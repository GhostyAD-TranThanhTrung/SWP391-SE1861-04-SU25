import { Link, useLocation } from 'react-router-dom';
import '../styles/SettingSidebar.scss';
import { FaUser, FaBookOpen, FaGraduationCap, FaChartBar, FaCalendarDays } from "react-icons/fa6";
import { useState, useEffect } from 'react';

const SettingSidebar = ({ isOpen }) => {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/setting/profile')) setActiveItem('profile');
        else if (path.includes('/my-blogs')) setActiveItem('my-blogs');
        else if (path.includes('/my-programs/community-events')) setActiveItem('community-events');
        else if (path.includes('/my-programs/others')) setActiveItem('other-programs');
        else if (path.includes('/assessment-history')) setActiveItem('assessment-history');
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
                <li className={activeItem === 'my-blogs' ? 'active' : ''}>
                    <Link to="/my-blogs">
                        <div className="menu-item">
                            <FaBookOpen className='icon' />
                            <span>Blog bạn viết</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'community-events' ? 'active' : ''}>
                    <Link to="/my-programs/community-events">
                        <div className="menu-item">
                            <FaCalendarDays className='icon' />
                            <span>Sự kiện cộng đồng</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'other-programs' ? 'active' : ''}>
                    <Link to="/my-programs/others">
                        <div className="menu-item">
                            <FaGraduationCap className='icon' />
                            <span>Chương trình khác</span>
                        </div>
                    </Link>
                </li>
                <li className={activeItem === 'assessment-history' ? 'active' : ''}>
                    <Link to="/assessment-history">
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
