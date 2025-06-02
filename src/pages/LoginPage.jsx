import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [emailDisplay, setEmailDisplay] = useState('');
    const [type, setType] = useState('off');
    const navigate = useNavigate();

    // Luôn điều hướng về trang chủ
    const redirectToHome = () => {
        setTimeout(() => navigate('/'), 500);
    };

    async function login() {
        try {
            const email = emailRef.current.value;
            const password = passwordRef.current.value;
            console.log('Đang gửi yêu cầu đăng nhập với:', { email, password });

            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Phản hồi từ API (status):', response.status);
            const data = await response.json();
            console.log('Dữ liệu trả về từ API:', data);

            if (response.status !== 401 && data) {
                console.log('Đăng nhập thành công, email:', data.email);
                setEmailDisplay("Xin chào " + data.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';
                redirectToHome();
                localStorage.setItem("email", email, { expires: 7 });
            } else {
                console.log('Đăng nhập thất bại:', data.error);
                setEmailDisplay(data.error || 'Đăng nhập thất bại');
                setType('on');
            }
        } catch (e) {
            console.log('Lỗi khi đăng nhập:', e);
            setEmailDisplay('Đăng nhập thất bại');
            setType('on');
        }
    }

    async function handleGoogleLogin(credentialResponse) {
        try {
            console.log('Đang xử lý đăng nhập Google:', credentialResponse);
            const response = await fetch('http://localhost:3000/api/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            });

            console.log('Phản hồi từ API Google (status):', response.status);
            const data = await response.json();
            console.log('Dữ liệu trả về từ API Google:', data);

            if (data) {
                console.log('Đăng nhập Google thành công, email:', data.email);
                setEmailDisplay("Xin chào " + data.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';
                redirectToHome();
                localStorage.setItem("email", data.email);
            } else {
                console.log('Đăng nhập Google thất bại:', data.error);
                setEmailDisplay(data.error || 'Đăng nhập Google thất bại');
                setType('on');
            }
        } catch (e) {
            console.log('Lỗi khi đăng nhập Google:', e);
            setEmailDisplay('Đăng nhập Google thất bại');
            setType('on');
        }
    }

    return (
        <div
            className="login-page d-flex align-items-center"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="login-blur-box d-flex justify-content-center align-items-center">
                <div className="login-form-container text-center">
                    <h2 className="mb-4">Đăng nhập</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        className="form-control mb-3"
                        name="email"
                        ref={emailRef}
                    />

                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        className="form-control mb-3"
                        name="password"
                        ref={passwordRef}
                    />

                    <div className="form-check mb-3 text-start">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                            Ghi nhớ tôi
                        </label>
                    </div>

                    <button onClick={login} className="btn btn-primary w-100 mb-3">
                        Đăng nhập
                    </button>

                    {type === 'on' && (
                        <div className="btn btn-primary w-100 mb-3">{emailDisplay}</div>
                    )}

                    <hr className="divider" />

                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => alert("Đăng nhập thất bại!!")}
                        />
                    </div>

                    <div className="mt-3">
                        <p className="small">
                            Bạn chưa có tài khoản?{' '}
                            <a href="/signup">Đăng ký</a>
                        </p>
                        <p className="small">
                            Quên mật khẩu?{' '}
                            <a href="/forget">Quên mật khẩu</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
