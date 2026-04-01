require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const generateUsernameFromName = (name) => {
    return name.toLowerCase().replace(/\s+/g, ".");
};

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
            const newUsername = generateUsernameFromName(parent.parentName);

            // Check if username is already taken
            const existingUser = await User.findOne({ username: newUsername, _id: { $ne: parent._id } });
            if (existingUser) {
                console.log(`⚠️  Username '${newUsername}' already exists for another user`);
                continue;
            }

            // Update parent username
            await User.findByIdAndUpdate(parent._id, { username: newUsername });
            console.log(`✅ Updated parent: ${parent.parentName} (${parent.username} → ${newUsername})`);
            updatedCount++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Updated: ${updatedCount} parent usernames`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

update();
