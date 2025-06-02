import '../styles/AdminLoginPage.scss';
import PreventionImage from '../images/Prevention.jpg';

const AdminLoginPage = () => {
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
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="form-control mb-3"
                    />

                     <div className="text-start mb-3">
                        <select id="roleSelect" className="form-select">
                            <option value="">Your Role</option>
                            <option value="admin">Admin</option>
                            <option value="consultant">Consultant</option>
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

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

                    <button className="btn btn-primary w-100 mb-3">
                        Log in
                    </button>

                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
