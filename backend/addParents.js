require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const parentsList = [
    { parentName: "Ramesh S", email: "ramesh.s@email.com", childrenNames: ["Aarthi S", "Bhuvanesh R"] },
    { parentName: "Vijaya P", email: "vijaya.p@email.com", childrenNames: ["Chitra M", "Dhanush K"] },
    { parentName: "Kumar V", email: "kumar.v@email.com", childrenNames: ["Eswari P", "Gopinath V"] },
    { parentName: "Lakshmi R", email: "lakshmi.r@email.com", childrenNames: ["Hemalatha R", "Ishwar S"] },
    { parentName: "Prakash K", email: "prakash.k@email.com", childrenNames: ["Jayanthi K", "Karthika M"] },
    { parentName: "Sunita M", email: "sunita.m@email.com", childrenNames: ["Lokesh P", "Mahalakshmi R"] },
    { parentName: "Arun N", email: "arun.n@email.com", childrenNames: ["Natarajan S", "Pavithra K"] },
    { parentName: "Divya R", email: "divya.r@email.com", childrenNames: ["Raghavan M", "Sakthi V"] },
    { parentName: "Mohan T", email: "mohan.t@email.com", childrenNames: ["Thilagavathi R", "Udhaya K"] },
    { parentName: "Priya V", email: "priya.v@email.com", childrenNames: ["Vasanthi S", "Yogesh M"] },
    { parentName: "Suresh B", email: "suresh.b@email.com", childrenNames: ["Anitha R", "Balasubramanian K"] },
    { parentName: "Geetha C", email: "geetha.c@email.com", childrenNames: ["Chandra S", "Durgadevi M"] },
    { parentName: "Ravi E", email: "ravi.e@email.com", childrenNames: ["Elangovan P", "Geetha R"] },
    { parentName: "Asha H", email: "asha.h@email.com", childrenNames: ["Haripriya K", "Jegan S"] },
    { parentName: "Karthik K", email: "karthik.k@email.com", childrenNames: ["Kalpana M", "Muthukumar V"] }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        let createdCount = 0;
        let skippedCount = 0;

        for (const parentData of parentsList) {
            // Generate username: lowercase parent name with dot
            const username = parentData.parentName.toLowerCase().replace(/\s+/g, ".");

            const exists = await User.findOne({ username });
            if (!exists) {
                // Find children by their names
                const children = await User.find({
                    studentName: { $in: parentData.childrenNames }
                });
                const childrenIds = children.map(c => c._id);

                await new User({
                    username,
                    password: username + "123",
                    role: "parent",
                    parentName: parentData.parentName,
                    email: parentData.email,
                    childrenIds: childrenIds
                }).save();
                console.log(`✓ Added: ${parentData.parentName} (${username}) with ${childrenIds.length} children`);
                createdCount++;
            } else {
                console.log(`– Skipped (Already exists): ${parentData.parentName} (${username})`);
                skippedCount++;
            }
        }

        console.log(`\nResults:\nCreated: ${createdCount}\nSkipped: ${skippedCount}`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding parents:", err);
        process.exit(1);
    }
};

seed();
