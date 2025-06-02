import React from 'react';
import '../styles/ChooseRolePage.scss'; // Keeping the same SCSS file
import PreventionImage from '../images/Prevention.jpg';

const ChooseRolePage = () => {
    return (
        <div
            className="register-page d-flex"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="left-image-section"></div>

            <div className="register-blur-box d-flex justify-content-center align-items-center">
                <div className="register-form-container text-start">
                    <h2 className="mb-4 fw-bold text-center">Choose Your Role</h2>

                    <label>Họ và Tên</label>
                    <input
                        type="text"
                        placeholder="Họ và Tên"
                        className="form-control mb-3"
                    />

                    <label>Date of Birth</label>
                    <div className="position-relative mb-3">
                        <input
                            type="date"
                            placeholder="DD/MM/YYYY"
                            className="form-control"
                            style={{ paddingRight: '0.75rem' }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: '#6c757d'
                            }}
                        >
                        </span>
                    </div>

                    <label>Gender</label>
                    <select className="form-select mb-3">
                        <option>Choose your gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>

                    <label>Role</label>
                    <select className="form-select mb-3">
                        <option>Your Job</option>
                        <option>Student</option>
                        <option>College Student</option>
                        <option>Parent</option>
                        <option>Teacher</option>
                    </select>

                    <button className="btn btn-primary w-100 mb-3">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChooseRolePage;