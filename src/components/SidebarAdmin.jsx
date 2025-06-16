import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/SidebarAdmin.scss';
import { FaBlog, FaBook, FaClipboardList, FaGauge, FaIdBadge, FaRightFromBracket, FaTerminal, FaUser, FaUserCheck } from "react-icons/fa6";

const SidebarAdmin = ({ isOpen }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("email2");
        sessionStorage.removeItem("token");
        navigate("/admin/login");
    };

    return (
        <div className={`sidebar-admin ${isOpen ? "open" : "collapsed"}`}>
            {/* Navigation */}
            <ul className="sidebar-menu">
                <li className={currentPath === "/dashboard" ? "active" : ""}>
                    <Link to="/dashboard"><FaGauge className='icon'/> Dashboard</Link>
                </li>
                <li className={currentPath === "/memberlist" ? "active" : ""}>
                    <Link to="/memberlist"><FaUser className='icon'/> Member</Link>
                </li>
                <li className={currentPath === "/stafflist" ? "active" : ""}>
                    <Link to="/stafflist"><FaIdBadge className='icon'/> Staff</Link>
                </li>
                <li className={currentPath === "/consultantlist" ? "active" : ""}>
                    <Link to="/consultantlist"><FaUserCheck className='icon'/> Consultant</Link>
                </li>
                <li className={currentPath === "/scorelist" ? "active" : ""}>
                    <Link to="/scorelist"><FaClipboardList className='icon'/> Score</Link>
                </li>
                <li className={currentPath === "/bloglist" ? "active" : ""}>
                    <Link to="/bloglist"><FaBlog className='icon'/> Blog</Link>
                </li>
                <li className={currentPath === "/courselist" ? "active" : ""}>
                    <Link to="/courselist"><FaBook className='icon'/> Course</Link>
                </li>
                <li className={currentPath === "/log" ? "active" : ""}>
                    <Link to="/log"><FaTerminal className='icon'/> Log</Link>
                </li>
                <li>
                    <Link to="#" onClick={handleLogout}><FaRightFromBracket className='icon'/> Logout</Link>
                </li>
            </ul>

            {/* Profile */}
            <div className="sidebar-footer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png" alt="Admin Avatar" />
                <div>
                    <strong>Admin</strong>
                    <Link to="#">
                        <div className="text-muted">View profile</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SidebarAdmin;
