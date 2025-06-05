import { useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../images/Logo.png';
import '../styles/Navbar.scss';

const Navbar = () => {
    const searchRef = useRef();
    const navigate = useNavigate();
    const email = localStorage.getItem("email");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSearch = () => {
        const query = searchRef.current.value.trim();
        if (query) {
            console.log("Searching for:", query);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("email");
        navigate("/");
    };

    const handleSettings = () => {
        navigate("/settings");
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg custom-navbar">
            <div className="container-fluid">
                {/* Logo */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src={Logo} alt="Logo" className="navbar-logo" />
                </Link>

                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Centered links */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav gap-3">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/booking">Booking</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/courses">Courses</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/test">Test</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/blog">Blog</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/about">About Us</Link></li>
                    </ul>
                </div>

                {/* Right: search + buttons or email */}
                <div className="d-flex align-items-center gap-2">
                    <div className="input-group search-box">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            ref={searchRef}
                        />
                        <button className="btn btn-search" onClick={handleSearch}>
                            <i className="bi bi-search text-white"></i>
                        </button>
                    </div>

                    {email ? (
                        <div className="dropdown">
                            <button
                                className="btn d-flex align-items-center text-white"
                                style={{ backgroundColor: '#66B0C6', border: 'none' }}
                                onClick={toggleDropdown}
                                data-bs-toggle="dropdown"
                            >
                                <i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
                                <span className="navbar-text">{email}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end custom-dropdown">
                                <li>
                                    <button
                                        className="dropdown-item btn-settings"
                                        onClick={handleSettings}
                                    >
                                        <i className="bi bi-gear me-2"></i> Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item btn btn-logout"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-login">Login</Link>
                            <Link to="/signup" className="btn btn-signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;