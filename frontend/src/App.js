import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import ParentDashboardPage from "./pages/ParentDashboardPage";
import StudentManagementPage from "./pages/StudentManagementPage";
import ManagementPage from "./pages/ManagementPage";
import IssueCertificatePage from "./pages/IssueCertificatePage";
import MessagingPage from "./pages/MessagingPage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";


import "./App.css";
import SCHOOL from "./utils/schoolInfo";
function Layout({ children }) {
  const location = useLocation();
  const hideSidebar = location.pathname === "/" || location.pathname === "/login"; // hide sidebar on landing/login pages
  const userRole = localStorage.getItem("userRole"); // 'admin' or 'student'

  return (
    <div className="dashboard">
      {!hideSidebar && (
        <aside className="sidebar">
          <div className="sidebar-brand">
            <img src={SCHOOL.logo} alt="School Logo" className="sidebar-logo" />
            <h2>{SCHOOL.name}</h2>
            <p className="sidebar-tagline">{SCHOOL.tagline}</p>
          </div>
          <ul>
            {userRole === "admin" && (
              <>
                <li><Link to="/dashboard">Admin Dashboard</Link></li>
                <li><Link to="/issue-certificate">Issue Certificate</Link></li>
                <li><Link to="/management">Management Hub</Link></li>
                <li><Link to="/messages">Messages</Link></li>
              </>
            )}
            {userRole === "student" && (
              <>
                <li><Link to="/student-dashboard">Students Dashboard</Link></li>
                <li><Link to="/messages">Messages</Link></li>
              </>
            )}
            {userRole === "parent" && (
              <>
                <li><Link to="/parent-dashboard">Parent Dashboard</Link></li>
                <li><Link to="/verify-certificate">Verify Certificate</Link></li>
                <li><Link to="/messages">Messages</Link></li>
              </>
            )}

            <li><Link to="/" onClick={() => localStorage.clear()}>Logout</Link></li>
          </ul>
        </aside>
      )}
      <main className="main">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const userRole = localStorage.getItem("userRole");
  // If no role found, redirect to login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  // If role not allowed, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin') return <DashboardPage />;
    if (userRole === 'parent') return <ParentDashboardPage />;
    return <StudentDashboardPage />;
  }
  return children;
}

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <ManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <StudentManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/issue-certificate"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <IssueCertificatePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={['admin', 'student', 'parent']}>
                <Layout>
                  <MessagingPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify-certificate"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <Layout>
                  <VerifyCertificatePage />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* Student Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <StudentDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <Layout>
                  <ParentDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          </Routes>
        </Router>
    </AuthProvider>
  </SocketProvider>
  );
}

export default App;
