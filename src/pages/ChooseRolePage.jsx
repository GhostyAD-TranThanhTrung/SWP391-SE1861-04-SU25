import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChooseRolePage.scss';
import PreventionImage from '../images/Prevention.jpg';

const ChooseRolePage = () => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [job, setJob] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        // Log the retrieved email and token for debugging
        console.log('Email từ localStorage:', email);
        console.log('Token từ localStorage:', token);

        // Validate email and token
        if (!email || !token) {
            alert("Không tìm thấy email hoặc token. Vui lòng đăng nhập lại.");
            navigate('/login');
            return;
        }

        const payload = { email, name, dob, job };
        console.log("Gửi dữ liệu đến API:", payload);

        try {
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log("Phản hồi từ server (status):", response.status);
            const data = await response.json();
            console.log("Dữ liệu trả về từ server:", data);

            if (response.ok) {
                alert("Cập nhật thành công!");
                navigate('/home');
            } else {
                alert("Lỗi gửi thông tin: " + (data.error || 'Không rõ lỗi'));
            }
        } catch (error) {
            console.error("Lỗi fetch:", error);
            alert("Không thể kết nối đến máy chủ.");
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
                    <h2 className="mb-4 fw-bold text-center">Choose Your Role</h2>

                    <label>Họ và Tên</label>
                    <input
                        type="text"
                        placeholder="Họ và Tên"
                        className="form-control mb-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label>Date of Birth</label>
                    <input
                        type="date"
                        className="form-control mb-3"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />

                    <label>Your Job</label>
                    <select
                        className="form-select mb-3"
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                    >
                        <option value="">Your Job</option>
                        <option value="Student">Student</option>
                        <option value="College Student">College Student</option>
                        <option value="Parent">Parent</option>
                        <option value="Teacher">Teacher</option>
                    </select>

                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChooseRolePage;