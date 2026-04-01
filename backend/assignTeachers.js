require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"); // Ensure path is correct depending on where the script runs.

const teachers = [
  "Aravind K", "Nandhini R", "Karthikeyan S", "Divya M", "Praveen V",
  "Harini T", "Suresh P", "Keerthana K", "Manoj R", "Pavithra S",
  "Vignesh M", "Gayathri V", "Dinesh T", "Aishwarya P", "Ramesh K",
  "Janani R", "Sathish S", "Abirami M", "Lokesh V", "Saranya T",
  "Naveen P", "Meena K", "Kiran R", "Sharmila S", "Vijay M",
  "Nivetha V", "Ajith T", "Deepa P", "Rahul K", "Priyanka R"
];

const assignTeachers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillcert", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    // Find all students
    const students = await User.find({ role: "student" });
    console.log(`Found ${students.length} students.`);

    // Group by className and section
    const classSections = new Set();
    students.forEach(s => {
      if (s.className) {
        const sec = s.section || "A";
        classSections.add(`${s.className}-${sec}`);
      }
    });

    const uniqueClasses = Array.from(classSections).sort();
    console.log(`Found ${uniqueClasses.length} unique class-section combinations.`);

    let teacherIndex = 0;
    const teacherMap = {}; // mapping "className-section" to "Teacher Name"

    for (const clsSec of uniqueClasses) {
       teacherMap[clsSec] = teachers[teacherIndex % teachers.length];
       teacherIndex++;
    }

    console.log("Teacher Mapping:", teacherMap);

    // Update students
    let updateCount = 0;
    for (const s of students) {
        if (!s.className) continue;
        const sec = s.section || "A";
        const key = `${s.className}-${sec}`;
        const assignedTeacher = teacherMap[key];
        if (assignedTeacher) {
            s.classTeacher = assignedTeacher;
            await s.save();
            updateCount++;
        }
    }

    console.log(`Successfully updated ${updateCount} students with class teachers.`);

  } catch (error) {
    console.error("Error updating teachers:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

assignTeachers();
