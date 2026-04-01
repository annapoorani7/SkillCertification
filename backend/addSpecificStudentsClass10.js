require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const studentNamesClass10 = [
    "Aarthi S",
    "Bhuvanesh R",
    "Chitra M",
    "Dhanush K",
    "Eswari P",
    "Gopinath V",
    "Hemalatha R",
    "Ishwar S",
    "Jayanthi K",
    "Karthika M",
    "Lokesh P",
    "Mahalakshmi R",
    "Natarajan S",
    "Pavithra K",
    "Raghavan M",
    "Sakthi V",
    "Thilagavathi R",
    "Udhaya K",
    "Vasanthi S",
    "Yogesh M",
    "Anitha R",
    "Balasubramanian K",
    "Chandra S",
    "Durgadevi M",
    "Elangovan P",
    "Geetha R",
    "Haripriya K",
    "Jegan S",
    "Kalpana M",
    "Muthukumar V"
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        let createdCount = 0;
        let skippedCount = 0;

        for (const fullName of studentNamesClass10) {
            // Generate username: lowercase, replace spaces with dot
            const username = fullName.toLowerCase().replace(/\s+/g, ".");

            const exists = await User.findOne({ username });
            if (!exists) {
                await new User({
                    username,
                    password: username + "123", // New password format
                    role: "student",
                    studentName: fullName,
                    className: "10"
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
