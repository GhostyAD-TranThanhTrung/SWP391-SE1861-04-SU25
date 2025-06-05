import Logo from "../images/Logo.png";
import "../styles/HeaderAdmin.scss";
import { FaBars } from "react-icons/fa";

const HeaderAdmin = ({ toggleSidebar }) => {
  return (
    <nav className="navbar header-admin bg-light px-3">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-link p-0" onClick={toggleSidebar}>
          <FaBars style={{ fontSize: "1.5rem" }} />
        </button>
        <img src={Logo} alt="Logo" className="navbar-logo" />
      </div>
    </nav>
  );
};

export default HeaderAdmin;
