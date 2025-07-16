import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaEye, FaTrash, FaWrench, FaUser } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ManageBookingPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ManageBookingPage = () => {
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showMemberDetailPopup, setShowMemberDetailPopup] = useState(false);
  const [originalBookingSessions, setOriginalBookingSessions] = useState([]);
  const [bookingSessions, setBookingSessions] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [slots, setSlots] = useState([]);
  const [editFormData, setEditFormData] = useState({
    consultant_id: '',
    slot_id: '',
    booking_date: '',
    status: '',
    notes: '',
    google_meet_link: ''
  });
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
  const statusOptions = ['Hoàn thành', 'Lên lịch', 'Đã hủy', 'Đang chờ xác nhận', 'Xác nhận thành công'];

  // Function to check and auto-cancel expired bookings
  const checkAndCancelExpiredBookings = async (bookings) => {
    const now = new Date();
    const expiredBookings = [];

    bookings.forEach(booking => {
      // Skip if already completed, cancelled, or pending confirmation
      if (booking.status === 'Hoàn thành' || booking.status === 'Đã hủy' || booking.status === 'Đang chờ xác nhận') {
        return;
      }

      // Create a Date object from booking_date and end_time
      const bookingDate = new Date(booking.booking_date);
      const [endHour, endMinute] = booking.end_time.split(':').map(Number);
      
      // Set the end time on the booking date
      const bookingEndTime = new Date(bookingDate);
      bookingEndTime.setHours(endHour, endMinute, 0, 0);

      // Check if the booking has passed its end time
      if (now > bookingEndTime) {
        expiredBookings.push(booking);
      }
    });

    // Auto-cancel expired bookings
    if (expiredBookings.length > 0) {
      console.log(`Found ${expiredBookings.length} expired bookings to cancel:`, expiredBookings);
      
      for (const expiredBooking of expiredBookings) {
        try {
          const updateData = {
            consultant_id: expiredBooking.consultant_id,
            slot_id: expiredBooking.slot_id,
            booking_date: expiredBooking.booking_date,
            status: 'Đã hủy',
            notes: expiredBooking.notes ? 
              `${expiredBooking.notes} | Tự động hủy do quá thời gian` : 
              'Tự động hủy do quá thời gian',
            google_meet_link: expiredBooking.google_meet_link || ''
          };

          await axios.put(
            `http://localhost:3000/api/booking-sessions/${expiredBooking.booking_id}`,
            updateData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log(`Auto-cancelled booking ${expiredBooking.booking_id}`);
        } catch (err) {
          console.error(`Failed to auto-cancel booking ${expiredBooking.booking_id}:`, err);
        }
      }

      // Refresh the booking list to show updated statuses
      return true; // Indicates that some bookings were cancelled
    }

    return false; // No bookings were cancelled
  };

  const handleCloseViewPopup = () => setShowViewPopup(false);
  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setEditFormData({ consultant_id: '', slot_id: '', booking_date: '', status: '', notes: '', google_meet_link: '' });
  };
  const handleCloseMemberDetailPopup = () => {
    setShowMemberDetailPopup(false);
    setSelectedMemberDetail(null);
  };

  const fetchBookingSessions = async () => {
    try {
      // Get consultant ID from email
      const email = localStorage.getItem('email2');
      if (!email) {
        console.error("No email found in localStorage");
        return;
      }

      // Get consultant ID by email
      const consultantResponse = await axios.get(`http://localhost:3000/api/consultants/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!consultantResponse.data.success) {
        console.error("Failed to get consultant ID");
        return;
      }

      const consultantId = consultantResponse.data.data.consultant_id;
      console.log(consultantId);
      
      // Get booking sessions for this consultant
      const res = await axios.get(`http://localhost:3000/api/booking-sessions/consultant/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        console.log('Raw booking data:', res.data.data);

        // Remove duplicates based on booking_id
        const uniqueBookings = res.data.data.filter((booking, index, self) =>
          index === self.findIndex(b => b.booking_id === booking.booking_id)
        );

        console.log('Unique bookings after filtering:', uniqueBookings);
        console.log('Original count:', res.data.data.length, 'Unique count:', uniqueBookings.length);

        // Check and auto-cancel expired bookings
        const hadCancellations = await checkAndCancelExpiredBookings(uniqueBookings);
        
        // If we had cancellations, fetch the updated data
        if (hadCancellations) {
          console.log('Refetching booking data after auto-cancellations...');
          const updatedRes = await axios.get(`http://localhost:3000/api/booking-sessions/consultant/${consultantId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (updatedRes.data.success) {
            const updatedUniqueBookings = updatedRes.data.data.filter((booking, index, self) =>
              index === self.findIndex(b => b.booking_id === booking.booking_id)
            );
            setOriginalBookingSessions(updatedUniqueBookings);
            setBookingSessions(updatedUniqueBookings);
          }
        } else {
          setOriginalBookingSessions(uniqueBookings);
          setBookingSessions(uniqueBookings);
        }
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  const fetchConsultants = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/consultants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setConsultants(res.data.data.consultants);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API consultants:", err);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API slots:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === '') {
      // Reset to original data instead of making another API call
      setBookingSessions(originalBookingSessions);
      return;
    }
    // Filter bookings locally by member name or status
    const filtered = originalBookingSessions.filter(booking =>
      booking.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setBookingSessions(filtered);
  };

  const fetchMemberDetail = async (memberId) => {
    try {
      console.log('=== MEMBER DETAIL API CALL START ===');
      console.log('Member ID:', memberId);
      console.log('API URL:', `http://localhost:3000/api/members/detailed/${memberId}`);
      console.log('Token exists:', !!token);

      const res = await axios.get(`http://localhost:3000/api/members/detailed/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response Status:', res.status);
      console.log('API Response Data:', res.data);

      if (res.data.success) {
        console.log('Member detail data received:', res.data.data);
        setSelectedMemberDetail(res.data.data);
        setShowMemberDetailPopup(true);
        console.log('Member detail popup opened successfully');
      } else {
        console.error("Failed to fetch member details:", res.data.message);
        console.log('API returned success: false');
        alert("Không thể tải thông tin chi tiết thành viên");
      }
      console.log('=== MEMBER DETAIL API CALL END ===');
    } catch (err) {
      console.error("=== MEMBER DETAIL API ERROR ===");
      console.error("Error details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);
      alert("Có lỗi xảy ra khi tải thông tin thành viên");
    }
  };

  const handleViewMemberDetail = (booking) => {
    if (booking.member_id) {
      fetchMemberDetail(booking.member_id);
    } else {
      alert("Không tìm thấy ID thành viên");
    }
  };

  useEffect(() => {
    fetchBookingSessions();
    fetchConsultants();
    fetchSlots();

    // Set up periodic check for expired bookings every 5 minutes
    const intervalId = setInterval(async () => {
      console.log('Running periodic check for expired bookings...');
      if (originalBookingSessions.length > 0) {
        const hadCancellations = await checkAndCancelExpiredBookings(originalBookingSessions);
        if (hadCancellations) {
          console.log('Found expired bookings, refreshing data...');
          fetchBookingSessions();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run only once

  // Additional useEffect to monitor changes in booking sessions for expired bookings
  useEffect(() => {
    if (originalBookingSessions.length > 0) {
      checkAndCancelExpiredBookings(originalBookingSessions).then(hadCancellations => {
        if (hadCancellations) {
          // Small delay before refetching to ensure database updates are complete
          setTimeout(() => {
            fetchBookingSessions();
          }, 1000);
        }
      });
    }
  }, [originalBookingSessions.length]); // Run when bookings are first loaded


  const handleOpenDeleteDialog = (bookingId) => {
    setBookingIdToDelete(bookingId);
    setDeleteDialogOpen(true);

  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBookingIdToDelete(null);
  };

  const handleConfirmDelete = async () => {

    if (!bookingIdToDelete) return;
    alert(bookingIdToDelete + 'is the id')
    try {
      const res = await axios.delete(
        "http://localhost:3000/api/booking-sessions/" + bookingIdToDelete,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.data.success) {
        fetchBookingSessions();
      }
    } catch (err) {
      console.error("Lỗi khi xóa lịch hẹn:", err);
    }
    handleCloseDeleteDialog();
  };

  const handleView = async (bookingId) => {
    const booking = bookingSessions.find(b => b.booking_id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowViewPopup(true);
    }
  };

  const handleEdit = async (bookingId) => {
    const booking = bookingSessions.find(b => b.booking_id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setEditFormData({
        consultant_id: booking.consultant_id || '',
        slot_id: booking.slot_id || '',
        status: booking.status || '',
        notes: booking.notes || '',
        google_meet_link: booking.google_meet_link || '',
        booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : ''
      });
      setShowEditPopup(true);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedBooking) return;

    // Validate required fields
    if (!editFormData.google_meet_link || editFormData.google_meet_link.trim() === '') {
      alert('Google Meet Link là bắt buộc');
      return;
    }

    // Validate Google Meet URL format
    const meetUrlPattern = /^https:\/\/meet\.google\.com\/[a-z-]+$/;
    if (!meetUrlPattern.test(editFormData.google_meet_link)) {
      alert('Vui lòng nhập một Google Meet link hợp lệ (ví dụ: https://meet.google.com/abc-defg-hij)');
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:3000/api/booking-sessions/${selectedBooking.booking_id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        await fetchBookingSessions(); // Refresh the list
        handleCloseEditPopup();
        alert('Successful edited booking session!!')
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật lịch hẹn:", err);
    }
  };

  // Function to check if a booking is close to expiring or has expired
  const getBookingTimeStatus = (booking) => {
    if (booking.status === 'Hoàn thành' || booking.status === 'Đã hủy') {
      return 'completed';
    }

    const now = new Date();
    const bookingDate = new Date(booking.booking_date);
    const [endHour, endMinute] = booking.end_time.split(':').map(Number);
    const [startHour, startMinute] = booking.start_time.split(':').map(Number);
    
    const bookingEndTime = new Date(bookingDate);
    bookingEndTime.setHours(endHour, endMinute, 0, 0);
    
    const bookingStartTime = new Date(bookingDate);
    bookingStartTime.setHours(startHour, startMinute, 0, 0);

    // Check if booking has passed its end time
    if (now > bookingEndTime) {
      return 'expired';
    }
    
    // Check if booking is currently in progress
    if (now >= bookingStartTime && now <= bookingEndTime) {
      return 'in-progress';
    }
    
    // Check if booking is within 30 minutes of starting
    const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000));
    if (thirtyMinutesFromNow >= bookingStartTime) {
      return 'starting-soon';
    }

    return 'scheduled';
  };

  // Manual check for expired bookings
  const handleManualExpiredCheck = async () => {
    console.log('Manual check for expired bookings triggered...');
    const hadCancellations = await checkAndCancelExpiredBookings(originalBookingSessions);
    if (hadCancellations) {
      alert('Đã tìm thấy và hủy các buổi hẹn đã quá thời gian. Danh sách sẽ được cập nhật.');
      await fetchBookingSessions();
    } else {
      alert('Không có buổi hẹn nào quá thời gian cần hủy.');
    }
  };

  return (
    <div className="member-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <button 
          className="btn btn-warning btn-sm"
          onClick={handleManualExpiredCheck}
          title="Kiểm tra và hủy các buổi hẹn đã quá thời gian"
        >
          <FaSearch className="me-1" />
          Kiểm tra hẹn quá hạn
        </button>
        <div
          className="search-box"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm theo tên thành viên hoặc trạng thái..."
            style={{ background: "white" }}
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
              <th>Tên thành viên</th>
              <th>Email</th>
              <th>Ngày đặt lịch</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookingSessions.map((booking, index) => {
              const timeStatus = getBookingTimeStatus(booking);
              return (
                <tr 
                  key={`booking-${booking.booking_id}-${index}`}
                  className={`booking-row ${timeStatus}`}
                  style={{
                    backgroundColor: 
                      timeStatus === 'expired' ? '#ffebee' :
                      timeStatus === 'in-progress' ? '#e8f5e8' :
                      timeStatus === 'starting-soon' ? '#fff3e0' :
                      'transparent'
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{booking.member_name}</td>
                  <td>{booking.member_email}</td>
                  <td>{new Date(booking.booking_date).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {`${booking.start_time} - ${booking.end_time}`}
                    {timeStatus === 'expired' && (
                      <span className="badge bg-danger ms-2" title="Đã quá thời gian">
                        Quá hạn
                      </span>
                    )}
                    {timeStatus === 'in-progress' && (
                      <span className="badge bg-success ms-2" title="Đang diễn ra">
                        Đang diễn ra
                      </span>
                    )}
                    {timeStatus === 'starting-soon' && (
                      <span className="badge bg-warning ms-2" title="Sắp bắt đầu">
                        Sắp bắt đầu
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${booking.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.notes || 'Không có'}</td>
                  <td className="action-buttons">
                    <button className="btn btn-light me-2" onClick={() => handleView(booking.booking_id)}>
                      <FaEye color="blue" />
                    </button>
                    <button className="btn btn-light me-2" onClick={() => handleViewMemberDetail(booking)}>
                      <FaUser color="purple" />
                    </button>
                    <button className="btn btn-light me-2" onClick={() => handleEdit(booking.booking_id)}>
                      <FaWrench color="green" />
                    </button>
                    <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(booking.booking_id)}>
                      <FaTrash color="red" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showViewPopup && selectedBooking && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleCloseViewPopup}>
              <MdCancel />
            </span>
            <h4>Chi tiết lịch hẹn</h4>
            <div className="member-detail-row">
              <span className="member-detail-label">ID lịch hẹn:</span>
              <span className="member-detail-value">{selectedBooking.booking_id}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Tên thành viên:</span>
              <span className="member-detail-value">{selectedBooking.member_name}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Email thành viên:</span>
              <span className="member-detail-value">{selectedBooking.member_email}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Số điện thoại:</span>
              <span className="member-detail-value">{selectedBooking.member_phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Ngày đặt lịch:</span>
              <span className="member-detail-value">{new Date(selectedBooking.booking_date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Thời gian:</span>
              <span className="member-detail-value">{`${selectedBooking.start_time} - ${selectedBooking.end_time}`}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Trạng thái:</span>
              <span className="member-detail-value">{selectedBooking.status}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Ghi chú:</span>
              <span className="member-detail-value">{selectedBooking.notes || 'Không có'}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Google Meet Link:</span>
              <span className="member-detail-value">
                {selectedBooking.google_meet_link ? (
                  <a href={selectedBooking.google_meet_link} target="_blank" rel="noopener noreferrer">
                    {selectedBooking.google_meet_link}
                  </a>
                ) : 'Chưa có'}
              </span>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && selectedBooking && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleCloseEditPopup}>
              <MdCancel />
            </span>
            <h4>Chỉnh sửa lịch hẹn</h4>

            <div className="form-group mb-3">
              <label className="form-label">Chuyên gia:</label>
              <input
                type="text"
                value={consultants.find(c => c.id_consultant == editFormData.consultant_id)?.name ||
                  consultants.find(c => c.id_consultant == editFormData.consultant_id)?.email ||
                  'Không xác định'}
                className="form-control"
                readOnly
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Khung giờ:</label>
              <input
                type="text"
                value={slots.find(s => s.slot_id == editFormData.slot_id) ?
                  `${slots.find(s => s.slot_id == editFormData.slot_id).start_time} - ${slots.find(s => s.slot_id == editFormData.slot_id).end_time}` :
                  'Không xác định'}
                className="form-control"
                readOnly
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Trạng thái:</label>
              <select
                name="status"
                value={editFormData.status}
                onChange={handleEditFormChange}
                className="form-control"
              >
                <option value="">Chọn trạng thái</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Ngày đặt lịch:</label>
              <input
                type="text"
                value={editFormData.booking_date ? new Date(editFormData.booking_date).toLocaleDateString('vi-VN') : 'Không xác định'}
                className="form-control"
                readOnly
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Ghi chú:</label>
              <textarea
                name="notes"
                value={editFormData.notes}
                onChange={handleEditFormChange}
                className="form-control"
                rows="3"
                placeholder="Nhập ghi chú..."
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Google Meet Link: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="url"
                name="google_meet_link"
                value={editFormData.google_meet_link}
                onChange={handleEditFormChange}
                className="form-control"
                placeholder="https://meet.google.com/..."
                required
              />
              <small className="form-text text-muted">
                Ví dụ: https://meet.google.com/abc-defg-hij
              </small>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary me-2" onClick={handleCloseEditPopup}>
                Hủy
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberDetailPopup && selectedMemberDetail && (
        <div className="popup" style={{ zIndex: 1050 }}>
          <div className="popup-content" style={{
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <span className="close" onClick={handleCloseMemberDetailPopup} style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              zIndex: 1051
            }}>
              <MdCancel />
            </span>
            <div style={{ padding: '20px' }}>
              <h4 style={{
                marginBottom: '20px',
                color: '#333',
                borderBottom: '2px solid #007bff',
                paddingBottom: '10px',
                fontSize: '1.5rem'
              }}>Chi tiết thông tin thành viên</h4>

              {/* Basic Information Section */}
              <div className="info-section" style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <h5 style={{
                  color: '#495057',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  borderBottom: '1px solid #dee2e6',
                  paddingBottom: '8px'
                }}>🧑‍💼 Thông tin cơ bản</h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="member-detail-row">
                      <span className="member-detail-label">ID thành viên:</span>
                      <span className="member-detail-value">{selectedMemberDetail.user?.user_id || selectedMemberDetail.profile?.user_id || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Họ và tên:</span>
                      <span className="member-detail-value" style={{ fontWeight: 'bold' }}>{selectedMemberDetail.profile?.name || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Email:</span>
                      <span className="member-detail-value">{selectedMemberDetail.user?.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Nghề nghiệp:</span>
                      <span className="member-detail-value">{selectedMemberDetail.profile?.job || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="member-detail-row">
                      <span className="member-detail-label">Ngày sinh:</span>
                      <span className="member-detail-value">
                        {selectedMemberDetail.profile?.date_of_birth ?
                          new Date(selectedMemberDetail.profile.date_of_birth).toLocaleDateString('vi-VN') :
                          'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Vai trò:</span>
                      <span className="member-detail-value">{selectedMemberDetail.user?.role || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Trạng thái:</span>
                      <span className="member-detail-value">
                        <span className={`status-badge ${selectedMemberDetail.user?.status?.toLowerCase()}`}>
                          {selectedMemberDetail.user?.status || 'Không xác định'}
                        </span>
                      </span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Ngày tạo tài khoản:</span>
                      <span className="member-detail-value">
                        {selectedMemberDetail.user?.date_created ?
                          new Date(selectedMemberDetail.user.date_created).toLocaleDateString('vi-VN') :
                          'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Summary Section */}
              <div className="info-section" style={{
                backgroundColor: '#e3f2fd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #bbdefb'
              }}>
                <h5 style={{
                  color: '#1565c0',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  borderBottom: '1px solid #90caf9',
                  paddingBottom: '8px'
                }}>📊 Tổng quan đánh giá</h5>

                <div className="member-detail-row">
                  <span className="member-detail-label">Số lượng đánh giá:</span>
                  <span className="member-detail-value">
                    <span style={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '0.9em',
                      fontWeight: 'bold'
                    }}>
                      {selectedMemberDetail.assessment_count || 0} lần
                    </span>
                  </span>
                </div>
              </div>

              {/* Assessment Details */}
              {selectedMemberDetail.assessments && selectedMemberDetail.assessments.length > 0 && (
                <div className="info-section" style={{
                  backgroundColor: '#fff3e0',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #ffcc02'
                }}>
                  <h5 style={{
                    color: '#e65100',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                    borderBottom: '1px solid #ffb74d',
                    paddingBottom: '8px'
                  }}>📋 Lịch sử đánh giá chi tiết</h5>
                  {selectedMemberDetail.assessments.map((assessment, index) => {
                    // Parse result_json to extract meaningful data
                    let parsedResult = null;
                    let totalScore = 0;
                    let questionCount = 0;

                    try {
                      if (assessment.result_json) {
                        parsedResult = JSON.parse(assessment.result_json);
                        if (parsedResult.result && Array.isArray(parsedResult.result)) {
                          questionCount = parsedResult.result.length;
                          totalScore = parsedResult.score || 0;
                        }
                      }
                    } catch (e) {
                      console.error('Error parsing assessment result:', e);
                    }

                    return (
                      <div key={index} className="assessment-item" style={{
                        backgroundColor: '#ffffff',
                        padding: '20px',
                        margin: '15px 0',
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Loại đánh giá:</span>
                          <span className="member-detail-value">
                            <strong style={{
                              color: assessment.type === 'assist' ? '#28a745' :
                                assessment.type === 'crafft' ? '#007bff' : '#6c757d',
                              textTransform: 'uppercase'
                            }}>
                              {assessment.type || 'Chưa xác định'}
                            </strong>
                          </span>
                        </div>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Mô tả:</span>
                          <span className="member-detail-value">{assessment.description || 'Không có mô tả'}</span>
                        </div>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Ngày thực hiện:</span>
                          <span className="member-detail-value">
                            {assessment.created_at ?
                              new Date(assessment.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) :
                              'Chưa cập nhật'}
                          </span>
                        </div>

                        {parsedResult && (
                          <div className="assessment-results" style={{ marginTop: '15px' }}>
                            <div className="result-summary" style={{
                              backgroundColor: '#fff',
                              padding: '10px',
                              borderRadius: '5px',
                              border: '1px solid #dee2e6',
                              marginBottom: '10px'
                            }}>
                              <div className="member-detail-row">
                                <span className="member-detail-label">Tổng điểm:</span>
                                <span className="member-detail-value">
                                  <strong style={{
                                    color: totalScore >= 15 ? '#dc3545' :
                                      totalScore >= 10 ? '#fd7e14' :
                                        totalScore >= 5 ? '#ffc107' : '#28a745',
                                    fontSize: '1.1em'
                                  }}>
                                    {totalScore}
                                  </strong>
                                </span>
                              </div>
                              <div className="member-detail-row">
                                <span className="member-detail-label">Số câu hỏi:</span>
                                <span className="member-detail-value">{questionCount} câu</span>
                              </div>
                              <div className="member-detail-row">
                                <span className="member-detail-label">Mức độ rủi ro:</span>
                                <span className="member-detail-value">
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.9em',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: totalScore >= 15 ? '#dc3545' :
                                      totalScore >= 10 ? '#fd7e14' :
                                        totalScore >= 5 ? '#ffc107' : '#28a745'
                                  }}>
                                    {totalScore >= 15 ? 'Cao' :
                                      totalScore >= 10 ? 'Trung bình' :
                                        totalScore >= 5 ? 'Thấp' : 'Rất thấp'}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {parsedResult.result && (
                              <div className="question-details">
                                <h6 style={{
                                  margin: '15px 0 10px 0',
                                  color: '#495057',
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}>💭 Chi tiết câu trả lời:</h6>
                                <div style={{
                                  maxHeight: '250px',
                                  overflowY: 'auto',
                                  backgroundColor: '#f8f9fa',
                                  padding: '10px',
                                  borderRadius: '8px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  {parsedResult.result.map((question, qIndex) => (
                                    <div key={qIndex} style={{
                                      padding: '8px 12px',
                                      margin: '4px 0',
                                      backgroundColor: question.score > 2 ? '#ffebee' : '#f1f8e9',
                                      borderRadius: '6px',
                                      fontSize: '0.9em',
                                      borderLeft: `4px solid ${question.score > 2 ? '#f44336' : '#4caf50'}`,
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                      <strong>Q{question.questionId}:</strong>
                                      <span style={{ marginLeft: '5px' }}>
                                        Lựa chọn {question.selectedOption}
                                        <span style={{
                                          color: question.score > 2 ? '#d32f2f' : '#388e3c',
                                          fontWeight: 'bold',
                                          marginLeft: '5px'
                                        }}>
                                          ({question.score} điểm)
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {!parsedResult && assessment.result_json && (
                          <div className="member-detail-row">
                            <span className="member-detail-label">Kết quả:</span>
                            <span className="member-detail-value" style={{ fontSize: '0.9em', color: '#666' }}>
                              Dữ liệu đánh giá không thể hiển thị
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                <p>Bạn có chắc chắn muốn xóa lịch hẹn này không?</p>
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

export default ManageBookingPage;
