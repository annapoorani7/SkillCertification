require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Update all students that have className but no section field
        const result = await User.updateMany(
            { role: "student", section: { $exists: false } },
            { $set: { section: "A" } }
        );

        console.log(`✅ Updated ${result.modifiedCount} students with section: "A"`);

        // Now verify
        const class9Students = await User.find({
            className: "9",
            section: "A"
        });

        console.log(`✅ Verified: Found ${class9Students.length} students in class 9, section A`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

migrate();
