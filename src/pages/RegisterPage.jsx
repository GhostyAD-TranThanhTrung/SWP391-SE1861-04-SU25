import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const navigate = useNavigate();

    async function handleRegister() {
        if (!emailRef.current || !passwordRef.current || !confirmPasswordRef.current) return;

        const email = emailRef.current.value.trim();
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        // ✅ Kiểm tra định dạng Gmail
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            alert("Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: example@gmail.com)");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                alert("Registration successful");

                emailRef.current.value = '';
                passwordRef.current.value = '';
                confirmPasswordRef.current.value = '';

                navigate('/login');
            } else {
                alert("Registration failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed: Server error");
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
                navigate('/login');
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
