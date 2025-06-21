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
    const email = sessionStorage.getItem("email");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSearch = () => {
        const query = searchRef.current.value.trim();
        if (query) {
            console.log("Đang tìm kiếm:", query);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("token");
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
                <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="SUBSTANCE Trang chủ">
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
                    aria-label="Chuyển đổi điều hướng"
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
                                Trang chủ
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActiveLink('/booking') ? 'active' : ''}`}
                                to="/booking"
                                aria-current={isActiveLink('/booking') ? 'page' : undefined}
                            >
                                Đặt lịch
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActiveLink('/courses') ? 'active' : ''}`}
                                to="/courses"
                                aria-current={isActiveLink('/courses') ? 'page' : undefined}
                            >
                                Khóa học
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActiveLink('/test') ? 'active' : ''}`}
                                to="/test"
                                aria-current={isActiveLink('/test') ? 'page' : undefined}
                            >
                                Kiểm tra
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
                                Về chúng tôi
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Right: search + buttons or email */}
                <div className="d-flex align-items-center gap-3">
                    <div className="search-box">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm..."
                            ref={searchRef}
                            onKeyPress={handleKeyPress}
                            aria-label="Tìm kiếm"
                        />
                        <button
                            className="btn btn-search"
                            onClick={handleSearch}
                            aria-label="Nút tìm kiếm"
                            type="button"
                        >
                            <i className="bi bi-search text-white"></i>
                        </button>
                    </div>

                    {email ? (
                        <div className="dropdown">
                            <button
                                className="btn d-flex align-items-center text-white user-dropdown-btn"
                                style={{ backgroundColor: '#66B0C6', border: 'none' }}
                                onClick={toggleDropdown}
                                data-bs-toggle="dropdown"
                                aria-expanded={dropdownOpen}
                                aria-label={`Menu người dùng cho ${email}`}
                            >
                                <i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
                                <span className="navbar-text email-truncate" title={email}>{email}</span>
                                <i className="bi bi-chevron-down ms-1"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end custom-dropdown">
                                <li>
                                    <button
                                        className="dropdown-item btn-settings"
                                        onClick={handleSettings}
                                        aria-label="Cài đặt tài khoản"
                                    >
                                        <i className="bi bi-gear me-2"></i> Cài đặt
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item btn btn-logout"
                                        onClick={handleLogout}
                                        aria-label="Đăng xuất"
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-login" aria-label="Đăng nhập vào tài khoản">
                                Đăng nhập
                            </Link>
                            <Link to="/signup" className="btn btn-signup" aria-label="Tạo tài khoản mới">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;