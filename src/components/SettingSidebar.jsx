import { Link, useLocation } from 'react-router-dom';
import '../styles/SettingSidebar.scss';
import { FaUser, FaBookOpen, FaHeart, FaGraduationCap, FaChartBar } from "react-icons/fa6";
import { useState, useEffect } from 'react';

const SettingSidebar = ({ isOpen }) => {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/setting/profile')) setActiveItem('profile');
        else if (path.includes('/read-blogs')) setActiveItem('read-blogs');
        else if (path.includes('/favorite-blogs')) setActiveItem('favorite-blogs');
        else if (path.includes('/completed-courses')) setActiveItem('completed-courses');
        else if (path.includes('/assessment-result')) setActiveItem('assessment-result');
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
                <li className={activeItem === 'read-blogs' ? 'active' : ''}>
                    <Link to="/read-blogs">
                        <div className="menu-item">
                            <FaBookOpen className='icon' />
                            <span>Blog đã đọc</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'favorite-blogs' ? 'active' : ''}>
                    <Link to="/favorite-blogs">
                        <div className="menu-item">
                            <FaHeart className='icon' />
                            <span>Blog yêu thích</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'completed-courses' ? 'active' : ''}>
                    <Link to="/completed-courses">
                        <div className="menu-item">
                            <FaGraduationCap className='icon' />
                            <span>Chương trình khác</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'assessment-result' ? 'active' : ''}>
                    <Link to="/assessment-result">
                        <div className="menu-item">
                            <FaChartBar className='icon' />
                            <span>Lịch sử đánh giá</span>
                        </div>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default SettingSidebar;
