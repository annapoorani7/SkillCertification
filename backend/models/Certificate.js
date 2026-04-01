const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Blockchain cert ID
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String },
    registerNumber: { type: String }, // Student's register number (e.g., 12A101)
    skill: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedOn: { type: String, required: true }, // Unix timestamp string (matches blockchain)
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Certificate", certificateSchema);
