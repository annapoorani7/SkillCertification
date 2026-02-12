const { Web3 } = require("web3");
const contract = require("./build/contracts/SkillCertificate.json");

// Connect to Ganache RPC (just pass the URL string)
const web3 = new Web3("http://127.0.0.1:8545");

// Replace with your deployed contract address from `truffle migrate`
const contractAddress = "0xcEF83c0Cc9923083253702A88f8C33D967EA40c3"
const skillCert = new web3.eth.Contract(contract.abi, contractAddress);

// Use one of Ganache’s accounts (copy from Ganache GUI)
const account = "0x30831eF95A8d48A752E12343127d76ac46feA71b";

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
