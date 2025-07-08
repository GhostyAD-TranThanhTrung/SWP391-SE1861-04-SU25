import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import "../../styles/CertificatePage.scss";

const CertificatePage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [consultantProfile, setConsultantProfile] = useState({
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    cost: "",
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
    cost: "",
    certification: "",
    speciality: "",
    job: "",
    availability_slots: [],
    consultant_slots_full: [], // Store full slot data with days
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [consultantId, setConsultantId] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showCustomScheduleModal, setShowCustomScheduleModal] = useState(false);
  const [showDaySpecificModal, setShowDaySpecificModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ start_time: "", end_time: "" });
  const [customSchedules, setCustomSchedules] = useState([
    { days: ['Monday'], start_time: '', end_time: '' }
  ]);
  const [daySpecificSlots, setDaySpecificSlots] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(['Monday']); // Default to Monday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const token = sessionStorage.getItem("token");

  // Get user email from token or session storage


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

  // Fetch all available slots
  const fetchAvailableSlots = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/slots", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAvailableSlots(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách slots:", err);
    }
  };

  // Fetch consultant's existing slots from Consultant_Slot table
  const fetchConsultantSlots = async (consultantId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/consultant-slots/${consultantId}`, {
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
          cost: profile.cost || "",
          certification: profile.certification || "",
          speciality: profile.speciality || "",
          job: profile.job || "",
          availability_slots: slotIds,
          consultant_slots_full: existingSlots, // Keep full data for display
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
    fetchAvailableSlots();
  }, []);

  const handleOpenEditModal = () => {
    // Extract current days from consultant's slots for editing
    const currentDays = consultantProfile.consultant_slots_full
      ? [...new Set(consultantProfile.consultant_slots_full.map(cs => cs.day_of_week))]
      : ['Monday'];

    setSelectedDaysOfWeek(currentDays);

    // Initialize day-specific slots
    initializeDaySpecificSlots(consultantProfile.consultant_slots_full);

    // Ensure edit data is populated with current profile data
    setEditData({
      name: consultantProfile.name || "",
      bio: consultantProfile.bio || "",
      education: consultantProfile.education || "",
      date_of_birth: consultantProfile.date_of_birth || "",
      cost: consultantProfile.cost || "",
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
        cost: parseFloat(editData.cost) || null,
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
        // Update consultant slots separately
        await updateConsultantSlots(consultantId, editData.availability_slots);

        // Refresh the entire consultant profile to get updated slot data
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

  // Update consultant slots in Consultant_Slot table
  const updateConsultantSlots = async (consultantId, selectedSlotIds) => {
    try {
      // First, delete existing consultant slots
      await axios.delete(`http://localhost:3000/api/consultant-slots/consultant/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Then, add new slots if any are selected
      if (selectedSlotIds.length > 0 && selectedDaysOfWeek.length > 0) {
        const slotsData = [];

        // Create combinations of slots and days
        selectedSlotIds.forEach(slotId => {
          selectedDaysOfWeek.forEach(day => {
            slotsData.push({
              slot_id: slotId,
              day_of_week: day
            });
          });
        });

        const response = await axios.post(`http://localhost:3000/api/consultant-slots/consultant/${consultantId}`, {
          slots: slotsData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          console.log("Consultant slots updated successfully:", response.data.data);
          return response.data.data;
        }
      }

      return null;
    } catch (err) {
      console.error("Lỗi khi cập nhật slots:", err);
      throw err;
    }
  };

  // Handle day selection
  const handleDayToggle = (day) => {
    setSelectedDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Handle slot selection
  const handleSlotToggle = (slotId) => {
    setEditData(prev => ({
      ...prev,
      availability_slots: prev.availability_slots.includes(slotId)
        ? prev.availability_slots.filter(id => id !== slotId)
        : [...prev.availability_slots, slotId]
    }));
  };

  // Create new slot
  const handleCreateSlot = async () => {
    try {
      if (!newSlot.start_time || !newSlot.end_time) {
        setMessage({ text: "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc", type: "error" });
        return;
      }

      if (newSlot.start_time >= newSlot.end_time) {
        setMessage({ text: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc", type: "error" });
        return;
      }

      const res = await axios.post("http://localhost:3000/api/slots", newSlot, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage({ text: "Tạo slot thành công!", type: "success" });
        setNewSlot({ start_time: "", end_time: "" });
        setShowSlotModal(false);
        await fetchAvailableSlots(); // Refresh slots list

        // Clear any previous messages after successful creation
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      }
    } catch (err) {
      console.error("Lỗi khi tạo slot:", err);
      setMessage({ text: "Có lỗi xảy ra khi tạo slot", type: "error" });
    }
  };

  // Handle custom schedule changes
  const handleCustomScheduleChange = (index, field, value) => {
    setCustomSchedules(prev => {
      const updated = [...prev];
      if (field === 'days') {
        // Toggle day selection
        const currentDays = updated[index].days;
        if (currentDays.includes(value)) {
          updated[index].days = currentDays.filter(day => day !== value);
        } else {
          updated[index].days = [...currentDays, value];
        }
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  // Add new custom schedule
  const addCustomSchedule = () => {
    setCustomSchedules(prev => [
      ...prev,
      { days: ['Monday'], start_time: '', end_time: '' }
    ]);
  };

  // Remove custom schedule
  const removeCustomSchedule = (index) => {
    setCustomSchedules(prev => prev.filter((_, i) => i !== index));
  };

  // Create custom consultant schedule
  const handleCreateCustomSchedule = async () => {
    try {
      setLoading(true);

      // Validate schedules
      const validSchedules = customSchedules.filter(schedule =>
        schedule.days.length > 0 && schedule.start_time && schedule.end_time
      );

      if (validSchedules.length === 0) {
        setMessage({ text: "Vui lòng nhập ít nhất một lịch làm việc hợp lệ", type: "error" });
        return;
      }

      // Check for valid time ranges
      const invalidSchedules = validSchedules.filter(schedule =>
        schedule.start_time >= schedule.end_time
      );

      if (invalidSchedules.length > 0) {
        setMessage({ text: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc", type: "error" });
        return;
      }

      const res = await axios.put(
        `http://localhost:3000/api/consultant-slots/consultant/${consultantId}/schedule`,
        { schedules: validSchedules },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage({ text: "Tạo lịch làm việc thành công!", type: "success" });
        setShowCustomScheduleModal(false);
        setCustomSchedules([{ days: ['Monday'], start_time: '', end_time: '' }]);
        await fetchConsultantProfile(); // Refresh the profile to show new slots

        // Clear message after successful creation
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      }
    } catch (err) {
      console.error("Lỗi khi tạo lịch làm việc:", err);
      setMessage({ text: "Có lỗi xảy ra khi tạo lịch làm việc", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle day-specific slot selection
  const handleDaySpecificSlotToggle = (day, slotId) => {
    setDaySpecificSlots(prev => {
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

  // Initialize day-specific slots from consultant's existing slots
  const initializeDaySpecificSlots = (consultantSlotsData) => {
    const daySlots = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    if (consultantSlotsData && consultantSlotsData.length > 0) {
      consultantSlotsData.forEach(cs => {
        if (daySlots[cs.day_of_week]) {
          daySlots[cs.day_of_week].push(cs.slot_id);
        }
      });
    }

    setDaySpecificSlots(daySlots);
  };

  // Update consultant slots using day-specific selections
  const updateDaySpecificConsultantSlots = async (consultantId) => {
    try {
      // First, delete all existing consultant slots
      await axios.delete(`http://localhost:3000/api/consultant-slots/consultant/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create new slots based on day-specific selections
      const slotsToCreate = [];
      Object.keys(daySpecificSlots).forEach(day => {
        daySpecificSlots[day].forEach(slotId => {
          slotsToCreate.push({
            slot_id: slotId,
            day_of_week: day
          });
        });
      });

      if (slotsToCreate.length > 0) {
        const response = await axios.post(`http://localhost:3000/api/consultant-slots/consultant/${consultantId}`, {
          slots: slotsToCreate
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          console.log("Day-specific consultant slots updated successfully:", response.data.data);
          return response.data.data;
        }
      }

      return null;
    } catch (err) {
      console.error("Lỗi khi cập nhật day-specific slots:", err);
      throw err;
    }
  };

  // Handle day-specific schedule update
  const handleUpdateDaySpecificSchedule = async () => {
    try {
      setLoading(true);

      if (!consultantId) {
        setMessage({ text: "Consultant ID không hợp lệ", type: "error" });
        return;
      }

      // Check if at least one slot is selected
      const hasAnySlots = Object.values(daySpecificSlots).some(daySlots => daySlots.length > 0);
      if (!hasAnySlots) {
        setMessage({ text: "Vui lòng chọn ít nhất một khung giờ cho một ngày", type: "error" });
        return;
      }

      await updateDaySpecificConsultantSlots(consultantId);
      await fetchConsultantProfile(); // Refresh the profile
      alert("Cập nhật lịch làm việc theo ngày thành công!")
      setMessage({ text: "Cập nhật lịch làm việc theo ngày thành công!", type: "success" });
      setTimeout(() => {
        setShowDaySpecificModal(false);
        setMessage({ text: "", type: "" });
      }, 2000);

    } catch (err) {
      console.error("Lỗi khi cập nhật lịch theo ngày:", err);
      setMessage({ text: "Có lỗi xảy ra khi cập nhật lịch làm việc", type: "error" });
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
                  <label className="form-label fw-bold">Chi phí (VNĐ):</label>
                  <p className="form-control-plaintext">
                    {consultantProfile.cost ? `${Number(consultantProfile.cost).toLocaleString('vi-VN')} VNĐ` : "Chưa cập nhật"}
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
                      <label htmlFor="cost" className="form-label">Chi phí (VNĐ)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="cost"
                        name="cost"
                        value={editData.cost}
                        onChange={handleEditChange}
                        placeholder="Nhập chi phí tư vấn"
                        min="0"
                        step="1000"
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
                    <div className="col-12 mb-3">
                      <label className="form-label">Khung giờ làm việc</label>
                      <div className="slots-selection">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">Quản lý lịch làm việc của bạn</small>
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info me-2"
                              onClick={() => setShowDaySpecificModal(true)}
                            >
                              Tạo lịch tư vấn theo ca
                            </button>
                          </div>
                        </div>

                      </div>
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

      {/* Slot Creation Modal */}
      {showSlotModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo khung giờ mới</h5>
                <button type="button" className="btn-close" onClick={() => setShowSlotModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {message.text}
                  </div>
                )}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="start_time" className="form-label">Thời gian bắt đầu *</label>
                    <input
                      type="time"
                      className="form-control"
                      id="start_time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="end_time" className="form-label">Thời gian kết thúc *</label>
                    <input
                      type="time"
                      className="form-control"
                      id="end_time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="alert alert-info">
                  <small>
                    <strong>Lưu ý:</strong> Khung giờ mới sẽ được tạo và có thể sử dụng cho tất cả tư vấn viên.
                    Vui lòng đảm bảo thời gian bắt đầu nhỏ hơn thời gian kết thúc.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSlotModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateSlot}>
                  Tạo khung giờ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Schedule Modal */}
      {showCustomScheduleModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo lịch làm việc tùy chỉnh</h5>
                <button type="button" className="btn-close" onClick={() => setShowCustomScheduleModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {message.text}
                  </div>
                )}
                <div className="custom-schedule-container">
                  {customSchedules.map((schedule, index) => (
                    <div key={index} className="custom-schedule mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="m-0">Lịch làm việc {index + 1}</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeCustomSchedule(index)}
                        >
                          <MdCancel /> Xóa lịch
                        </button>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">Ngày trong tuần:</label>
                          <div className="days-selection d-flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                              <div key={day} className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`custom-day-${index}-${day}`}
                                  checked={schedule.days.includes(day)}
                                  onChange={() => handleCustomScheduleChange(index, 'days', day)}
                                />
                                <label className="form-check-label" htmlFor={`custom-day-${index}-${day}`}>
                                  {day === 'Monday' ? 'Thứ 2' :
                                    day === 'Tuesday' ? 'Thứ 3' :
                                      day === 'Wednesday' ? 'Thứ 4' :
                                        day === 'Thursday' ? 'Thứ 5' :
                                          day === 'Friday' ? 'Thứ 6' :
                                            day === 'Saturday' ? 'Thứ 7' : 'Chủ nhật'}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor={`custom-start-time-${index}`} className="form-label">Thời gian bắt đầu *</label>
                          <input
                            type="time"
                            className="form-control"
                            id={`custom-start-time-${index}`}
                            value={schedule.start_time}
                            onChange={(e) => handleCustomScheduleChange(index, 'start_time', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor={`custom-end-time-${index}`} className="form-label">Thời gian kết thúc *</label>
                          <input
                            type="time"
                            className="form-control"
                            id={`custom-end-time-${index}`}
                            value={schedule.end_time}
                            onChange={(e) => handleCustomScheduleChange(index, 'end_time', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addCustomSchedule}
                    >
                      + Thêm lịch làm việc khác
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCustomScheduleModal(false)} disabled={loading}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateCustomSchedule} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo lịch làm việc"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day-Specific Schedule Modal */}
      {showDaySpecificModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Quản lý lịch làm việc theo từng ngày</h5>
                <button type="button" className="btn-close" onClick={() => { setShowDaySpecificModal(false); }} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {message.text}
                  </div>
                )}

                <div className="alert alert-info">
                  <strong>Hướng dẫn:</strong> Chọn các khung giờ làm việc cho từng ngày trong tuần.
                  Bạn có thể chọn khung giờ khác nhau cho mỗi ngày.
                </div>

                <div className="day-specific-schedule">
                  {daysOfWeek.map(day => (
                    <div key={day} className="day-schedule-section mb-4 p-3 border rounded">
                      <h6 className="day-title mb-3">
                        {day === 'Monday' ? 'Thứ 2' :
                          day === 'Tuesday' ? 'Thứ 3' :
                            day === 'Wednesday' ? 'Thứ 4' :
                              day === 'Thursday' ? 'Thứ 5' :
                                day === 'Friday' ? 'Thứ 6' :
                                  day === 'Saturday' ? 'Thứ 7' : 'Chủ nhật'}
                      </h6>

                      <div className="slots-grid-day">
                        {availableSlots.length > 0 ? (
                          <div className="row">
                            {availableSlots.map(slot => (
                              <div key={slot.slot_id} className="col-md-3 col-sm-6 mb-2">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`day-specific-${day}-${slot.slot_id}`}
                                    checked={daySpecificSlots[day]?.includes(slot.slot_id) || false}
                                    onChange={() => handleDaySpecificSlotToggle(day, slot.slot_id)}
                                  />
                                  <label className="form-check-label" htmlFor={`day-specific-${day}-${slot.slot_id}`}>
                                    {slot.start_time} - {slot.end_time}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">Không có khung giờ nào. Vui lòng tạo khung giờ mới trước.</p>
                        )}
                      </div>

                      {daySpecificSlots[day]?.length > 0 && (
                        <div className="selected-slots-preview mt-2">
                          <small className="text-muted">Đã chọn: </small>
                          {availableSlots
                            .filter(slot => daySpecificSlots[day]?.includes(slot.slot_id))
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowDaySpecificModal(false)} disabled={loading}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={() => { handleUpdateDaySpecificSchedule(); setShowDaySpecificModal(false); handleCloseEditModal() }} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật lịch làm việc"
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

export default CertificatePage;
