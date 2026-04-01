import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            localStorage.removeItem("studentName");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
