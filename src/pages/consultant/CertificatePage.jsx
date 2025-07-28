import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaUser, FaClock, FaCertificate } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import "../../styles/CertificatePage.scss";
import { useNavigate } from "react-router-dom";

const CertificatePage = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // Authentication and role check
  const checkUserRole = async () => {
    try {
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const res = await axios.get('http://localhost:3000/api/user/role/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!(res.data.role && res.data.role === 'consultant')) {
        navigate('/admin/login');
      }
    } catch (err) {
      console.error("Role check failed:", err);
      navigate('/admin/login');
    }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  // UI State Management
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'consultant', 'schedule'
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // User Data (authentication info from user table)
  const [userData, setUserData] = useState({
    user_id: null,
    email: "",
    role: "",
    created_at: "",
    updated_at: "",
  });

  // Profile Data (personal information from profile table)
  const [profileData, setProfileData] = useState({
    profile_id: null,
    user_id: null,
    name: "",
    date_of_birth: "",
    bio: "",
    education: "",
    job: "",
    created_at: "",
    updated_at: "",
  });

  // Consultant Data (professional information from consultant table)
  const [consultantData, setConsultantData] = useState({
    consultant_id: null,
    user_id: null,
    google_meet_link: "",
    certification: "",
    speciality: "",
    status: "",
    created_at: "",
    updated_at: "",
  });

  // Schedule Data (working slots from consultant_slot table)
  const [scheduleData, setScheduleData] = useState({
    consultant_slots: [], // Array of {slot_id, consultant_id, day_of_week, start_time, end_time}
    total_slots: 0,
    working_days: 0,
    unique_slots: 0,
  });

  // Edit Form Data (only editable fields)
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    google_meet_link: "",
    certification: "",
    speciality: "",
    job: "",
  });


  // Get consultant ID by email from token
  const getConsultantIdByEmail = async () => {
    try {
      const userEmail = sessionStorage.getItem('email2');

      if (!userEmail) {
        console.error("User email not found in session or token");
        setMessage({ text: "Không tìm thấy email người dùng", type: "error" });
        return null;
      }

      const res = await axios.get(`http://localhost:3000/api/consultants/email/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        return res.data.data.consultant_id;
      }
    } catch (err) {
      console.error("Lỗi khi lấy consultant ID:", err);
      setMessage({ text: "Không thể xác định consultant ID", type: "error" });
      return null;
    }
  };

  // Fetch User Data (from user table via auth endpoint)
  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      // Fixed: Use correct endpoint - port 3000 instead of 3001, and correct path
      const response = await axios.get("http://localhost:3000/api/user/profile-combined", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("User data response:", response.data);
      const user = response.data.data; // Note: API returns data in .data property

      setUserData({
        user_id: user.user_id || null,
        email: user.email || "",
        role: user.role || "",
        created_at: user.created_at || "",
        updated_at: user.updated_at || "",
      });

      return user;
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin-login");
      }
      return null;
    }
  };

  // Fetch Profile Data (personal information from profile table)
  const fetchProfileData = async (consultantId) => {
    try {
      console.log("Fetching profile data for consultant ID:", consultantId);

      const res = await axios.get(`http://localhost:3000/api/consultants/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Profile data response:", res.data);

      if (res.data.success) {
        const profile = res.data.data;
        const bio_json = profile.bio_json ? JSON.parse(profile.bio_json) : {};

        setProfileData({
          profile_id: profile.profile_id || null,
          user_id: profile.user_id || null,
          name: profile.name || "",
          date_of_birth: profile.date_of_birth?.slice(0, 10) || "",
          bio: bio_json.bio || "",
          education: bio_json.education || "",
          job: profile.job || "",
          created_at: profile.created_at || "",
          updated_at: profile.updated_at || "",
        });

        return profile;
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setMessage({ text: "Không thể tải thông tin profile", type: "error" });
      return null;
    }
  };

  // Fetch Consultant Data (professional information from consultant table)
  const fetchConsultantData = async (consultantId) => {
    try {
      console.log("Fetching consultant data for ID:", consultantId);

      const res = await axios.get(`http://localhost:3000/api/consultants/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Consultant data response:", res.data);

      if (res.data.success) {
        const consultant = res.data.data;

        setConsultantData({
          consultant_id: consultant.consultant_id || consultantId,
          user_id: consultant.user_id || null,
          google_meet_link: consultant.google_meet_link || "",
          certification: consultant.certification || "",
          speciality: consultant.speciality || "",
          status: consultant.status || "",
          created_at: consultant.created_at || "",
          updated_at: consultant.updated_at || "",
        });

        return consultant;
      }
    } catch (err) {
      console.error("Error fetching consultant data:", err);
      setMessage({ text: "Không thể tải thông tin consultant", type: "error" });
      return null;
    }
  };

  // Fetch Schedule Data (consultant slots from consultant_slot table)
  const fetchScheduleData = async (consultantId) => {
    try {
      console.log("Fetching schedule data for consultant ID:", consultantId);

      const res = await axios.get(`http://localhost:3000/api/consultant-slots/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Schedule data response:", res.data);

      if (res.data.success && res.data.data) {
        const slots = res.data.data;
        console.log("Raw slots data:", slots);

        // Process slots - API already returns the correct structure
        const processedSlots = slots.map(slot => ({
          slot_id: slot.slot_id,
          consultant_id: slot.consultant_id || consultantId,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          created_at: slot.created_at,
          updated_at: slot.updated_at
        }));

        // Calculate statistics
        const uniqueDays = [...new Set(processedSlots.map(slot => slot.day_of_week))];
        const uniqueSlotIds = [...new Set(processedSlots.map(slot => slot.slot_id))];

        setScheduleData({
          consultant_slots: processedSlots,
          total_slots: processedSlots.length,
          working_days: uniqueDays.length,
          unique_slots: uniqueSlotIds.length,
        });

        console.log("Processed schedule data:", {
          slots: processedSlots,
          stats: {
            total: processedSlots.length,
            days: uniqueDays.length,
            unique: uniqueSlotIds.length
          }
        });

        return processedSlots;
      } else {
        console.log("No schedule data found");
        setScheduleData({
          consultant_slots: [],
          total_slots: 0,
          working_days: 0,
          unique_slots: 0,
        });
        return [];
      }
    } catch (err) {
      console.error("Error fetching schedule data:", err);
      setMessage({
        text: "Không thể tải khung giờ làm việc. Vui lòng thử lại.",
        type: "error"
      });
      return [];
    }
  };

  // Main data fetching function
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      // 1. Fetch user data first
      const user = await fetchUserData();
      if (!user) return;

      // 2. Get consultant ID
      const consultantId = await getConsultantIdByEmail();
      if (!consultantId) {
        setMessage({ text: "Không thể xác định consultant ID", type: "error" });
        return;
      }

      // 3. Fetch profile, consultant, and schedule data in parallel
      const [profile, consultant, schedule] = await Promise.all([
        fetchProfileData(consultantId),
        fetchConsultantData(consultantId),
        fetchScheduleData(consultantId)
      ]);

      if (profile && consultant) {
        console.log("All data fetched successfully");
      }

    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setMessage({ text: "Có lỗi xảy ra khi tải dữ liệu", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Refresh only schedule data
  const refreshSchedule = async () => {
    if (!consultantData.consultant_id) return;

    try {
      setLoading(true);
      console.log("Refreshing schedule data...");
      await fetchScheduleData(consultantData.consultant_id);
      setMessage({ text: "Đã làm mới lịch làm việc", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    } catch (err) {
      console.error("Error refreshing schedule:", err);
      setMessage({ text: "Không thể làm mới lịch làm việc", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Modal handlers
  const handleOpenEditModal = () => {
    setEditData({
      name: profileData.name,
      bio: profileData.bio,
      education: profileData.education,
      date_of_birth: profileData.date_of_birth,
      google_meet_link: consultantData.google_meet_link,
      certification: consultantData.certification,
      speciality: consultantData.speciality,
      job: profileData.job,
    });
    setShowEditModal(true);
    setMessage({ text: "", type: "" });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setMessage({ text: "", type: "" });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Update profile and consultant data
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!consultantData.consultant_id) {
        setMessage({ text: "Consultant ID không hợp lệ", type: "error" });
        return;
      }

      const payload = {
        name: editData.name,
        bio_json: {
          bio: editData.bio,
          education: editData.education,
        },
        date_of_birth: editData.date_of_birth,
        job: editData.job,
        google_meet_link: editData.google_meet_link || null,
        certification: editData.certification,
        speciality: editData.speciality,
      };

      const res = await axios.put(
        `http://localhost:3000/api/consultants/${consultantData.consultant_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Update local state with new data
        setProfileData(prev => ({
          ...prev,
          name: editData.name,
          bio: editData.bio,
          education: editData.education,
          date_of_birth: editData.date_of_birth,
          job: editData.job,
        }));

        setConsultantData(prev => ({
          ...prev,
          google_meet_link: editData.google_meet_link,
          certification: editData.certification,
          speciality: editData.speciality,
        }));

        setMessage({ text: "Cập nhật thông tin thành công!", type: "success" });
        setTimeout(() => {
          handleCloseEditModal();
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ text: "Có lỗi xảy ra khi cập nhật thông tin", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Tab content renderers
  const renderProfileTab = () => (
    <div className="profile-content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title d-flex align-items-center">
            <FaUser className="me-2" />
            Thông tin cá nhân
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Tên:</label>
              <p className="form-control-plaintext">{profileData.name || "Chưa cập nhật"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ngày sinh:</label>
              <p className="form-control-plaintext">
                {profileData.date_of_birth
                  ? new Date(profileData.date_of_birth).toLocaleDateString('vi-VN')
                  : "Chưa cập nhật"
                }
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Công việc:</label>
              <p className="form-control-plaintext">{profileData.job || "Chưa cập nhật"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Email:</label>
              <p className="form-control-plaintext">{userData.email || "Chưa cập nhật"}</p>
            </div>
            <div className="col-12 mb-3">
              <label className="form-label fw-bold">Tiểu sử:</label>
              <p className="form-control-plaintext" style={{ minHeight: "60px" }}>
                {profileData.bio || "Chưa cập nhật"}
              </p>
            </div>
            <div className="col-12 mb-3">
              <label className="form-label fw-bold">Học vấn:</label>
              <p className="form-control-plaintext" style={{ minHeight: "60px" }}>
                {profileData.education || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConsultantTab = () => (
    <div className="consultant-content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title d-flex align-items-center">
            <FaCertificate className="me-2" />
            Thông tin chuyên môn
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Chuyên môn:</label>
              <p className="form-control-plaintext">{consultantData.speciality || "Chưa cập nhật"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Chứng chỉ:</label>
              <p className="form-control-plaintext">{consultantData.certification || "Chưa cập nhật"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Google Meet Link:</label>
              <p className="form-control-plaintext">
                {consultantData.google_meet_link ? "Đã thiết lập" : "Chưa cập nhật"}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Trạng thái:</label>
              <p className="form-control-plaintext">
                <span className={`badge ${consultantData.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                  {consultantData.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Consultant ID:</label>
              <p className="form-control-plaintext">{consultantData.consultant_id || "Không có"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">User ID:</label>
              <p className="form-control-plaintext">{consultantData.user_id || userData.user_id || "Không có"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ngày tạo tài khoản:</label>
              <p className="form-control-plaintext">
                {consultantData.created_at
                  ? new Date(consultantData.created_at).toLocaleDateString('vi-VN')
                  : "Không có thông tin"
                }
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Cập nhật lần cuối:</label>
              <p className="form-control-plaintext">
                {consultantData.updated_at
                  ? new Date(consultantData.updated_at).toLocaleDateString('vi-VN')
                  : "Không có thông tin"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="schedule-content">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title d-flex align-items-center mb-0">
            <FaClock className="me-2" />
            Lịch làm việc
          </h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={refreshSchedule}
            disabled={loading}
            title="Làm mới lịch làm việc"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              "🔄 Làm mới"
            )}
          </button>
        </div>
        <div className="card-body">
          {scheduleData.consultant_slots && scheduleData.consultant_slots.length > 0 ? (
            <div>
              {/* Summary Statistics */}
              <div className="row mb-4">
                <div className="col-md-4 text-center">
                  <div className="stat-card p-3 border rounded">
                    <h4 className="text-primary">{scheduleData.working_days}</h4>
                    <small className="text-muted">Ngày làm việc</small>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="stat-card p-3 border rounded">
                    <h4 className="text-info">{scheduleData.total_slots}</h4>
                    <small className="text-muted">Tổng khung giờ</small>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="stat-card p-3 border rounded">
                    <h4 className="text-warning">{scheduleData.unique_slots}</h4>
                    <small className="text-muted">Khung giờ duy nhất</small>
                  </div>
                </div>
              </div>

              {/* Detailed Schedule */}
              <div className="schedule-details">
                {(() => {
                  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  const dayLabels = {
                    'Monday': 'Thứ 2',
                    'Tuesday': 'Thứ 3',
                    'Wednesday': 'Thứ 4',
                    'Thursday': 'Thứ 5',
                    'Friday': 'Thứ 6',
                    'Saturday': 'Thứ 7',
                    'Sunday': 'Chủ nhật'
                  };

                  return dayOrder.map(day => {
                    const daySlots = scheduleData.consultant_slots.filter(slot => slot.day_of_week === day);

                    return daySlots.length > 0 ? (
                      <div key={day} className="day-schedule mb-3 p-3 border rounded">
                        <div className="d-flex align-items-center mb-2">
                          <strong className="day-label text-primary">{dayLabels[day]}:</strong>
                          <span className="badge bg-info ms-2">{daySlots.length} khung giờ</span>
                        </div>
                        <div className="time-slots">
                          <div className="row">
                            {daySlots
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map((slot, index) => (
                                <div key={`${slot.slot_id}-${slot.day_of_week}-${index}`} className="col-auto mb-2">
                                  <span className="badge bg-primary p-2">
                                    <i className="bi bi-clock me-1"></i>
                                    {slot.start_time} - {slot.end_time}
                                    <small className="ms-1">(ID: {slot.slot_id})</small>
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  });
                })()}
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <span className="me-2">ℹ️</span>
                <div>
                  <strong>Chưa thiết lập lịch làm việc</strong>
                  <br />
                  <small>Vui lòng liên hệ quản trị viên để thiết lập lịch làm việc.</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="consultant-profile-container">
      {/* Header */}
      <div className="profile-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Hồ sơ Consultant</h2>
          <small className="text-muted">Quản lý thông tin cá nhân và chuyên môn</small>
        </div>
        <button className="btn btn-primary" onClick={handleOpenEditModal}>
          <FaEdit style={{ marginRight: "5px" }} />
          Chỉnh sửa thông tin
        </button>
      </div>

      {/* Loading State */}
      {loading && !showEditModal && (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
          {message.text}
        </div>
      )}

      {/* Navigation Tabs */}
      {!loading && (
        <div className="profile-tabs mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="me-2" />
                Thông tin cá nhân
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'consultant' ? 'active' : ''}`}
                onClick={() => setActiveTab('consultant')}
              >
                <FaCertificate className="me-2" />
                Thông tin Consultant
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <FaClock className="me-2" />
                Lịch làm việc
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <div className="tab-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'consultant' && renderConsultantTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa thông tin</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal} aria-label="Close"></button>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <div className="modal-body">
                  {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Tên *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        required
                        placeholder="Nhập tên của bạn"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="date_of_birth" className="form-label">Ngày sinh</label>
                      <input
                        type="date"
                        className="form-control"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={editData.date_of_birth}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="job" className="form-label">Công việc</label>
                      <input
                        type="text"
                        className="form-control"
                        id="job"
                        name="job"
                        value={editData.job}
                        onChange={handleEditChange}
                        placeholder="Chức danh công việc hiện tại"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="google_meet_link" className="form-label">Google Meet Link</label>
                      <input
                        type="text"
                        className="form-control"
                        id="google_meet_link"
                        name="google_meet_link"
                        value={editData.google_meet_link}
                        onChange={handleEditChange}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="speciality" className="form-label">Chuyên môn</label>
                      <input
                        type="text"
                        className="form-control"
                        id="speciality"
                        name="speciality"
                        value={editData.speciality}
                        onChange={handleEditChange}
                        placeholder="Lĩnh vực chuyên môn"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="certification" className="form-label">Chứng chỉ</label>
                      <input
                        type="text"
                        className="form-control"
                        id="certification"
                        name="certification"
                        value={editData.certification}
                        onChange={handleEditChange}
                        placeholder="Các chứng chỉ, bằng cấp chuyên môn"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="bio" className="form-label">Tiểu sử</label>
                      <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        rows="4"
                        value={editData.bio}
                        onChange={handleEditChange}
                        placeholder="Mô tả về bản thân, kinh nghiệm làm việc..."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="education" className="form-label">Học vấn</label>
                      <textarea
                        className="form-control"
                        id="education"
                        name="education"
                        rows="3"
                        value={editData.education}
                        onChange={handleEditChange}
                        placeholder="Thông tin về trình độ học vấn, bằng cấp..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <FaSave style={{ marginRight: "5px" }} />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
