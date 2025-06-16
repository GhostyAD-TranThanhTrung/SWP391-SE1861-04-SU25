import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ConsultantListPage.scss";
import axios from "axios";

const ConsultantListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [consultants, setConsultants] = useState([]);
  // const [newConsultant, setNewConsultant] = useState({
  //   email: "",
  //   password: "",
  //   role: "",
  //   name: "",
  //   bio_json: "",
  //   date_of_birth: "",
  //   job: "",
  // });

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    // setNewConsultant({
    //   email: "",
    //   password: "",
    //   role: "",
    //   name: "",
    //   bio_json: "",
    //   date_of_birth: "",
    //   job: "",
    // });
  };

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/consultants");
      if (res.data.success) {
        setConsultants(res.data.data.consultants);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);


  return (
    <div className="staff-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleOpenPopup}>
          <FaPlus style={{ marginRight: "5px", paddingBottom: "2px" }} /> Create
          new consultant
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
            style={{ background: "white" }}
          />
          <button>
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Creation date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultants.map((consultant, index) => (
              <tr key={consultant.id_consultant}>
                <td>{index + 1}</td>
                <td>{consultant.name}</td>
                <td>{consultant.email}</td>
                <td>{consultant.role}</td>
                <td>{consultant.status}</td>
                <td>{new Date(consultant.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2">
                    <FaEdit color="yellow" />
                  </button>
                  <button className="btn btn-light">
                    <FaTrash color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>
              <MdCancel />
            </span>
            <div className="form">
              <h2>Create New Consultant</h2>
              <form>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    style={{ background: "white" }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="position"
                    placeholder="Enter position"
                    style={{ background: "white" }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="email"
                    placeholder="Enter contact email"
                    style={{ background: "white" }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="number"
                    placeholder="Enter phone number"
                    style={{ background: "white" }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="date"
                    placeholder="Enter date of joining"
                    style={{ background: "white" }}
                  />
                </div>

                <button type="submit" className="form-button">
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantListPage;
