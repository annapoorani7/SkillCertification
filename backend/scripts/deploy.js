const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying SkillCert contracts...\n");
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer account:", deployer.address);
    
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("Deploying to network:", network.name, "Chain ID:", network.chainId);
    
    // Get account balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", hre.ethers.utils.formatEther(balance), "ETH/MATIC\n");
    
    // Deploy SkillCertificate contract
    const issuanceFeeWei = hre.ethers.utils.parseEther("0.01"); // 0.01 MATIC/ETH
    
    console.log("Deploying SkillCertificate with fee:", hre.ethers.utils.formatEther(issuanceFeeWei), "MATIC/ETH");
    
    const SkillCertificateFactory = await hre.ethers.getContractFactory("SkillCertificate");
    const skillCert = await SkillCertificateFactory.deploy(issuanceFeeWei);
    
    console.log("Contract deployment transaction hash:", skillCert.deployTransaction?.hash);
    
    // Wait for deployment
    await skillCert.deployed();
    
    const contractAddress = skillCert.address;
    console.log("✅ SkillCertificate deployed to:", contractAddress);
    
    // Get deployment block number
    const deploymentBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Deployment block number:", deploymentBlock);
    
    // Verify contract was deployed correctly
    const name = await skillCert.name();
    const symbol = await skillCert.symbol();
    const fee = await skillCert.issuanceFeeWei();
    const owner = await skillCert.owner();
    
    console.log("\nContract details:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Issuance Fee:", hre.ethers.utils.formatEther(fee), "MATIC/ETH");
    console.log("- Owner:", owner);
    
    // Save deployment info
    const deployment = {
        network: network.name,
        chainId: network.chainId.toString(),
        skillCertificateAddress: contractAddress,
        deployer: deployer.address,
        deploymentBlock: deploymentBlock,
        deploymentTimestamp: new Date().toISOString(),
        issuanceFee: hre.ethers.utils.formatEther(fee) + " MATIC/ETH",
        owner: owner
    };
    
    console.log("\n📝 Deployment summary:", JSON.stringify(deployment, null, 2));
    
    // Save to file
    const fs = require("fs");
    const path = require("path");
    const deploymentFile = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
    
    // Create deployments directory if it doesn't exist
    const deploymentDir = path.dirname(deploymentFile);
    if (!fs.existsSync(deploymentDir)) {
        require("fs").mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFile);
    
    return deployment;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });