import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/StaffListPage.scss";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination.jsx";
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  const navigate = useNavigate()
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && res.data.role === 'admin')) navigate('/admin/login')
    } catch{
      navigate('/admin/login')
    }

  }
  userRole()
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

    // Validate required fields
    if (!newStaff.email || !newStaff.role || !newStaff.name || !newPassword) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (Email, Vai trò, Tên, Mật khẩu)");
      return;
    }

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
        alert("Tạo nhân viên thành công!");
        fetchStaffs();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi thêm staff:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi tạo nhân viên. Vui lòng thử lại.");
      }
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
      console.error("Lỗi khi cập nhật nhân viên:", err);
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
      console.error("Lỗi khi xóa nhân viên:", err);
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

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Filter staffs theo status
  const filteredStaffs = staffs.filter(s => 
    filterStatus === 'all' || s.status === filterStatus
  );

  // Pagination logic
  const totalItems = filteredStaffs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // Reset to page 1 if filter/search changes and current page is out of range
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filterStatus, searchTerm, staffs]);

  return (
    <div className="staff-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleOpenPopup}>
          <FaPlus className="me-1" /> Tạo nhân viên mới
        </button>
        <div className="input-group" style={{ maxWidth: '450px' }}>
          <select
            className="form-select me-2"
            style={{ maxWidth: '200px' }}
            value={filterStatus}
            onChange={handleStatusChange}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm nhân viên..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="btn btn-outline-secondary" onClick={handleSearchClick}>
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
            {paginatedStaffs.map((staff, index) => (
              <tr key={staff.user_id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
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

      {/* Pagination below the table */}
      <PaginationComp
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        maxPageNumbersToShow={maxPageNumbersToShow}
        onPageChange={setCurrentPage}
      />

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>{editingStaffId ? "Chỉnh sửa nhân viên" : "Tạo nhân viên mới"}</h2>
              <form className="form-grid" onSubmit={editingStaffId ? handleUpdateSubmit : handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editingStaffId ? editStaffData?.email || "" : newStaff.email}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    required
                    disabled={isAdminEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu {!editingStaffId && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required={!editingStaffId}
                    disabled={isAdminEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vai trò *</label>
                  <select
                    name="role"
                    value={editingStaffId ? editStaffData?.role || "" : newStaff.role}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    required
                    disabled={isAdminEditing}
                    className="form-select"
                  >
                    <option value="">Chọn vai trò</option>
                    {editingStaffId && editStaffData?.role === 'admin' && <option value="admin">Admin</option>}
                    {editingStaffId && <option value="admin">Admin</option>}
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                {editingStaffId && (
                  <div className="form-group">
                    <label className="form-label">Trạng thái *</label>
                    <select
                      name="status"
                      value={editStaffData?.status || ""}
                      onChange={handleEditChange}
                      required
                      disabled={isAdminEditing}
                      className="form-select"
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={editingStaffId ? editStaffData?.name || "" : newStaff.name}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    required
                    disabled={isAdminEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiểu sử</label>
                  <input
                    type="text"
                    name="bio"
                    value={editingStaffId ? editStaffData?.bio || "" : newStaff.bio}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    disabled={isAdminEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Học vấn</label>
                  <select
                    name="education"
                    value={editingStaffId ? editStaffData?.education || "" : newStaff.education}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    disabled={isAdminEditing}
                    className="form-select"
                  >
                    <option value="">Chọn trình độ học vấn</option>
                    <option value="Trung học phổ thông">Trung học phổ thông</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editingStaffId ? editStaffData?.date_of_birth || "" : newStaff.date_of_birth}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    disabled={isAdminEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Công việc</label>
                  <input
                    type="text"
                    name="job"
                    value={editingStaffId ? editStaffData?.job || "" : newStaff.job}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    disabled={isAdminEditing}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="form-button form-grid-col-span-2" disabled={isAdminEditing}>
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
