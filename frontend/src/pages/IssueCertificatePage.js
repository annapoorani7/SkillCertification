import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../utils/api";
import { downloadCertificatePDF } from "../utils/pdfGenerator";
import "../App.css";

function IssueCertificatePage() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        selectedClass: "",
        selectedSection: "",
        studentId: "",
        domain: "",
        skill: "",
        proficiency: "Intermediate",
        issuedBy: ""
    });
    const [issuedCert, setIssuedCert] = useState(null);

    // Domain and skills mapping
    const domainSkills = [
        {
            domain: "Academic & Technical Skills",
            skills: [
                "Programming / Coding",
                "Robotics",
                "Artificial Intelligence Basics",
                "Web Development",
                "Mathematics Excellence",
                "Science Project Achievement"
            ]
        },
        {
            domain: "Sports",
            skills: [
                "Cricket",
                "Football",
                "Volleyball",
                "Athletics",
                "Chess",
                "Badminton"
            ]
        },
        {
            domain: "Cultural & Arts",
            skills: [
                "Classical Dance",
                "Music (Vocal / Instrumental)",
                "Drama / Theatre",
                "Drawing & Painting",
                "Photography",
                "Creative Writing"
            ]
        },
        {
            domain: "Soft Skills & Leadership",
            skills: [
                "Public Speaking",
                "Leadership",
                "Teamwork",
                "Problem Solving",
                "Critical Thinking",
                "Communication Skills"
            ]
        }
    ];

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const studentsRes = await api.get("/users");
            const studentList = studentsRes.data.users || studentsRes.data || [];
            setStudents(studentList);
            // Extract unique classes from students
            const uniqueClasses = [...new Set(studentList.map(s => s.className))].filter(Boolean).sort();
            setClasses(uniqueClasses);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load students");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId || !formData.skill) {
            toast.warning("Please select a student and a skill");
            return;
        }

        setLoading(true);
        try {
            const selectedStudent = students.find(s => s._id === formData.studentId);

            const payload = {
                studentName: selectedStudent.studentName,
                className: selectedStudent.className,
                section: selectedStudent.section,
                skill: formData.skill,
                issuedBy: formData.issuedBy
            };

            const res = await api.post("/issue", payload);

            toast.success("Certificate issued successfully!");
            setIssuedCert(res.data.data);
            // Reset form but keep selectedClass/section and issuedBy
            setFormData({
                ...formData,
                studentId: "",
                skill: "",
                proficiency: "Intermediate"
            });
        } catch (err) {
            console.error("Issue error:", err);
            toast.error(err.response?.data?.error || "Failed to issue certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (issuedCert) {
            await downloadCertificatePDF(issuedCert);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Issue New Certificate</h1>
                    <p>Recognize student achievements with verified digital credentials.</p>
                </div>
            </div>

            <div className="grid-2">
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3>Certificate Details</h3>
                    <form onSubmit={handleSubmit} className="form-stack">
                        <div className="form-group">
                            <label>Select Class</label>
                            <select
                                className="capsule-input"
                                value={formData.selectedClass}
                                onChange={(e) => {
                                    const cls = e.target.value;
                                    const secs = [...new Set(students
                                        .filter(s => s.className === cls)
                                        .map(s => s.section))].filter(Boolean).sort();
                                    setSections(secs);
                                    setFormData({ ...formData, selectedClass: cls, selectedSection: "", studentId: "" });
                                }}
                                required
                            >
                                <option value="">-- Choose Class --</option>
                                {classes.map(cls => (
                                    <option key={cls} value={cls}>
                                        {cls}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.selectedClass && sections.length > 0 && (
                            <div className="form-group">
                                <label>Select Section</label>
                                <select
                                    className="capsule-input"
                                    value={formData.selectedSection}
                                    onChange={(e) => setFormData({ ...formData, selectedSection: e.target.value, studentId: "" })}
                                >
                                    <option value="">-- All Sections --</option>
                                    {sections.map(sec => (
                                        <option key={sec} value={sec}>
                                            {sec}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Select Student</label>
                            <select
                                className="capsule-input"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                required
                                disabled={!formData.selectedClass}
                            >
                                <option value="">-- Choose Student --</option>
                                {students
                                    .filter(s => s.className === formData.selectedClass &&
                                        (formData.selectedSection ? s.section === formData.selectedSection : true)
                                    )
                                    .map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.studentName} {s.registerNumber ? `- ${s.registerNumber}` : ""}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Register Number field removed as register number is now shown in the dropdown */}

                        <div className="form-group">
                            <label>Select Domain</label>
                            <select
                                className="capsule-input"
                                value={formData.domain}
                                onChange={e => setFormData({ ...formData, domain: e.target.value, skill: "" })}
                                required
                            >
                                <option value="">-- Choose Domain --</option>
                                {domainSkills.map(ds => (
                                    <option key={ds.domain} value={ds.domain}>{ds.domain}</option>
                                ))}
                            </select>
                        </div>

                        {formData.domain && (
                            <div className="form-group">
                                <label>Select Skill</label>
                                <select
                                    className="capsule-input"
                                    value={formData.skill}
                                    onChange={e => setFormData({ ...formData, skill: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Skill --</option>
                                    {domainSkills.find(ds => ds.domain === formData.domain)?.skills.map(skill => (
                                        <option key={skill} value={skill}>{skill}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Proficiency Level</label>
                            <select
                                className="capsule-input"
                                value={formData.proficiency}
                                onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Authorized Signatory</label>
                            <input
                                type="text"
                                className="capsule-input"
                                value={formData.issuedBy}
                                onChange={e => setFormData({ ...formData, issuedBy: e.target.value })}
                                placeholder="Enter signatory name"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`capsule-button ${loading ? "loading" : ""}`}
                            disabled={loading}
                            style={{ marginTop: "10px" }}
                        >
                            {loading ? "Processing..." : "Issue Certificate"}
                        </button>
                    </form>
                </motion.div>

                {issuedCert && (
                    <motion.div
                        className="card success-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <div style={{ fontSize: "50px", marginBottom: "20px", color: "#2e7d32" }}>✓</div>
                            <h3>Issuance Successful!</h3>
                            <p>Certificate <strong>#{issuedCert.id}</strong> has been generated for <strong>{issuedCert.studentName}</strong>.</p>
                            {issuedCert.registerNumber && (
                                <p>Register Number: <strong>{issuedCert.registerNumber}</strong></p>
                            )}

                            <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <button className="capsule-button" onClick={handleDownload}>
                                    Download PDF
                                </button>
                                <button className="capsule-button secondary" onClick={() => setIssuedCert(null)}>
                                    Issue Another
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default IssueCertificatePage;
