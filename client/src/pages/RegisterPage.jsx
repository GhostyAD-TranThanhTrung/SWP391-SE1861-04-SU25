import React, { useState } from 'react';
import '../styles/RegisterPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        // Validate form inputs
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }
        
        try {
            await registerUser({ email, password});
            
            // Redirect to login page after successful registration
            navigate('/login');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="register-page d-flex"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="left-image-section"></div>

            <div className="register-blur-box d-flex justify-content-center align-items-center">                <div className="register-form-container text-start">
                    <h2 className="mb-4 fw-bold text-center">Register</h2>

                    {error && <div className="alert alert-danger mb-3">{error}</div>}

                    <form onSubmit={handleRegister}>

                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-control mb-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control mb-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="form-control mb-3"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 mb-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <hr />

                    <button className="btn btn-outline-secondary w-100 google-btn mb-3">
                        <img
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                            alt="Google"
                            className="me-2"
                            style={{ width: '20px' }}
                        />
                        Log in with Google
                    </button>

                    <div className="mt-3 d-flex flex-column align-items-center text-center w-100">
                        <p className="small mb-1">
                            You already have an account? <a href="/login">Login</a>
                        </p>
                        <p className="small">
                            You forgot password? <a href="/forget">Forget password</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
