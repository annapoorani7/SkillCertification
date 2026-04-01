const { Web3 } = require("web3");
const contract = require("./build/contracts/SkillCertificate.json");

// Connect to Ganache RPC (just pass the URL string)
const web3 = new Web3("http://127.0.0.1:8545");

// Replace with your deployed contract address from `truffle migrate`
const contractAddress = "0xa374da579fd1a6758C566d4d2057D29865faE91d"
const skillCert = new web3.eth.Contract(contract.abi, contractAddress);

// Use one of Ganache’s accounts (copy from Ganache GUI)
const account = "0xF503B2511b45A56B422025F34AF600b04FefbC3c";

// Function to issue a certificate
async function issueCertificate(studentName, skill, issuedBy) {
  const receipt = await skillCert.methods
    .issueCertificate(studentName, skill, issuedBy)
    .send({ from: account, gas: 3000000 });

  console.log("Certificate issued:", receipt.events.CertificateIssued.returnValues);
}

// Function to verify a certificate
async function verifyCertificate(certId) {
  const cert = await skillCert.methods.verifyCertificate(certId).call();
  console.log("Certificate details:", cert);
}

// Example calls
(async () => {
  await issueCertificate("Alice", "Blockchain Basics", "SkillCert Academy");
  await verifyCertificate(1);
})();
