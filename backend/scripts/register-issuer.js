const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function registerIssuer() {
    const network = await hre.ethers.provider.getNetwork();
    const deploymentFile = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
    
    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Contract not deployed on ${network.name}`);
        process.exit(1);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const [signer] = await hre.ethers.getSigners();
    
    const SkillCertificate = await hre.ethers.getContractFactory("SkillCertificate");
    const contract = SkillCertificate.attach(deployment.skillCertificateAddress);
    
    // Example: Register the deployer as first issuer
    const issuerAddress = await signer.getAddress();
    const organizationName = "Skill Certification Authority";
    const registrationNumber = "SCRT-2024-001";
    
    console.log(`\n📝 Registering Issuer`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Issuer Address: ${issuerAddress}`);
    console.log(`Organization: ${organizationName}`);
    console.log(`Registration: ${registrationNumber}\n`);
    
    try {
        const tx = await contract.registerIssuer(
            issuerAddress,
            organizationName,
            registrationNumber
        );
        
        console.log(`⏳ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        
        console.log(`✅ Issuer registered successfully!`);
        console.log(`Block: ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}\n`);
        
        // Verify issuer is registered
        const isIssuer = await contract.issuers(issuerAddress);
        const org = await contract.organizations(issuerAddress);
        
        console.log(`🔍 Verification:`);
        console.log(`- Is Issuer: ${isIssuer}`);
        console.log(`- Organization Name: ${org.name}`);
        console.log(`- Verified: ${org.isVerified}`);
        console.log(`- Total Certificates: ${org.totalIssuedCertificates}\n`);
        
    } catch (error) {
        console.error(`❌ Error registering issuer:`, error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    registerIssuer()
        .catch((error) => {
            console.error("❌ Error:", error.message);
            process.exit(1);
        });
}

module.exports = { registerIssuer };
