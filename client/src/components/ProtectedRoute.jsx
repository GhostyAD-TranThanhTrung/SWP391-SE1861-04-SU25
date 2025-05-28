import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/api';

/**
 * A wrapper component that protects routes from unauthorized access
 * If the user is not authenticated (no token), they are redirected to the login page
 * Otherwise, the protected route is rendered
 * 
 * Usage:
 * <Route path="/protected" element={<ProtectedRoute><ProtectedComponent /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
    // Check if user is authenticated
    const isAuthenticated = !!getToken();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
