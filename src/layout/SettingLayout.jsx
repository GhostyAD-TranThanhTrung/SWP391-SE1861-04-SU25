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
        <div className="profile-container d-flex setting-layout-container">
            <SettingSidebar isOpen={isSidebarOpen} />
            <div className="profile-content flex-grow-1 p-4">
                <div className="d-flex justify-content-between mb-4 page-header">
                    <button
                        className="btn btn-light sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <FaBars />
                    </button>
                    <h2 className="page-title">Cài đặt tài khoản</h2>
                    <div></div> {/* Để giữ cân đối cho layout */}
                </div>
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SettingLayout;
