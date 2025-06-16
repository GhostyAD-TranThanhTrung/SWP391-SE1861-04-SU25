import '../styles/AdminLoginPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLoginPage = () => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();    

    async function login() {
        try {
            const email = emailRef.current.value;
            const password = passwordRef.current.value;
            console.log('Đang gửi yêu cầu đăng nhập với:', { email, password });

            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password
            });

            console.log('Phản hồi từ API (status):', response.status);
            console.log('Dữ liệu trả về từ API:', response.data);

            if (response.data.user.role === 'admin') {
                console.log('Đăng nhập thành công, email:', email);
                emailRef.current.value = '';
                passwordRef.current.value = '';                
                localStorage.setItem("email2", email);
                sessionStorage.setItem("token", response.data.token);
                navigate('/dashboard');
            } else {
                setError('Access denied. Admin privileges required.');
            }
        } catch (e) {
            console.log('Lỗi khi đăng nhập:', e);
            setError(e.response?.data?.error || 'Login failed. Please try again.');
        }
    }

    return (
        <div
            className="login-page d-flex align-items-center"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="login-blur-box d-flex justify-content-center align-items-center">
                <div className="login-form-container text-center">
                    <h2 className="mb-4">Admin Login</h2>
                    
                    {error && <div className="alert alert-danger mb-3">{error}</div>}

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        login();
                    }}>
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-control mb-3"
                            name="email"
                            ref={emailRef}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control mb-3"
                            name="password"
                            ref={passwordRef}
                            required
                        />

                        <div className="form-check mb-3 text-start">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="rememberMe"
                            />
                            <label className="form-check-label" htmlFor="rememberMe">
                                Remember me
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mb-3">
                            Log in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;