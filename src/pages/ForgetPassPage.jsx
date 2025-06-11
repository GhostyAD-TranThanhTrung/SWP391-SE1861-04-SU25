import React from 'react';
import '../styles/ForgetPassPage.scss';
import PreventionImage from '../images/Prevention.jpg';

const ForgetPassPage = () => {
    return (
        <div
            className="register-page d-flex"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="left-image-section"></div>

            <div className="register-blur-box d-flex justify-content-center align-items-center">
                <div className="register-form-container text-start">
                    <h2 className="mb-4 fw-bold text-center">Reset Password</h2>

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
                        Submit
                    </button>

                    <div className="mt-3 d-flex flex-column align-items-center text-center w-100">
                        <p className="small mb-1">
                            Remember your password? <a href="/login">Login</a>
                        </p>
                        <p className="small">
                            Don’t have an account? <a href="/signup">Register</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassPage;