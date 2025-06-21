import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChooseRolePage.scss';
import PreventionImage from '../images/Prevention.jpg';

const ChooseRolePage = () => {
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [job, setJob] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        // Kiểm tra đầu vào
        if (!name || !dateOfBirth || !job) {
            alert("Vui lòng điền đầy đủ thông tin trước khi gửi.");
            return;
        }

        const email = sessionStorage.getItem('email');
        const token = sessionStorage.getItem('token');

        if (!email || !token) {
            alert("Không tìm thấy email hoặc token. Vui lòng đăng nhập lại.");
            navigate('/login');
            return;
        }

        const payload = { email, name, dateOfBirth, job };
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

            const data = await response.json();
            console.log("Phản hồi từ server:", response.status, data);

            if (response.ok) {
                alert("Cập nhật thành công!");
                navigate('/');
            } else {
                alert("Lỗi: " + (data.error || "Không rõ lỗi"));
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
                    <h2 className="mb-4 fw-bold text-center">Chọn Vai Trò Của Bạn</h2>

                    <label>Họ và Tên</label>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Họ và Tên"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label>Ngày Sinh</label>
                    <input
                        type="date"
                        className="form-control mb-3"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                    />

                    <label>Nghề Nghiệp</label>
                    <select
                        className="form-select mb-3"
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                    >
                        <option value="">Chọn nghề nghiệp</option>
                        <option value="Student">Học sinh</option>
                        <option value="College Student">Sinh viên</option>
                        <option value="Parent">Phụ huynh</option>
                        <option value="Teacher">Giáo viên</option>
                    </select>

                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleSubmit}
                        disabled={!name || !dateOfBirth || !job}
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChooseRolePage;
