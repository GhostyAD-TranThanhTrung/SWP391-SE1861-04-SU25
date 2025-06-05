import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
    const nameRef = useRef('');
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const confirmPasswordRef = useRef('');
    const navigate = useNavigate(); // Hook for navigation

    async function handleRegister() {
        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
            alert("Passwords do not match");
            return;
        }
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: nameRef.current.value,
                email: emailRef.current.value,
                password: passwordRef.current.value,
            })
        });
        const data = await response.json();
        if (data && !data.error) {
            alert("Registration successful");
            nameRef.current.value = '';
            emailRef.current.value = '';
            passwordRef.current.value = '';
            confirmPasswordRef.current.value = '';
            navigate('/login'); // Redirect to login page on success
        } else {
            alert("Registration failed: " + (data.error || "Unknown error"));
        }
    }

    async function handleGoogleRegister(credentialResponse) {
        try {
            const response = await fetch('http://localhost:3000/api/google-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            });
            const data = await response.json();
            if (data && data.user) {
                alert(data.message || 'Google authentication successful!');
                console.log('User info:', data.user);
                navigate('/login'); // Redirect to login page on success
            } else {
                alert('Google authentication failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error('Google auth error:', e);
            alert('Google authentication failed');
        }
    }

    return (
        <div
            className="register-page d-flex"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="left-image-section"></div>

            <div className="register-blur-box d-flex justify-content-center align-items-center">
                <div className="register-form-container text-start">
                    <h2 className="mb-4 fw-bold text-center">Register</h2>

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        className="form-control mb-3"
                        ref={emailRef}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        className="form-control mb-3"
                        ref={passwordRef}
                    />

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="form-control mb-3"
                        ref={confirmPasswordRef}
                    />

                    <button onClick={handleRegister} className="btn btn-primary w-100 mb-3">
                        Register
                    </button>

                    <hr />

                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <GoogleLogin
                            onSuccess={handleGoogleRegister}
                            onError={() => alert('Google registration failed')}
                            theme="outline"
                            width="100%"
                        />
                    </div>
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