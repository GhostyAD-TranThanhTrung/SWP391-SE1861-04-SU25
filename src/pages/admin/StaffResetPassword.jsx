import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RegisterPage.scss';
import { useEffect } from 'react';
import PreventionImage from '../../images/Prevention.jpg';
import axios from 'axios';
const StaffResetPassword = () => {
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const token = sessionStorage.getItem("token");
    const navigate = useNavigate();
    const userRole = async () => {
        try {
            if (!token) navigate('/admin/login')
            const res = await axios.get('http://localhost:3000/api/user/role/',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager' || res.data.role === 'staff' || res.data.role === 'consultant'))) navigate('/admin/login')

        } catch (err) {
            alert(err)
            navigate('/admin/login')
        }

    }
    useEffect(() => {
        (
            async () => {
                await userRole()
            }
        )()
    }, [token])

    async function handleRegister() {
        if (!passwordRef.current || !confirmPasswordRef.current) return;
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                alert("Đặt lại mật khẩu thành công");

                passwordRef.current.value = '';
                confirmPasswordRef.current.value = '';

                navigate('/admin/login');
            } else {
                alert("Đăng ký thất bại: " + (data.error || "Lỗi không xác định"));
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Đăng ký thất bại: Lỗi máy chủ");
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
                    <h2 className="mb-4 fw-bold text-center">Đặt lại mật khẩu</h2>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        className="form-control mb-3"
                        ref={passwordRef}
                    />

                    <label>Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        className="form-control mb-3"
                        ref={confirmPasswordRef}
                    />

                    <button onClick={handleRegister} className="btn btn-primary w-100 mb-3">
                        Đặt lại mật khẩu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffResetPassword;
