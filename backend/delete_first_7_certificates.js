require("dotenv").config();
const mongoose = require("mongoose");
const Certificate = require("./models/Certificate");

const deleteFirstNCertificates = async (n = 7) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Find the first n certificates (by creation date)
    const certs = await Certificate.find().sort({ createdAt: 1 }).limit(n);
    if (certs.length === 0) {
      console.log("No certificates found.");
      return;
    }
    const ids = certs.map(c => c._id);
    const result = await Certificate.deleteMany({ _id: { $in: ids } });
    console.log(`Deleted ${result.deletedCount} certificate(s).`);
  } catch (err) {
    console.error("Error deleting certificates:", err);
  } finally {
    await mongoose.disconnect();
  }
};

deleteFirstNCertificates(7);