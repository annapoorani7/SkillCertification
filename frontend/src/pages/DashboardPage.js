import React, { useEffect, useState } from "react";
import { downloadCertificatePDF } from "../utils/pdfGenerator";
import api from "../utils/api";
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";
import "../App.css";
import SCHOOL from "../utils/schoolInfo";

const COLORS = ["#003f87", "#0056b3", "#0070d8", "#a29bfe", "#ffd700"];

function DashboardPage() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    studentCount: 0,
    adminCount: 0,
    classDistribution: []
  });
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, certsRes] = await Promise.all([
        api.get("/stats"),
        api.get("/certificates")
      ]);

      setStats(statsRes.data);
      if (certsRes.data && Array.isArray(certsRes.data.certificates)) {
        setCertificates(certsRes.data.certificates);
        setFilteredCertificates(certsRes.data.certificates);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = certificates.filter((cert) => {
      const studentName = (cert.studentName || "").toLowerCase();
      const skill = (cert.skill || "").toLowerCase();
      const cls = (cert.className || "").toLowerCase();

      if (filterType === "studentName") return studentName.includes(lowerTerm);
      if (filterType === "skill") return skill.includes(lowerTerm);
      if (filterType === "class") return cls.includes(lowerTerm);
      return studentName.includes(lowerTerm) || skill.includes(lowerTerm) || cls.includes(lowerTerm);
    });
    setFilteredCertificates(filtered);
  }, [searchTerm, filterType, certificates]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>{SCHOOL.name}</h1>
          <p>Admin Dashboard &middot; Certificate Management</p>
        </div>
        <button
          className={`capsule-button ${loading ? "loading" : ""}`}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "🔄 Refresh Data"}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <h3>Total Issued</h3>
          <p>{stats.totalCertificates}</p>
        </motion.div>
        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <h3>Students</h3>
          <p>{stats.studentCount}</p>
        </motion.div>
        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <h3>Admins</h3>
          <p>{stats.adminCount}</p>
        </motion.div>
      </div>

      {/* Analytics Chart */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3>Certifications by Class</h3>
        <div style={{ height: "300px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.classDistribution || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {(stats.classDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Certificate Registry Table */}
      <div className="card">
        <div className="dashboard-header" style={{ marginBottom: "20px" }}>
          <h3>Certificate Registry</h3>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="capsule-input"
              style={{ minWidth: "250px" }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Skill</th>
                <th>Issued On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => (
                <tr key={cert.id}>
                  <td style={{ fontWeight: "bold", color: "#003f87" }}>#{cert.id}</td>
                  <td>{cert.studentName}</td>
                  <td><span className="badge">{cert.className}</span></td>
                  <td>{cert.skill}</td>
                  <td>{new Date(Number(cert.issuedOn) * 1000).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="capsule-button small"
                      onClick={async () => await downloadCertificatePDF(cert)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCertificates.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    No matching certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
