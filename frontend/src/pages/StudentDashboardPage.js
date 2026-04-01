import React from "react";
import { useAuth } from "../context/AuthContext";
import StudentPortfolioList from "../components/StudentPortfolioList";

function StudentDashboardPage() {
    const { user, loading } = useAuth();

    // Determine the student's avatar path, fallback to default if file doesn't exist
    const [avatarSrc, setAvatarSrc] = React.useState("/assets/students/default.png");

    React.useEffect(() => {
        if (user && user.username) {
            setAvatarSrc(`/assets/students/${user.username}.png`);
        }
    }, [user]);

    const handleImageError = () => {
        setAvatarSrc("/assets/students/default.png");
    };

    if (loading) return <div className="loading-state"><p>Loading Profile...</p></div>;

    return (
        <div className="main-content">
            <div className="dashboard-header">
                <div>
                    <h1>Certificate Portfolio</h1>
                    <p style={{ color: "#666", marginTop: "5px" }}>
                        Welcome back, <strong>{user ? (user.studentName || user.username) : "Student"}</strong>
                    </p>
                </div>
            </div>

            {user && (
                <div className="student-profile-card">
                    <div className="student-avatar-container">
                        <img
                            src={avatarSrc}
                            alt="Avatar"
                            className="student-profile-img"
                            onError={handleImageError}
                        />
                    </div>
                    <div className="student-profile-info">
                        <span className="profile-label">Student Profile</span>
                        <h2>{user.studentName || user.username}</h2>
                        <div className="profile-details">
                            <span className="badge">Class {user.className}</span>
                            {user.classTeacher && (
                                <span className="badge" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
                                    Teacher: {user.classTeacher}
                                </span>
                            )}
                            <span className="platform-id">ID: {user.username}</span>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: "40px" }}>
                <StudentPortfolioList isAuthenticated={true} />
            </div>
        </div>
    );
}

export default StudentDashboardPage;
