require("dotenv").config();
const mongoose = require("mongoose");
const { Web3 } = require("web3");
const dns = require("dns");
const User = require("./models/User");
const ActivityLog = require("./models/ActivityLog");
const contractJson = require("./build/contracts/SkillCertificate.json");

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const contractAddress = "0xdB95FBf1BC1b2Ca1d196a6A35f906Ac008eb0d7F";
const GANACHE_URL = process.env.GANACHE_URL || "http://127.0.0.1:8545";

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // 1. Clear Activity Logs for a fresh feed
        await ActivityLog.deleteMany({});
        console.log("Cleared old Activity Logs.");

        // 2. Add sample students across different classes if they don't exist
        const sampleStudents = [
            { name: "John Doe", user: "john_9", class: "9" },
            { name: "Jane Smith", user: "jane_10", class: "10" },
            { name: "Bob Wilson", user: "bob_11", class: "11" },
            { name: "Alice Brown", user: "alice_12", class: "12" },
            { name: "Charlie Davis", user: "charlie_10", class: "10" }
        ];

        const users = [];
        for (const s of sampleStudents) {
            let u = await User.findOne({ username: s.user });
            if (!u) {
                u = new User({
                    username: s.user,
                    password: "password123",
                    role: "student",
                    studentName: s.name,
                    className: s.class
                });
                await u.save();
                console.log(`Created student: ${s.name} in Class ${s.class}`);
            }
            users.push(u);
        }

        // 3. Create mock Activity Logs
        const logs = [
            { action: "LOGIN_SUCCESS", username: "admin", details: "Admin logged into system", ip: "127.0.0.1" },
            { action: "CREATE_STUDENT", username: "admin", details: "Created student: john_9", ip: "127.0.0.1" },
            { action: "CREATE_STUDENT", username: "admin", details: "Created student: jane_10", ip: "127.0.0.1" },
            { action: "ISSUE_CERTIFICATE", username: "admin", details: "Issued to John Doe for Web Development", ip: "127.0.0.1" },
            { action: "ISSUE_CERTIFICATE", username: "admin", details: "Issued to Jane Smith for Data Science", ip: "127.0.0.1" },
            { action: "UPDATE_STUDENT", username: "admin", details: "Updated profile for bob_11", ip: "127.0.0.1" },
            { action: "LOGIN_FAILED", username: "unknown_user", details: "Invalid login attempt", ip: "192.168.1.5" }
        ];

        for (const logData of logs) {
            const log = new ActivityLog(logData);
            await log.save();
        }
        console.log("Populated mock Activity Logs.");

        // 4. Issue Certificates on Blockchain
        const web3 = new Web3(GANACHE_URL);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const skillCert = new web3.eth.Contract(contractJson.abi, contractAddress);

        console.log("Issuing sample certificates to blockchain...");
        const certsToIssue = [
            { name: "John Doe", class: "9", skill: "Web Design", by: "Admin Smith" },
            { name: "Jane Smith", class: "10", skill: "Python Basics", by: "Admin Smith" },
            { name: "Bob Wilson", class: "11", skill: "UI/UX Design", by: "Admin Jones" },
            { name: "Alice Brown", class: "12", skill: "Machine Learning", by: "Admin Jones" },
            { name: "Charlie Davis", class: "10", skill: "Cloud Computing", by: "Admin Smith" }
        ];

        for (const c of certsToIssue) {
            await skillCert.methods
                .issueCertificate(c.name, c.class, c.skill, c.by)
                .send({ from: account, gas: 3000000 });
            console.log(`Blockchain Certificate Issued: ${c.name} - ${c.skill}`);
        }

        console.log("Seeding Complete! Dashboard should now be populated.");
        process.exit(0);

    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seed();
