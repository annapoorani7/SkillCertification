require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const assignRegisterNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillcert');
        console.log("Connected to MongoDB...");

        // Get all students grouped by class and section
        const students = await User.find({ role: "student" }).sort({ className: 1, section: 1, studentName: 1 });

        console.log(`Found ${students.length} students to assign register numbers`);

        // Group students by class and section
        const groupedStudents = {};
        students.forEach(student => {
            const key = `${student.className}${student.section}`;
            if (!groupedStudents[key]) {
                groupedStudents[key] = [];
            }
            groupedStudents[key].push(student);
        });

        let totalUpdated = 0;

        // Assign register numbers for each class-section group
        for (const [classSection, studentList] of Object.entries(groupedStudents)) {
            const className = classSection.slice(0, -1); // Remove last character (section)
            const section = classSection.slice(-1); // Get last character (section)

            console.log(`\nProcessing Class ${className} Section ${section}: ${studentList.length} students`);

            // Sort students by name for consistent ordering
            studentList.sort((a, b) => a.studentName.localeCompare(b.studentName));

            // Assign register numbers starting from 101
            for (let i = 0; i < studentList.length; i++) {
                const registerNumber = `${className}${section}${String(101 + i).padStart(3, '0')}`;

                await User.findByIdAndUpdate(studentList[i]._id, { registerNumber });

                console.log(`  ${studentList[i].studentName} → ${registerNumber}`);
                totalUpdated++;
            }

            console.log(`✅ Class ${className} Section ${section}: ${studentList.length} students updated`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Total students updated: ${totalUpdated}`);

        // Verification
        console.log(`\n🔍 Verification:`);
        const verificationResults = await User.aggregate([
            { $match: { role: "student", registerNumber: { $exists: true } } },
            {
                $group: {
                    _id: { className: "$className", section: "$section" },
                    count: { $sum: 1 },
                    registerNumbers: { $push: "$registerNumber" }
                }
            },
            { $sort: { "_id.className": 1, "_id.section": 1 } }
        ]);

        verificationResults.forEach(result => {
            console.log(`Class ${result._id.className} Section ${result._id.section}: ${result.count} students`);
            console.log(`  Register numbers: ${result.registerNumbers.slice(0, 5).join(', ')}${result.registerNumbers.length > 5 ? '...' : ''}`);
        });

        console.log("\n🎉 Register number assignment completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Error assigning register numbers:", error);
        process.exit(1);
    }
};

assignRegisterNumbers();