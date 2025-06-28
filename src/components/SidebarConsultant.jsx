import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/SidebarAdmin.scss";
import { FaGauge, FaRightFromBracket } from "react-icons/fa6";
import { ManageAccountsOutlined } from "@mui/icons-material";

const SidebarConsultant = ({ isOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("emailconsultant");
    sessionStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className={`sidebar-admin ${isOpen ? "open" : "collapsed"}`}>
      {/* Navigation */}
      <ul className="sidebar-menu">
        <li className={currentPath === "/manage-booking" ? "active" : ""}>
          <Link to="/manage-booking">
            <ManageAccountsOutlined className="icon" /> Đặt lịch
          </Link>
        </li>
        <li className={currentPath === "/certificate" ? "active" : ""}>
          <Link to="/certificate">
            <FaGauge className="icon" /> Chứng chỉ
          </Link>
        </li>

        <li>
          <Link to="#" onClick={handleLogout}>
            <FaRightFromBracket className="icon" /> Đăng xuất
          </Link>
        </li>
      </ul>

      {/* Profile */}
      <div className="sidebar-footer">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png"
          alt="Admin Avatar"
        />
        <div>
          <strong>Tư vấn viên</strong>
          <Link to="#">
            <div className="text-muted">Xem hồ sơ</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SidebarConsultant;
