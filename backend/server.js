require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dns = require("dns");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { pgPool } = require("./config/database");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Certificate = require("./models/Certificate");
const { body, validationResult } = require("express-validator");
const auth = require("./middleware/auth");
const http = require("http");
const socketIo = require("socket.io");

app.get("/", (req, res) => {
  res.send("SkillCert Backend Running ✅");
});

// new modular controllers
const UserController = require("./src/controllers/user.controller");
const userController = new UserController();

// Certificate routes
const certificateRoutes = require("./src/routes/certificates");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use(bodyParser.json());
app.use(cors()); // ✅ enable cross-origin requests

// Force IPv4 for localhost resolving (fixes ::1 ECONNREFUSED)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Test postgres connection
pgPool.query('SELECT NOW()', [], (err, res) => {
  if (err) {
    console.error('Postgres connection error:', err);
  } else {
    console.log('Postgres connected at', res.rows[0].now);
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their role-based room
  socket.on('join', (userData) => {
    if (userData.role) {
      socket.join(userData.role);
      socket.join(`user_${userData.id}`);
      console.log(`User ${userData.username} joined rooms: ${userData.role}, user_${userData.id}`);
    }
  });

  // Handle messaging
  socket.on('sendMessage', (data) => {
    const { to, message, from } = data;
    io.to(`user_${to}`).emit('receiveMessage', { from, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Log request helper
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Log error to file helper
const logError = (msg, err) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}: ${err.message}\n${err.stack}\n---\n`;
  fs.appendFileSync(path.join(__dirname, "error.log"), logMsg);
  console.error(msg, err);
};

// ---------------- AUTH ROUTES ----------------

// Register
app.post("/register", [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role, studentName, className } = req.body;
  try {
    const user = new User({ username, password, role, studentName, className });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "User registration failed: " + err.message });
  }
});

// Login
app.post("/login", [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {

      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, studentName: user.studentName, className: user.className, classTeacher: user.classTeacher, parentName: user.parentName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, username: user.username, role: user.role, studentName: user.studentName, className: user.className, classTeacher: user.classTeacher, parentName: user.parentName, email: user.email, id: user._id });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// Add new student (Admin only)
app.post("/users", auth, [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("studentName").notEmpty().withMessage("Student name is required"),
  body("className").notEmpty().withMessage("Class name is required"),
  body("section").optional().isIn(["A","B","C"]).withMessage("Section must be A, B, or C"),
], async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, studentName, className, section } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = new User({
      username,
      password,
      role: "student",
      studentName,
      className,
      section: section || "A"
    });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create student: " + err.message });
  }
});

// Get all students (Admin only)
app.get("/users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students: " + err.message });
  }
});

// Get students for authenticated users (including admins during certificate issuance)
app.get("/api/students", auth, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students: " + err.message });
  }
});

// Diagnostic endpoint to check system status
app.get("/api/diagnostic", auth, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    res.json({
      totalStudents,
      totalAdmins,
      currentUser: {
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const certificateRepository = require('./src/repositories/certificate.repository');

// Sample skills data for admin dashboard
const SAMPLE_SKILLS = [
  { _id: '1', skillName: 'English', id: '1', name: 'English' },
  { _id: '2', skillName: 'Tamil', id: '2', name: 'Tamil' },
  { _id: '3', skillName: 'C', id: '3', name: 'C' },
  { _id: '4', skillName: 'Python', id: '4', name: 'Python' },
];

app.get("/api/skills", async (req, res) => {
  res.json(SAMPLE_SKILLS);
});

app.get("/api/certificates/all", auth, async (req, res) => {
  try {
    const certs = await certificateRepository.getAllCertificates();
    res.json({ certificates: certs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/organizations", auth, async (req, res) => {
  try {
    const result = await pgPool.query('SELECT * FROM organizations');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modular routes alias
app.get("/api/users", auth, async (req, res) => {
  try {
    const users = await User.find({ role: "student" }).select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Certificate routes
app.use("/api/certificates", certificateRoutes);


// Update student details (Admin only)
app.put("/users/:id", auth, [
  body("username").optional().isLength({ min: 3 }),
  body("password").optional().isLength({ min: 6 }),
  body("section").optional().isIn(["A","B","C"]).withMessage("Section must be A, B, or C"),
], async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, studentName, password, className, section } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Student not found" });

    const oldUsername = user.username;
    if (username) user.username = username;
    if (studentName) user.studentName = studentName;
    if (className) user.className = className;
    if (section) user.section = section;
    if (password) user.password = password; // Pre-save hook will hash it

    await user.save();

    res.json({ message: "Student updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Update failed: " + err.message });
  }
});

// Delete student (Admin only)
app.delete("/users/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ error: "Student not found" });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed: " + err.message });
  }
});

// ---------------- SYSTEM MANAGEMENT ROUTES (ADMIN ONLY) ----------------

// Get all admins
app.get("/admins", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied." });
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// Create new admin
app.post("/admins", auth, [
  body("username").isLength({ min: 3 }),
  body("password").isLength({ min: 6 }),
], async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied." });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password } = req.body;
    const admin = new User({ username, password, role: "admin" });
    await admin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to create admin" });
  }
});

// Delete admin
app.delete("/admins/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied." });
  if (req.user.id === req.params.id) return res.status(400).json({ error: "You cannot delete yourself." });

  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Admin not found" });

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

// Get all parents (Admin only) with populated children
app.get("/api/parents", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const parents = await User.find({ role: "parent" })
      .populate({
        path: "childrenIds",
        select: "studentName className section _id"
      })
      .select("-password");
    res.json({ parents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create parent (Admin only)
app.post("/api/parents", auth, [
  body("username").notEmpty(),
  body("password").notEmpty(),
  body("parentName").notEmpty(),
], async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, parentName, email, childrenIds } = req.body;

  try {
    // Check if username exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newParent = new User({
      username,
      password,
      role: "parent",
      parentName,
      email: email || "",
      childrenIds: childrenIds || []
    });

    await newParent.save();

    const savedParent = await User.findById(newParent._id)
      .populate({ path: "childrenIds", select: "studentName className _id section" })
      .select("-password");

    res.status(201).json({ message: "Parent created successfully", parent: savedParent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update parent (Admin only)
app.put("/api/parents/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    const { parentName, email, childrenIds, password } = req.body;
    const updateData = { parentName, email };

    if (password) updateData.password = password;
    if (childrenIds !== undefined) updateData.childrenIds = childrenIds;

    const parent = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({ path: "childrenIds", select: "studentName className _id section" })
      .select("-password");

    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    res.json({ message: "Parent updated successfully", parent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete parent (Admin only)
app.delete("/api/parents/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const parent = await User.findByIdAndDelete(req.params.id);
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }
    res.json({ message: "Parent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete parent" });
  }
});


// ---------------- ROUTES ----------------

// Issue certificate (Admin only) - MongoDB only
app.post("/issue", auth, [
  body("studentName").notEmpty(),
  body("className").notEmpty(),
  body("section").notEmpty(),
  body("skill").notEmpty(),
  body("issuedBy").notEmpty(),
], async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { studentName, className, section, skill, issuedBy } = req.body;

  try {
    // Find the student to get their register number
    const student = await User.findOne({
      studentName: studentName,
      className: className,
      section: section,
      role: "student"
    });

    const registerNumber = student ? student.registerNumber : null;

    const responseData = {
      id: Math.floor(Math.random() * 1000000).toString(), // Generate a unique ID for MongoDB
      studentName,
      className,
      section,
      registerNumber,
      skill,
      issuedBy,
      issuedOn: Math.floor(Date.now() / 1000).toString()
    };

    const cert = new Certificate(responseData);
    await cert.save();

    // Emit notifications
    if (student) {
      io.to(`user_${student._id}`).emit('notification', {
        type: 'certificate_issued',
        message: `New certificate issued for ${skill}`,
        data: responseData
      });
      io.to('student').emit('notification', {
        type: 'certificate_issued',
        message: `Certificate issued to ${studentName} for ${skill}`,
        data: responseData
      });
    }
    io.to('admin').emit('notification', {
      type: 'certificate_issued',
      message: `Certificate issued to ${studentName} for ${skill}`,
      data: responseData
    });

    res.json({
      message: "Certificate issued successfully",
      data: responseData,
    });
  } catch (err) {
    logError("Error in /issue", err);
    res.status(500).json({ error: err.message });
  }
});

// Verify certificate — MongoDB only
app.get("/verify/:id", async (req, res) => {
  const certId = req.params.id;

  try {
    const cert = await Certificate.findOne({ id: certId }).lean();
    if (!cert) return res.status(404).json({ error: "Certificate not found" });
    return res.json({ certificate: cert });
  } catch (err) {
    console.error(`Error in /verify/${certId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Get certificates by student name (Protected: Owner or Admin) — reads from MongoDB for persistence
app.get("/student/:name/certificates", auth, async (req, res) => {
  const studentName = req.params.name;

  // Check if user is admin OR requesting their own certificates
  if (req.user.role !== "admin" && req.user.studentName !== studentName) {
    return res.status(403).json({ error: "Access denied. You can only view your own certificates." });
  }

  try {
    const certificates = await Certificate.find({ studentName }).sort({ createdAt: -1 }).lean();
    res.json({ certificates });
  } catch (err) {
    console.error(`Error in /student/${studentName}/certificates:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Alias for student dashboard fetching from MongoDB
app.get("/api/my-certificates", auth, async (req, res) => {
  try {
    const studentName = req.user.studentName;
    if (!studentName) {
      return res.status(400).json({ error: "Student profile not found" });
    }
    const fetchedCertificates = await Certificate.find({ studentName }).sort({ createdAt: -1 }).lean();

    // Map to unified format for frontend
    const mappedCertificates = fetchedCertificates.map(cert => ({
      id: cert.id,
      student_id: cert.studentName,
      class_name: cert.className,
      skill_name: cert.skill,
      proficiency_level: "Intermediate",
      organization_name: cert.issuedBy,
      issued_at: new Date(Number(cert.issuedOn) * 1000).toISOString(),
      expires_at: null,
      revoked: false
    }));

    res.json({ success: true, certificates: mappedCertificates });
  } catch (err) {
    console.error("Error fetching my certificates from MongoDB:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all certificates (Admin) — reads from MongoDB for persistence
app.get("/certificates", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 }).lean();
    res.json({ certificates });
  } catch (err) {
    console.error("Error in /certificates:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get parent's children (Parent only)
app.get("/parent/children", auth, async (req, res) => {
  if (req.user.role !== "parent") {
    return res.status(403).json({ error: "Access denied. Parents only." });
  }
  try {
    const parent = await User.findById(req.user.id).populate("childrenIds", "studentName className _id").select("-password");
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }
    res.json({ children: parent.childrenIds });
  } catch (err) {
    console.error("Error in /parent/children:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get parent's children certificates (Parent only)
app.get("/parent/children-certificates", auth, async (req, res) => {
  if (req.user.role !== "parent") {
    return res.status(403).json({ error: "Access denied. Parents only." });
  }
  try {
    const parent = await User.findById(req.user.id).populate("childrenIds");
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    const childrenIds = parent.childrenIds.map(child => child._id);
    const certificates = await Certificate.find({
      studentId: { $in: childrenIds }
    }).lean().sort({ createdAt: -1 });

    res.json({ certificates, children: parent.childrenIds });
  } catch (err) {
    console.error("Error in /parent/children-certificates:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get platform stats — reads from MongoDB for persistence
app.get("/stats", auth, async (req, res) => {
  try {
    const [totalCertificates, studentCount, adminCount, parentCount, allCerts] = await Promise.all([
      Certificate.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "parent" }),
      Certificate.find().select("className").lean()
    ]);

    // Certificates by Class aggregation from MongoDB
    const classMap = {};
    allCerts.forEach(cert => {
      const cls = cert.className || "Unassigned";
      classMap[cls] = (classMap[cls] || 0) + 1;
    });

    const classDistribution = Object.keys(classMap).map(cls => ({
      name: cls,
      value: classMap[cls]
    }));

    res.json({
      totalCertificates: totalCertificates.toString(),
      studentCount,
      adminCount,
      parentCount,
      classDistribution
    });
  } catch (err) {
    console.error("Error in /stats:", err);
    res.status(500).json({ error: err.message });
  }
});

// Store FCM token for push notifications
app.post("/api/store-fcm-token", auth, async (req, res) => {
  const { token, userId } = req.body;
  try {
    // In a real app, store this in database
    console.log(`FCM Token for user ${userId}: ${token}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
