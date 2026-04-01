const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function verifyDeployment() {
    const network = await hre.ethers.provider.getNetwork();
    const deploymentFile = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
    
    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ No deployment found for network: ${network.name}`);
        console.error(`Expected file: ${deploymentFile}`);
        process.exit(1);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const contractAddress = deployment.skillCertificateAddress;
    
    console.log(`\n✅ Verifying deployment on ${network.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Deployment Block: ${deployment.deploymentBlock}`);
    console.log(`Deployed at: ${deployment.deploymentTimestamp}\n`);
    
    try {
        // Get contract
        const SkillCertificate = await hre.ethers.getContractFactory("SkillCertificate");
        const contract = SkillCertificate.attach(contractAddress);
        
        // Check basic info
        console.log(`📋 Contract Information:`);
        const name = await contract.name();
        const symbol = await contract.symbol();
        const owner = await contract.owner();
        const fee = await contract.issuanceFeeWei();
        
        console.log(`- Name: ${name}`);
        console.log(`- Symbol: ${symbol}`);
        console.log(`- Owner: ${owner}`);
        console.log(`- Issuance Fee: ${hre.ethers.formatEther(fee)} MATIC/ETH\n`);
        
        // Check code exists
        const code = await hre.ethers.provider.getCode(contractAddress);
        if (code === '0x') {
            console.error(`❌ No contract code found at ${contractAddress}`);
            process.exit(1);
        }
        
        console.log(`✅ Contract successfully deployed and verified!`);
        console.log(`\n📖 Next steps:`);
        console.log(`1. Register issuers: npx hardhat run scripts/register-issuer.js --network ${network.name}`);
        console.log(`2. Issue certificates: npx hardhat run scripts/issue-certificate.js --network ${network.name}`);
        console.log(`3. Verify certificates: npx hardhat run scripts/verify-certificate.js --network ${network.name}\n`);
        
    } catch (error) {
        console.error(`❌ Verification failed:`, error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    verifyDeployment()
        .catch((error) => {
            console.error("❌ Error:", error.message);
            process.exit(1);
        });
}

module.exports = { verifyDeployment };
