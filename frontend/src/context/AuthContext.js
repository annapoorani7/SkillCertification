/**
 * Authentication Context
 * Manages user authentication state and JWT tokens
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import { useSocket } from "./SocketContext";
import { requestPermission } from "../utils/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { joinRoom } = useSocket();

    // Initialize auth from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing stored user:", e);
                localStorage.removeItem("user");
            }
        }

        setLoading(false);
    }, []);

    /**
     * Register new user
     */
    const register = async (username, password, role = "student") => {
        try {
            setError(null);
            const response = await api.post("/register", {
                username,
                password,
                role,
            });

            if (response.data.token) {
                const userData = {
                    username: response.data.username,
                    role: response.data.role,
                    id: response.data.id,
                };

                setToken(response.data.token);
                setUser(userData);

                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("userRole", response.data.role);

                return { success: true, data: userData };
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.error ||
                err.message ||
                "Registration failed";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Login user
     */
    const login = async (username, password) => {
        try {
            setError(null);
            const response = await api.post("/login", {
                username,
                password,
            });

            if (response.data.token) {
                const userData = {
                    username: response.data.username,
                    role: response.data.role,
                    id: response.data.id,
                    studentName: response.data.studentName,
                    className: response.data.className,
                    classTeacher: response.data.classTeacher,
                };

                setToken(response.data.token);
                setUser(userData);

                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("userRole", response.data.role);

                // Join socket room
                joinRoom({
                    id: response.data.id,
                    username: response.data.username,
                    role: response.data.role
                });

                // Request Firebase permission for push notifications
                requestPermission().then(token => {
                    if (token) {
                        // Send token to backend
                        api.post('/api/store-fcm-token', { token, userId: response.data.id });
                    }
                });

                return { success: true, data: userData };
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.error || err.message || "Login failed";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        setToken(null);
        setUser(null);
        setError(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
    };

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = () => {
        return !!token && !!user;
    };

    /**
     * Check if user has admin role
     */
    const isAdmin = () => {
        return user?.role === "admin";
    };

    /**
     * Check if user has student role
     */
    const isStudent = () => {
        return user?.role === "student";
    };

    /**
     * Check if user has specific role
     */
    const hasRole = (requiredRole) => {
        return user?.role === requiredRole;
    };

    const value = {
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isStudent,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

export default AuthContext;
