import { Link } from 'react-router-dom';
import '../styles/SettingSidebar.scss';
import { FaBlog, FaBook, FaClipboardList, FaGauge, FaIdBadge, FaRightFromBracket, FaUser, FaUserCheck } from "react-icons/fa6";


const SettingSidebar = ({ isOpen }) => {
    return (
        <div className={`sidebar-setting ${isOpen ? "open" : "collapsed"}`}>
            {/* Navigation */}
            <ul className="sidebar-menu">
                <li><Link to="/dashboard"><FaGauge className='icon' /> Your Profile</Link></li>
                <li><Link to="/users"><FaUser className='icon' /> History</Link></li>
                <li><Link to="/stafflist"><FaIdBadge className='icon' /> Notification</Link></li>
                <li><Link to="/consultant"><FaUserCheck className='icon' /> Test Result</Link></li>
            </ul>

        </div>
    );
};

export default SettingSidebar;
