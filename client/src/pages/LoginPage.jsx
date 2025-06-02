import { useState, useRef, useEffect } from 'react';
import '../styles/LoginPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { loginUser, getToken, removeToken } from '../services/api';
const LoginPage = () => {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const [emailDisplay, setEmailDisplay] = useState('');
    const [type, setType] = useState('off');

    // Check for existing token on component mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                // Decode the token to get user info
                const decoded = jwtDecode(token);
                if (decoded.email && decoded.exp > Date.now() / 1000) {
                    setEmailDisplay(decoded.email);
                    setType('on');
                } else {
                    // Token is expired, remove it
                    removeToken();
                }
            } catch (error) {
                // Invalid token, remove it
                removeToken();
                console.error('Invalid token:', error);
            }
        }
    }, []);async function handleLogin() {
        try {
            const email = emailRef.current.value;
            const password = passwordRef.current.value;
            
            // Use the loginUser function from api.js which handles token storage
            const data = await loginUser(email, password);
            
            if (data.user) {
                setEmailDisplay(data.user.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';
                
                // Log the successful login with token info
                console.log('Login successful:', {
                    user: data.user,
                    token: data.token ? 'Token stored successfully' : 'No token received'
                });
            }
        } catch (error) {
            setEmailDisplay(error.message || 'Login failed');
            setType('on');
            console.error('Login error:', error);
        }
    }    
    async function handleGoogleLogin(credentialResponse) {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            
            // Use the loginUser function for Google login as well
            const data = await loginUser(decoded.email, decoded.sub);
            
            if (data && data.user) {
                setEmailDisplay(data.user.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';
                
                console.log('Google login successful:', {
                    user: data.user,
                    token: data.token ? 'Token stored successfully' : 'No token received'
                });
            }
        } catch (error) {
            setEmailDisplay(error.message || 'Google login failed');
            setType('on');
            console.error('Google login error:', error);
        }
    }
    return (
        <div
            className="login-page d-flex align-items-center"
            style={{ backgroundImage: `url(${PreventionImage})` }}
        >
            <div className="login-blur-box d-flex justify-content-center align-items-center">
                <div className="login-form-container text-center">
                    <h2 className="mb-4">Log in</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        className="form-control mb-3"
                        name="email"
                        ref={emailRef}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="form-control mb-3"
                        name='password'
                        ref={passwordRef}
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
                    </div>                    <button onClick={handleLogin} className="btn btn-primary w-100 mb-3">
                        Log in
                    </button>
                    {type === 'on' && (
                        <button
                            onClick={() => {
                                setType('off');
                                setEmailDisplay('');
                                emailRef.current.value = '';
                                passwordRef.current.value = '';
                                // Remove the stored token on logout
                                removeToken();
                                console.log('User logged out, token removed');
                            }}
                            className="btn btn-secondary w-100 mb-3"
                        >
                            Log out
                        </button>
                    )}
                    <div className='bg-primary rounded text-white'>{type === 'on' ? `Hello ${emailDisplay}` : ''}</div>
                    <hr className="divider" />

                    <button className="btn btn-outline-secondary w-100 google-btn mb-3">
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="me-2"
                            style={{ width: '20px' }}
                        />
                        Log in with Google
                    </button>
                    <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Failed to login!!")} />
                    <div className="mt-3">
                        <p className="small">
                            You don't have an account?{' '}
                            <a href="/signup">Register</a>
                        </p>
                        <p className="small">
                            You forgot password?{' '}
                            <a href="/forget">Forget password</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
