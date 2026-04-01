require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const assignSections = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Get all classes
        const allStudents = await User.find({ role: "student" }).select("className section studentName");
        const classes = [...new Set(allStudents.map(s => s.className))].sort();

        console.log(`Found classes: ${classes.join(", ")}`);

        let totalUpdated = 0;

        for (const className of classes) {
            const classStudents = await User.find({ role: "student", className }).sort({ studentName: 1 });

            console.log(`\nProcessing Class ${className}: ${classStudents.length} students`);

            // Divide into 3 sections (A, B, C)
            const sectionSize = Math.ceil(classStudents.length / 3);
            const sections = ['A', 'B', 'C'];

            let updatedInClass = 0;

            for (let i = 0; i < classStudents.length; i++) {
                const sectionIndex = Math.floor(i / sectionSize);
                const section = sections[Math.min(sectionIndex, 2)]; // Ensure we don't go beyond 'C'

                await User.findByIdAndUpdate(classStudents[i]._id, { section });
                console.log(`  ${classStudents[i].studentName} → Section ${section}`);
                updatedInClass++;
                totalUpdated++;
            }

            console.log(`✅ Class ${className}: ${updatedInClass} students updated`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Total students updated: ${totalUpdated}`);

        // Verify the distribution
        console.log(`\n🔍 Verification:`);
        for (const className of classes) {
            const sectionCounts = await User.aggregate([
                { $match: { role: "student", className } },
                { $group: { _id: "$section", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);

            console.log(`Class ${className}:`);
            sectionCounts.forEach(sec => {
                console.log(`  Section ${sec._id}: ${sec.count} students`);
            });
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

assignSections();
