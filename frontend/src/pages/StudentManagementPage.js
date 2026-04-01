import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import "../App.css";

function StudentManagementPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ username: "", studentName: "", password: "", className: "", section: "A", classTeacher: "", registerNumber: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [parents, setParents] = useState([]);

    // New student state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({ username: "", studentName: "", password: "", className: "", section: "A", classTeacher: "", registerNumber: "" });
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [availableSections, setAvailableSections] = useState([]);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, parentsRes] = await Promise.all([
                api.get("/users"),
                api.get("/api/parents").catch(() => ({ data: { parents: [] } }))
            ]);
            const studentsData = usersRes.data.users || usersRes.data;
            setStudents(studentsData);
            setParents(parentsRes.data.parents || []);

            // compute sections for selected class if set
            if (selectedClass) {
                const secs = new Set();
                studentsData.forEach(s => {
                    if (String(s.className) === selectedClass && s.section) secs.add(s.section);
                });
                setAvailableSections(Array.from(secs).sort());
            }
        } catch (err) {
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    }, [selectedClass]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success("Student deleted successfully");
            fetchStudents();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const startEdit = (student) => {
        setEditingId(student._id);
        setEditData({
            username: student.username,
            studentName: student.studentName,
            className: student.className || "",
            section: student.section || "A",
            classTeacher: student.classTeacher || "",
            registerNumber: student.registerNumber || "",
            password: ""
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editData };
            if (!payload.password) delete payload.password;

            await api.put(`/users/${editingId}`, payload);
            toast.success("Student updated successfully");
            setEditingId(null);
            fetchStudents();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!newStudent.username || !newStudent.studentName || !newStudent.password || !newStudent.className || !newStudent.section) {
            toast.warn("Please fill in all fields.");
            return;
        }
        try {
            await api.post("/users", newStudent);
            toast.success("Student added successfully");
            setNewStudent({ username: "", studentName: "", password: "", className: "", section: "A", classTeacher: "", registerNumber: "" });
            setShowAddForm(false);
            fetchStudents();
        } catch (err) {
            toast.error("Failed to add student: " + (err.response?.data?.error || err.message));
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = selectedClass ? String(s.className) === selectedClass : false;
        const matchesSection = selectedSection ? String(s.section) === selectedSection : true;
        return matchesSearch && matchesClass && matchesSection;
    });

    return (
        <div style={{ padding: "10px 0" }}>
            {/* Redundant header removed for tabbed integration */}

            {showAddForm && (
                <div className="card" style={{ marginBottom: "20px" }}>
                    <h3>Add New Student</h3>
                    <form onSubmit={handleAddStudent} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px" }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={newStudent.studentName}
                            onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 1, minWidth: "150px" }}
                        />
                        <input
                            type="text"
                            placeholder="Register Number"
                            value={newStudent.registerNumber}
                            onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 1, minWidth: "150px" }}
                        />
                        <input
                            type="text"
                            placeholder="Class"
                            value={newStudent.className}
                            onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 1, minWidth: "100px" }}
                        />
                        <select
                            value={newStudent.section}
                            onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 0.5, minWidth: "80px" }}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Class Teacher"
                            value={newStudent.classTeacher}
                            onChange={(e) => setNewStudent({ ...newStudent, classTeacher: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 1, minWidth: "150px" }}
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={newStudent.username}
                            onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 1, minWidth: "150px" }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            className="capsule-input"
                            style={{ flex: 1, minWidth: "150px" }}
                        />
                        <button type="submit" className="capsule-button small" style={{ width: "auto", marginTop: "10px" }}>Save Student</button>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="dashboard-header" style={{ marginBottom: "20px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px", flex: 1, alignItems: "center" }}>
                        <div style={{ minWidth: "150px" }}>
                            <select
                                className="capsule-input"
                                value={selectedClass}
                                onChange={(e) => {
                                    const cls = e.target.value;
                                    setSelectedClass(cls);
                                    setSelectedSection("");
                                    // update available sections
                                    const secs = new Set();
                                    students.forEach(s => {
                                        if (String(s.className) === cls && s.section) secs.add(s.section);
                                    });
                                    setAvailableSections(Array.from(secs).sort());
                                }}
                                style={{ width: "100%", background: "#f9f9f9" }}
                            >
                                <option value="">-- Select Class --</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        {selectedClass && (
                            <>
                                <div style={{ minWidth: "120px", marginLeft: "10px" }}>
                                    <select
                                        className="capsule-input"
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        style={{ width: "100%", background: "#f9f9f9" }}
                                        disabled={availableSections.length === 0}
                                    >
                                        <option value="">-- All Sections --</option>
                                        {availableSections.map(sec => (
                                            <option key={sec} value={sec}>Section {sec}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="search-bar-container" style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder={`Search in Class ${selectedClass}${selectedSection ? ' ' + selectedSection : ''}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="capsule-input"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <button className="capsule-button small" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? "Cancel" : "+ ADD"}
                    </button>
                </div>

                {!selectedClass ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                        <p>Please select a class to view and manage students.</p>
                    </div>
                ) : loading ? (
                    <p>Loading students...</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Reg. Number</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Class Teacher</th>
                                    <th>Username</th>
                                    <th>Parent</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s) => (
                                    <tr key={s._id}>
                                        <td>
                                            {editingId === s._id ? (
                                                <input
                                                    type="text"
                                                    value={editData.studentName}
                                                    onChange={(e) => setEditData({ ...editData, studentName: e.target.value })}
                                                    className="capsule-input small"
                                                />
                                            ) : (
                                                s.studentName
                                            )}
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <input
                                                    type="text"
                                                    value={editData.registerNumber}
                                                    onChange={(e) => setEditData({ ...editData, registerNumber: e.target.value })}
                                                    className="capsule-input small"
                                                    placeholder="Reg. Number"
                                                />
                                            ) : (
                                                s.registerNumber || "N/A"
                                            )}
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <input
                                                    type="text"
                                                    value={editData.className}
                                                    onChange={(e) => setEditData({ ...editData, className: e.target.value })}
                                                    className="capsule-input small"
                                                />
                                            ) : (
                                                s.className || "N/A"
                                            )}
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <select
                                                    className="capsule-input small"
                                                    value={editData.section}
                                                    onChange={(e) => setEditData({ ...editData, section: e.target.value })}
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                </select>
                                            ) : (
                                                s.section || "A"
                                            )}
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <input
                                                    type="text"
                                                    value={editData.classTeacher}
                                                    onChange={(e) => setEditData({ ...editData, classTeacher: e.target.value })}
                                                    className="capsule-input small"
                                                    placeholder="Teacher Name"
                                                />
                                            ) : (
                                                s.classTeacher || "Not Assigned"
                                            )}
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <input
                                                    type="text"
                                                    value={editData.username}
                                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                                    className="capsule-input small"
                                                />
                                            ) : (
                                                s.username
                                            )}
                                        </td>
                                        <td>
                                            {(() => {
                                                const parent = parents.find(p => p.childrenIds.some(c => String(c._id || c) === String(s._id)));
                                                return parent ? parent.parentName : <span style={{color: "#999"}}>Unassigned</span>;
                                            })()}
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <div style={{ display: "flex", gap: "5px" }}>
                                                    <button onClick={handleUpdate} className="capsule-button small">Save</button>
                                                    <button onClick={() => setEditingId(null)} className="capsule-button small secondary">Cancel</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", gap: "5px" }}>
                                                    <button onClick={() => startEdit(s)} className="capsule-button small">Edit</button>
                                                    <button onClick={() => handleDelete(s._id)} className="capsule-button small delete">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center" }}>No students found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentManagementPage;
