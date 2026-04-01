require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const allClass9 = await User.find({
            className: "9"
        });

        console.log(`Total students in class 9: ${allClass9.length}`);
        console.log("\nFirst 3 students in class 9 (full documents):");
        allClass9.slice(0, 3).forEach(s => {
            console.log(`\nStudent: ${s.studentName}`);
            console.log(`  - className: '${s.className}' (type: ${typeof s.className})`);
            console.log(`  - section: '${s.section}' (type: ${typeof s.section})`);
            console.log(`  - role: '${s.role}' (type: ${typeof s.role})`);
            console.log(`  - Full section value: ${JSON.stringify(s.section)}`);
            console.log(`  - section === "A": ${s.section === "A"}`);
        });

        console.log("\n\n=== Testing different query combinations ===");
        
        // Test 1: just section
        const justSection = await User.find({ section: "A" });
        console.log(`1. Just section="A": ${justSection.length} results`);
        
        // Test 2: just className
        const justClass = await User.find({ className: "9" });
        console.log(`2. Just className="9": ${justClass.length} results`);
        
        // Test 3: className and section
        const classAndSection = await User.find({ className: "9", section: "A" });
        console.log(`3. className="9" AND section="A": ${classAndSection.length} results`);
        
        // Test 4: with role
        const allThree = await User.find({ className: "9", section: "A", role: "student" });
        console.log(`4. className="9" AND section="A" AND role="student": ${allThree.length} results`);
        
        // Test 5: just role
        const justRole = await User.find({ role: "student" });
        console.log(`5. Just role="student": ${justRole.length} results`);
        
        // Test 6: see if section field exists at all
        const noSection = await User.find({ section: { $exists: false } });
        console.log(`6. Records where section doesn't exist: ${noSection.length} results`);
        
        const hasSection = await User.find({ section: { $exists: true } });
        console.log(`7. Records where section exists: ${hasSection.length} results`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};

check();
