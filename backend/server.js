const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // allow frontend requests
const { Web3 } = require("web3");
const contract = require("./build/contracts/SkillCertificate.json");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // ✅ enable cross-origin requests

// Connect to Ganache
const web3 = new Web3("http://127.0.0.1:8545");

// Replace with your deployed contract address from truffle migrate
const contractAddress = "0xcEF83c0Cc9923083253702A88f8C33D967EA40c3";

// Create contract object
const skillCert = new web3.eth.Contract(contract.abi, contractAddress);

// Use one of Ganache’s accounts (copy from Ganache GUI)
const account = "0x30831eF95A8d48A752E12343127d76ac46feA71b";

// ---------------- ROUTES ----------------

// Issue certificate
app.post("/issue", async (req, res) => {
  const { studentName, skill, issuedBy } = req.body;

  try {
    const receipt = await skillCert.methods
      .issueCertificate(studentName, skill, issuedBy)
      .send({ from: account, gas: 3000000 });

    // Convert BigInt values to string
    const data = receipt.events.CertificateIssued.returnValues;
    const responseData = {
      id: data.id.toString(),
      studentName: data.studentName,
      skill: data.skill,
      issuedBy: data.issuedBy,
      issuedOn: data.issuedOn.toString()
    };

    res.json({
      message: "Certificate issued successfully",
      data: responseData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify certificate
app.get("/verify/:id", async (req, res) => {
  const certId = req.params.id;

  try {
    const cert = await skillCert.methods.verifyCertificate(certId).call();

    // Convert BigInt values to string
    const responseCert = {
      id: cert[0].toString(),
      studentName: cert[1],
      skill: cert[2],
      issuedBy: cert[3],
      issuedOn: cert[4].toString()
    };

    res.json({ certificate: responseCert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START SERVER ----------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
