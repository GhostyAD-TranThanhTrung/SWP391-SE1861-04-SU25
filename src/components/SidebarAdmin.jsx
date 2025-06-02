import { Link } from 'react-router-dom';
import '../styles/SidebarAdmin.scss';
import { FaBlog, FaBook, FaClipboardList, FaGauge, FaIdBadge, FaRightFromBracket, FaUser, FaUserCheck } from "react-icons/fa6";


const SidebarAdmin = ({isOpen}) => {
    return (
        <div className={`sidebar-admin ${isOpen ? "open" : "collapsed"}`}>
            {/* Navigation */}
            <ul className="sidebar-menu">
                <li><Link to="/dashboard"><FaGauge className='icon'/> Dashboard</Link></li>
                <li><Link to="/users"><FaUser className='icon'/> User</Link></li>
                <li><Link to="/stafflist"><FaIdBadge className='icon'/> Staff</Link></li>
                <li><Link to="/consultant"><FaUserCheck className='icon'/> Consultant</Link></li>
                <li><Link to="/blog"><FaBlog className='icon'/> Blog</Link></li>
                <li><Link to="/courses"><FaBook className='icon'/> Course</Link></li>
                <li><Link to="/log"><FaClipboardList className='icon'/> Log</Link></li>
                <li><Link to="/admin/login"><FaRightFromBracket className='icon'/> Logout</Link></li>
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
