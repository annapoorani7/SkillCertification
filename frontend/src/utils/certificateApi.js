/**
 * Certificate API Utility Functions
 * All endpoints for certificate operations with the backend blockchain API
 */

import api from "./api";

/**
 * ============================================================================
 * PUBLIC ENDPOINTS (No Authentication Required)
 * ============================================================================
 */

/**
 * Get contract information
 * GET /api/certificates/contract/info
 */
export const getSkills = async () => {
    try {
        console.log("Fetching skills from /api/skills endpoint...");
        const response = await api.get("/api/skills");
        console.log(`Successfully fetched ${response.data?.length || 0} skills`);
        return response.data;
    } catch (error) {
        console.error("Error fetching skills:", error);
        throw new Error(error.response?.data?.error || "Failed to fetch skills");
    }
};

export const getStudents = async () => {
    try {
        console.log("Fetching students from /users endpoint...");
        const response = await api.get("/users");
        console.log(`Successfully fetched ${response.data?.length || 0} students`);
        return response.data;
    } catch (error) {
        console.error("Error fetching students:", error);
        throw new Error(error.response?.data?.error || "Failed to fetch students");
    }
};

export const getOrganizations = async () => {
    try {
        const response = await api.get("/api/organizations");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to fetch organizations");
    }
};

export const getContractInfo = async () => {
    try {
        const response = await api.get("/api/certificates/contract/info");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to fetch contract info");
    }
};

/**
 * Check issuer status
 * GET /api/certificates/issuer/:issuerAddress/status
 */
export const checkIssuerStatus = async (issuerAddress) => {
    try {
        const response = await api.get(`/api/certificates/issuer/${issuerAddress}/status`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to check issuer status");
    }
};

/**
 * Public certificate verification (no auth required)
 * GET /api/certificates/verify/:certificateId
 */
export const verifyCertificatePublic = async (certificateId) => {
    try {
        const response = await api.get(`/api/certificates/verify/${certificateId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Certificate not found");
    }
};

/**
 * ============================================================================
 * AUTHENTICATED ENDPOINTS (Requires JWT Token)
 * ============================================================================
 */

/**
 * Issue a single certificate
 * POST /api/certificates/issue
 * 
 * @param {Object} certificateData
 *   - studentAddress: string (Ethereum address)
 *   - skillId: string (UUID)
 *   - proficiencyLevel: string ('Beginner' | 'Intermediate' | 'Advanced' | 'Expert')
 *   - expirationDate: number (Unix timestamp)
 *   - organizationId?: string (UUID, optional)
 */
export const issueCertificate = async (certificateData) => {
    try {
        const response = await api.post("/api/certificates/issue", certificateData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to issue certificate");
    }
};

/**
 * Issue certificates in batch (1-100)
 * POST /api/certificates/batch-issue
 * 
 * @param {Object} batchData
 *   - certificates: Array of certificate objects (max 100)
 *   - organizationId: string (UUID)
 */
export const batchIssueCertificates = async (batchData) => {
    try {
        const response = await api.post("/api/certificates/batch-issue", batchData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to issue certificates");
    }
};

/**
 * Get certificate details
 * GET /api/certificates/:certificateId
 */
export const getCertificateDetails = async (certificateId) => {
    try {
        const response = await api.get(`/api/certificates/${certificateId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Certificate not found");
    }
};

/**
 * Verify certificate (authenticated)
 * GET /api/certificates/:certificateId/verify
 */
export const verifyCertificate = async (certificateId) => {
    try {
        const response = await api.get(`/api/certificates/${certificateId}/verify`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Verification failed");
    }
};

/**
 * Revoke a certificate
 * POST /api/certificates/:certificateId/revoke
 * 
 * @param {string} certificateId
 * @param {string} revocationReason (10-500 characters)
 */
export const revokeCertificate = async (certificateId, revocationReason) => {
    try {
        const response = await api.post(
            `/api/certificates/${certificateId}/revoke`,
            { revocationReason }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to revoke certificate");
    }
};

/**
 * Get all certificates for a student
 * GET /api/certificates/student/:studentAddress
 */
export const getStudentCertificates = async (studentAddress) => {
    try {
        const response = await api.get(`/api/certificates/student/${studentAddress}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to fetch certificates");
    }
};

/**
 * Get authenticated student's own certificates
 * GET /api/certificates/my-certificates
 */
export const getMyStudentCertificates = async () => {
    try {
        const response = await api.get(`/api/my-certificates`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to fetch certificates");
    }
};

/**
 * ============================================================================
 * ADMIN ENDPOINTS (Requires Admin Role)
 * ============================================================================
 */

/**
 * Register issuer (admin only)
 * POST /api/certificates/issuer/register
 * 
 * @param {Object} issuerData
 *   - issuerAddress: string (Ethereum address)
 *   - organizationName: string
 *   - registrationNumber: string (unique identifier)
 */
export const registerIssuer = async (issuerData) => {
    try {
        const response = await api.post("/api/certificates/issuer/register", issuerData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to register issuer");
    }
};

/**
 * Get all certificates (Admin only)
 * GET /api/certificates/all
 */
export const getAdminCertificates = async () => {
    try {
        const response = await api.get("/api/certificates/all");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to fetch certificates");
    }
};

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Format certificate data for display
 */
export const formatCertificate = (cert) => {
    return {
        id: cert.id,
        studentAddress: cert.student_id,
        className: cert.class_name,
        skillName: cert.skill_name,
        proficiencyLevel: cert.proficiency_level,
        organizationName: cert.organization_name,
        issuedAt: new Date(cert.issued_at).toLocaleDateString(),
        expiresAt: cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "N/A",
        isValid: !cert.revoked && (!cert.expires_at || new Date(cert.expires_at) > new Date()),
        isRevoked: cert.revoked,
        revocationReason: cert.revocation_reason,
        tokenId: cert.blockchain_token_id,
        txHash: cert.blockchain_tx_hash,
        metadataUri: cert.metadata_uri,
    };
};

/**
 * Validate Ethereum address
 */
export const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Convert proficiency level to display text
 */
export const getProficiencyLabel = (level) => {
    const labels = {
        Beginner: "Beginner",
        Intermediate: "Intermediate",
        Advanced: "Advanced",
        Expert: "Expert",
    };
    return labels[level] || level;
};

/**
 * Calculate days until expiration
 */
export const daysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const days = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
};

/**
 * Convert Unix timestamp to readable date
 */
export const formatUnixTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

/**
 * Format batch import data (CSV to API format)
 */
export const formatBatchImport = (csvData) => {
    // Expected CSV format:
    // studentAddress,skillId,proficiencyLevel,expirationDate
    const lines = csvData.trim().split("\n");
    const certificates = [];

    for (let i = 1; i < lines.length; i++) {
        const [studentAddress, skillId, proficiencyLevel, expirationDate] = lines[i].split(",");
        certificates.push({
            studentAddress: studentAddress.trim(),
            skillId: skillId.trim(),
            proficiencyLevel: proficiencyLevel.trim(),
            expirationDate: parseInt(expirationDate.trim()),
        });
    }

    return certificates;
};

const certificateAPI = {
    // Public
    getSkills,
    getStudents,
    getOrganizations,
    getContractInfo,
    checkIssuerStatus,
    verifyCertificatePublic,
    // Authenticated
    issueCertificate,
    batchIssueCertificates,
    getCertificateDetails,
    verifyCertificate,
    revokeCertificate,
    getStudentCertificates,
    // Admin
    registerIssuer,
    getAdminCertificates,
    // Helpers
    formatCertificate,
    isValidEthereumAddress,
    getProficiencyLabel,
    daysUntilExpiration,
    formatUnixTimestamp,
    formatBatchImport,
};

export default certificateAPI;
