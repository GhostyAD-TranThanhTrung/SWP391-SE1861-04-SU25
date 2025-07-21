// src/layout/SettingLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SettingSidebar from '../components/SettingSidebar';
import '../styles/ProfilePage.scss'; // hoặc layout riêng nếu cần
import { FaBars } from 'react-icons/fa';

const SettingLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Nếu người dùng truy cập đúng vào /setting, chuyển hướng đến /setting/profile
        if (location.pathname === '/setting') {
            navigate('/setting/profile');
        }
    }, [location.pathname, navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="setting-layout-container">
            <SettingSidebar isOpen={isSidebarOpen} />
            <div className={`setting-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="setting-header-section">
                    <button
                        className="setting-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <FaBars />
                    </button>
                    <div className="setting-header-title">
                        <h1>Cài đặt tài khoản</h1>
                        <p>Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn</p>
                    </div>
                </div>
                <div className="setting-content-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SettingLayout;
