import { useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../images/Logo.png';
import '../styles/Navbar.scss';

const Navbar = () => {
    const searchRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();
    const email = localStorage.getItem("email");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSearch = () => {
        const query = searchRef.current.value.trim();
        if (query) {
            console.log("Searching for:", query);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("email");
        navigate("/");
    };

    const handleSettings = () => {
        navigate("/setting");
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Helper function to check if link is active
    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg custom-navbar">
            <div className="container-fluid">
                {/* Logo */}
                <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="SUBSTANCE Home">
                    <img src={Logo} alt="SUBSTANCE Logo" className="navbar-logo" />
                </Link>

                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Centered links */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav gap-3">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActiveLink('/') ? 'active' : ''}`} 
                                to="/"
                                aria-current={isActiveLink('/') ? 'page' : undefined}
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActiveLink('/booking') ? 'active' : ''}`} 
                                to="/booking"
                                aria-current={isActiveLink('/booking') ? 'page' : undefined}
                            >
                                Booking
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActiveLink('/courses') ? 'active' : ''}`} 
                                to="/courses"
                                aria-current={isActiveLink('/courses') ? 'page' : undefined}
                            >
                                Courses
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActiveLink('/test') ? 'active' : ''}`} 
                                to="/test"
                                aria-current={isActiveLink('/test') ? 'page' : undefined}
                            >
                                Test
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActiveLink('/blog') ? 'active' : ''}`} 
                                to="/blog"
                                aria-current={isActiveLink('/blog') ? 'page' : undefined}
                            >
                                Blog
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActiveLink('/about') ? 'active' : ''}`} 
                                to="/about"
                                aria-current={isActiveLink('/about') ? 'page' : undefined}
                            >
                                About Us
                            </Link>
                        </li>
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
                            onKeyPress={handleKeyPress}
                            aria-label="Search"
                        />
                        <button 
                            className="btn btn-search" 
                            onClick={handleSearch}
                            aria-label="Search button"
                            type="button"
                        >
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
                                aria-expanded={dropdownOpen}
                                aria-label={`User menu for ${email}`}
                            >
                                <i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
                                <span className="navbar-text">{email}</span>
                                <i className="bi bi-chevron-down ms-1"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end custom-dropdown">
                                <li>
                                    <button
                                        className="dropdown-item btn-settings"
                                        onClick={handleSettings}
                                        aria-label="Account settings"
                                    >
                                        <i className="bi bi-gear me-2"></i> Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item btn btn-logout"
                                        onClick={handleLogout}
                                        aria-label="Logout"
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-login" aria-label="Login to your account">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-signup" aria-label="Create new account">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;