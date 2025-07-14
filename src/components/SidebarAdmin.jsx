import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/SidebarAdmin.scss';
import { FaBlog, FaBook, FaClipboardList, FaGauge, FaIdBadge, FaRightFromBracket, FaUser, FaUserCheck } from "react-icons/fa6";
import { useState } from 'react';
const SidebarAdmin = ({ isOpen }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("email2");
        sessionStorage.removeItem("token");
        navigate("/admin/login");
    };
    (async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/admin/login")
            return;
        };
        try {
            const res = await fetch("http://localhost:3000/api/user/role/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            setUserRole(data.role);

        } catch (err) {
            alert("Lỗi khi lấy thông tin người dùng");
            console.error(err);
            navigate("/admin/login");
        }
    })();

    return (
        <div className={`sidebar-admin ${isOpen ? "open" : "collapsed"}`}>
            {/* Navigation */}
            <ul className="sidebar-menu">
                <li className={currentPath === "/dashboard" ? "active" : ""}>
                    <Link className={userRole !== 'manager' ? 'disabled btn btn-link' : ''} to="/dashboard"><FaGauge className='icon' /> Bảng báo cáo</Link>
                </li>
                <li className={currentPath === "/member-list" ? "active" : ""}>
                    <Link className={(userRole !== 'admin' && userRole !== 'manager') ? 'disabled btn btn-link' : ''} to="/member-list"><FaUser className='icon' /> Thành viên</Link>
                </li>
                <li className={currentPath === "/staff-list" ? "active" : ""}>
                    <Link className={(userRole !== 'admin' && userRole !== 'manager') ? 'disabled btn btn-link' : ''} to="/staff-list"><FaIdBadge className='icon' /> Nhân viên</Link>
                </li>
                <li className={currentPath === "/consultant-list" ? "active" : ""}>
                    <Link className={(userRole !== 'admin' && userRole !== 'manager') ? 'disabled btn btn-link' : ''} to="/consultant-list"><FaUserCheck className='icon' /> Tư vấn viên</Link>
                </li>
                <li className={currentPath === "/assessment-list" ? "active" : ""}>
                    <Link className={userRole !== 'manager' ? 'disabled btn btn-link' : ''} to="/assessment-list"><FaClipboardList className='icon' /> Đánh giá</Link>
                </li>
                <li className={currentPath === "/course-list" ? "active" : ""}>
                    <Link className={userRole !== 'manager' ? 'disabled btn btn-link' : ''} to="/course-list"><FaBook className='icon' /> Khóa học</Link>
                </li>
                <li className={currentPath === "/blog-list" ? "active" : ""}>
                    <Link className={userRole !== 'staff' ? 'disabled btn btn-link' : ''} to="/blog-list"><FaBlog className='icon' /> Blog</Link>
                </li>
                <li>
                    <Link to="#" onClick={handleLogout}><FaRightFromBracket className='icon' /> Đăng xuất</Link>
                </li>
            </ul>

            {/* Profile */}
            <div className="sidebar-footer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png" alt="Ảnh đại diện Admin" />
                <div>
                    <strong>Quản trị viên</strong>
                    <Link to="#">
                        <div className="text-muted">Xem hồ sơ</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SidebarAdmin;
