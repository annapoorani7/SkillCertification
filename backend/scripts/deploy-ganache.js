#!/usr/bin/env node
/**
 * Simple Deployment Script for SkillCertificate Contract
 * Uses Web3.js to deploy to Ganache without requiring compilation
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Setup Web3
const rpcUrl = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:8545';
const web3 = new Web3(rpcUrl);

// Get compiled contract ABI and bytecode from Truffle artifacts
const contractPath = path.join(__dirname, '../build/contracts/SkillCertificate.json');

async function deploy() {
    try {
        console.log('\n🚀 Deploying SkillCertificate to Ganache...\n');
        
        // Get accounts
        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Make sure Ganache is running at ' + rpcUrl);
        }
        
        const deployer = accounts[0];
        console.log('Deployer account:', deployer);
        
        // Get balance
        const balance = await web3.eth.getBalance(deployer);
        const balanceEther = web3.utils.fromWei(balance, 'ether');
        console.log('Deployer balance:', balanceEther, 'ETH\n');
        
        // Load contract artifact
        if (!fs.existsSync(contractPath)) {
            throw new Error(`Contract artifact not found at ${contractPath}. Run 'truffle compile' first.`);
        }
        
        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const { abi, bytecode } = contractArtifact;
        
        if (!bytecode || bytecode === '0x') {
            throw new Error('Contract bytecode not found. Run "truffle compile" first.');
        }
        
        // Prepare constructor parameters
        const issuanceFeeWei = web3.utils.toWei('0.01', 'ether'); // 0.01 ETH
        
        // Create contract instance
        const contract = new web3.eth.Contract(abi);
        
        console.log('Deploying with issuance fee:', web3.utils.fromWei(issuanceFeeWei, 'ether'), 'ETH\n');
        
        // Deploy contract
        const deployment = contract.deploy({
            data: bytecode,
            arguments: [issuanceFeeWei]
        });
        
        const gas = await deployment.estimateGas({ from: deployer });
        console.log('Estimated gas:', gas.toString());
        
        const gasLimit = String(Math.ceil(Number(gas) * 1.2));
        console.log('Gas limit:', gasLimit);
        
        const tx = await deployment.send({
            from: deployer,
            gas: gasLimit,
            gasPrice: web3.utils.toWei('1', 'gwei')
        });
        
        const contractAddress = tx.options.address || tx.address;
        
        console.log('\n✅ SkillCertificate deployed successfully!');
        console.log('Contract address:', contractAddress);
        console.log('Transaction hash:', tx.transactionHash);
        console.log('Block number:', tx.blockNumber, '\n');
        
        // Verify contract
        const deployedContract = new web3.eth.Contract(abi, contractAddress);
        const name = await deployedContract.methods.name().call();
        const symbol = await deployedContract.methods.symbol().call();
        const fee = await deployedContract.methods.issuanceFeeWei().call();
        const owner = await deployedContract.methods.owner().call();
        
        console.log('📋 Contract Details:');
        console.log('- Name:', name);
        console.log('- Symbol:', symbol);
        console.log('- Issuance Fee:', web3.utils.fromWei(fee, 'ether'), 'ETH');
        console.log('- Owner:', owner, '\n');
        
        // Save deployment info
        const deployment_info = {
            network: 'ganache',
            chainId: '1772632217628',
            skillCertificateAddress: contractAddress,
            deployer: deployer,
            transactionHash: tx.transactionHash,
            blockNumber: tx.blockNumber,
            deploymentTimestamp: new Date().toISOString(),
            issuanceFee: web3.utils.fromWei(fee, 'ether') + ' ETH',
            owner: owner
        };
        
        const deploymentDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentDir)) {
            fs.mkdirSync(deploymentDir, { recursive: true });
        }
        
        const deploymentFile = path.join(deploymentDir, 'ganache-deployment.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(deployment_info, null, 2));
        
        console.log('💾 Deployment info saved to:', deploymentFile);
        console.log('\n✨ Next steps:');
        console.log('1. Register an issuer: npx truffle exec scripts/register-issuer.js --network ganache');
        console.log('2. Issue a certificate: npx truffle exec scripts/issue-certificate.js --network ganache');
        console.log('3. Verify certificate: npx truffle exec scripts/verify-certificate.js --network ganache\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        console.error('\nTroubleshooting:');
        console.error('- Make sure Ganache is running at', rpcUrl);
        console.error('- Run "truffle compile" to compile contracts first');
        console.error('- Check that contracts/SkillCertificate.sol exists');
        process.exit(1);
    }
}

deploy();
