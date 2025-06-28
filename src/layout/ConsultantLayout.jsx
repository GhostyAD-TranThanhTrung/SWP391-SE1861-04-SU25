import HeaderConsultant from "../components/HeaderConsultant";
import SidebarConsultant from "../components/SidebarConsultant";
import "../styles/AdminLayout.scss";
import { useState } from "react";

const ConsultantLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="layout-main">
      <HeaderConsultant toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="main-content">
        <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <SidebarConsultant isOpen={isSidebarOpen} />
        </div>

        <div className="content">
          <div className="component">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantLayout;
