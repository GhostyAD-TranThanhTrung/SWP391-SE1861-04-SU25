
import { jwtDecode } from "jwt-decode";

const API_URL = 'http://localhost:3000';

// Helper function to get the authentication token from sessionStorage
export const getToken = () => {
    return sessionStorage.getItem('token');
};

// Helper function to set the authentication token in sessionStorage
export const setToken = (token) => {
    sessionStorage.setItem('token', token);
};

// Helper function to remove the authentication token from sessionStorage
export const removeToken = () => {
    sessionStorage.removeItem('token');
};

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        // Store the JWT token in sessionStorage
        if (data.token) {
            setToken(data.token);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Function to make authenticated API requests
export const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();

    // Add the Authorization header if token exists
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        // If we get a 401 Unauthorized, the token might be expired
        if (response.status === 401) {
            // Clear the invalid token
            removeToken();
        }

        throw new Error(data.error || 'Request failed');
    }

    return data;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp > Date.now() / 1000; // Check if token is not expired
    } catch (error) {
        return false;
    }
};

// Get user info from stored token
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        if (decoded.exp > Date.now() / 1000) {
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        } else {
            removeToken(); // Remove expired token
            return null;
        }
    } catch (error) {
        removeToken(); // Remove invalid token
        return null;
    }
};

// Get the user profile (protected route example)
export const getUserProfile = async () => {
    return fetchWithAuth(`${API_URL}/api/profile`);
};

export const updateUserProfile = async ({ email, name, dob, job }) => {
    const token = getToken();
    if (!token) throw new Error("Không có token.");

    const response = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, name, dob, job }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Lỗi cập nhật hồ sơ");
    }

    return data;
};
