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

    // Hàm kiểm tra profile và điều hướng người dùng
    async function checkProfileAndRedirect() {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('Không tìm thấy token');
                navigate('/login'); // Redirect to login instead of choose-role
                return;
            }

            console.log('🔍 Checking profile with token:', token.substring(0, 20) + '...');

            const res = await fetch('http://localhost:3000/api/profile/status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Profile status response:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('✅ Profile data received:', data);

                // Kiểm tra xem có redirectAfterLogin không
                const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
                if (redirectAfterLogin) {
                    console.log('🔄 Redirecting to saved path:', redirectAfterLogin);
                    sessionStorage.removeItem('redirectAfterLogin'); // Xóa để tránh redirect lại
                    navigate(redirectAfterLogin);
                    return;
                }

                // Check for both possible response formats
                if (data.success && data.hasProfile) {
                    console.log('👤 User has profile, redirecting to home');
                    navigate('/'); // User has profile
                } else if (data.success && !data.hasProfile) {
                    console.log('📝 User needs to create profile, redirecting to choose-role');
                    navigate('/choose-role'); // User needs to create profile
                } else {
                    console.log('⚠️ Unexpected response format:', data);
                    navigate('/choose-role'); // Default to profile creation
                }
            } else if (res.status === 401) {
                console.error('🔒 Token invalid or expired');
                // Clear invalid token and redirect to login
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('email');
                setEmailDisplay('Phiên đăng nhập đã hết hạn');
                setType('on');
                navigate('/login');
            } else if (res.status === 404) {
                console.log('📝 Profile not found, redirecting to choose-role');
                navigate('/choose-role'); // Profile doesn't exist
            } else {
                console.error('❌ Server error:', res.status);
                const errorData = await res.json().catch(() => ({}));
                console.error('Error details:', errorData);
                navigate('/choose-role'); // Default fallback
            }
        } catch (err) {
            console.error('🌐 Network error during profile check:', err);
            // Check if it's a network error or server is down
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setEmailDisplay('Không thể kết nối đến server');
                setType('on');
            }
            navigate('/choose-role'); // Fallback for network errors
        }
    }

    // Đăng nhập thông thường
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
                console.log('Đăng nhập thành công, email:', email);
                setEmailDisplay("Xin chào " + email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = ''; sessionStorage.setItem("email", email);
                sessionStorage.setItem("token", data.token);

                // Kiểm tra profile sau khi lưu token
                await checkProfileAndRedirect();
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

    // Đăng nhập bằng Google
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

            if (data && data.user) {
                console.log('Đăng nhập Google thành công, email:', data.user.email);
                setEmailDisplay("Xin chào " + data.user.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';

                sessionStorage.setItem("email", data.user.email);
                sessionStorage.setItem("token", data.token);

                // Kiểm tra profile sau khi lưu token
                await checkProfileAndRedirect();
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
