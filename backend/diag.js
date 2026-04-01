const { Web3 } = require("web3");
const web3 = new Web3("http://127.0.0.1:8545");

async function diag() {
    try {
        const networkId = await web3.eth.net.getId();
        console.log("Network ID:", networkId);

        const accounts = await web3.eth.getAccounts();
        console.log("Available accounts:", accounts);

        const targetAccount = "0xf9069AF6CDCE0bDDc1C577f9e34dD3C6824E5723";
        if (accounts.includes(targetAccount)) {
            console.log("Target account is available.");
            const balance = await web3.eth.getBalance(targetAccount);
            console.log("Account balance:", web3.utils.fromWei(balance, "ether"), "ETH");
        } else {
            console.log("Target account NOT found in available accounts.");
        }

        const contractAddress = "0x41db15B82Cbc99e15Aa7b0c1aBdC144805238bad";
        const contractJson = require("./build/contracts/SkillCertificate.json");
        const skillCert = new web3.eth.Contract(contractJson.abi, contractAddress);

        const code = await web3.eth.getCode(contractAddress);
        if (code === "0x" || code === "0x0") {
            console.log("No contract code found at address:", contractAddress);
        } else {
            console.log("Contract code found at address:", contractAddress);

            const count = await skillCert.methods.certCount().call();
            console.log("Cert count from contract:", count.toString());
        }
    } catch (err) {
        console.error("Connection error:", err);
    }
}

diag();
