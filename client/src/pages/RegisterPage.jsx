import React from 'react';
import { useState, useRef } from 'react';
import '../styles/RegisterPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const RegisterPage = () => {
    const nameRef = useRef('');
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const confirmPasswordRef = useRef('');
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
                password: passwordRef.current.value
            })
        })
        const data = await response.json();
        if (data && !data.error) {
            alert("Registration successful");
            nameRef.current.value = '';
            emailRef.current.value = '';
            passwordRef.current.value = '';
            confirmPasswordRef.current.value = '';
        } else {
            alert("Registration failed: " + (data.error || "Unknown error"));
        }
    }

    const handleGoogleRegister = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            // decoded contains email, name, etc.
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: decoded.name,
                    email: decoded.email,
                    password: decoded.sub // Use Google sub as a unique password or generate a random one
                })
            });
            const data = await response.json();
            if (data && data.user) {
                alert('Google registration successful!');
            } else {
                alert('Google registration failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Google registration failed');
        }
    };

    return (
        <div
            className="register-page d-flex"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="left-image-section"></div>

            <div className="register-blur-box d-flex justify-content-center align-items-center">
                <div className="register-form-container text-start">
                    <h2 className="mb-4 fw-bold text-center">Register</h2>

                    <label>Họ và Tên</label>
                    <input
                        type="text"
                        placeholder="Họ và Tên"
                        className="form-control mb-3"
                        ref={nameRef}
                    />

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
