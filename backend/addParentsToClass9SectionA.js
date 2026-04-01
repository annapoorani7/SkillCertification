require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Find all students in class 9, section A
        console.log("Querying: className='9', section='A', role='student'");
        
        // Debug: check what's in the DB first
        const allUsers = await User.countDocuments();
        console.log(`Total users in DB: ${allUsers}`);
        
        const class9Count = await User.countDocuments({ className: "9" });
        console.log(`Students with className='9': ${class9Count}`);
        
        const class9SectionACount = await User.countDocuments({ className: "9", section: "A" });
        console.log(`Students with className='9' AND section='A': ${class9SectionACount}`);
        
        const students = await User.find({
            className: "9",
            section: "A",
            role: "student"
        }).select("studentName className section role");

        console.log(`Found ${students.length} students in class 9, section A`);
        if (students.length > 0) {
            console.log("First student:", students[0]);
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (const student of students) {
            // Generate parent username: "parent_" + student name lowercase with dots
            const parentUsername = `parent_${student.studentName.toLowerCase().replace(/\s+/g, ".")}`;
            
            // Check if parent already exists
            const existingParent = await User.findOne({ username: parentUsername });
            if (existingParent) {
                console.log(`⏭️  Parent for ${student.studentName} already exists (${parentUsername})`);
                skippedCount++;
                continue;
            }

            // Create parent for this student
            const parentName = `Parent of ${student.studentName}`;
            const newParent = new User({
                username: parentUsername,
                password: parentUsername + "123",
                role: "parent",
                parentName: parentName,
                email: `${parentUsername}@school.local`,
                childrenIds: [student._id]
            });

            await newParent.save();
            console.log(`✅ Created parent: ${parentUsername} for student: ${student.studentName}`);
            createdCount++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Created: ${createdCount} new parents`);
        console.log(`⏭️  Skipped: ${skippedCount} (already have parents)`);
        console.log(`Total: ${createdCount + skippedCount} students processed`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

seed();
