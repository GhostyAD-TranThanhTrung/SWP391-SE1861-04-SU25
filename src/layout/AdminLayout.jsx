import HeaderAdmin from "../components/HeaderAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import "../styles/AdminLayout.scss";
import { useState } from "react";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="layout-main">
      <HeaderAdmin toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="main-content">
        <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <SidebarAdmin isOpen={isSidebarOpen} />
        </div>

        <div className="content">
          <div className="component">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
