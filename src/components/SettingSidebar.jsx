import { Link, useLocation } from 'react-router-dom';
import '../styles/SettingSidebar.scss';
import { FaUser, FaBook, FaGraduationCap, FaChartBar } from "react-icons/fa6";
import { useState, useEffect } from 'react';

const SettingSidebar = ({ isOpen }) => {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/setting/profile')) setActiveItem('profile');
        else if (path.includes('/setting/write-blogs')) setActiveItem('write-blogs');
        else if (path.includes('/setting/completed-courses')) setActiveItem('completed-courses');
        else if (path.includes('/setting/assessment-result')) setActiveItem('assessment-result');
    }, [location]);

    return (
        <div className={`sidebar-setting ${isOpen ? "open" : "collapsed"}`}>
            <div className="sidebar-header">
                <h3>Cài đặt tài khoản</h3>
            </div>

            {/* Navigation Menu */}
            <ul className="sidebar-menu">
                <li className={activeItem === 'profile' ? 'active' : ''}>
                    <Link to="/setting/profile">
                        <div className="menu-item">
                            <FaUser className='icon' />
                            <span>Hồ sơ của bạn</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'write-blogs' ? 'active' : ''}>
                    <Link to="/setting/write-blogs">
                        <div className="menu-item">
                            <FaBook className='icon' />
                            <span>Blog đã viết</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'completed-courses' ? 'active' : ''}>
                    <Link to="/setting/completed-courses">
                        <div className="menu-item">
                            <FaGraduationCap className='icon' />
                            <span>Khóa học đã hoàn thành</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'assessment-result' ? 'active' : ''}>
                    <Link to="/setting/assessment-result">
                        <div className="menu-item">
                            <FaChartBar className='icon' />
                            <span>Kết quả kiểm tra</span>
                        </div>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default SettingSidebar;
