require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Seed Admin
        const adminExists = await User.findOne({ username: "admin" });
        if (!adminExists) {
            const admin = new User({
                username: "admin",
                password: "adminPassword123",
                role: "admin",
            });
            await admin.save();
            console.log("Admin user created: admin / adminPassword123");
        } else {
            console.log("Admin user already exists.");
        }

        // Remove old sample student if exists
        await User.deleteOne({ username: "student" });
        console.log("Removed generic sample student account.");

        // List of 10 students for Class 11
        const students = [
            { name: "Abinithi", user: "abinithi", pass: "pass123", class: "11" },
            { name: "Annapoorani", user: "annapoorani", pass: "pass123", class: "11" },
            { name: "Bharathi", user: "bharathi", pass: "pass123", class: "11" },
            { name: "Chithra", user: "chithra", pass: "pass123", class: "11" },
            { name: "Deepa", user: "deepa", pass: "pass123", class: "11" },
            { name: "Ezhil", user: "ezhil", pass: "pass123", class: "11" },
            { name: "Farooq", user: "farooq", pass: "pass123", class: "11" },
            { name: "Ganesh", user: "ganesh", pass: "pass123", class: "11" },
            { name: "Hari", user: "hari", pass: "pass123", class: "11" },
            { name: "Indhu", user: "indhu", pass: "pass123", class: "11" },
        ];

        for (const s of students) {
            const exists = await User.findOne({ username: s.user });
            if (!exists) {
                const newUser = new User({
                    username: s.user,
                    password: s.pass,
                    role: "student",
                    studentName: s.name,
                    className: s.class
                });
                await newUser.save();
                console.log(`Student created: ${s.name} (${s.user}) in Class ${s.class}`);
            } else {
                // Update existing students with className if missing
                if (!exists.className) {
                    exists.className = s.class;
                    await exists.save();
                    console.log(`Updated Class for ${s.name}`);
                } else {
                    console.log(`Student already exists: ${s.name}`);
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
