import React, { useState } from 'react';
import '../styles/LoginPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api'; // Import the loginUser function from API service

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            // Use the loginUser function from our API service
            // NOTE: This function handles the API request and token storage
            const data = await loginUser(email, password);
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to home page after successful login
            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="login-page d-flex align-items-center"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="login-blur-box d-flex justify-content-center align-items-center">
                <div className="login-form-container text-center">                    <h2 className="mb-4">Log in</h2>
                    
                    {error && <div className="alert alert-danger mb-3">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-control mb-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control mb-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="form-check mb-3 text-start">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="rememberMe"
                            />
                            <label className="form-check-label" htmlFor="rememberMe">
                                Remember me
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 mb-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <hr className="divider" />

                    <button className="btn btn-outline-secondary w-100 google-btn mb-3">
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="me-2"
                            style={{ width: '20px' }}
                        />
                        Log in with Google
                    </button>

                    <div className="mt-3">
                        <p className="small">
                            You don't have an account?{' '}
                            <a href="/signup">Register</a>
                        </p>
                        <p className="small">
                            You forgot password?{' '}
                            <a href="/forget">Forget password</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
