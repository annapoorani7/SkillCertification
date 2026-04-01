import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SCHOOL from "../utils/schoolInfo";
import "../App.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={SCHOOL.logo}
            alt="School Logo"
            style={{
              width: "120px",
              height: "120px",
              marginBottom: "20px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.2)"
            }}
          />
          <h1 className="hero-title" style={{ fontSize: "3.5rem" }}>{SCHOOL.name}</h1>
          <p className="hero-subtitle">
            {SCHOOL.tagline} &middot; {SCHOOL.location}
            <br />
            <span style={{ fontSize: "0.9rem", opacity: 0.7, display: "inline-block", marginTop: "10px" }}>
              Powered by SkillCert Platform
            </span>
          </p>
        </motion.div>

        <motion.div
          className="glass-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2 style={{ marginBottom: "15px", color: "white" }}>Welcome to Digital Certificates</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "30px", fontSize: "1.1rem" }}>
              Manage, issue, and verify student skill certificates with confidence
            </p>
            <button
              className="capsule-button"
              onClick={() => navigate("/login")}
              style={{ fontSize: "1.1rem", padding: "14px 40px" }}
            >
              Get Started →
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div
          className="features-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", justifyContent: "center" }}
        >
          <motion.div
            className="feature-tile"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>School-issued Certificates</h3>
            <p>Every certificate is officially issued by {SCHOOL.name} and securely stored on a tamper-proof digital ledger.</p>
          </motion.div>

          <motion.div
            className="feature-tile"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3>Instant QR Verification</h3>
            <p>Anyone can scan the unique QR code on a student's certificate to instantly confirm its validity online.</p>
          </motion.div>

          <motion.div
            className="feature-tile"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3>Easy-to-use Portal</h3>
            <p>Admins can quickly issue certificates, parents can monitor student achievements, and students can showcase their skills.</p>
          </motion.div>
        </div>
      </section>

      <footer style={{ padding: "40px", backgroundColor: "#000", color: "#444", textAlign: "center", borderTop: "1px solid #111" }}>
        <p>&copy; {new Date().getFullYear()} {SCHOOL.fullTitle}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
