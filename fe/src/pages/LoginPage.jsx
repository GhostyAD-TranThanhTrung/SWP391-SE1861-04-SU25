import { useState, useRef } from 'react';
import '../styles/LoginPage.scss';
import PreventionImage from '../images/Prevention.jpg';
import { GoogleLogin } from '@react-oauth/google';
const LoginPage = () => {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const [emailDisplay, setEmailDisplay] = useState('');
    const [type, setType] = useState('off');
    async function login() {
        try {
            const email = emailRef.current.value;
            const password = passwordRef.current.value;
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.status !== 401 && data.user) {
                setEmailDisplay("Hello " + data.user.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';
            } else {
                setEmailDisplay(data.error || 'Login failed');
                setType('on');
            }
        } catch (e) {
            setEmailDisplay('Login failed');
            setType('on');
        }
    }
    async function handleGoogleLogin(credentialResponse) {
        try {
            // Send credential to backend for verification
            const response = await fetch('http://localhost:3000/api/google-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            });
            const data = await response.json();
            if (data && data.user) {
                setEmailDisplay("Hello " + data.user.email);
                setType('on');
                emailRef.current.value = '';
                passwordRef.current.value = '';
            } else {
                setEmailDisplay(data.error || 'Google login failed');
                setType('on');
            }
        } catch (e) {
            setEmailDisplay('Google login failed');
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
                    </div>

                    <button onClick={login} className="btn btn-primary w-100 mb-3">
                        Log in
                    </button>

                    {type === 'on' && (
                        <div className="btn btn-primary w-100 mb-3">{emailDisplay} </div>
                    )}


                    <hr className="divider" />


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
