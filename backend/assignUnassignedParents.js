require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const parentNames = [
    "Abhishek R", "Anjali S", "Akash M", "Bhavya V", "Anand T", "Chitra P", "Arul K", "Deepika R", "Baskar S", "Elavarasi M", "Dhanush V", "Fathima T", "Eshwar P", "Geetha K", "Gopinath R", "Hema S", "Hariharan M", "Indira V", "Ilango T", "Jothi P", "Jagadeesh K", "Kalpana R", "Karthi S", "Lalitha M", "Kavin V", "Madhavi T", "Kiran P", "Nirmala K", "Kumar R", "Oviya S", "Logesh M", "Parvathi V", "Muthu T", "Revathi P", "Murali K", "Shanthi R", "Naren S", "Thilaga M", "Nithin V", "Uma T", "Pandian P", "Valli K", "Prasanth R", "Yamuna S", "Praveenkumar M", "Aarthika V", "Raghavan T", "Bhuvaneshwari P", "Rajkumar K", "Charumathi R", "Rakesh S", "Dharani M", "Ramkumar V", "Ezhilarasi T", "Ranjan P", "Firoz K", "Saravanan R", "Girija S", "Selvakumar M", "Hemavathi V", "Senthil T", "Ilavarasi P", "Shankar K", "Janaki R", "Sivakumar S", "Kamala M", "Sureshkumar V", "Kaveri T", "Thangaraj P", "Leelavathi K", "Uday R", "Malliga S", "Vasanth M", "Nageswari V", "Velmurugan T", "Padma P", "Venkatesh K", "Rani R", "Vijayakumar S", "Sarojini M", "Vishnu V", "Thangam T", "Yashwanth P", "Usha K", "Yogesh R", "Vennila S", "Yuvaraj M", "Abinaya V", "Aadhavan T", "Balamani P", "Aakash K", "Chinnaponnu R", "Adarsh S", "Devayani M", "Ajmal V", "Easwari T", "Akilan P", "Gomathi K", "Amal R", "Hemalatha S", "Anbu M", "Indumathi V", "Anish T", "Jayanthi P", "Antony K", "Karpagam R", "Aravinth S", "Lakshmi M", "Ashwinraj V", "Meera T", "Babu P", "Nandha K", "Bala R", "Oormila S", "Balamurugan M", "Pavani V", "Boopathy T", "Radhika P", "Chandran K", "Sadhana R", "Damu S", "Shobana M", "Deena V", "Subha T", "Devraj P", "Sudha K", "Dilli R", "Suganthi S", "Dineshwar M", "Sujatha V", "Elango T", "Sumalatha P", "Eswaran K", "Suseela R", "Ganesan S", "Thamarai M", "Gopi V", "Thilagavathi T", "Guhan P", "Udhaya K", "Harish R", "Vasanthi S", "Iniyan M", "Vidhya V", "Jegan T", "Vijaya P", "Jeyakumar K", "Vinodhini R", "Karthick S", "Yazhini M", "Kousik V", "Yashika T", "Krishnan P", "Zareena K", "Madhanraj R", "Zubaida S", "Mahesh M", "Zarina V", "Mani T", "Zeenath P", "Maran K", "Zoya R", "Mohanraj S", "Zainab M"
];

const assignParents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Find all parents
        const parents = await User.find({ role: "parent" });
        
        // Collect all assigned student IDs
        const assignedStudentIds = new Set();
        parents.forEach(parent => {
            if (parent.childrenIds) {
                parent.childrenIds.forEach(id => assignedStudentIds.add(id.toString()));
            }
        });

        // Find all students
        const allStudents = await User.find({ role: "student" });
        
        // Determine unassigned students
        const unassignedStudents = allStudents.filter(student => !assignedStudentIds.has(student._id.toString()));

        console.log(`Total Students: ${allStudents.length}`);
        console.log(`Assigned Students: ${assignedStudentIds.size}`);
        console.log(`Unassigned Students: ${unassignedStudents.length}`);
        console.log(`Available Parent Names: ${parentNames.length}`);

        let createdCount = 0;
        let pIndex = 0;

        for (const student of unassignedStudents) {
            if (pIndex >= parentNames.length) {
                console.log("Ran out of provided parent names! Some students remain unassigned.");
                break;
            }

            let parentName = parentNames[pIndex];
            pIndex++;
            
            // Generate username
            let baseUsername = parentName.toLowerCase().replace(/\s+/g, ".");
            let username = baseUsername;
            
            // Ensure unique username
            let existingUser = await User.findOne({ username });
            let counter = 1;
            while (existingUser) {
                username = `${baseUsername}${counter}`;
                existingUser = await User.findOne({ username });
                counter++;
            }

            const email = `${username}@email.com`;

            // Create parent
            await new User({
                username: username,
                password: username + "123", // raw password, mongoose pre-save hook hashes it
                role: "parent",
                parentName: parentName,
                email: email,
                childrenIds: [student._id]
            }).save();

            console.log(`✓ Assigned parent ${parentName} (${username}) to student ${student.studentName || student.username}`);
            createdCount++;
        }

        console.log(`\nAssignment Complete.`);
        console.log(`Newly Created Parents: ${createdCount}`);
        console.log(`Remaining Unassigned Students: ${Math.max(0, unassignedStudents.length - createdCount)}`);

        process.exit(0);
    } catch (err) {
        console.error("Error assigning parents:", err);
        process.exit(1);
    }
};

assignParents();
