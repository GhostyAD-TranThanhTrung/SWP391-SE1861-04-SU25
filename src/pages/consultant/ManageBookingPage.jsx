import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaEye, FaTrash, FaWrench, FaUser } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ManageBookingPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { assessRiskLevel as assessCrafftRisk, hasSubstanceUseInPartA, hasCarRisk } from "../../QuizData/Crafft-Data";
import { assessRiskLevel as assessAssistRisk } from "../../QuizData/Assist_Data";
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
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('newest');
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
  
  // Database slots for consistent time checking
  const databaseSlots = [
    { slot_id: 1, start_time: '09:00:00', end_time: '10:00:00' },
    { slot_id: 2, start_time: '10:00:00', end_time: '11:00:00' },
    { slot_id: 3, start_time: '11:00:00', end_time: '12:00:00' },
    { slot_id: 4, start_time: '12:00:00', end_time: '13:00:00' },
    { slot_id: 5, start_time: '13:00:00', end_time: '14:00:00' },
    { slot_id: 6, start_time: '14:00:00', end_time: '15:00:00' },
    { slot_id: 7, start_time: '15:00:00', end_time: '16:00:00' },
    { slot_id: 8, start_time: '16:00:00', end_time: '17:00:00' }
  ];
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
  const statusOptions = ['Hoàn thành', 'Đã hủy', 'Đang chờ xác nhận', 'Xác nhận thành công'];

  // Function to get available status options based on booking date
  const getAvailableStatusOptions = (bookingDate) => {
    if (!bookingDate) return statusOptions;

    const now = new Date();
    const booking = new Date(bookingDate);

    // Set booking date to end of day for comparison
    booking.setHours(23, 59, 59, 999);

    // If booking date has passed, only allow "Đã hủy" status
    if (now > booking) {
      return ['Đã hủy'];
    }

    // If booking date hasn't passed, allow all status options
    return statusOptions;
  };

  const translateStatus = (status) => {
    if (!status) return 'Không xác định';

    const statusTranslations = {
      'Hoạt động': 'Hoạt động',
      'Không hoạt động': 'Không hoạt động',
      'Bị cấm': 'Bị cấm',
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'banned': 'Bị cấm'
    };

    return statusTranslations[status] || status;
  };

  // Helper function to calculate risk level from assessment data
  const calculateRiskLevel = (assessment) => {
    try {
      const actionMapping ={
        '2':'Thấp',
        '3':'Trung Bình',
        '4':'Cao',
        '5':'Thấp',
        '6':'Trung Bình',
        '7':'Cao',
      }

      const riskLevel = actionMapping[assessment.action?.action_id] || 'demo';
      
      const resultData = typeof assessment.result_json === 'string'
        ? JSON.parse(assessment.result_json)
        : assessment.result_json;

      const score = resultData.score;

      return { riskLevel, score };
    } catch (error) {
      console.error('Error calculating risk level:', error);
    }
  };

  // Get risk level color class
  const getRiskLevelClass = (riskLevel) => {
    // Ensure riskLevel is a string
    const riskLevelStr = typeof riskLevel === 'string' ? riskLevel : 'không xác định';
    
    switch (riskLevelStr.toLowerCase()) {
      case 'thấp':
        return 'bg-success';
      case 'trung bình':
        return 'bg-warning';
      case 'cao':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Function to check and auto-cancel expired bookings
  const checkAndCancelExpiredBookings = async (bookings) => {
    if (!bookings || bookings.length === 0) {
      console.log('Không có lịch hẹn nào để kiểm tra');
      return false;
    }

    console.log(`Đang kiểm tra ${bookings.length} lịch hẹn đã hết hạn:`);
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ID lịch hẹn: ${booking.booking_id}, Ngày: ${booking.booking_date}, Thời gian: ${booking.start_time}-${booking.end_time}, Trạng thái: ${booking.status}`);
    });

    const now = new Date();
    console.log(`Thời gian hiện tại: ${now.toLocaleString()}`);
    const expiredBookings = [];

    bookings.forEach(booking => {
      // Skip if already completed, cancelled, confirmed, or confirmed successfully
      if (booking.status === 'Hoàn thành' ||
        booking.status === 'Đã hủy' ||
        booking.status === 'Xác nhận thành công') {
        return;
      }

      // Only process bookings with "Đang chờ xác nhận" status
      if (booking.status !== 'Đang chờ xác nhận') return;

      try {
        // Get the slot information from database slots
        const slot = databaseSlots.find(s => s.slot_id === booking.slot_id);
        if (!slot) {
          console.warn(`Không tìm thấy slot cho lịch hẹn ${booking.booking_id}:`, booking.slot_id);
          return;
        }

        // Create the booking end datetime
        const bookingDate = new Date(booking.booking_date);
        
        // Validate booking date
        if (isNaN(bookingDate.getTime())) {
          console.warn(`Ngày lịch hẹn không hợp lệ cho booking ${booking.booking_id}:`, booking.booking_date);
          return;
        }

        const [hours, minutes] = slot.end_time.split(':').map(Number);
        
        // Validate time values
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.warn(`Giá trị thời gian không hợp lệ cho lịch hẹn ${booking.booking_id}:`, slot.end_time);
          return;
        }

        // Set the end time on the booking date
        bookingDate.setHours(hours, minutes, 0, 0);

        // Debug logging
        console.log(`Đang kiểm tra lịch hẹn ${booking.booking_id}:`);
        console.log(`  - Ngày lịch hẹn: ${bookingDate.toLocaleString()}`);
        console.log(`  - Thời gian hiện tại: ${now.toLocaleString()}`);
        console.log(`  - Đã hết hạn: ${now > bookingDate}`);
        console.log(`  - Trạng thái: ${booking.status}`);

        // Check if the booking has passed its end time
        if (now > bookingDate) {
          console.log(`  - THÊM VÀO DANH SÁCH HẾT HẠN: Lịch hẹn ${booking.booking_id} đã hết hạn`);
          expiredBookings.push(booking);
        }
      } catch (error) {
        console.error(`Lỗi khi xử lý lịch hẹn ${booking.booking_id}:`, error);
      }
    });

    // Auto-cancel expired bookings
    if (expiredBookings.length > 0) {
      console.log(`Tìm thấy ${expiredBookings.length} lịch hẹn hết hạn cần hủy:`, expiredBookings);

      let successfulCancellations = 0;

      for (const expiredBooking of expiredBookings) {
        try {
          console.log(`Đang tự động hủy lịch hẹn bị bỏ lỡ ${expiredBooking.booking_id} - đã lên lịch lúc ${new Date(expiredBooking.booking_date).toLocaleString()}`);
          
          const updateData = {
            consultant_id: expiredBooking.consultant_id,
            slot_id: expiredBooking.slot_id,
            booking_date: expiredBooking.booking_date,
            status: 'Đã hủy',
            notes: expiredBooking.notes ?
              `${expiredBooking.notes} | Tự động hủy: Quá thời gian xác nhận` :
              'Tự động hủy: Quá thời gian xác nhận',
            google_meet_link: expiredBooking.google_meet_link || ''
          };

          const response = await axios.put(
            `http://localhost:3000/api/booking-sessions/${expiredBooking.booking_id}`,
            updateData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            successfulCancellations++;
            console.log(`Đã tự động hủy thành công lịch hẹn ${expiredBooking.booking_id}`);
          } else {
            console.error(`Lỗi khi tự động hủy lịch hẹn ${expiredBooking.booking_id}:`, response.data.message);
          }
        } catch (err) {
          console.error(`Lỗi trong quá trình tự động hủy lịch hẹn ${expiredBooking.booking_id}:`, err.response?.data?.message || err.message);
        }
      }

      console.log(`🔄 Đã tự động hủy thành công ${successfulCancellations} trong tổng số ${expiredBookings.length} lịch hẹn hết hạn`);
      return successfulCancellations > 0;
    }

    console.log('Không tìm thấy lịch hẹn hết hạn nào cần hủy');
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
      const email = sessionStorage.getItem('email2');
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

  const applyFiltersAndSort = () => {
    let filtered = originalBookingSessions;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(booking =>
        booking.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== '') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply date sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.booking_date);
      const dateB = new Date(b.booking_date);
      
      if (dateSort === 'newest') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

    setBookingSessions(filtered);
  };

  const handleSearchClick = async () => {
    applyFiltersAndSort();
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateSortChange = (e) => {
    setDateSort(e.target.value);
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
      console.log('Đang chạy kiểm tra định kỳ các lịch hẹn hết hạn...');
      if (originalBookingSessions.length > 0) {
        const hadCancellations = await checkAndCancelExpiredBookings(originalBookingSessions);
        if (hadCancellations) {
          console.log('Tìm thấy lịch hẹn hết hạn, đang làm mới dữ liệu...');
          fetchBookingSessions();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run only once

  // Additional useEffect to check for expired bookings when data is loaded
  useEffect(() => {
    // Use a flag to prevent multiple simultaneous checks
    let isChecking = false;

    const checkExpiredBookings = async () => {
      if (isChecking || originalBookingSessions.length === 0) return;

      isChecking = true;
      try {
        const hadCancellations = await checkAndCancelExpiredBookings(originalBookingSessions);
        if (hadCancellations) {
          // Small delay before refetching to ensure database updates are complete
          setTimeout(() => {
            fetchBookingSessions();
          }, 1000);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra lịch hẹn hết hạn:', error);
      } finally {
        isChecking = false;
      }
    };

    if (originalBookingSessions.length > 0) {
      checkExpiredBookings();
    }
  }, [originalBookingSessions]); // Use the full array as dependency but with safety checks

  // Apply filters and sorting whenever filter criteria change
  useEffect(() => {
    if (originalBookingSessions.length > 0) {
      applyFiltersAndSort();
    }
  }, [searchTerm, statusFilter, dateSort, originalBookingSessions]);


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

      // Check if booking date has passed
      const now = new Date();
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(23, 59, 59, 999); // Set to end of day

      // If booking date has passed and current status is not "Đã hủy", suggest cancellation
      let defaultStatus = booking.status || '';
      if (now > bookingDate && booking.status !== 'Đã hủy') {
        defaultStatus = 'Đã hủy';
      }

      setEditFormData({
        consultant_id: booking.consultant_id || '',
        slot_id: booking.slot_id || '',
        status: defaultStatus,
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
    if (booking.status === 'Hoàn thành' ||
      booking.status === 'Đã hủy' ||
      booking.status === 'Xác nhận thành công') {
      return 'completed';
    }

    try {
      const now = new Date();
      const bookingDate = new Date(booking.booking_date);

      // Validate booking date
      if (isNaN(bookingDate.getTime())) {
        console.warn(`Invalid booking date for booking ${booking.booking_id}:`, booking.booking_date);
        return 'error';
      }

      // Validate time formats
      if (!booking.end_time || !booking.start_time ||
        !booking.end_time.includes(':') || !booking.start_time.includes(':')) {
        console.warn(`Invalid time format for booking ${booking.booking_id}:`,
          { start_time: booking.start_time, end_time: booking.end_time });
        return 'error';
      }

      const [endHour, endMinute] = booking.end_time.split(':').map(Number);
      const [startHour, startMinute] = booking.start_time.split(':').map(Number);

      // Validate time values
      if (isNaN(endHour) || isNaN(endMinute) || isNaN(startHour) || isNaN(startMinute) ||
        endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59 ||
        startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59) {
        console.warn(`Invalid time values for booking ${booking.booking_id}:`,
          { start_time: booking.start_time, end_time: booking.end_time });
        return 'error';
      }

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
    } catch (error) {
      console.error(`Error determining booking time status for booking ${booking.booking_id}:`, error);
      return 'error';
    }
  };

  // Check if booking is today
  const isBookingToday = (booking) => {
    if (!booking.booking_date) return false;
    
    try {
      const bookingDate = new Date(booking.booking_date);
      const today = new Date();
      
      return bookingDate.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  };

  // Get row styling based on booking status and date
  const getBookingRowStyle = (booking) => {
    const baseStyle = {};
    
    if (isBookingToday(booking)) {
      // Highlight today's bookings with a subtle blue background
      return {
        ...baseStyle,
        backgroundColor: '#e3f2fd',
        borderLeft: '4px solid #2196f3',
        boxShadow: '0 1px 3px rgba(33, 150, 243, 0.1)'
      };
    }
    
    return baseStyle;
  };

  return (
    <div className="member-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <div className="filters-section d-flex gap-3 align-items-center">
          <div className="filter-group">
            <label htmlFor="statusFilter" className="form-label mb-1" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
              Lọc theo trạng thái:
            </label>
            <select
              id="statusFilter"
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ minWidth: '180px' }}
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="dateSort" className="form-label mb-1" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
              Sắp xếp theo ngày:
            </label>
            <select
              id="dateSort"
              className="form-select form-select-sm"
              value={dateSort}
              onChange={handleDateSortChange}
              style={{ minWidth: '150px' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
        <div
          className="search-box"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "auto",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm theo tên thành viên hoặc trạng thái..."
            style={{ background: "white", minWidth: '300px' }}
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
              const rowStyle = getBookingRowStyle(booking);
              return (
                <tr
                  key={`booking-${booking.booking_id}-${index}`}
                  className={`booking-row ${timeStatus}`}
                  style={{
                    ...rowStyle,
                    backgroundColor: isBookingToday(booking) ? '#e3f2fd' :
                      timeStatus === 'expired' ? '#ffebee' :
                        timeStatus === 'in-progress' ? '#e8f5e8' :
                          timeStatus === 'starting-soon' ? '#fff3e0' :
                            timeStatus === 'error' ? '#fce4ec' :
                              'transparent'
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{booking.member_name}</td>
                  <td>{booking.member_email}</td>
                  <td>{new Date(booking.booking_date).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {timeStatus === 'error' ? (
                      <span className="text-danger" title="Lỗi định dạng thời gian">
                        Lỗi định dạng
                      </span>
                    ) : (
                      `${booking.start_time} - ${booking.end_time}`
                    )}
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
                    {timeStatus === 'error' && (
                      <span className="badge bg-secondary ms-2" title="Có lỗi xảy ra">
                        Lỗi
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

      {/* Visual Legend */}
      <div className="legend-section mt-3">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info" style={{ padding: '10px 15px', fontSize: '0.9rem' }}>
              <strong>📋 Chú thích màu sắc:</strong>
              <div className="row mt-2">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-1">
                    <div style={{ width: '20px', height: '15px', backgroundColor: '#e3f2fd', border: '2px solid #2196f3', marginRight: '8px' }}></div>
                    <span>Lịch hẹn hôm nay</span>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <div style={{ width: '20px', height: '15px', backgroundColor: '#ffebee', marginRight: '8px' }}></div>
                    <span>Đã quá hạn</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-1">
                    <div style={{ width: '20px', height: '15px', backgroundColor: '#e8f5e8', marginRight: '8px' }}></div>
                    <span>Đang diễn ra</span>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <div style={{ width: '20px', height: '15px', backgroundColor: '#fff3e0', marginRight: '8px' }}></div>
                    <span>Sắp bắt đầu</span>
                  </div>
                </div>
              </div>
              <small className="text-muted">
                💡 Hệ thống tự động hủy các lịch hẹn "Đang chờ xác nhận" đã quá thời gian mỗi 5 phút.
              </small>
            </div>
          </div>
        </div>
      </div>

      {showViewPopup && selectedBooking && (
        <div className="popup">
          <div className="popup-content" style={{
            width: '50%',
            maxWidth: '50vw',
            minWidth: '600px'
          }}>
            <span className="close" onClick={handleCloseViewPopup}>
              <MdCancel />
            </span>
            <h4>Chi tiết lịch hẹn</h4>

            {/* Row 1: Basic Info */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">ID lịch hẹn:</span>
                  <span className="member-detail-value">{selectedBooking.booking_id}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">Tên thành viên:</span>
                  <span className="member-detail-value">{selectedBooking.member_name}</span>
                </div>
              </div>
            </div>

            {/* Row 2: Contact Info */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">Email thành viên:</span>
                  <span className="member-detail-value">{selectedBooking.member_email}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">Số điện thoại:</span>
                  <span className="member-detail-value">{selectedBooking.member_phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>

            {/* Row 3: Booking Details */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">Ngày đặt lịch:</span>
                  <span className="member-detail-value">{new Date(selectedBooking.booking_date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">Thời gian:</span>
                  <span className="member-detail-value">{`${selectedBooking.start_time} - ${selectedBooking.end_time}`}</span>
                </div>
              </div>
            </div>

            {/* Row 4: Status */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="member-detail-row">
                  <span className="member-detail-label">Trạng thái:</span>
                  <span className="member-detail-value">
                    <span className={`status-badge ${selectedBooking.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedBooking.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Full Width Sections */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="member-detail-row">
                  <span className="member-detail-label">Ghi chú:</span>
                  <span className="member-detail-value">{selectedBooking.notes || 'Không có'}</span>
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <div className="member-detail-row">
                  <span className="member-detail-label">Google Meet Link:</span>
                  <span className="member-detail-value">
                    {selectedBooking.google_meet_link ? (
                      <a href={selectedBooking.google_meet_link} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'underline' }}>
                        {selectedBooking.google_meet_link}
                      </a>
                    ) : 'Chưa có'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && selectedBooking && (
        <div className="popup">
          <div className="popup-content" style={{
            width: '50%',
            maxWidth: '50vw',
            minWidth: '600px'
          }}>
            <span className="close" onClick={handleCloseEditPopup}>
              <MdCancel />
            </span>
            <h4>Chỉnh sửa lịch hẹn</h4>

            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
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
              </div>
              <div className="col-md-6">
                <div className="form-group">
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
              </div>
            </div>

            {/* Row 2 */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Trạng thái:</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                    className="form-control"
                  >
                    <option value="">Chọn trạng thái</option>
                    {getAvailableStatusOptions(editFormData.booking_date).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {getAvailableStatusOptions(editFormData.booking_date).length === 1 &&
                    getAvailableStatusOptions(editFormData.booking_date)[0] === 'Đã hủy' && (
                      <small className="form-text text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Lịch hẹn đã quá hạn, chỉ có thể chuyển sang trạng thái "Đã hủy"
                      </small>
                    )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Ngày đặt lịch:</label>
                  <input
                    type="text"
                    value={editFormData.booking_date ? new Date(editFormData.booking_date).toLocaleDateString('vi-VN') : 'Không xác định'}
                    className="form-control"
                    readOnly
                    style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>

            {/* Full width fields */}
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
                          {translateStatus(selectedMemberDetail.user?.status) || 'Không xác định'}
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
                    let questionCount = 0;

                    try {
                      if (assessment.result_json) {
                        parsedResult = JSON.parse(assessment.result_json);
                        if (parsedResult.result && Array.isArray(parsedResult.result)) {
                          questionCount = parsedResult.result.length;
                        }
                      }
                    } catch (e) {
                      console.error('Error parsing assessment result:', e);
                    }

                    const { riskLevel, score } = calculateRiskLevel(assessment);
                    const riskLevelClass = getRiskLevelClass(riskLevel);

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
                          <span className="member-detail-value">
                            {assessment.description || 
                             assessment.assessment_description || 
                             (assessment.type ? `Đánh giá ${assessment.type.toUpperCase()}` : 'Đánh giá tâm lý') || 
                             'Không có mô tả'}
                          </span>
                        </div>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Ngày thực hiện:</span>
                          <span className="member-detail-value">
                            {(assessment.created_at || assessment.create_at || assessment.date_created) ?
                              new Date(assessment.created_at || assessment.create_at || assessment.date_created).toLocaleDateString('vi-VN', {
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
                                    color: score >= 15 ? '#dc3545' :
                                      score >= 10 ? '#fd7e14' :
                                        score >= 5 ? '#ffc107' : '#28a745',
                                    fontSize: '1.1em'
                                  }}>
                                    {score}
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
                                  <span className={`badge ${riskLevelClass}`} style={{ fontSize: '0.9em' }}>
                                    {riskLevel}
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
