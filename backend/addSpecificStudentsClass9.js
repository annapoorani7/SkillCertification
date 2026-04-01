require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const studentNamesClass9 = [
    "Aadhavan R",
    "Abinaya S",
    "Akshaya M",
    "Amarnath K",
    "Anbarasi P",
    "Arunkumar V",
    "Balamurugan R",
    "Bhuvaneshwari S",
    "Dhanalakshmi M",
    "Dineshkumar K",
    "Gajalakshmi P",
    "Gautham V",
    "Harishankar R",
    "Hemavathi S",
    "Jayaprakash M",
    "Jeyanthi K",
    "Kalyani P",
    "Karthikeyan V",
    "Latha R",
    "Logesh S",
    "Malarvizhi M",
    "Mohanasundaram K",
    "Nandhakumar P",
    "Nivetha V",
    "Palanisamy R",
    "Parvathi S",
    "Rajalakshmi M",
    "Rajeshkumar K",
    "Selvakumar P",
    "Thirumagal V"
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        let createdCount = 0;
        let skippedCount = 0;

        for (const fullName of studentNamesClass9) {
            // Generate username: lowercase, replace spaces with dot
            const username = fullName.toLowerCase().replace(/\s+/g, ".");

            const exists = await User.findOne({ username });
            if (!exists) {
                await new User({
                    username,
                    password: username + "123", // New password format
                    role: "student",
                    studentName: fullName,
                    className: "9"
                }).save();
                console.log(`✓ Added: ${fullName} (${username})`);
                createdCount++;
            } else {
                console.log(`– Skipped (Already exists): ${fullName} (${username})`);
                skippedCount++;
            }
        }

        console.log(`\nResults:\nCreated: ${createdCount}\nSkipped: ${skippedCount}`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding students:", err);
        process.exit(1);
    }
};

seed();
