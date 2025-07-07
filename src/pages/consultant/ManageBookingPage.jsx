import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaEye, FaTrash, FaWrench } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ManageBookingPage.scss";
import axios from "axios";

const ManageBookingPage = () => {
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [originalBookingSessions, setOriginalBookingSessions] = useState([]);
  const [bookingSessions, setBookingSessions] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  const statusOptions = ['Hoàn thành', 'Lên lịch', 'Đã hủy', 'Đang chờ xác nhận', 'Xác nhận thành công'];

  const handleCloseViewPopup = () => setShowViewPopup(false);
  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setEditFormData({ consultant_id: '', slot_id: '', booking_date: '', status: '', notes: '', google_meet_link: '' });
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

        setOriginalBookingSessions(uniqueBookings);
        setBookingSessions(uniqueBookings);
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

  useEffect(() => {
    fetchBookingSessions();
    fetchConsultants();
    fetchSlots();
  }, []); // Empty dependency array to run only once


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

  return (
    <div className="member-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
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
            {bookingSessions.map((booking, index) => (
              <tr key={`booking-${booking.booking_id}-${index}`}>
                <td>{index + 1}</td>
                <td>{booking.member_name}</td>
                <td>{booking.member_email}</td>
                <td>{new Date(booking.booking_date).toLocaleDateString('vi-VN')}</td>
                <td>{`${booking.start_time} - ${booking.end_time}`}</td>
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
                  <button className="btn btn-light me-2" onClick={() => handleEdit(booking.booking_id)}>
                    <FaWrench color="green" />
                  </button>
                  <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(booking.booking_id)}>
                    <FaTrash color="red" />
                  </button>
                </td>
              </tr>
            ))}
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
