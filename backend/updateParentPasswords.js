require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const update = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Find all parents of class 9, section A students
        const parents = await User.find({ role: "parent" })
            .populate({
                path: "childrenIds",
                select: "className section role"
            });

        // Filter to only parents whose children are in class 9, section A
        const class9SectionAParents = parents.filter(parent =>
            parent.childrenIds.some(child => child.className === "9" && child.section === "A")
        );

        console.log(`Found ${class9SectionAParents.length} parents with class 9, section A children`);

        let updatedCount = 0;

        for (const parent of class9SectionAParents) {
            // Hash the new password (username + "123")
            const newPassword = parent.username + "123";
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update parent password
            await User.findByIdAndUpdate(parent._id, { password: hashedPassword });
            console.log(`✅ Updated password for parent: ${parent.parentName} (${parent.username}) → ${newPassword}`);
            updatedCount++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Updated: ${updatedCount} parent passwords to "username123"`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

update();
