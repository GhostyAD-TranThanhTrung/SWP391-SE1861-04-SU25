import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import "../../styles/CertificatePage.scss";
import { useNavigate } from "react-router-dom";
const CertificatePage = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && res.data.role === 'consultant')) navigate('/admin/login')
    } catch (err) {
      navigate('/admin/login')
    }

  }
  userRole()
  const [showEditModal, setShowEditModal] = useState(false);
  const [consultantProfile, setConsultantProfile] = useState({
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    google_meet_link: "",
    certification: "",
    speciality: "",
    job: "",
    availability_slots: [],
    consultant_slots_full: [], // Store full slot data with days
  });
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    google_meet_link: "",
    certification: "",
    speciality: "",
    job: "",
    availability_slots: [],
    consultant_slots_full: [], // Store full slot data with days
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [consultantId, setConsultantId] = useState(null);


  // Get consultant ID by email from token
  const getConsultantIdByEmail = async () => {
    try {
      const userEmail = localStorage.getItem('email2');

      if (!userEmail) {
        console.error("User email not found in session or token");
        setMessage({ text: "Không tìm thấy email người dùng", type: "error" });
        return null;
      }

      const res = await axios.get(`http://localhost:3000/api/consultants/email/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setConsultantId(res.data.data.consultant_id);
        return res.data.data.consultant_id;
      }
    } catch (err) {
      console.error("Lỗi khi lấy consultant ID:", err);
      setMessage({ text: "Không thể xác định consultant ID", type: "error" });
      return null;
    }
  };

  // Fetch consultant's existing slots from Consultant_Slot table (for display only)
  const fetchConsultantSlots = async (consultantId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/consultant-slots/consultant/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Return the full consultant slot data including days and times
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error("Lỗi khi lấy slots của consultant:", err);
      return [];
    }
  };

  const fetchConsultantProfile = async () => {
    try {
      setLoading(true);

      // Get consultant ID first
      const id = await getConsultantIdByEmail();
      if (!id) {
        setMessage({ text: "Không thể xác định consultant ID", type: "error" });
        return;
      }

      // Fetch consultant profile
      const res = await axios.get(`http://localhost:3000/api/consultants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const profile = res.data.data;
        const bio_json = profile.bio_json ? JSON.parse(profile.bio_json) : {};

        // Fetch consultant's existing slots
        const existingSlots = await fetchConsultantSlots(id);

        // Extract unique slot IDs and days from consultant's slots
        const slotIds = [...new Set(existingSlots.map(cs => cs.slot_id))];
        const assignedDays = [...new Set(existingSlots.map(cs => cs.day_of_week))];

        const profileData = {
          name: profile.name || "",
          bio: bio_json.bio || "",
          education: bio_json.education || "",
          date_of_birth: profile.date_of_birth?.slice(0, 10) || "",
          google_meet_link: profile.google_meet_link || "",
          certification: profile.certification || "",
          speciality: profile.speciality || "",
          job: profile.job || "",
          availability_slots: slotIds,
          consultant_slots_full: existingSlots, // Keep full data for display only
        };
        setConsultantProfile(profileData);
        setEditData(profileData);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin profile:", err);
      setMessage({ text: "Không thể tải thông tin profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultantProfile();
  }, []);

  const handleOpenEditModal = () => {
    // Ensure edit data is populated with current profile data
    setEditData({
      name: consultantProfile.name || "",
      bio: consultantProfile.bio || "",
      education: consultantProfile.education || "",
      date_of_birth: consultantProfile.date_of_birth || "",
      google_meet_link: consultantProfile.google_meet_link || "",
      certification: consultantProfile.certification || "",
      speciality: consultantProfile.speciality || "",
      job: consultantProfile.job || "",
      availability_slots: consultantProfile.availability_slots || [],
      consultant_slots_full: consultantProfile.consultant_slots_full || [],
    });
    setShowEditModal(true);
    setMessage({ text: "", type: "" });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditData(consultantProfile); // Reset to original data
    setMessage({ text: "", type: "" });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!consultantId) {
        setMessage({ text: "Consultant ID không hợp lệ", type: "error" });
        return;
      }

      const payload = {
        // Profile fields
        name: editData.name,
        bio_json: {
          bio: editData.bio,
          education: editData.education,
        },
        date_of_birth: editData.date_of_birth,
        job: editData.job,
        // Consultant fields
        google_meet_link: editData.google_meet_link || null,
        certification: editData.certification,
        speciality: editData.speciality,
      };

      // Update consultant profile
      const res = await axios.put(
        `http://localhost:3000/api/consultants/${consultantId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Refresh the entire consultant profile to get updated data
        await fetchConsultantProfile();

        setMessage({ text: "Cập nhật thông tin thành công!", type: "success" });
        setTimeout(() => {
          handleCloseEditModal();
        }, 2000);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật profile:", err);
      setMessage({ text: "Có lỗi xảy ra khi cập nhật thông tin", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultant-profile-container">
      <div className="profile-header d-flex justify-content-between align-items-center mb-4">
        <h2>Thông tin cá nhân</h2>
        <button className="btn btn-primary" onClick={handleOpenEditModal}>
          <FaEdit style={{ marginRight: "5px" }} /> Chỉnh sửa thông tin
        </button>
      </div>

      {loading && !showEditModal && (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="profile-card">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Tên:</label>
                  <p className="form-control-plaintext">{consultantProfile.name || "Chưa cập nhật"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Ngày sinh:</label>
                  <p className="form-control-plaintext">
                    {consultantProfile.date_of_birth
                      ? new Date(consultantProfile.date_of_birth).toLocaleDateString('vi-VN')
                      : "Chưa cập nhật"
                    }
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Google Meet Link:</label>
                  <p className="form-control-plaintext">
                    {consultantProfile.google_meet_link ? "Đã thiết lập" : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Công việc:</label>
                  <p className="form-control-plaintext">{consultantProfile.job || "Chưa cập nhật"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Chuyên môn:</label>
                  <p className="form-control-plaintext">{consultantProfile.speciality || "Chưa cập nhật"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Chứng chỉ:</label>
                  <p className="form-control-plaintext">{consultantProfile.certification || "Chưa cập nhật"}</p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Tiểu sử:</label>
                  <p className="form-control-plaintext" style={{ minHeight: "60px" }}>
                    {consultantProfile.bio || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Học vấn:</label>
                  <p className="form-control-plaintext" style={{ minHeight: "60px" }}>
                    {consultantProfile.education || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Khung giờ làm việc:</label>
                  <div className="availability-slots-display">
                    {consultantProfile.consultant_slots_full && consultantProfile.consultant_slots_full.length > 0 ? (
                      <div className="slots-by-day">
                        {/* Group slots by day and sort by day order */}
                        {(() => {
                          const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                          const groupedSlots = consultantProfile.consultant_slots_full.reduce((acc, cs) => {
                            const dayKey = cs.day_of_week;
                            if (!acc[dayKey]) acc[dayKey] = [];
                            acc[dayKey].push(cs);
                            return acc;
                          }, {});

                          // Sort slots within each day by start time
                          Object.keys(groupedSlots).forEach(day => {
                            groupedSlots[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
                          });

                          // Return sorted days
                          return dayOrder
                            .filter(day => groupedSlots[day])
                            .map(day => [day, groupedSlots[day]]);
                        })().map(([day, slots]) => (
                          <div key={day} className="day-slots mb-2">
                            <strong className="day-label">
                              {day === 'Monday' ? 'Thứ 2' :
                                day === 'Tuesday' ? 'Thứ 3' :
                                  day === 'Wednesday' ? 'Thứ 4' :
                                    day === 'Thursday' ? 'Thứ 5' :
                                      day === 'Friday' ? 'Thứ 6' :
                                        day === 'Saturday' ? 'Thứ 7' : 'Chủ nhật'}:
                            </strong>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                              {slots.map(cs => (
                                <span key={`${cs.slot_id}-${cs.day_of_week}`} className="badge bg-primary">
                                  {cs.start_time} - {cs.end_time}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">Chưa thiết lập khung giờ làm việc</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa thông tin cá nhân</h5>
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
