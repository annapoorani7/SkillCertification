const hre = require("hardhat");

async function checkBalance() {
    const [signer] = await hre.ethers.getSigners();
    const address = await signer.getAddress();
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEther = hre.ethers.formatEther(balance);
    
    const network = await hre.ethers.provider.getNetwork();
    const currency = network.chainId === 80001 ? "MATIC" : 
                     network.chainId === 137 ? "MATIC" :
                     network.chainId === 97 ? "BNB" :
                     network.chainId === 56 ? "BNB" : "ETH";
    
    console.log(`\n📊 Wallet Balance Check`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`Address: ${address}`);
    console.log(`Balance: ${balanceInEther} ${currency}\n`);
    
    if (balance === 0n) {
        console.log("⚠️  Wallet is empty! Fund your wallet before deploying.");
        process.exit(1);
    }
    
    return { address, balance: balanceInEther, currency };
}

if (require.main === module) {
    checkBalance()
        .catch((error) => {
            console.error("❌ Error:", error.message);
            process.exit(1);
        });
}

module.exports = { checkBalance };
