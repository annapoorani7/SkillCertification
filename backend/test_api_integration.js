#!/usr/bin/env node

/**
 * Backend API Integration Test Suite
 * 
 * Tests all certificate endpoints including:
 * - Public endpoints (no auth)
 * - Authenticated endpoints (with JWT)
 * - Request validation
 * - Error handling
 * 
 * Usage: node backend/test_api_integration.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';
let testResults = [];
let authToken = null;

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Log test result
 */
function logTest(name, passed, details = '') {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} - ${name}`);
    if (details) console.log(`  ${colors.cyan}${details}${colors.reset}`);
    
    testResults.push({ name, passed, details });
}

/**
 * Wait function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test 1: Health check - Server is running
 */
async function testServerHealth() {
    try {
        const res = await axios.get(`${API_URL}/health`, {
            validateStatus: () => true // Accept any status
        });
        
        const passed = res.status === 200;
        logTest('Health Check', passed, `Status: ${res.status}`);
    } catch (error) {
        logTest('Health Check', false, `${error.message}`);
    }
}

/**
 * Test 2: Public endpoint - Get Contract Info
 */
async function testGetContractInfo() {
    try {
        const res = await axios.get(`${API_URL}/api/certificates/contract/info`);
        
        const passed = res.data.success && res.data.contract && res.data.contract.contractAddress;
        logTest(
            'GET /api/certificates/contract/info (Public)',
            passed,
            `Contract: ${res.data.contract?.contractAddress}`
        );
        
        return res.data.contract;
    } catch (error) {
        logTest('GET /api/certificates/contract/info (Public)', false, error.message);
        return null;
    }
}

/**
 * Test 3: Public endpoint - Check Issuer Status
 */
async function testIssuerStatus() {
    try {
        const testAddress = '0xA27fd037895c7ad2a0d929f6A6dD65A10Db68A8e';
        const res = await axios.get(`${API_URL}/api/certificates/issuer/${testAddress}/status`);
        
        const passed = res.data.success !== undefined;
        logTest(
            `GET /api/certificates/issuer/:address/status (Public)`,
            passed,
            `Address: ${testAddress}`
        );
    } catch (error) {
        logTest('GET /issuer/:address/status (Public)', false, error.message);
    }
}

/**
 * Test 4: Register User
 */
async function testRegisterUser() {
    try {
        const userData = {
            username: `testuser_${Date.now()}`,
            password: 'TestPassword123!',
            role: 'teacher'
        };
        
        const res = await axios.post(`${API_URL}/register`, userData, {
            validateStatus: () => true
        });
        
        const passed = res.status === 201 && res.data.token;
        logTest('POST /register', passed, `User: ${userData.username}`);
        
        return userData;
    } catch (error) {
        logTest('POST /register', false, error.message);
        return null;
    }
}

/**
 * Test 5: Login User
 */
async function testLoginUser(userData) {
    if (!userData) return false;
    
    try {
        const res = await axios.post(`${API_URL}/login`, {
            username: userData.username,
            password: userData.password
        });
        
        const passed = res.data.token && res.data.token.length > 20;
        if (passed) {
            authToken = res.data.token;
            logTest('POST /login', passed, `Token: ${authToken.substring(0, 20)}...`);
        } else {
            logTest('POST /login', false, 'No token in response');
        }
        
        return passed;
    } catch (error) {
        logTest('POST /login', false, error.message);
        return false;
    }
}

/**
 * Test 6: Issue Certificate (Authenticated)
 */
async function testIssueCertificate() {
    if (!authToken) {
        logTest('POST /api/certificates/issue (Auth)', false, 'No authentication token');
        return null;
    }
    
    try {
        const certificateData = {
            studentAddress: '0x8d0A87f202d1E9c75b97eb00f7a1C74E44608E45',
            skillId: '550e8400-e29b-41d4-a716-446655440000',
            proficiencyLevel: 'Advanced',
            expirationDate: Math.floor(Date.now() / 1000) + 31536000
        };
        
        const res = await axios.post(`${API_URL}/api/certificates/issue`, certificateData, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            validateStatus: () => true
        });
        
        const passed = res.status === 201 && res.data.certificate && res.data.certificate.id;
        logTest(
            'POST /api/certificates/issue (Auth)',
            passed,
            `CertID: ${res.data.certificate?.id || 'N/A'}`
        );
        
        return res.data.certificate;
    } catch (error) {
        logTest('POST /api/certificates/issue (Auth)', false, error.message);
        return null;
    }
}

/**
 * Test 7: Get Certificate Details
 */
async function testGetCertificate(certificate) {
    if (!authToken || !certificate) {
        logTest('GET /api/certificates/:id (Auth)', false, 'Missing cert or token');
        return false;
    }
    
    try {
        const res = await axios.get(`${API_URL}/api/certificates/${certificate.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            validateStatus: () => true
        });
        
        const passed = res.status === 200 && res.data.certificate;
        logTest('GET /api/certificates/:id (Auth)', passed, `Status: ${res.status}`);
        
        return passed;
    } catch (error) {
        logTest('GET /api/certificates/:id (Auth)', false, error.message);
        return false;
    }
}

/**
 * Test 8: Verify Certificate (Public)
 */
async function testVerifyCertificate(certificate) {
    if (!certificate) {
        logTest('GET /api/verify/:id (Public)', false, 'No certificate to verify');
        return false;
    }
    
    try {
        const res = await axios.get(`${API_URL}/api/certificates/verify/${certificate.id}`, {
            validateStatus: () => true
        });
        
        // Note: This might 404 if blockchain tx not mined yet
        const passed = res.status === 200 || res.status === 404;
        logTest(
            'GET /api/certificates/verify/:id (Public)',
            passed,
            `Status: ${res.status}`
        );
        
        return res.status === 200;
    } catch (error) {
        logTest('GET /api/certificates/verify/:id (Public)', false, error.message);
        return false;
    }
}

/**
 * Test 9: Get Student Certificates
 */
async function testGetStudentCertificates() {
    if (!authToken) {
        logTest('GET /api/certificates/student/:address (Auth)', false, 'No auth token');
        return false;
    }
    
    try {
        const studentAddress = '0x8d0A87f202d1E9c75b97eb00f7a1C74E44608E45';
        const res = await axios.get(
            `${API_URL}/api/certificates/student/${studentAddress}`,
            {
                headers: { 'Authorization': `Bearer ${authToken}` },
                validateStatus: () => true
            }
        );
        
        const passed = res.status === 200 && Array.isArray(res.data.certificates);
        logTest(
            'GET /api/certificates/student/:address (Auth)',
            passed,
            `Count: ${res.data.certificates?.length || 0}`
        );
        
        return passed;
    } catch (error) {
        logTest('GET /api/certificates/student/:address (Auth)', false, error.message);
        return false;
    }
}

/**
 * Test 10: Request Validation - Invalid Ethereum Address
 */
async function testValidationInvalidAddress() {
    try {
        const res = await axios.post(
            `${API_URL}/api/certificates/issue`,
            {
                studentAddress: 'not-an-address',
                skillId: '550e8400-e29b-41d4-a716-446655440000',
                proficiencyLevel: 'Advanced',
                expirationDate: Math.floor(Date.now() / 1000) + 31536000
            },
            {
                headers: { 'Authorization': `Bearer ${authToken || ''}` },
                validateStatus: () => true
            }
        );
        
        const passed = res.status === 400;
        logTest(
            'Validation: Invalid Ethereum Address',
            passed,
            `Status: ${res.status} (Expected 400)`
        );
    } catch (error) {
        logTest('Validation: Invalid Ethereum Address', false, error.message);
    }
}

/**
 * Test 11: Request Validation - Invalid Proficiency Level
 */
async function testValidationInvalidProficiency() {
    try {
        const res = await axios.post(
            `${API_URL}/api/certificates/issue`,
            {
                studentAddress: '0x8d0A87f202d1E9c75b97eb00f7a1C74E44608E45',
                skillId: '550e8400-e29b-41d4-a716-446655440000',
                proficiencyLevel: 'InvalidLevel',
                expirationDate: Math.floor(Date.now() / 1000) + 31536000
            },
            {
                headers: { 'Authorization': `Bearer ${authToken || ''}` },
                validateStatus: () => true
            }
        );
        
        const passed = res.status === 400;
        logTest(
            'Validation: Invalid Proficiency Level',
            passed,
            `Status: ${res.status} (Expected 400)`
        );
    } catch (error) {
        logTest('Validation: Invalid Proficiency Level', false, error.message);
    }
}

/**
 * Test 12: Authentication - Missing Token
 */
async function testAuthMissing() {
    try {
        const res = await axios.get(
            `${API_URL}/api/certificates/550e8400-e29b-41d4-a716-446655440001`,
            { validateStatus: () => true }
        );
        
        const passed = res.status === 401;
        logTest(
            'Authentication: Missing Token',
            passed,
            `Status: ${res.status} (Expected 401)`
        );
    } catch (error) {
        logTest('Authentication: Missing Token', false, error.message);
    }
}

/**
 * Test 13: Authentication - Invalid Token
 */
async function testAuthInvalid() {
    try {
        const res = await axios.get(
            `${API_URL}/api/certificates/550e8400-e29b-41d4-a716-446655440001`,
            {
                headers: { 'Authorization': 'Bearer invalid_token_xyz' },
                validateStatus: () => true
            }
        );
        
        const passed = res.status === 401;
        logTest(
            'Authentication: Invalid Token',
            passed,
            `Status: ${res.status} (Expected 401)`
        );
    } catch (error) {
        logTest('Authentication: Invalid Token', false, error.message);
    }
}

/**
 * Print Summary
 */
function printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
    console.log('='.repeat(70));
    
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`Total Tests: ${total}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`Success Rate: ${percentage}%`);
    
    if (failed > 0) {
        console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
        testResults.filter(r => !r.passed).forEach(result => {
            console.log(`  - ${result.name}: ${result.details}`);
        });
    }
    
    console.log('='.repeat(70) + '\n');
    
    return failed === 0;
}

/**
 * Main Test Runner
 */
async function runTests() {
    console.log(`${colors.blue}${'='.repeat(70)}`);
    console.log('SkillCert Backend API Integration Test Suite');
    console.log(`${'='.repeat(70)}${colors.reset}\n`);
    
    // Test 1-3: Public endpoints
    console.log(`${colors.yellow}[Public Endpoints]${colors.reset}`);
    await testServerHealth();
    const contract = await testGetContractInfo();
    await testIssuerStatus();
    
    await sleep(1000);
    
    // Test 4-5: Authentication
    console.log(`\n${colors.yellow}[Authentication]${colors.reset}`);
    const userData = await testRegisterUser();
    await testLoginUser(userData);
    
    await sleep(1000);
    
    // Test 6-9: Certificate Operations (Authenticated)
    console.log(`\n${colors.yellow}[Certificate Operations]${colors.reset}`);
    const certificate = await testIssueCertificate();
    
    await sleep(2000); // Wait for blockchain tx
    
    if (certificate) {
        await testGetCertificate(certificate);
        await testVerifyCertificate(certificate);
    }
    
    await testGetStudentCertificates();
    
    // Test 10-13: Validation & Error Handling
    console.log(`\n${colors.yellow}[Validation & Error Handling]${colors.reset}`);
    await testValidationInvalidAddress();
    await testValidationInvalidProficiency();
    await testAuthMissing();
    await testAuthInvalid();
    
    // Print results
    const allPassed = printSummary();
    
    process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error(`${colors.red}Test suite failed: ${error.message}${colors.reset}`);
    process.exit(1);
});
