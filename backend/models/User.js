const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "student", "parent"], default: "student" },
    studentName: { type: String }, // For students, map to their name
    className: { type: String }, // Class/Grade of student
    section: { type: String, enum: ["A","B","C"], default: "A" }, // Section within class
    registerNumber: { type: String }, // Unique register number for students (e.g., 12A101)
    classTeacher: { type: String }, // Class teacher assigned to this student
    parentName: { type: String }, // For parents, their name
    childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For parents, their children
    email: { type: String }, // Email for parents/admin
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
