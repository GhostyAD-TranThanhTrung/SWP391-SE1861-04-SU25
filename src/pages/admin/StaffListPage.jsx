import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaEyeSlash, FaUsers, FaUserShield, FaUserTie, FaCrown, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/StaffListPage.scss";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination.jsx";
const StaffListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [filterRole, setFilterRole] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const navigate = useNavigate()
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.role === 'admin') setIsAdmin(true);
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager'))) navigate('/admin/login')
    } catch {
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
    setShowPassword(false);
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
        password: staff.password || "", // Include actual password from API
      };
      setEditStaffData(flatData);
      setEditingStaffId(staffId);
      setNewPassword("");
      setShowPassword(false);
      setShowPopup(true);
    }
  };

  // Function to get password display value
  const getPasswordDisplayValue = () => {
    if (editingStaffId) {
      // When editing existing staff
      if (showPassword) {
        return newPassword || ""; // Show new password being typed
      } else {
        return "*********"; // Hide password by default when editing
      }
    } else {
      // When creating new staff
      return newPassword;
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

      // Only include password if a new password was entered
      if (newPassword && newPassword.trim() !== "") {
        payload.password = newPassword;
      } else {
        // Remove password from payload if it's empty or hidden
        delete payload.password;
      }

      console.log("Payload gửi:", payload);
      console.log("Editing Staff ID:", editingStaffId);

      const res = await axios.put(
        `http://localhost:3000/api/staff/${editingStaffId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Cập nhật nhân viên thành công!");
        fetchStaffs();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật nhân viên:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật nhân viên. Vui lòng thử lại.");
      }
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
        const { data } = res.data;

        if (data.action === "status_changed_to_inactive") {
          // Staff has references, status changed to inactive
          alert(`Nhân viên có ${data.references.total_count} tham chiếu (${data.references.programs_count} chương trình, ${data.references.flags_count} cờ).\nTrạng thái đã được chuyển thành "Không hoạt động" thay vì xóa.`);
        } else if (data.action === "completely_deleted") {
          // Staff was completely deleted
          let deletedEntities = [];
          if (data.deleted_entities.profile) deletedEntities.push("hồ sơ cá nhân");
          if (data.deleted_entities.user) deletedEntities.push("tài khoản người dùng");

          alert(`Xóa nhân viên thành công!\nĐã xóa: ${deletedEntities.join(", ")}`);
        } else {
          // Fallback message
          alert("Thao tác thành công!");
        }

        // Refresh the staff list to reflect changes
        fetchStaffs();
      }
    } catch (err) {
      console.error("Lỗi khi xóa nhân viên:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại.");
      }
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

  const handleRoleChange = (e) => {
    setFilterRole(e.target.value);
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      // If same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If different field, set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
  };

  // Filter staffs by status, role, and inactive visibility
  const filteredStaffs = staffs.filter(s => {
    // Hide inactive users by default unless showInactive is true
    if (!showInactive && s.status === 'inactive') {
      return false;
    }
    // Apply status filter
    const statusMatch = filterStatus === 'all' || s.status === filterStatus;
    // Apply role filter
    const roleMatch = filterRole === 'all' || s.role === filterRole;

    return statusMatch && roleMatch;
  });

  // Sort filtered staffs
  const sortedStaffs = [...filteredStaffs].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested properties
    if (sortField === 'name') {
      aValue = a.profile?.name || '';
      bValue = b.profile?.name || '';
    } else if (sortField === 'date_create') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string comparisons
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalItems = sortedStaffs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStaffs = sortedStaffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Đếm số lượng từng vai trò
  const adminCount = sortedStaffs.filter(s => s.role === 'admin').length;
  const staffCount = sortedStaffs.filter(s => s.role === 'staff').length;
  const managerCount = sortedStaffs.filter(s => s.role === 'manager').length;

  useEffect(() => {
    // Reset to page 1 if filter/search changes and current page is out of range
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filterStatus, filterRole, searchTerm, showInactive, staffs]);

  return (
    <div className="staff-container">

      <div className="row g-4 mb-4">
        {/* Total Staff Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Tổng số nhân viên</div>
                <div className="h3 mb-0 fw-bold">{totalItems}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  <FaCrown />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Quản trị viên</div>
                <div className="h3 mb-0 fw-bold">{adminCount}</div>
                <div className="small text-muted">admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  <FaUserShield />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Nhân viên</div>
                <div className="h3 mb-0 fw-bold">{staffCount}</div>
                <div className="small text-muted">staff</div>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  <FaUserTie />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Quản lý</div>
                <div className="h3 mb-0 fw-bold">{managerCount}</div>
                <div className="small text-muted">manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              <button disabled={!isAdmin} className="btn btn-primary shadow-sm" onClick={handleOpenPopup}>
                <FaPlus className="me-1" /> Tạo nhân viên mới
              </button>
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`btn shadow-sm ${showInactive ? 'btn-warning' : 'btn-outline-warning'}`}
                title={showInactive ? "Ẩn người dùng không hoạt động" : "Hiển thị người dùng không hoạt động"}
              >
                {showInactive ? "Ẩn không hoạt động" : "Hiện không hoạt động"}
              </button>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select shadow-sm"
                style={{ minWidth: '150px' }}
                value={filterStatus}
                onChange={handleStatusChange}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
              <select
                className="form-select shadow-sm"
                style={{ minWidth: '140px' }}
                value={filterRole}
                onChange={handleRoleChange}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
              <div className="input-group" style={{ minWidth: '250px' }}>
                <input
                  type="text"
                  className="form-control shadow-sm"
                  placeholder="Tìm kiếm nhân viên..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className="btn btn-outline-secondary shadow-sm" onClick={handleSearchClick}>
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th 
                onClick={() => handleSort('name')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by name"
              >
                Tên {getSortIcon('name')}
              </th>
              <th 
                onClick={() => handleSort('email')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by email"
              >
                Email {getSortIcon('email')}
              </th>
              <th 
                onClick={() => handleSort('role')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by role"
              >
                Vai trò {getSortIcon('role')}
              </th>
              <th 
                onClick={() => handleSort('status')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by status"
              >
                Trạng thái {getSortIcon('status')}
              </th>
              <th 
                onClick={() => handleSort('date_create')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by creation date"
              >
                Ngày tạo {getSortIcon('date_create')}
              </th>
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
                  <button disabled={!isAdmin} className="btn btn-light me-2" onClick={() => handleEdit(staff.user_id)}>
                    <FaEdit color="yellow" />
                  </button>
                  {staff.role !== 'admin' && (
                    <button disabled={!isAdmin} className="btn btn-light" onClick={() => handleOpenDeleteDialog(staff.user_id)}>
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

                {/* User Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin tài khoản</h3>
                </div>

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
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu {!editingStaffId && '*'}</label>
                  <div className="d-flex align-items-center">
                    <input
                      type={editingStaffId && showPassword ? "text" : "password"}
                      name="password"
                      value={getPasswordDisplayValue()}
                      onChange={(e) => {
                        if (editingStaffId) {
                          // When editing staff, always update newPassword for changes
                          setNewPassword(e.target.value);
                        } else {
                          // When creating new staff
                          setNewPassword(e.target.value);
                        }
                      }}
                      required={!editingStaffId}
                      disabled={isAdminEditing}
                      className="form-input"
                      style={{ color: '#000', backgroundColor: '#fff' }}
                    />
                    {editingStaffId && isAdmin && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                  </div>
                  {editingStaffId && (
                    <small className="text-muted mt-1">
                      {showPassword ? "Để trống nếu không muốn thay đổi mật khẩu" : "Nhấn nút mắt để xem/chỉnh sửa mật khẩu"}
                    </small>
                  )}
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
                    style={{ color: '#000', backgroundColor: '#fff' }}
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
                      style={{ color: '#000', backgroundColor: '#fff' }}
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                )}

                {/* Profile Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin cá nhân</h3>
                </div>

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
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
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
                    style={{ color: '#000', backgroundColor: '#fff' }}
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
                    style={{ color: '#000', backgroundColor: '#fff' }}
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
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  >
                    <option value="">Chọn trình độ học vấn</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Tiểu sử</label>
                  <textarea
                    name="bio"
                    value={editingStaffId ? editStaffData?.bio || "" : newStaff.bio}
                    onChange={editingStaffId ? handleEditChange : handleChange}
                    disabled={isAdminEditing}
                    className="form-textarea"
                    rows="4"
                    placeholder="Nhập tiểu sử chi tiết của nhân viên..."
                    style={{ color: '#000', backgroundColor: '#fff', resize: 'vertical' }}
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
                <h5 className="modal-title">Xác nhận thao tác</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn thực hiện thao tác này không?</p>
                <small className="text-muted">
                  Lưu ý: Nếu nhân viên có chương trình hoặc cờ liên quan, trạng thái sẽ được chuyển thành "Không hoạt động" thay vì xóa hoàn toàn.
                </small>
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
