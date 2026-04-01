require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const parentNames = [
    "Aishwarya M",
    "Akilan R",
    "Amudha S",
    "Arulraj K",
    "Ashwini P",
    "Balachandar V",
    "Bhavatharani R",
    "Chandrasekar S",
    "Dharshini M",
    "Elamaran K",
    "Gayathri P",
    "Gokulnath V",
    "Haritha R",
    "Ilavarasan S",
    "Janarthanan M",
    "Jayanthika K",
    "Kavinraj P",
    "Keerthivasan V",
    "Lakshmipriya R",
    "Madhumitha S",
    "Manivannan M",
    "Meenalochani K",
    "Natarani P",
    "Nithish V",
    "Poornima R",
    "Prabhakaran S",
    "Ranjithkumar M",
    "Rukmani K",
    "Senthamarai P",
    "Vetrivel V"
];

const update = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Find all students in class 9, section A and sort by studentName
        const students = await User.find({
            className: "9",
            section: "A",
            role: "student"
        }).sort({ studentName: 1 });

        console.log(`Found ${students.length} students in class 9, section A`);

        if (students.length !== parentNames.length) {
            console.warn(`⚠️  Warning: Student count (${students.length}) doesn't match parent names count (${parentNames.length})`);
        }

        let updatedCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const newParentName = parentNames[i];

            // Find parent for this student
            const parent = await User.findOne({
                role: "parent",
                childrenIds: student._id
            });

            if (parent) {
                // Update parent name
                await User.findByIdAndUpdate(parent._id, { parentName: newParentName });
                console.log(`✅ Updated parent for ${student.studentName}: ${parent.parentName} → ${newParentName}`);
                updatedCount++;
            } else {
                console.log(`⚠️  No parent found for ${student.studentName}`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Updated: ${updatedCount} parent names`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

update();
