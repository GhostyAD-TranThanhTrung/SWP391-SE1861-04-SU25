import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaClock, FaEye, FaEyeSlash, FaUsers } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ConsultantListPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination";
const ConsultantListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [newConsultant, setNewConsultant] = useState({
    email: "",
    password: "",
    role: "",
    status: "active",
    cost: 0,
    certification: "",
    speciality: "",
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    job: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editingConsultantId, setEditingConsultantId] = useState(null);
  const [editConsultantData, setEditConsultantData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultantIdToDelete, setConsultantIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Slot management state
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedConsultantForSlots, setSelectedConsultantForSlots] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [consultantSlots, setConsultantSlots] = useState([]);
  const [daySlotSelections, setDaySlotSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;
  
  // Statistics state - no longer needed as we'll calculate from filtered data

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.role === 'admin') setIsAdmin(true);
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager'))) navigate('/admin/login')
    } catch (err) {
      navigate('/admin/login')
    }

  }
  userRole()
  // Days of week configuration
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayLabels = {
    'Monday': 'Thứ 2',
    'Tuesday': 'Thứ 3',
    'Wednesday': 'Thứ 4',
    'Thursday': 'Thứ 5',
    'Friday': 'Thứ 6',
    'Saturday': 'Thứ 7',
    'Sunday': 'Chủ nhật'
  };

  // Slot management functions
  const fetchAvailableSlots = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/slots", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        console.log("Available slots:", res.data.data); // Debug log
        setAvailableSlots(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách slots:", err);
    }
  };

  const fetchConsultantSlots = async (consultantId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/consultant-slots/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        console.log("Consultant slots data:", res.data.data); // Debug log
        setConsultantSlots(res.data.data);

        // Initialize day-slot selections based on existing consultant slots
        const selections = {};
        daysOfWeek.forEach(day => {
          selections[day] = [];
        });

        // Group existing slots by day and collect slot IDs
        res.data.data.forEach(slot => {
          console.log("Processing slot:", slot); // Debug log
          const day = slot.day_of_week;
          if (selections[day]) {
            // Make sure we're using the correct slot_id field
            const slotId = slot.slot_id || slot.id;
            if (slotId && !selections[day].includes(slotId)) {
              selections[day].push(slotId);
            }
          }
        });

        console.log("Initialized day slot selections:", selections); // Debug log
        setDaySlotSelections(selections);
      }
    } catch (err) {
      console.error("Lỗi khi lấy slots của consultant:", err);
      setConsultantSlots([]);
      // Initialize empty selections
      const emptySelections = {};
      daysOfWeek.forEach(day => {
        emptySelections[day] = [];
      });
      setDaySlotSelections(emptySelections);
    }
  };

  const handleOpenSlotModal = async (consultant) => {
    setSelectedConsultantForSlots(consultant);
    setShowSlotModal(true);
    setMessage({ text: "", type: "" });
    console.log("Opening slot modal for consultant:", consultant); // Debug log
    await fetchAvailableSlots();
    await fetchConsultantSlots(consultant.id_consultant);
  };

  const handleCloseSlotModal = () => {
    setShowSlotModal(false);
    setSelectedConsultantForSlots(null);
    setConsultantSlots([]);
    setDaySlotSelections({});
    setMessage({ text: "", type: "" });
  };

  const handleSlotToggle = (day, slotId) => {
    setDaySlotSelections(prev => {
      const daySlots = prev[day] || [];
      const newDaySlots = daySlots.includes(slotId)
        ? daySlots.filter(id => id !== slotId)
        : [...daySlots, slotId];

      return {
        ...prev,
        [day]: newDaySlots
      };
    });
  };

  const handleSaveSlots = async () => {
    if (!selectedConsultantForSlots) return;

    try {
      setLoading(true);

      // Prepare slots data for the API
      const slotsToSave = [];

      Object.entries(daySlotSelections).forEach(([day, slotIds]) => {
        slotIds.forEach(slotId => {
          slotsToSave.push({
            slot_id: parseInt(slotId),
            day_of_week: day
          });
        });
      });

      // First, delete all existing consultant slots
      await axios.delete(`http://localhost:3000/api/consultant-slots/consultant/${selectedConsultantForSlots.id_consultant}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Then, create new slots if any are selected
      if (slotsToSave.length > 0) {
        const res = await axios.post(
          `http://localhost:3000/api/consultant-slots/consultant/${selectedConsultantForSlots.id_consultant}`,
          { slots: slotsToSave },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setMessage({ text: "Cập nhật lịch làm việc thành công!", type: "success" });
          setTimeout(() => {
            handleCloseSlotModal();
          }, 2000);
        }
      } else {
        setMessage({ text: "Đã xóa tất cả lịch làm việc của tư vấn viên", type: "success" });
        setTimeout(() => {
          handleCloseSlotModal();
        }, 2000);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật slots:", err);
      setMessage({ text: "Có lỗi xảy ra khi cập nhật lịch làm việc", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewPassword("");
    setShowPassword(false);
    setEditingConsultantId(null);
    setEditConsultantData(null);
    setNewConsultant({
      email: "",
      password: "",
      role: "consultant",
      status: "active",
      name: "",
      bio_json: "",
      education: "",
      date_of_birth: "",
      job: "",
      cost: 0,
      certification: "",
      speciality: ""
    });
  };

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/consultants-complete", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setConsultants(res.data.data.consultants);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };



  const handleChange = (e) => {
    setNewConsultant({ ...newConsultant, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditConsultantData({ ...editConsultantData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newConsultant.email || !newConsultant.name || !newPassword) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (Email, Tên, Mật khẩu)");
      return;
    }

    try {
      const payload = {
        // User table fields
        email: newConsultant.email,
        password: newPassword,
        role: "consultant",
        status: "active", // Vietnamese status value

        // Consultant table fields
        cost: newConsultant.cost || 0,
        certification: newConsultant.certification || "",
        speciality: newConsultant.speciality || "",

        // Profile table fields
        name: newConsultant.name,
        bio_json: JSON.stringify({
          bio: newConsultant.bio || "",
          education: newConsultant.education || "",
        }),
        date_of_birth: newConsultant.date_of_birth || null,
        job: newConsultant.job || "",
      };

      console.log("Payload gửi:", payload);

      const res = await axios.post("http://localhost:3000/api/consultants-complete", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("Tạo tư vấn viên thành công!");
        fetchConsultants();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi thêm consultant:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi tạo tư vấn viên. Vui lòng thử lại.");
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === "") {
      fetchConsultants();
      return;
    }

    try {
      // For now, we'll filter on the frontend since there's no search endpoint for complete consultants
      // You could implement a search endpoint in the backend later
      const res = await axios.get("http://localhost:3000/api/consultants-complete", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const filteredConsultants = res.data.data.consultants.filter(consultant =>
          consultant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultant.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setConsultants(filteredConsultants);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm consultant:", err);
    }
  };

  const handleOpenDeleteDialog = (consultantId) => {
    setConsultantIdToDelete(consultantId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConsultantIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!consultantIdToDelete) return;
    try {
      console.log(`🗑️ Frontend: Deleting consultant ${consultantIdToDelete}`);
      
      const res = await axios.delete(
        `http://localhost:3000/api/consultants-complete/${consultantIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`📋 Frontend: Delete response:`, res.data);
      
      if (res.data.success) {
        const { data, message } = res.data;
        
        if (data.action === "status_changed_to_inactive") {
          // Consultant has booking sessions, some were cancelled, status changed to inactive
          alert(message || `Tư vấn viên có ${data.booking_sessions_count} phiên tư vấn đã đặt.\n` +
                           `${data.cancelled_sessions_count} phiên đã được hủy, ${data.completed_sessions_count} phiên hoàn thành được giữ nguyên.\n` +
                           `Trạng thái tài khoản đã được chuyển thành "Không hoạt động".`);
        } else if (data.action === "completely_deleted") {
          // Consultant was completely deleted
          alert(message || "Xóa tư vấn viên thành công!\nĐã xóa: lịch làm việc, thông tin tư vấn viên, hồ sơ cá nhân, tài khoản người dùng");
        } else {
          // Fallback message
          alert(message || "Thao tác thành công!");
        }
        
        console.log(`✅ Frontend: Delete operation completed, refreshing list...`);
        // Refresh the consultant list to reflect changes
        fetchConsultants();
      }
    } catch (err) {
      console.error("❌ Frontend: Error deleting consultant:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        alert(`Lỗi hệ thống: ${err.response.data.error}`);
      } else {
        alert("Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại.");
      }
    }
    handleCloseDeleteDialog();
  };

  // Fetch consultant by ID and open edit popup
  const handleEdit = async (consultantId) => {
    if (!consultantId) {
      setShowPopup(true)
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/consultants-complete/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const consultant = res.data.data;
        let bio = "";
        let education = "";
        if (consultant && consultant.bio_json) {
          try {
            let bioObj = typeof consultant.bio_json === "string"
              ? JSON.parse(consultant.bio_json)
              : consultant.bio_json;
            bio = bioObj?.bio || "";
            education = bioObj?.education || "";
          } catch {
            bio = "";
            education = "";
          }
        }
        setEditConsultantData({
          ...consultant,
          bio,
          education,
          date_of_birth: consultant.date_of_birth ? consultant.date_of_birth.slice(0, 10) : "",
          password: consultant.password || "", // Include actual password from API
        });
        setEditingConsultantId(consultantId);
        setShowPassword(false);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin consultant:", err);
    }
  };

  // Function to get password display value
  const getPasswordDisplayValue = () => {
    if (editingConsultantId) {
      // When editing existing consultant
      if (showPassword) {
        return editConsultantData?.password || ""; // Show actual password when admin toggles visibility
      } else {
        return "*********"; // Hide password by default when editing
      }
    } else {
      // When creating new consultant
      return newPassword;
    }
  };

  // Update consultant info
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingConsultantId) return;

    try {
      const payload = {
        // User table fields
        email: editConsultantData.email,
        role: "consultant",
        status: editConsultantData.status,

        // Consultant table fields
        cost: editConsultantData.cost,
        certification: editConsultantData.certification,
        speciality: editConsultantData.speciality,

        // Profile table fields
        name: editConsultantData.name,
        bio_json: JSON.stringify({
          bio: editConsultantData.bio || "",
          education: editConsultantData.education || "",
        }),
        date_of_birth: editConsultantData.date_of_birth,
        job: editConsultantData.job,
      };

      console.log("ID cần update:", editingConsultantId);
      console.log("Payload gửi:", payload);

      const res = await axios.put(`http://localhost:3000/api/consultants-complete/${editingConsultantId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Cập nhật tư vấn viên thành công!");
        fetchConsultants();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật consultant:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật tư vấn viên. Vui lòng thử lại.");
      }
    }
  };

  // Filter consultants by status and inactive visibility
  const filteredConsultants = consultants.filter(c => {
    // Hide inactive users by default unless showInactive is true
    if (!showInactive && c.status === 'inactive') {
      return false;
    }
    // Apply status filter
    return statusFilter === 'all' || c.status === statusFilter;
  });

  // Pagination logic
  const totalItems = filteredConsultants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedConsultants = filteredConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics from all consultants data
  const activeCount = consultants.filter(c => c.status === 'active').length;
  const inactiveCount = consultants.filter(c => c.status === 'inactive').length;
  const bannedCount = consultants.filter(c => c.status === 'banned').length;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line
  }, [statusFilter, searchTerm, showInactive, totalPages]);

  return (
    <div className="staff-container">

      <div className="row g-4 mb-4">
        {/* Total Consultants Card */}
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
                <div className="small text-muted">Tổng số tư vấn viên</div>
                <div className="h3 mb-0 fw-bold">{consultants.length}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Consultants Card */}
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
                <div className="small text-muted">Tư vấn viên hoạt động</div>
                <div className="h3 mb-0 fw-bold">{activeCount}</div>
                <div className="small text-muted">active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inactive Consultants Card */}
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
                <div className="small text-muted">Không hoạt động</div>
                <div className="h3 mb-0 fw-bold">{inactiveCount}</div>
                <div className="small text-muted">inactive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Banned Consultants Card */}
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
                <div className="small text-muted">Bị cấm</div>
                <div className="h3 mb-0 fw-bold">{bannedCount}</div>
                <div className="small text-muted">banned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              <button onClick={() => { handleEdit(null) }} className="btn btn-primary shadow-sm" title="Tạo tư vấn viên tạm thời">
                <FaPlus className="me-1" /> Tạo tư vấn viên mới
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
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
              <div className="input-group" style={{ minWidth: '250px' }}>
                <input
                  type="text"
                  className="form-control shadow-sm"
                  placeholder="Tìm kiếm tư vấn viên..."
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
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedConsultants.map((consultant, index) => (
              <tr key={consultant.id_consultant}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{consultant.name}</td>
                <td>{consultant.email}</td>
                <td>{consultant.role}</td>
                <td>{consultant.status}</td>
                <td>{new Date(consultant.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button disabled={!isAdmin} className="btn btn-outline-warning btn-sm me-2" onClick={() => handleEdit(consultant.id_consultant)}>
                    <FaEdit />
                  </button>
                  <button disabled={!isAdmin} className="btn btn-outline-info btn-sm me-2" onClick={() => handleOpenSlotModal(consultant)} title="Quản lý lịch làm việc">
                    <FaClock />
                  </button>
                  <button disabled={!isAdmin} className="btn btn-outline-danger btn-sm" onClick={() => handleOpenDeleteDialog(consultant.id_consultant)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


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
              <h2>{editingConsultantId ? "Chỉnh sửa Tư vấn viên" : "Tạo mới Tư vấn viên"}</h2>
              <form className="form-grid" onSubmit={editingConsultantId ? handleUpdate : handleSubmit}>
                
                {/* User Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin tài khoản</h3>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editingConsultantId ? editConsultantData?.email ?? '' : newConsultant.email}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    required
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mật khẩu {!editingConsultantId && '*'}</label>
                  <div className="d-flex align-items-center">
                    <input
                      type={editingConsultantId && showPassword ? "text" : "password"}
                      name="password"
                      value={getPasswordDisplayValue()}
                      onChange={(e) => {
                        if (editingConsultantId && showPassword) {
                          // When editing and password is visible, allow editing
                          setEditConsultantData({ ...editConsultantData, password: e.target.value });
                        } else if (!editingConsultantId) {
                          // When creating new consultant
                          setNewPassword(e.target.value);
                        }
                      }}
                      required={!editingConsultantId}
                      disabled={editingConsultantId && !showPassword}
                      className="form-input"
                      style={{ color: '#000', backgroundColor: '#fff' }}
                    />
                    {editingConsultantId && isAdmin && (
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
                  {editingConsultantId && (
                    <small className="text-muted mt-1">
                      {showPassword ? "Để trống nếu không muốn thay đổi mật khẩu" : "Nhấn nút mắt để xem/chỉnh sửa mật khẩu"}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <input
                    type="text"
                    name="role"
                    value="Consultant"
                    disabled
                    readOnly
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                  <input type="hidden" name="role" value="consultant" />
                </div>

                {editingConsultantId && (
                  <div className="form-group">
                    <label className="form-label">Trạng thái *</label>
                    <select
                      name="status"
                      value={editConsultantData?.status ?? ''}
                      onChange={handleEditChange}
                      required
                      className="form-select"
                      style={{ color: '#000', backgroundColor: '#fff' }}
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="active">Hoạt Động</option>
                      <option value="inactive">Không Hoạt Động</option>
                      <option value="banned">Bị Cấm</option>
                    </select>
                  </div>
                )}

                {/* Profile Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin cá nhân</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={editingConsultantId ? editConsultantData?.name ?? '' : newConsultant.name}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    required
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editingConsultantId ? editConsultantData?.date_of_birth ?? '' : newConsultant.date_of_birth}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nghề nghiệp</label>
                  <input
                    type="text"
                    name="job"
                    value={editingConsultantId ? editConsultantData?.job ?? '' : newConsultant.job}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Học vấn</label>
                  <select
                    name="education"
                    value={editingConsultantId ? editConsultantData?.education ?? '' : newConsultant.education}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    className="form-select"
                    style={{ color: '#000', backgroundColor: '#fff' }}
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

                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Tiểu sử</label>
                  <textarea
                    name="bio"
                    value={editingConsultantId ? editConsultantData?.bio ?? '' : newConsultant.bio}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Nhập tiểu sử chi tiết của tư vấn viên..."
                    style={{ color: '#000', backgroundColor: '#fff', resize: 'vertical' }}
                  />
                </div>

                {/* Consultant Specific Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin tư vấn viên</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Chi phí (VND) *</label>
                  <input
                    type="number"
                    name="cost"
                    step="10"
                    min="100"
                    value={editingConsultantId ? editConsultantData?.cost ?? '' : newConsultant.cost}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    required
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chứng chỉ</label>
                  <input
                    type="text"
                    name="certification"
                    value={editingConsultantId ? editConsultantData?.certification ?? '' : newConsultant.certification}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Chuyên môn</label>
                  <input
                    type="text"
                    name="speciality"
                    value={editingConsultantId ? editConsultantData?.speciality ?? '' : newConsultant.speciality}
                    onChange={editingConsultantId ? handleEditChange : handleChange}
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                <button type="submit" className="form-button form-grid-col-span-2">
                  {editingConsultantId ? "Cập nhật" : "Tạo mới"}
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
                <div className="text-muted small">
                  <strong>Lưu ý:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Nếu tư vấn viên có phiên tư vấn đã đặt:
                      <ul>
                        <li>Các phiên tư vấn chưa hoàn thành sẽ được chuyển thành trạng thái "Đã hủy"</li>
                        <li>Các phiên tư vấn đã hoàn thành sẽ được giữ nguyên</li>
                        <li>Tài khoản tư vấn viên sẽ được chuyển thành "Không hoạt động"</li>
                      </ul>
                    </li>
                    <li>Nếu tư vấn viên không có phiên tư vấn nào: Tài khoản và tất cả dữ liệu sẽ được xóa hoàn toàn</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>Không</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Có</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slot Management Modal */}
      {showSlotModal && selectedConsultantForSlots && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Quản lý lịch làm việc - {selectedConsultantForSlots.name}
                </h5>
                <button type="button" className="btn btn-close" onClick={handleCloseSlotModal}>
                </button>
              </div>
              <div className="modal-body">
                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                    {message.text}
                  </div>
                )}

                {/* Current Consultant Slots Display */}
                <div className="mb-4">
                  <h6>Lịch làm việc hiện tại:</h6>
                  {consultantSlots.length > 0 ? (
                    <div className="current-slots-display">
                      {daysOfWeek.map(day => {
                        const daySlots = consultantSlots.filter(slot => slot.day_of_week === day);
                        return daySlots.length > 0 ? (
                          <div key={day} className="day-slots mb-2">
                            <strong>{dayLabels[day]}:</strong>
                            <div className="slots-list ms-2">
                              {daySlots.map((slot, index) => (
                                <span key={index} className="badge bg-primary me-1">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-muted">Chưa có lịch làm việc nào được thiết lập.</p>
                  )}
                </div>

                {/* Slot Selection by Day */}
                <div className="mb-4">
                  <h6>Thiết lập lịch làm việc theo ngày:</h6>
                  <div className="alert alert-info">
                    <small>Chọn các khung giờ làm việc cho từng ngày trong tuần. Bạn có thể chọn khung giờ khác nhau cho mỗi ngày.</small>
                  </div>

                  {daysOfWeek.map(day => (
                    <div key={day} className="day-section mb-4 p-3 border rounded">
                      <h6 className="day-header mb-3 text-primary">{dayLabels[day]}</h6>

                      {availableSlots.length > 0 ? (
                        <div className="row">
                          {availableSlots.map(slot => {
                            // Check if this slot is selected for this day
                            const isSelected = daySlotSelections[day]?.includes(slot.slot_id) || false;
                            return (
                              <div key={slot.slot_id} className="col-md-3 col-sm-4 col-6 mb-2">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`${day}-${slot.slot_id}`}
                                    checked={isSelected}
                                    onChange={() => handleSlotToggle(day, slot.slot_id)}
                                  />
                                  <label className="form-check-label" htmlFor={`${day}-${slot.slot_id}`}>
                                    {slot.start_time} - {slot.end_time}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted">Không có khung giờ nào. Vui lòng tạo khung giờ mới trước.</p>
                      )}

                      {/* Show selected slots for this day */}
                      {daySlotSelections[day] && daySlotSelections[day].length > 0 && (
                        <div className="selected-slots-preview mt-3">
                          <small className="text-muted">Đã chọn: </small>
                          {availableSlots
                            .filter(slot => daySlotSelections[day].includes(slot.slot_id))
                            .map(slot => (
                              <span key={slot.slot_id} className="badge bg-secondary me-1">
                                {slot.start_time}-{slot.end_time}
                              </span>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseSlotModal} disabled={loading}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={() => { handleSaveSlots() }} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Lưu lịch làm việc"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantListPage;
