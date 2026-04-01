require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const updatePasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const students = await User.find({ role: "student" });
        console.log(`Found ${students.length} students. Updating passwords...`);

        let updatedCount = 0;

        for (const student of students) {
            // New password is username + "123"
            const newPassword = student.username + "123";

            // Re-hash will happen automatically due to pre-save hook in User model
            student.password = newPassword;
            await student.save();

            updatedCount++;
            if (updatedCount % 10 === 0) {
                console.log(`Progress: ${updatedCount}/${students.length} updated...`);
            }
        }

        console.log(`\nSuccessfully updated passwords for ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating passwords:", err);
        process.exit(1);
    }
};

updatePasswords();
