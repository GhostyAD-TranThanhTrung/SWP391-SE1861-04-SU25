import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/StaffListPage.scss";

const StaffListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [newStaff, setNewStaff] = useState({
    email: "",
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
  const [newPassword, setNewPassword] = useState('');
  const token = sessionStorage.getItem("token");
  const isAdminEditing = editingStaffId && editStaffData?.role === 'admin';

  const fetchStaffs = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const handleOpenPopup = () => {
    setShowPopup(true);
    setNewPassword(""); // reset khi tạo mới
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewPassword("");
    setEditingStaffId(null);
    setEditStaffData(null);
    setNewStaff({
      email: "",
      role: "",
      name: "",
      bio: "",
      education: "",
      date_of_birth: "",
      job: "",
    });
  };

  const handleChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditStaffData({ ...editStaffData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStaff,
        bio_json: {
          bio: newStaff.bio,
          education: newStaff.education,
        },
        password: newPassword,
      };
      delete payload.bio;
      delete payload.education;

      console.log("Payload gửi:", payload);


      const res = await axios.post("http://localhost:3000/api/staff", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
        role: staff.role,
        status: staff.status,
        name: staff.profile?.name || "",
        bio: staff.profile?.bio_json?.bio || "",
        education: staff.profile?.bio_json?.education || "",
        date_of_birth: staff.profile?.date_of_birth?.slice(0, 10) || "",
        job: staff.profile?.job || "",
      };
      setEditStaffData(flatData);
      setEditingStaffId(staffId);
      setNewPassword(""); 
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


      if (newPassword.trim() !== "") {
        payload.password = newPassword;
      }

      console.log("Payload gửi:", payload);
      console.log("Editing Staff ID:", editingStaffId);

      const res = await axios.put(
        `http://localhost:3000/api/staff/${editingStaffId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
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
        `http://localhost:3000/api/staff/${staffIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    if (searchTerm.trim() === "") {
      fetchStaffs();
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/api/staff/${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
          <FaPlus style={{ marginRight: "5px" }} /> Tạo nhân viên mới
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
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
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
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
                  <button className="btn btn-light me-2" onClick={() => handleEdit(staff.user_id)}>
                    <FaEdit color="yellow" />
                  </button>
                  {staff.role !== 'admin' && (
                    <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(staff.user_id)}>
                      <FaTrash color="red" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>{editingStaffId ? "Chỉnh sửa nhân viên" : "Tạo nhân viên mới"}</h2>
              <form className="form-grid" onSubmit={editingStaffId ? handleUpdateSubmit : handleSubmit}>
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={editingStaffId ? editStaffData?.email || "" : newStaff.email}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                  disabled={isAdminEditing}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={!editingStaffId}
                  disabled={isAdminEditing}
                />
                <select
                  name="role"
                  value={editingStaffId ? editStaffData?.role || "" : newStaff.role}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                  disabled={isAdminEditing}
                >
                  <option value="">Chọn vai trò</option>
                  {editingStaffId && editStaffData?.role === 'admin' && <option value="admin">Admin</option>}
                  <option value="staff">Nhân viên</option>
                  <option value="manager">Quản lý</option>
                </select>
                {editingStaffId && (
                  <select
                    name="status"
                    value={editStaffData?.status || ""}
                    onChange={handleEditChange}
                    required
                    disabled={isAdminEditing}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="banned">Bị cấm</option>
                  </select>
                )}
                <input
                  type="text"
                  name="name"
                  placeholder="Tên"
                  value={editingStaffId ? editStaffData?.name || "" : newStaff.name}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                  disabled={isAdminEditing}
                />
                <input
                  type="text"
                  name="bio"
                  placeholder="Tiểu sử"
                  value={editingStaffId ? editStaffData?.bio || "" : newStaff.bio}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  disabled={isAdminEditing}
                />
                <input
                  type="text"
                  name="education"
                  placeholder="Học vấn"
                  value={editingStaffId ? editStaffData?.education || "" : newStaff.education}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  disabled={isAdminEditing}
                />
                <input
                  type="date"
                  name="date_of_birth"
                  value={editingStaffId ? editStaffData?.date_of_birth || "" : newStaff.date_of_birth}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  disabled={isAdminEditing}
                />
                <input
                  type="text"
                  name="job"
                  placeholder="Công việc"
                  value={editingStaffId ? editStaffData?.job || "" : newStaff.job}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  disabled={isAdminEditing}
                />
                <button type="submit" className="form-button" disabled={isAdminEditing}>
                  {editingStaffId ? "Cập nhật" : "Tạo"}
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
              <button type="button" className="close position-absolute top-0 end-0 m-2"
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
                style={{ border: 'none', background: 'none' }}>
                <span><MdCancel size={20} /></span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận xóa</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa nhân viên này không?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>Không</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Có</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffListPage;
