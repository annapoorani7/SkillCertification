import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../utils/api";
import "../App.css";

function ParentDashboardPage() {
  const [children, setChildren] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const [childrenRes, certificatesRes] = await Promise.all([
        api.get("/parent/children"),
        api.get("/parent/children-certificates")
      ]);

      const childrenList = childrenRes.data.children || [];
      setChildren(childrenList);

      const certificatesList = certificatesRes.data.certificates || [];
      setCertificates(certificatesList);

      // Create a map for easy lookup
      const map = {};
      certificatesRes.data.children?.forEach(child => {
        map[child._id] = child.studentName;
      });
      setChildrenMap(map);

      if (childrenList.length > 0) {
        setSelectedChild(childrenList[0]._id);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load children data");
    } finally {
      setLoading(false);
    }
  };

  const selectedChildName = selectedChild
    ? children.find(c => c._id === selectedChild)?.studentName || "Unknown"
    : "All Children";

  const filteredCertificates = selectedChild
    ? certificates.filter(cert => cert.studentId === selectedChild)
    : certificates;

  if (loading) {
    return (
      <div className="dashboard-container">
        <p style={{ textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Parent Portal</h1>
          <p>Monitor your children's achievements and skill certificates.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Children Overview */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Your Children</h3>
          {children.length === 0 ? (
            <p style={{ color: "#999" }}>No children linked to your account.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => setSelectedChild(null)}
                className={`capsule-button ${selectedChild === null ? "active" : ""}`}
                style={{
                  backgroundColor: selectedChild === null ? "#283593" : "#f0f0f0",
                  color: selectedChild === null ? "white" : "#333"
                }}
              >
                All Children ({children.length})
              </button>
              {children.map(child => (
                <button
                  key={child._id}
                  onClick={() => setSelectedChild(child._id)}
                  className={`capsule-button ${selectedChild === child._id ? "active" : ""}`}
                  style={{
                    backgroundColor: selectedChild === child._id ? "#283593" : "#f0f0f0",
                    color: selectedChild === child._id ? "white" : "#333",
                    textAlign: "left"
                  }}
                >
                  {child.studentName} <span style={{ opacity: 0.7 }}>({child.className})</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Certificates View */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>{selectedChildName}'s Certificates</h3>
          {filteredCertificates.length === 0 ? (
            <p style={{ color: "#999" }}>No certificates earned yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredCertificates.map((cert, idx) => (
                <motion.div
                  key={cert._id || idx}
                  className="cert-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    backgroundColor: "#f9f9f9"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px" }}>{cert.skill}</h4>
                      <p style={{ margin: "0", fontSize: "0.9rem", color: "#666" }}>
                        Student: {childrenMap[cert.studentId] || cert.studentName}
                      </p>
                      <p style={{ margin: "0", fontSize: "0.9rem", color: "#666" }}>
                        Class: {cert.className}
                      </p>
                      <p style={{ margin: "0", fontSize: "0.85rem", color: "#999" }}>
                        Issued: {new Date(cert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "600"
                      }}>
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Statistics */}
      {selectedChild === null && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: "30px" }}
        >
          <h3>Overview</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "12px" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#283593" }}>
                {children.length}
              </div>
              <div style={{ color: "#666" }}>Total Children</div>
            </div>
            <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "12px" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#283593" }}>
                {certificates.length}
              </div>
              <div style={{ color: "#666" }}>Total Certificates</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ParentDashboardPage;
