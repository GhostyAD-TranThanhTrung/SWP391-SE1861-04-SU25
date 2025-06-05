import { useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { FaTrash, FaWrench } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../styles/StaffListPage.scss";

const StaffListPage = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  return (
    <div className="staff-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleOpenPopup}>
          <FaPlus style={{ marginRight: "5px", paddingBottom: "2px" }} /> Create
          new staff
        </button>
        <div className="search-box">
          <input type="text" placeholder="Search..." />
          <button>
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Position</th>
              <th>Contact Email</th>
              <th>Phone Number</th>
              <th>Date of Joining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alice Johnson</td>
              <td>Software Engineer</td>
              <td>alice.johnson@example.com</td>
              <td>123-456-7890</td>
              <td>2021-05-15</td>
              <td className="action-buttons">
                <button className="btn btn-light me-2">
                  <FaTrash color="red" />
                </button>
                <button className="btn btn-light">
                  <FaWrench color="yellow" />
                </button>
              </td>
            </tr>
            <tr>
              <td>Bob Smith</td>
              <td>Marketing Specialist</td>
              <td>bob.smith@example.com</td>
              <td>234-567-8901</td>
              <td>2020-03-22</td>
              <td className="action-buttons">
                <button className="btn btn-light me-2">
                  <FaTrash color="red" />
                </button>
                <button className="btn btn-light">
                  <FaWrench color="yellow" />
                </button>
              </td>
            </tr>
            <tr>
              <td>Charlie Brown</td>
              <td>Sales Manager</td>
              <td>charlie.brown@example.com</td>
              <td>345-678-9012</td>
              <td>2019-07-30</td>
              <td className="action-buttons">
                <button className="btn btn-light me-2">
                  <FaTrash color="red" />
                </button>
                <button className="btn btn-light">
                  <FaWrench color="yellow" />
                </button>
              </td>
            </tr>
            <tr>
              <td>Diana Prince</td>
              <td>HR Coordinator</td>
              <td>diana.prince@example.com</td>
              <td>456-789-0123</td>
              <td>2022-01-10</td>
              <td className="action-buttons">
                <button className="btn btn-light me-2">
                  <FaTrash color="red" />
                </button>
                <button className="btn btn-light">
                  <FaWrench color="yellow" />
                </button>
              </td>
            </tr>
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
              <h2>Create New Staff</h2>
              <form>
                <div>
                  
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  
                  <input
                    type="text"
                    name="position"
                    placeholder="Enter position"
                  />
                </div>
                <div>
                  
                  <input
                    type="text"
                    name="email"
                    placeholder="Enter contact email"
                  />
                </div>
                <div>
                  
                  <input
                    type="text"
                    name="number"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  
                  <input
                    type="text"
                    name="date"
                    placeholder="Enter date of joining"
                  />
                </div>
                {/* <div>
                         <label htmlFor="brand">Brand: </label>
                         <select value={arttool.brand} name='brand' onChange={handleChange}>
                             <option value="">Choose brand</option>
                             <option value="KingArt">KingArt</option>
                             <option value="Color Splash">Color Splash</option>
                             <option value="Edding">Edding</option>
                             <option value="Arteza">Arteza</option>
                         </select>
                         <br/>
                         {errors.brand_err && <span className='error'>{errors.brand_err}</span>}
                     </div>
                     <div>
                         <label htmlFor="limitedTimeDeal">Limited Time Deal: </label>
                         <input type="number" name='limitedTimeDeal' value={arttool.limitedTimeDeal} step="1" onChange={handleChange} />
                     </div> */}
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

export default StaffListPage;
