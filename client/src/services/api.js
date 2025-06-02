const API_URL = 'http://localhost:3000';

// Helper function to get the authentication token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Helper function to set the authentication token in localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Helper function to remove the authentication token from localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
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
        
        // Store the JWT token in localStorage
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

// Get the user profile (protected route example)
export const getUserProfile = async () => {
    return fetchWithAuth(`${API_URL}/api/profile`);
};
