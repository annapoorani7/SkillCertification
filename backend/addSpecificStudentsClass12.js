require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const studentNamesClass12 = [
    "Abirami S",
    "Balaji R",
    "Chandru K",
    "Dharani M",
    "Elavarasi P",
    "Ganesan V",
    "Hema L",
    "Ilango S",
    "Jothika R",
    "Kannan M",
    "Lavanya K",
    "Mahesh P",
    "Nirmala S",
    "Prakash R",
    "Revathi K",
    "Saravanan M",
    "Tharun V",
    "Uma R",
    "Vignesh K",
    "Yamuna S",
    "Akash R",
    "Bhavani M",
    "Charan K",
    "Deivanai P",
    "Eshwar S",
    "Fathima R",
    "Hariharan K",
    "Indumathi M",
    "Jagadeesh V",
    "Kalaiselvi R"
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        let createdCount = 0;
        let skippedCount = 0;

        for (const fullName of studentNamesClass12) {
            // Generate username: lowercase, replace spaces with dot
            const username = fullName.toLowerCase().replace(/\s+/g, ".");

            const exists = await User.findOne({ username });
            if (!exists) {
                await new User({
                    username,
                    password: username + "123", // New password format
                    role: "student",
                    studentName: fullName,
                    className: "12"
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
