import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import SCHOOL from "../utils/schoolInfo";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const result = await login(username, password);
      if (result.success) {
        toast.success("Login successful!");
        if (result.data.role === "admin") navigate("/dashboard");
        else if (result.data.role === "parent") navigate("/parent-dashboard");
        else navigate("/student-dashboard");
      } else {
        setErrors({ auth: result.error });
        toast.error(result.error);
      }
    }
  };



  return (
    <div className="landing-page">
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
              width: "100px",
              height: "100px",
              marginBottom: "20px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.2)"
            }}
          />
          <h1 className="hero-title" style={{ fontSize: "2.5rem" }}>{SCHOOL.name}</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "10px" }}>SkillCert Platform</p>
        </motion.div>

        <motion.div
          className="glass-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ padding: "40px", borderRadius: "20px", background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)" }}
        >
          {/* Login Form */}
          <div className="tab-content">
            <h3 style={{ textAlign: "center", color: "white", marginBottom: "30px", fontSize: "1.8rem", fontWeight: "600", letterSpacing: "1px" }}>
              Welcome Back
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Username / ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #4facfe"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.3)"}
              />
              {errors.username && <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginTop: "8px", marginLeft: "10px" }}>{errors.username}</p>}
            </div>

            <div style={{ marginBottom: "25px" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #4facfe"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.3)"}
              />
              {errors.password && <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginTop: "8px", marginLeft: "10px" }}>{errors.password}</p>}
            </div>

            {errors.auth && <p style={{ color: "#ff6b6b", textAlign: "center", marginBottom: "15px", fontWeight: "500", background: "rgba(255,107,107,0.1)", padding: "10px", borderRadius: "8px" }}>{errors.auth}</p>}

            <button 
              onClick={handleLogin}
              style={{
                width: "100%", padding: "16px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", color: "white",
                fontSize: "1.1rem", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(30, 60, 114, 0.4)"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(30, 60, 114, 0.6)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(30, 60, 114, 0.4)"; }}
            >
              Sign In
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "none",
                color: "#a0a5aa",
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "color 0.3s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "white"}
              onMouseOut={(e) => e.currentTarget.style.color = "#a0a5aa"}
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </section>

      <footer style={{ padding: "40px", backgroundColor: "#000", color: "#444", textAlign: "center", borderTop: "1px solid #111" }}>
        <p>&copy; {new Date().getFullYear()} {SCHOOL.fullTitle}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LoginPage;
