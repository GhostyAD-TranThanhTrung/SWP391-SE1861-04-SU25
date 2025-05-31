import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getToken } from '../services/api';

/**
 * Example of a protected component that requires authentication
 * This component will:
 * 1. Check if a token exists
 * 2. If no token, redirect to login
 * 3. If token exists, fetch protected user data from the API
 */
const ProtectedComponent = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            // Check if token exists
            if (!getToken()) {
                // No token, redirect to login
                navigate('/login');
                return;
            }

            try {
                // Fetch protected user data
                const data = await getUserProfile();
                setUserData(data.user);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Failed to load user profile. Please log in again.');
                // Redirect to login if unauthorized
                if (error.message.includes('unauthorized') || error.message.includes('Invalid token')) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3">
                {error}
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h3>Protected User Profile</h3>
                </div>
                <div className="card-body">
                    {userData && (
                        <div>
                            <p><strong>User ID:</strong> {userData.userId}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Role:</strong> {userData.role}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProtectedComponent;
