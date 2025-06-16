import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ScoreListPage.scss";

const ScoreListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [newStaff, setNewStaff] = useState({
    email: "",
    password: "",
    role: "",
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    job: "",
  });

  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editStaffData, setEditStaffData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffIdToDelete, setStaffIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewStaff({
      email: "",
      password: "",
      role: "",
      name: "",
      bio: "",
      education: "",
      date_of_birth: "",
      job: "",
    });
    setEditingStaffId(null);
    setEditStaffData(null);
  };

  const handleChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditStaffData({ ...editStaffData, [e.target.name]: e.target.value });
  };

  const fetchStaffs = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/staff");
      if (res.data.success) {
        setStaffs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStaff,
        bio_json: {
          bio: newStaff.bio,
          education: newStaff.education,
        },
      };
      delete payload.bio;
      delete payload.education;

      const res = await axios.post("http://localhost:3000/api/staff", payload);
      if (res.data.success) {
        fetchStaffs();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi thêm staff:", err);
    }
  };

  const handleEdit = (staffId) => {
    const staff = staffs.find((s) => s.user_id === staffId);
    if (staff) {
      const flatData = {
        email: staff.email,
        passwordInput: staff.password,
        role: staff.role,
        status: staff.status,
        name: staff.profile?.name || "",
        bio: staff.profile?.bio_json?.bio || "",
        education: staff.profile?.bio_json?.education || "",
        date_of_birth: staff.profile?.date_of_birth || "",
        job: staff.profile?.job || "",
      };
      setEditStaffData(flatData);
      setEditingStaffId(staffId);
      setShowPopup(true);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editStaffData,
        bio_json: {
          bio: editStaffData.bio,
          education: editStaffData.education,
        },
      };
      delete payload.bio;
      delete payload.education;
      
      if (payload.passwordInput && payload.passwordInput.trim() !== "") {
        payload.password = payload.passwordInput;
      }
      delete payload.passwordInput; // Xóa trường tạm
      const res = await axios.put(
        `http://localhost:3000/api/staff/${editingStaffId}`,
        payload
      );
      if (res.data.success) {
        fetchStaffs();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật staff:", err);
    }
  };

  const handleOpenDeleteDialog = (staffId) => {
    setStaffIdToDelete(staffId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStaffIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!staffIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/staff/${staffIdToDelete}`
      );
      if (res.data.success) {
        fetchStaffs();
      }
    } catch (err) {
      console.error("Lỗi khi xóa staff:", err);
    }
    handleCloseDeleteDialog();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === '') {
      fetchStaffs();
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/members/search/${searchTerm}`);
      if (res.data.success) {
        setStaffs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm staff:", err);
    }
  };

  return (
    <div className="staff-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleOpenPopup}>
          <FaPlus style={{ marginRight: "5px", paddingBottom: "2px" }} /> Create
          new staff
        </button>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={handleSearchClick}>
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
            {staffs.map((staff, index) => (
              <tr key={staff.user_id}>
                <td>{index + 1}</td>
                <td>{staff.profile?.name}</td>
                <td>{staff.email}</td>
                <td>{staff.role}</td>
                <td>{staff.status}</td>
                <td>{new Date(staff.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button
                    className="btn btn-light me-2"
                    onClick={() => handleEdit(staff.user_id)}
                  >
                    <FaEdit color="yellow" />
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => handleOpenDeleteDialog(staff.user_id)}
                  >
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
              <h2>{editingStaffId ? "Edit Staff" : "Create New Staff"}</h2>
              <form
                className="form-grid"
                onSubmit={editingStaffId ? handleUpdateSubmit : handleSubmit}
              >
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={editingStaffId ? editStaffData?.email || "" : newStaff.email}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                />

                  <input
                  type="password"
                  name="password"
                  placeholder={editingStaffId ? "Leave blank to keep current password" : "Password"}
                  value={
                    editingStaffId ? editStaffData?.passwordInput || "" : newStaff.password
                  }
                  onChange={(e) => {
                    if (editingStaffId) {
                      setEditStaffData({ ...editStaffData, passwordInput: e.target.value });
                    } else {
                      handleChange(e);
                    }
                  }}
                  required={!editingStaffId}
                />

                <select
                  name="role"
                  value={editingStaffId ? editStaffData?.role || "" : newStaff.role}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                >
                  <option value="">Choose role</option>
                  <option value="admin">Admin</option>
                  <option value="consultant">Consultant</option>
                </select>

                {editingStaffId && (
                  <select
                    name="status"
                    value={editStaffData?.status || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Choose status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                )}

                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={editingStaffId ? editStaffData?.name || "" : newStaff.name}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                />

                <input
                  type="text"
                  name="bio"
                  placeholder="Bio"
                  value={editingStaffId ? editStaffData?.bio || "" : newStaff.bio}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <input
                  type="text"
                  name="education"
                  placeholder="Education"
                  value={editingStaffId ? editStaffData?.education || "" : newStaff.education}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <input
                  type="date"
                  name="date_of_birth"
                  value={editingStaffId ? editStaffData?.date_of_birth || "" : newStaff.date_of_birth}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <input
                  type="text"
                  name="job"
                  placeholder="Job"
                  value={editingStaffId ? editStaffData?.job || "" : newStaff.job}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <button type="submit" className="form-button">
                  {editingStaffId ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content position-relative">
              <button
                type="button"
                className="close position-absolute top-0 end-0 m-2"
                style={{ zIndex: 2, background: 'none', border: 'none' }}
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
              >
                <span aria-hidden="true"><MdCancel size={20}/></span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận xóa</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa nhân viên này không?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>No</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreListPage;