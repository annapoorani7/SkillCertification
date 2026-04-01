const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function issueCertificate() {
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
    
    // Example certificate data
    const studentAddress = "0x70997970C51812e339D9B73b0245ad59e97C0756"; // Change this to actual student address
    const skillName = "Web Development Fundamentals";
    const proficiencyLevel = "Intermediate";
    const expirationDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now
    const certificateHash = crypto.randomBytes(32).toString('hex');
    const metadataURI = `ipfs://QmExample${crypto.randomBytes(16).toString('hex')}`;
    
    console.log(`\n🎓 Issuing Certificate`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Student Address: ${studentAddress}`);
    console.log(`Skill: ${skillName}`);
    console.log(`Proficiency: ${proficiencyLevel}`);
    console.log(`Expires: ${new Date(expirationDate * 1000).toLocaleDateString()}`);
    console.log(`Hash: ${certificateHash}`);
    console.log(`Metadata URI: ${metadataURI}\n`);
    
    try {
        // Check contract has fee info
        const fee = await contract.issuanceFeeWei();
        console.log(`Fee required: ${hre.ethers.formatEther(fee)} MATIC/ETH\n`);
        
        // Issue certificate with payment
        const tx = await contract.issueCertificate(
            studentAddress,
            skillName,
            proficiencyLevel,
            expirationDate,
            certificateHash,
            metadataURI,
            { 
                value: fee,
                gasLimit: 500000 
            }
        );
        
        console.log(`⏳ Certificate issuance transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        
        console.log(`✅ Certificate issued successfully!`);
        console.log(`Block: ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}\n`);
        
        // Extract token ID from logs
        const iface = new hre.ethers.Interface(
            require(path.join(__dirname, '../build/contracts/SkillCertificate.json')).abi
        );
        
        let tokenId = null;
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed && parsed.name === 'CertificateIssued') {
                    tokenId = parsed.args[0];
                    break;
                }
            } catch (e) {
                // Continue if log doesn't match
            }
        }
        
        console.log(`📋 Certificate Details:`);
        console.log(`- Token ID: ${tokenId || 'Check logs'}`);
        console.log(`- Transaction Hash: ${receipt.transactionHash}`);
        console.log(`- Block: ${receipt.blockNumber}\n`);
        
        // Verify certificate
        if (tokenId !== null) {
            const cert = await contract.getCertificate(tokenId);
            const isValid = await contract.isCertificateValid(tokenId);
            
            console.log(`🔍 Verification:`);
            console.log(`- Skill: ${cert.skillName}`);
            console.log(`- Student: ${cert.student}`);
            console.log(`- Issued: ${new Date(cert.issueDate * 1000).toLocaleDateString()}`);
            console.log(`- Valid: ${isValid}\n`);
        }
        
    } catch (error) {
        console.error(`❌ Error issuing certificate:`, error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    issueCertificate()
        .catch((error) => {
            console.error("❌ Error:", error.message);
            process.exit(1);
        });
}

module.exports = { issueCertificate };
