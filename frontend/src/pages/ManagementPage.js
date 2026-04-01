import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import StudentManagementPage from "./StudentManagementPage";
import "../App.css";

function ManagementPage() {
    const [activeTab, setActiveTab] = useState("students");
    const [admins, setAdmins] = useState([]);
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [classes, setClasses] = useState([]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
    const [showAddParent, setShowAddParent] = useState(false);
    const [newParent, setNewParent] = useState({ username: "", password: "", parentName: "", email: "", childrenIds: [] });
    const [editingParent, setEditingParent] = useState(null);
    const [editParentData, setEditParentData] = useState({ parentName: "", childrenIds: [], password: "" });
    const [selectedSection, setSelectedSection] = useState("");
    const [availableSections, setAvailableSections] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (activeTab === "admins") fetchAdmins();
        if (activeTab === "parents") {
            fetchParents();
            fetchStudents();
        }
    }, [activeTab]);

    const fetchStudents = async () => {
        try {
            const res = await api.get("/users");
            const studentList = res.data.users || res.data || [];
            setStudents(studentList.filter(u => u.role === "student"));
        } catch (err) {
            console.error("Failed to fetch students:", err);
        }
    };

    const fetchAdmins = async () => {
        try {
            const res = await api.get("/admins");
            setAdmins(res.data);
        } catch (err) {
            toast.error("Failed to fetch admins");
        }
    };

    const fetchParents = async () => {
        try {
            const res = await api.get("/api/parents");
            setParents(res.data.parents || []);
            
            // Extract unique classes from all children
            const uniqueClasses = new Set();
            res.data.parents.forEach(parent => {
                parent.childrenIds.forEach(child => {
                    if (child.className) uniqueClasses.add(child.className);
                });
            });
            setClasses(Array.from(uniqueClasses).sort());
            setSelectedClass(""); // Reset filter
            setSelectedSection(""); // Reset section filter
            setAvailableSections([]); // Reset available sections
        } catch (err) {
            console.error("Failed to fetch parents:", err);
            toast.error("Failed to fetch parents: " + (err.response?.data?.error || err.message));
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admins", newAdmin);
            toast.success("Admin created successfully");
            setNewAdmin({ username: "", password: "" });
            setShowAddAdmin(false);
            fetchAdmins();
        } catch (err) {
            toast.error("Failed to create admin");
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/admins/${id}`);
            toast.success("Admin removed");
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete admin");
        }
    };

    const handleDeleteParent = async (id) => {
        if (!window.confirm("Are you sure you want to remove this parent?")) return;
        try {
            await api.delete(`/api/parents/${id}`);
            toast.success("Parent removed successfully");
            fetchParents();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete parent");
        }
    };

    const handleAddParent = async (e) => {
        e.preventDefault();
        if (!newParent.username || !newParent.password || !newParent.parentName) {
            toast.warning("Please fill in required fields");
            return;
        }
        try {
            await api.post("/api/parents", newParent);
            toast.success("Parent created successfully");
            setNewParent({ username: "", password: "", parentName: "", email: "", childrenIds: [] });
            setShowAddParent(false);
            fetchParents();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to create parent");
        }
    };

    const startEditParent = (parent) => {
        setEditingParent(parent._id);
        setEditParentData({
            parentName: parent.parentName,
            childrenIds: parent.childrenIds.map(c => c._id),
            password: ""
        });
    };

    const handleUpdateParent = async (e) => {
        e.preventDefault();
        if (!editParentData.parentName) {
            toast.warning("Parent name is required");
            return;
        }
        try {
            const payload = { ...editParentData };
            if (!payload.password) delete payload.password;

            await api.put(`/api/parents/${editingParent}`, payload);
            toast.success("Parent updated successfully");
            setEditingParent(null);
            fetchParents();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update parent");
        }
    };

    const getFilteredParents = () => {
        if (!selectedClass || !selectedSection) return [];
        
        let filtered = parents.filter(parent =>
            parent.childrenIds.some(child => 
                child.className === selectedClass && 
                child.section === selectedSection
            )
        );

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(parent =>
                parent.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parent.username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>System Management</h1>
                    <p>Centralized control for students, admins, parents, and security logs.</p>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
                    onClick={() => setActiveTab("students")}
                >
                    Student Management
                </button>
                <button
                    className={`tab-btn ${activeTab === "parents" ? "active" : ""}`}
                    onClick={() => setActiveTab("parents")}
                >
                    Parent Management
                </button>
                <button
                    className={`tab-btn ${activeTab === "admins" ? "active" : ""}`}
                    onClick={() => setActiveTab("admins")}
                >
                    Admin Management
                </button>
            </div>

            <div className="tab-content" style={{ marginTop: "20px" }}>
                {activeTab === "students" && <StudentManagementPage />}

                {activeTab === "parents" && (
                    <div className="card">
                        <div className="dashboard-header">
                            <div>
                                <h3>Parent Management</h3>
                                <p>Create, update and manage parent accounts</p>
                            </div>
                            <button className="capsule-button small" onClick={() => setShowAddParent(!showAddParent)}>
                                {showAddParent ? "Cancel" : "+ NEW PARENT"}
                            </button>
                        </div>

                        {/* Add Parent Form */}
                        {showAddParent && (
                            <form onSubmit={handleAddParent} style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", marginBottom: "20px" }}>
                                <h4>Create New Parent Account</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="capsule-input"
                                        value={newParent.username}
                                        onChange={(e) => setNewParent({ ...newParent, username: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="capsule-input"
                                        value={newParent.password}
                                        onChange={(e) => setNewParent({ ...newParent, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <input
                                        type="text"
                                        placeholder="Parent Name"
                                        className="capsule-input"
                                        value={newParent.parentName}
                                        onChange={(e) => setNewParent({ ...newParent, parentName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px" }}>Children (select students)</label>
                                    <select
                                        className="capsule-input"
                                        multiple
                                        value={newParent.childrenIds}
                                        onChange={(e) => {
                                            const options = Array.from(e.target.options);
                                            const selected = options
                                                .filter(o => o.selected)
                                                .map(o => o.value);
                                            setNewParent({ ...newParent, childrenIds: selected });
                                        }}
                                        style={{ height: "100px" }}
                                    >
                                        {students.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.studentName} ({student.className}{student.section ? ` ${student.section}` : ""})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="capsule-button small">Create Parent</button>
                            </form>
                        )}

                        {/* Class and Section Selection */}
                        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ minWidth: "150px" }}>
                                <select
                                    className="capsule-input"
                                    value={selectedClass}
                                    onChange={(e) => {
                                        const cls = e.target.value;
                                        setSelectedClass(cls);
                                        setSelectedSection("");
                                        // update available sections for selected class
                                        const secs = new Set();
                                        parents.forEach(parent => {
                                            parent.childrenIds.forEach(child => {
                                                if (child.className === cls && child.section) secs.add(child.section);
                                            });
                                        });
                                        setAvailableSections(Array.from(secs).sort());
                                    }}
                                    style={{ width: "100%", background: "#f9f9f9" }}
                                >
                                    <option value="">-- Select Class --</option>
                                    {classes.map(cls => {
                                        const count = parents.filter(p => 
                                            p.childrenIds.some(c => c.className === cls)
                                        ).length;
                                        return (
                                            <option key={cls} value={cls}>
                                                Class {cls} ({count} parents)
                                            </option>
                                        );
                                    })}
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
                                            <option value="">-- Select Section --</option>
                                            {availableSections.map(sec => {
                                                const count = parents.filter(p => 
                                                    p.childrenIds.some(c => c.className === selectedClass && c.section === sec)
                                                ).length;
                                                return (
                                                    <option key={sec} value={sec}>
                                                        Section {sec} ({count} parents)
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    {selectedSection && (
                                        <div className="search-bar-container" style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                placeholder={`Search in Class ${selectedClass} Section ${selectedSection}...`}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="capsule-input"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Parents List */}
                        {!selectedClass ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                <p>Please select a class to view and manage parents.</p>
                            </div>
                        ) : selectedClass && !selectedSection ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                <p>Please select a section to view parents in class {selectedClass}.</p>
                            </div>
                        ) : getFilteredParents().length === 0 ? (
                            <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>
                                No parents found in class {selectedClass} section {selectedSection}
                                {searchTerm ? ` matching "${searchTerm}"` : ""}
                            </p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "20px" }}>
                                {getFilteredParents().map(parent => (
                                    <div
                                        key={parent._id}
                                        style={{
                                            padding: "20px",
                                            border: "1px solid #ddd",
                                            borderRadius: "12px",
                                            backgroundColor: editingParent === parent._id ? "#f0f7ff" : "#f9f9f9"
                                        }}
                                    >
                                        {editingParent === parent._id ? (
                                            <form onSubmit={handleUpdateParent}>
                                                <h4 style={{ margin: "0 0 15px" }}>Edit Parent Details</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Parent Name"
                                                    className="capsule-input"
                                                    value={editParentData.parentName}
                                                    onChange={(e) => setEditParentData({ ...editParentData, parentName: e.target.value })}
                                                    style={{ marginBottom: "10px", width: "100%" }}
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="New Password (leave blank to keep current)"
                                                    className="capsule-input"
                                                    value={editParentData.password}
                                                    onChange={(e) => setEditParentData({ ...editParentData, password: e.target.value })}
                                                    style={{ marginBottom: "10px", width: "100%" }}
                                                />
                                                <div style={{ marginBottom: "10px" }}>
                                                    <label style={{ display: "block", marginBottom: "5px" }}>Children (select students)</label>
                                                    <select
                                                        className="capsule-input"
                                                        multiple
                                                        value={editParentData.childrenIds || []}
                                                        onChange={(e) => {
                                                            const options = Array.from(e.target.options);
                                                            const selected = options
                                                                .filter(o => o.selected)
                                                                .map(o => o.value);
                                                            setEditParentData({ ...editParentData, childrenIds: selected });
                                                        }}
                                                        style={{ height: "100px", width: "100%" }}
                                                    >
                                                        {students.map(student => (
                                                            <option key={student._id} value={student._id}>
                                                                {student.studentName} ({student.className}{student.section ? ` ${student.section}` : ""})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button type="submit" className="capsule-button small">Save</button>
                                                    <button type="button" className="capsule-button small secondary" onClick={() => setEditingParent(null)}>Cancel</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                                                    <div>
                                                        <h4 style={{ margin: "0 0 5px" }}>{parent.parentName}</h4>
                                                        <p style={{ margin: "0", fontSize: "0.85rem", color: "#999" }}>
                                                            Username: <strong>{parent.username}</strong>
                                                        </p>
                                                    </div>
                                                    <div style={{ display: "flex", gap: "5px" }}>
                                                        <button
                                                            onClick={() => startEditParent(parent)}
                                                            className="capsule-button small"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteParent(parent._id)}
                                                            className="capsule-button small delete"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Children List */}
                                                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                                                    <h5 style={{ margin: "0 0 10px", fontSize: "0.95rem", color: "#333" }}>
                                                        Children ({parent.childrenIds.length}):
                                                    </h5>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                        {parent.childrenIds.length > 0 ? (
                                                            parent.childrenIds.map(child => (
                                                                <div
                                                                    key={child._id}
                                                                    style={{
                                                                        padding: "10px",
                                                                        backgroundColor: "white",
                                                                        borderRadius: "8px",
                                                                        border: "1px solid #e0e0e0",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <p style={{ margin: "0", fontSize: "0.9rem", fontWeight: "500" }}>
                                                                            {child.studentName}
                                                                        </p>
                                                                        <p style={{ margin: "0", fontSize: "0.85rem", color: "#999" }}>
                                                                            Class {child.className}
                                                                        </p>
                                                                    </div>
                                                                    <span style={{
                                                                        backgroundColor: "#e3f2fd",
                                                                        color: "#003f87",
                                                                        padding: "4px 12px",
                                                                        borderRadius: "8px",
                                                                        fontSize: "0.8rem"
                                                                    }}>
                                                                        Student
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p style={{ color: "#999", fontSize: "0.9rem", textAlign: "center", padding: "10px" }}>No children linked</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "admins" && (
                    <div className="card">
                        <div className="dashboard-header">
                            <h3>Administrative Access</h3>
                            <button className="capsule-button small" onClick={() => setShowAddAdmin(!showAddAdmin)}>
                                {showAddAdmin ? "Cancel" : "+ NEW ADMIN"}
                            </button>
                        </div>
                        {showAddAdmin && (
                            <form onSubmit={handleAddAdmin} style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="capsule-input"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="capsule-input"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                                <button type="submit" className="capsule-button small">Create</button>
                            </form>
                        )}

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map(admin => (
                                        <tr key={admin._id}>
                                            <td>{admin.username}</td>
                                            <td><span className="badge">ADMIN</span></td>
                                            <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="capsule-button small delete"
                                                    onClick={() => handleDeleteAdmin(admin._id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}

export default ManagementPage;
