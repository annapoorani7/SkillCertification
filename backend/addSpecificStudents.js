require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const studentNames = [
    "Aishwarya R",
    "Karthik S",
    "Priyadharshini M",
    "Aravind K",
    "Nandhini V",
    "Ramesh P",
    "Harini S",
    "Praveen Kumar R",
    "Keerthana L",
    "Vijayalakshmi T",
    "Dinesh B",
    "Sharmila R",
    "Santhosh K",
    "Lakshmi Priya M",
    "Naveen S",
    "Divya R",
    "Manikandan P",
    "Kavya S",
    "Suresh Kumar V",
    "Meenakshi R",
    "Bharath K",
    "Janani M",
    "Gokul S",
    "Deepika R",
    "Arjun V",
    "Gayathri K",
    "Senthil Kumar P",
    "Pooja S",
    "Rahul M",
    "Shruthi R"
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        let createdCount = 0;
        let skippedCount = 0;

        for (const fullName of studentNames) {
            // Generate username: lowercase, replace spaces with dot
            const username = fullName.toLowerCase().replace(/\s+/g, ".");

            const exists = await User.findOne({ username });
            if (!exists) {
                await new User({
                    username,
                    password: "pass123", // Default password
                    role: "student",
                    studentName: fullName,
                    className: "11"
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
