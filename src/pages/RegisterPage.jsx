import React from 'react';
import '../styles/RegisterPage.scss';
import PreventionImage from '../images/Prevention.jpg';

const RegisterPage = () => {
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
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        className="form-control mb-3"
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        className="form-control mb-3"
                    />

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="form-control mb-3"
                    />

                    <button className="btn btn-primary w-100 mb-3">
                        Register
                    </button>

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
