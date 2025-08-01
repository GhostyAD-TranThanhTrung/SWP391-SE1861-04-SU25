import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/BookingPage.scss';
import Image from '../images/Images.jpg';

const BookingPage = () => {
    const navigate = useNavigate();
    const [selectedSpecialization, setSelectedSpecialization] = useState('all');
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('all');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduledBookings, setScheduledBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [showAllBookings, setShowAllBookings] = useState(false);
    const [allBookings, setAllBookings] = useState([]);
    const [selectedNoteBooking, setSelectedNoteBooking] = useState(null);
    const [showNoteModal, setShowNoteModal] = useState(false);

    // Các slot dựa trên database sample.sql
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

    // API calls and data transformation functions (same as before)
    const fetchAllConsultants = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/consultants', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy danh sách tư vấn viên');
            }
            return data.data.consultants.filter(consultant => consultant.status !== 'inactive');
        } catch (error) {
            throw error;
        }
    };

    const transformConsultantsArray = (apiConsultants) => {
        if (!apiConsultants || !Array.isArray(apiConsultants)) return [];
        return apiConsultants.map(apiConsultant => {
            return {
                id_consultant: apiConsultant.id_consultant || 'N/A',
                google_meet_link: apiConsultant.google_meet_link || 'N/A',
                certification: apiConsultant.certification || 'N/A',
                speciality: apiConsultant.speciality || 'N/A',
                user_id: apiConsultant.user_id || 'N/A',
                date_create: apiConsultant.date_create || 'N/A',
                role: apiConsultant.role || 'N/A',
                email: apiConsultant.email || 'N/A',
                status: apiConsultant.status || 'N/A',
                img_link: apiConsultant.img_link || null,
                name: apiConsultant.name || 'N/A',
                bio_json: apiConsultant.bio_json || 'N/A',
                date_of_birth: apiConsultant.date_of_birth || 'N/A',
                job: apiConsultant.job || 'N/A',
                available_slots: apiConsultant.available_slots || []
            };
        });
    };

    const fetchScheduledBookings = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/booking-sessions/member', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy danh sách lịch hẹn');
            }
            return data.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách lịch hẹn:', error);
            return [];
        }
    };

    const filterActiveBookings = (bookings) => {
        if (!bookings || !Array.isArray(bookings)) return [];
        return bookings.filter(booking => {
            const status = booking.status;
            return status !== 'Đã hủy' && status !== 'Hoàn thành';
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '12:00 PM';
        try {
            const time = new Date(`2000-01-01T${timeString}`);
            return time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return timeString;
        }
    };

    // Format booking date with day of week and dd/mm/yyyy
    const formatBookingDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const dayOfWeek = dayNames[date.getDay()];
            const formattedDate = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            return `${dayOfWeek}, ${formattedDate}`;
        } catch (error) {
            return dateString;
        }
    };

    // Get slot time range for booking
    const getSlotTimeRange = (slotId) => {
        const slot = databaseSlots.find(s => s.slot_id === slotId);
        if (!slot) return 'N/A';
        const startTime = formatTime(slot.start_time);
        const endTime = formatTime(slot.end_time);
        return `${startTime} - ${endTime}`;
    };

    const getSpecializationFromSpeciality = (speciality) => {
        if (!speciality || speciality === 'N/A') return 'Tư vấn tổng quát';
        
        // Return Vietnamese specialization as is (since database now stores Vietnamese values)
        return speciality;
    };

    const handleViewProfile = (consultantId) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
            sessionStorage.setItem('redirectAfterLogin', `/consultant/${consultantId}`);
            alert('Vui lòng đăng nhập để xem hồ sơ tư vấn viên');
            navigate('/login');
            return;
        }
        navigate(`/consultant/${consultantId}`);
    };

    const handleViewNote = (booking) => {
        setSelectedNoteBooking(booking);
        setShowNoteModal(true);
    };

    // Auto-cancel missed bookings that are still pending confirmation
    const autoCorectMissedBookings = async (bookings) => {
        if (!bookings || bookings.length === 0) return [];

        const now = new Date();
        const updatedBookings = [...bookings];
        let hasUpdates = false;
        let cancelledCount = 0;

        for (let i = 0; i < updatedBookings.length; i++) {
            const booking = updatedBookings[i];
            
            // Only process bookings with "Đang chờ xác nhận" status
            if (booking.status !== 'Đang chờ xác nhận') continue;

            try {
                // Get the slot information
                const slot = databaseSlots.find(s => s.slot_id === booking.slot_id);
                if (!slot) continue;

                // Create the booking end datetime
                const bookingDate = new Date(booking.booking_date);
                const [hours, minutes] = slot.end_time.split(':').map(Number);
                bookingDate.setHours(hours, minutes, 0, 0);

                // If current time has passed the booking end time, auto-cancel
                if (now > bookingDate) {
                    console.log(`Đang tự động hủy lịch hẹn bị bỏ lỡ ${booking.booking_id} - đã lên lịch lúc ${bookingDate.toLocaleString()}`);
                    
                    try {
                        const token = sessionStorage.getItem('token');
                        const response = await fetch(`http://localhost:3000/api/booking-sessions/${booking.booking_id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                status: 'Đã hủy',
                                notes: booking.notes ? `${booking.notes} | Tự động hủy: Quá thời gian xác nhận` : 'Tự động hủy: Quá thời gian xác nhận'
                            })
                        });

                        if (response.ok) {
                            updatedBookings[i] = {
                                ...booking,
                                status: 'Đã hủy',
                                notes: booking.notes ? `${booking.notes} | Tự động hủy: Quá thời gian xác nhận` : 'Tự động hủy: Quá thời gian xác nhận'
                            };
                            hasUpdates = true;
                            cancelledCount++;
                            console.log(`Đã tự động hủy thành công lịch hẹn ${booking.booking_id}`);
                        } else {
                            console.error(`Lỗi khi tự động hủy lịch hẹn ${booking.booking_id}:`, await response.text());
                        }
                    } catch (error) {
                        console.error(`Lỗi trong quá trình tự động hủy lịch hẹn ${booking.booking_id}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Lỗi khi xử lý lịch hẹn ${booking.booking_id}:`, error);
            }
        }

        // Show notification if any bookings were cancelled
        if (cancelledCount > 0) {
            console.log(`🔄 Đã tự động hủy ${cancelledCount} lịch hẹn quá hạn xác nhận`);
        }

        return hasUpdates ? updatedBookings : bookings;
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
        const baseStyle = { backgroundColor: '#ffffff' };
        
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

    // Check if the booking time (with 15-minute margin) has arrived and status is confirmed
    const isMeetingTimeAvailable = (booking) => {
        if (!booking.booking_date || !booking.slot_id) return false;
        
        // Check booking status - disable if pending confirmation or cancelled
        const disabledStatuses = ['Đang chờ xác nhận', 'Đã hủy', 'pending', 'cancelled'];
        if (disabledStatuses.includes(booking.status)) {
            return false;
        }
        
        try {
            // Get the slot information
            const slot = databaseSlots.find(s => s.slot_id === booking.slot_id);
            if (!slot) return false;
            
            // Create the booking datetime
            const bookingDate = new Date(booking.booking_date);
            const [hours, minutes] = slot.start_time.split(':').map(Number);
            
            // Set the booking time
            bookingDate.setHours(hours, minutes, 0, 0);
            
            // Subtract 15 minutes (15 * 60 * 1000 milliseconds)
            const availableTime = new Date(bookingDate.getTime() - (15 * 60 * 1000));
            
            // Check if current time has passed the available time
            const now = new Date();
            return now >= availableTime;
        } catch (error) {
            console.error('Lỗi khi kiểm tra thời gian khả dụng của cuộc họp:', error);
            return false;
        }
    };

    // Get time remaining until meeting becomes available
    const getTimeUntilAvailable = (booking) => {
        if (!booking.booking_date || !booking.slot_id) return '';
        
        try {
            const slot = databaseSlots.find(s => s.slot_id === booking.slot_id);
            if (!slot) return '';
            
            const bookingDate = new Date(booking.booking_date);
            const [hours, minutes] = slot.start_time.split(':').map(Number);
            bookingDate.setHours(hours, minutes, 0, 0);
            
            const availableTime = new Date(bookingDate.getTime() - (15 * 60 * 1000));
            const now = new Date();
            
            if (now >= availableTime) return '';
            
            const diffMs = availableTime.getTime() - now.getTime();
            const diffMins = Math.ceil(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const remainingMins = diffMins % 60;
            
            if (diffHours > 0) {
                return `Khả dụng sau ${diffHours}h${remainingMins > 0 ? ` ${remainingMins}p` : ''}`;
            } else {
                return `Khả dụng sau ${diffMins} phút`;
            }
        } catch (error) {
            return '';
        }
    };

    // Get disabled button info based on booking status and time
    const getDisabledButtonInfo = (booking) => {
        const disabledStatuses = ['Đang chờ xác nhận', 'Đã hủy', 'pending', 'cancelled'];
        
        if (disabledStatuses.includes(booking.status)) {
            if (booking.status === 'Đang chờ xác nhận' || booking.status === 'pending') {
                return {
                    text: 'Chờ xác nhận',
                    tooltip: 'Cuộc hẹn đang chờ tư vấn viên xác nhận',
                    className: 'btn btn-sm btn-warning'
                };
            } else if (booking.status === 'Đã hủy' || booking.status === 'cancelled') {
                return {
                    text: 'Đã hủy',
                    tooltip: 'Cuộc hẹn đã bị hủy',
                    className: 'btn btn-sm btn-danger'
                };
            }
        }
        
        // Default case for time-based restriction
        return {
            text: 'Chưa đến giờ',
            tooltip: `Link sẽ khả dụng trước 15 phút khi bắt đầu. ${getTimeUntilAvailable(booking)}`,
            className: 'btn btn-sm btn-secondary'
        };
    };

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setLoadingBookings(true);

                const [apiConsultants, bookings] = await Promise.all([
                    fetchAllConsultants(),
                    fetchScheduledBookings()
                ]);

                const transformedConsultants = transformConsultantsArray(apiConsultants);
                setConsultants(transformedConsultants);
                
                // Auto-cancel missed bookings before setting state
                const updatedBookings = await autoCorectMissedBookings(bookings || []);
                
                const activeBookings = filterActiveBookings(updatedBookings);
                setAllBookings(updatedBookings);
                setScheduledBookings(activeBookings);
            } catch (error) {
                console.error('Lỗi khi load dữ liệu:', error);
                setConsultants([]);
                setScheduledBookings([]);
            } finally {
                setLoading(false);
                setLoadingBookings(false);
            }
        };
        loadData();
    }, []);

    // Periodic check for missed bookings (every 5 minutes)
    useEffect(() => {
        const checkMissedBookings = async () => {
            try {
                if (allBookings.length > 0) {
                    console.log('Đang kiểm tra các lịch hẹn bị bỏ lỡ...');
                    const updatedBookings = await autoCorectMissedBookings(allBookings);
                    
                    if (updatedBookings !== allBookings) {
                        console.log('Tìm thấy lịch hẹn bị bỏ lỡ, đang cập nhật trạng thái...');
                        const activeBookings = filterActiveBookings(updatedBookings);
                        setAllBookings(updatedBookings);
                        setScheduledBookings(activeBookings);
                    }
                }
            } catch (error) {
                console.error('Lỗi trong quá trình kiểm tra định kỳ lịch hẹn bị bỏ lỡ:', error);
            }
        };

        // Run immediately when component mounts
        if (allBookings.length > 0) {
            checkMissedBookings();
        }

        // Set up interval to check every 5 minutes (300000 ms)
        const interval = setInterval(checkMissedBookings, 300000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [allBookings]);

    // Filter options
    const specializations = [
        { value: 'all', label: 'Tất cả chuyên môn' },
        { value: 'Chuyên gia phòng ngừa', label: 'Chuyên gia phòng ngừa' },
        { value: 'Tư vấn & Trị liệu', label: 'Tư vấn & Trị liệu' },
        { value: 'Tiếp cận cộng đồng', label: 'Tiếp cận cộng đồng' },
        { value: 'Tâm lý học lâm sàng', label: 'Tâm lý học lâm sàng' },
        { value: 'Phục hồi chức năng', label: 'Phục hồi chức năng' }
    ];

    const daysOfWeek = [
        { value: 'all', label: 'Tất cả các ngày' },
        { value: 'Monday', label: 'Thứ Hai' },
        { value: 'Tuesday', label: 'Thứ Ba' },
        { value: 'Wednesday', label: 'Thứ Tư' },
        { value: 'Thursday', label: 'Thứ Năm' },
        { value: 'Friday', label: 'Thứ Sáu' },
        { value: 'Saturday', label: 'Thứ Bảy' },
        { value: 'Sunday', label: 'Chủ Nhật' }
    ];

    const timeSlots = [
        { value: 'all', label: 'Tất cả khung giờ' },
        { value: 'morning', label: 'Buổi sáng (6:00 - 12:00)' },
        { value: 'afternoon', label: 'Buổi chiều (12:00 - 18:00)' },
        { value: 'evening', label: 'Buổi tối (18:00 - 22:00)' }
    ];

    // Filter consultants
    const isTimeInSlot = (timeString, timeSlotFilter) => {
        if (timeSlotFilter === 'all') return true;
        if (!timeString) return false;
        try {
            const time = new Date(`2000-01-01T${timeString}`);
            const hours = time.getHours();
            switch (timeSlotFilter) {
                case 'morning': return hours >= 6 && hours < 12;
                case 'afternoon': return hours >= 12 && hours < 18;
                case 'evening': return hours >= 18 && hours < 22;
                default: return true;
            }
        } catch (error) {
            return false;
        }
    };

    const filteredConsultants = consultants.filter(consultant => {
        // Compare directly with the Vietnamese speciality value from database
        const matchesSpecialization = selectedSpecialization === 'all' || consultant.speciality === selectedSpecialization;
        
        let matchesDayOfWeek = selectedDayOfWeek === 'all';
        if (!matchesDayOfWeek && consultant.available_slots) {
            matchesDayOfWeek = consultant.available_slots.some(slot => slot.day_of_week === selectedDayOfWeek);
        }
        
        let matchesTimeSlot = selectedTimeSlot === 'all';
        if (!matchesTimeSlot && consultant.available_slots) {
            matchesTimeSlot = consultant.available_slots.some(slot => 
                isTimeInSlot(slot.start_time, selectedTimeSlot)
            );
        }
        
        return matchesSpecialization && matchesDayOfWeek && matchesTimeSlot;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Đang chờ xác nhận':
                return { 
                    label: 'Đang chờ xác nhận', 
                    class: 'status-pending',
                    backgroundColor: '#ffc107',
                    color: '#000'
                };
            case 'Xác nhận thành công':
                return { 
                    label: 'Xác nhận thành công', 
                    class: 'status-confirmed',
                    backgroundColor: '#28a745',
                    color: '#fff'
                };
            case 'confirmed':
                return { 
                    label: 'Xác nhận thành công', 
                    class: 'status-confirmed',
                    backgroundColor: '#28a745',
                    color: '#fff'
                };
            case 'pending':
                return { 
                    label: 'Đang chờ', 
                    class: 'status-pending',
                    backgroundColor: '#ffc107',
                    color: '#000'
                };
            case 'Đã hủy':
                return { 
                    label: 'Đã hủy', 
                    class: 'status-cancelled',
                    backgroundColor: '#dc3545',
                    color: '#fff'
                };
            case 'Hoàn thành':
                return { 
                    label: 'Hoàn thành', 
                    class: 'status-completed',
                    backgroundColor: '#17a2b8',
                    color: '#fff'
                };
            case 'cancelled':
                return { 
                    label: 'Đã hủy', 
                    class: 'status-cancelled',
                    backgroundColor: '#dc3545',
                    color: '#fff'
                };
            case 'completed':
                return { 
                    label: 'Hoàn thành', 
                    class: 'status-completed',
                    backgroundColor: '#17a2b8',
                    color: '#fff'
                };
            default:
                return { 
                    label: status, 
                    class: 'status-default',
                    backgroundColor: '#6c757d',
                    color: '#fff'
                };
        }
    };

    if (loading) {
        return (
            <div className="booking-page" style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '80px' }}>
                <div className="container text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <div className="container-fluid" style={{ padding: '2rem 1rem', backgroundColor: '#ffffff', padding:'200px', paddingTop:'100px' }}>
                
                {/* Booking Sessions Table Section */}
                <section className="booking-sessions-section mb-4">
                    <div className="card" style={{ border: '0.5px solid #e0e0e0', borderRadius: '8px' }}>
                        <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e0e0e0' }}>
                            <div>
                                <h4 className="mb-2" style={{ fontWeight: '600', color: '#333' }}>Lịch tư vấn của bạn</h4>
                                <div className="d-flex align-items-center" style={{ fontSize: '0.85rem', color: '#666' }}>
                                    <div className="d-flex align-items-center me-3">
                                        <div style={{ 
                                            width: '12px', 
                                            height: '12px', 
                                            backgroundColor: '#e3f2fd', 
                                            border: '2px solid #2196f3', 
                                            borderRadius: '3px',
                                            marginRight: '6px'
                                        }}></div>
                                        <span>Hôm nay</span>
                                    </div>
                                    <small className="text-muted">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Hệ thống tự động hủy lịch hẹn chưa xác nhận sau giờ kết thúc
                                    </small>
                                </div>
                            </div>
                            <div className="booking-toggle-buttons">
                                <button
                                    className={`btn btn-sm ${showAllBookings ? 'btn-outline-primary' : 'btn-primary'} me-2`}
                                    onClick={() => setShowAllBookings(false)}
                                    style={{ borderRadius: '6px', padding: '0.5rem 1rem' }}
                                >
                                    Đang hoạt động ({scheduledBookings.length})
                                </button>
                                <button
                                    className={`btn btn-sm ${showAllBookings ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setShowAllBookings(true)}
                                    style={{ borderRadius: '6px', padding: '0.5rem 1rem' }}
                                >
                                    Tất cả ({allBookings.length})
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0" style={{ backgroundColor: '#ffffff' }}>
                            {loadingBookings ? (
                                <div className="text-center py-5" style={{ margin: '2rem 0' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Đang tải lịch hẹn...</p>
                                </div>
                            ) : (showAllBookings ? allBookings : scheduledBookings).length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ backgroundColor: '#ffffff' }}>
                                        <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Trạng thái</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Thông tin tư vấn viên</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Ngày & Giờ hẹn</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Google Meet Link</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                            {(showAllBookings ? allBookings : scheduledBookings).map((booking) => {
                                const consultant = consultants.find(c => c.id_consultant === booking.consultant_id);
                                const slot = databaseSlots.find(s => s.slot_id === booking.slot_id);
                                const statusInfo = getStatusInfo(booking.status);

                                return (
                                                    <tr key={booking.id || booking.booking_id} style={getBookingRowStyle(booking)}>
                                                        <td style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                            <span 
                                                                className={`badge ${statusInfo.class}`} 
                                                                style={{ 
                                                                    padding: '0.5rem 0.75rem', 
                                                                    borderRadius: '6px',
                                                                    backgroundColor: statusInfo.backgroundColor,
                                                                    color: statusInfo.color,
                                                                    fontWeight: '600',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                {statusInfo.label}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={consultant?.img_link ? `http://localhost:3000${consultant.img_link}` : Image}
                                                                    alt={consultant?.name || 'Tư vấn viên'}
                                                                    className="rounded-circle me-3"
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', border: '2px solid #f0f0f0' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = Image;
                                                    }}
                                                />
                                                                <div>
                                                                    <div className="fw-bold" style={{ color: '#333', fontSize: '0.9rem' }}>
                                                                        {consultant?.name || booking.consultant_name || 'Tư vấn viên'}
                                            </div>
                                                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                                        {getSpecializationFromSpeciality(consultant?.speciality)}
                                                                    </small>
                                            </div>
                                            </div>
                                                        </td>
                                                                                                                <td style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                            <div>
                                                                <div className="fw-bold" style={{ color: '#333', fontSize: '0.9rem' }}>
                                                                    {formatBookingDate(booking.booking_date)}
                                        </div>
                                                                <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                                    {getSlotTimeRange(booking.slot_id)}
                                                                </small>
                                                </div>
                                                        </td>
                                                        <td style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                            {booking.google_meet_link ? (
                                                                isMeetingTimeAvailable(booking) ? (
                                                                    <a
                                                                        href={booking.google_meet_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm btn-success"
                                                                        style={{ borderRadius: '6px', padding: '0.5rem 1rem' }}
                                                                    >
                                                                        <i className="bi bi-camera-video me-1"></i>
                                                                        Tham gia
                                                                    </a>
                                                                ) : (
                                                                    (() => {
                                                                        const buttonInfo = getDisabledButtonInfo(booking);
                                                                        return (
                                                                            <button
                                                                                className={buttonInfo.className}
                                                                                disabled
                                                                                style={{ 
                                                                                    borderRadius: '6px', 
                                                                                    padding: '0.5rem 1rem',
                                                                                    cursor: 'not-allowed',
                                                                                    opacity: 0.6
                                                                                }}
                                                                                title={buttonInfo.tooltip}
                                                                            >
                                                                                <i className="bi bi-camera-video me-1"></i>
                                                                                {buttonInfo.text}
                                                                            </button>
                                                                        );
                                                                    })()
                                                                )
                                                            ) : (
                                                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>Chưa có link</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleViewNote(booking)}
                                                                style={{ borderRadius: '6px', padding: '0.5rem 1rem' }}
                                                            >
                                                                <i className="bi bi-eye me-1"></i>
                                                                Xem ghi chú
                                                    </button>
                                                        </td>
                                                    </tr>
                                );
                            })}
                                        </tbody>
                                    </table>
                        </div>
                            ) : (
                                <div className="text-center py-5" style={{ margin: '3rem 0', backgroundColor: '#ffffff' }}>
                                    <i className="bi bi-calendar-x display-4 text-muted mb-3"></i>
                                    <h5 style={{ color: '#666', fontWeight: '600' }}>Không có lịch hẹn nào</h5>
                                    <p className="text-muted" style={{ fontSize: '0.95rem' }}>Bạn chưa có lịch hẹn tư vấn nào. Hãy đặt lịch với các chuyên gia bên dưới.</p>
                        </div>
                            )}
                            </div>
                        </div>
                    </section>

                {/* Consultant List Section */}
                <section className="consultant-list-section">
                    <div className="card shadow-sm" style={{ border: '0.5px solid #e0e0e0', borderRadius: '8px' }}>
                        <div className="card-header bg-white" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e0e0e0' }}>
                            <h4 className="mb-0" style={{ fontWeight: '600', color: '#333' }}>Danh sách tư vấn viên</h4>
                    </div>
                        <div className="card-body" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                            <div className="row g-4">
                                {/* Filter Sidebar */}
                                <div className="col-lg-3 col-md-4">
                                    <div className="filter-sidebar" style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '0.5px solid #e0e0e0' }}>
                                        <h6 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1rem' }}>Bộ lọc tìm kiếm</h6>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold" style={{ color: '#555', fontSize: '0.9rem' }}>Chuyên môn</label>
                                <select
                                                className="form-select"
                                    value={selectedSpecialization}
                                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                                                style={{ borderRadius: '6px', border: '1px solid #ddd', padding: '0.75rem' }}
                                >
                                    {specializations.map(spec => (
                                        <option key={spec.value} value={spec.value}>{spec.label}</option>
                                    ))}
                                </select>
                            </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold" style={{ color: '#555', fontSize: '0.9rem' }}>Thứ trong tuần</label>
                                <select
                                                className="form-select"
                                    value={selectedDayOfWeek}
                                    onChange={(e) => setSelectedDayOfWeek(e.target.value)}
                                                style={{ borderRadius: '6px', border: '1px solid #ddd', padding: '0.75rem' }}
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day.value} value={day.value}>{day.label}</option>
                                    ))}
                                </select>
                            </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold" style={{ color: '#555', fontSize: '0.9rem' }}>Khung giờ</label>
                                <select
                                                className="form-select"
                                    value={selectedTimeSlot}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                                style={{ borderRadius: '6px', border: '1px solid #ddd', padding: '0.75rem' }}
                                >
                                    {timeSlots.map(slot => (
                                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                                    ))}
                                </select>
                            </div>

                                        <button
                                            className="btn btn-outline-secondary w-100"
                                            onClick={() => {
                                                setSelectedSpecialization('all');
                                                setSelectedDayOfWeek('all');
                                                setSelectedTimeSlot('all');
                                            }}
                                            style={{ borderRadius: '6px', padding: '0.75rem', marginTop: '0.5rem' }}
                                        >
                                            <i className="bi bi-arrow-clockwise me-2"></i>
                                            Xóa bộ lọc
                                        </button>
                        </div>
                    </div>

                                {/* Consultant Cards */}
                                <div className="col-lg-9 col-md-8">
                                    <div className="consultant-results">
                                        <div className="d-flex justify-content-between align-items-center mb-4" style={{ padding: '0 0.25rem' }}>
                                            <span className="text-muted" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                                                Tìm thấy {filteredConsultants.length} tư vấn viên
                                            </span>
                    </div>

                                                                {filteredConsultants.length > 0 ? (
                            <div className="consultant-cards-list">
                        {filteredConsultants.map((consultant) => (
                                    <div key={consultant.id_consultant} className="consultant-card-full-width mb-3">
                                        <div className="card" style={{ 
                                            border: '0.5px solid #e0e0e0', 
                                            borderRadius: '8px', 
                                            backgroundColor: '#ffffff',
                                            width: '100%'
                                        }}>
                                            <div className="card-body" style={{ padding: '1.5rem' }}>
                                                <div className="row align-items-center">
                                                    
                                                    {/* Left: Icon/Image */}
                                                    <div className="col-auto">
                                                        <div className="consultant-avatar">
                                            <img
                                                src={consultant.img_link ? `http://localhost:3000${consultant.img_link}` : Image}
                                                alt={consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}
                                                                className="rounded-circle"
                                                                style={{ 
                                                                    width: '80px', 
                                                                    height: '80px', 
                                                                    objectFit: 'cover', 
                                                                    border: '3px solid #f0f0f0' 
                                                                }}
                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = Image;
                                                }}
                                            />
                                        </div>
                                                    </div>

                                                    {/* Middle: Name, Certification, Bios */}
                                                    <div className="col">
                                        <div className="consultant-info">
                                                            {/* Name */}
                                                            <h5 className="consultant-name mb-2" style={{ 
                                                                fontWeight: '600', 
                                                                color: '#333', 
                                                                fontSize: '1.2rem',
                                                                marginBottom: '0.5rem !important'
                                                            }}>
                                                                {consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}
                                                            </h5>

                                                            {/* Certification */}
                                                            <div className="consultant-certification mb-2">
                                                                <small className="text-muted d-block mb-1" style={{ 
                                                                    fontSize: '0.85rem', 
                                                                    fontWeight: '500',
                                                                    color: '#555'
                                                                }}>
                                                                    <i className="bi bi-award me-1"></i>
                                                                    Chứng chỉ:
                                                                </small>
                                                                <span style={{ 
                                                                    fontSize: '0.9rem', 
                                                                    color: '#666',
                                                                    backgroundColor: '#f8f9fa',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #e9ecef'
                                                                }}>
                                                                    {consultant.certification !== 'N/A' && consultant.certification ? 
                                                                        consultant.certification : 'Chưa cập nhật'}
                                                                </span>
                                    </div>

                                                            {/* Bios */}
                                                            <div className="consultant-bio">
                                                                <small className="text-muted d-block mb-1" style={{ 
                                                                    fontSize: '0.85rem', 
                                                                    fontWeight: '500',
                                                                    color: '#555'
                                                                }}>
                                                                    <i className="bi bi-person-lines-fill me-1"></i>
                                                                    Giới thiệu:
                                                                </small>
                                                                <p style={{ 
                                                                    fontSize: '0.9rem', 
                                                                    lineHeight: '1.4', 
                                                                    color: '#666',
                                                                    marginBottom: '0.5rem'
                                                                }}>
                                            {(() => {
                                                if (!consultant.bio_json || consultant.bio_json === 'N/A') {
                                                                            return 'Chưa có thông tin giới thiệu';
                                                }
                                                try {
                                                    const bioData = typeof consultant.bio_json === 'string'
                                                        ? JSON.parse(consultant.bio_json)
                                                        : consultant.bio_json;
                                                    const bioContent = bioData?.bio || bioData?.description || bioData?.content;
                                                    if (!bioContent || bioContent.trim() === '' || bioContent === 'N/A') {
                                                                                return 'Chưa có thông tin giới thiệu';
                                                    }
                                                                            return bioContent.length > 120 ? bioContent.substring(0, 120) + '...' : bioContent;
                                                } catch (error) {
                                                    const plainText = consultant.bio_json.trim();
                                                    if (plainText.startsWith('{') && plainText.includes('"')) {
                                                                                return 'Chưa có thông tin giới thiệu';
                                                    }
                                                                            return plainText !== '' ? (plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText) : 'Chưa có thông tin giới thiệu';
                                                }
                                            })()}
                                        </p>

                                                                {/* Specialization */}
                                                                <span className="badge bg-primary" style={{ 
                                                                    fontSize: '0.75rem',
                                                                    padding: '0.4rem 0.8rem'
                                                                }}>
                                                                    {getSpecializationFromSpeciality(consultant.speciality)}
                                            </span>
                                        </div>
                                                        </div>
                                            </div>
                                            
                                                    {/* Right: Days of week with slots */}
                                                    <div className="col-md-4">
                                                        <div className="consultant-schedule">
                                                            <h6 className="schedule-title mb-3" style={{ 
                                                                fontWeight: '600', 
                                                                color: '#333',
                                                                fontSize: '1rem'
                                                            }}>
                                                                <i className="bi bi-calendar3 me-2"></i>
                                                                Lịch làm việc
                                                            </h6>
                                                            
                                                            {consultant.available_slots && consultant.available_slots.length > 0 ? (
                                                                <div className="schedule-calendar" style={{
                                                                    maxHeight: '280px',
                                                                    overflowY: 'auto',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '8px',
                                                                    padding: '1rem',
                                                                    border: '1px solid #e9ecef'
                                                                }}>
                                                            {(() => {
                                                                        // Group slots by day and sort by day order
                                                                const groupedSlots = consultant.available_slots.reduce((acc, slot) => {
                                                                    if (!acc[slot.day_of_week]) {
                                                                        acc[slot.day_of_week] = [];
                                                                    }
                                                                    acc[slot.day_of_week].push(slot);
                                                                    return acc;
                                                                }, {});

                                                                        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                                                        const dayLabels = {
                                                                    'Monday': 'T2',
                                                                    'Tuesday': 'T3',
                                                                    'Wednesday': 'T4',
                                                                    'Thursday': 'T5',
                                                                    'Friday': 'T6',
                                                                    'Saturday': 'T7',
                                                                    'Sunday': 'CN'
                                                                };

                                                                        return dayOrder
                                                                            .filter(day => groupedSlots[day])
                                                                            .map(day => {
                                                                                const daySlots = groupedSlots[day];
                                                                                const sortedSlots = daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
                                                                                
                                                                                return (
                                                                                    <div key={day} className="schedule-day-compact mb-3" style={{
                                                                                        backgroundColor: '#ffffff',
                                                                                        borderRadius: '6px',
                                                                                        padding: '0.75rem',
                                                                                        border: '1px solid #dee2e6',
                                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                                                    }}>
                                                                                        <div className="day-header d-flex align-items-center justify-content-between mb-2">
                                                                                            <span className="day-label" style={{ 
                                                                                                fontSize: '0.85rem', 
                                                                                                fontWeight: '700',
                                                                                                color: '#495057',
                                                                                                backgroundColor: '#e9ecef',
                                                                                                padding: '0.25rem 0.5rem',
                                                                                                borderRadius: '4px',
                                                                                                minWidth: '30px',
                                                                                                textAlign: 'center'
                                                                                            }}>
                                                                                                {dayLabels[day]}
                                                                        </span>
                                                                                            <span className="slots-count" style={{
                                                                                                fontSize: '0.7rem',
                                                                                                color: '#6c757d'
                                                                                            }}>
                                                                                                {sortedSlots.length} slot{sortedSlots.length > 1 ? 's' : ''}
                                                                            </span>
                                                                    </div>
                                                                                        <div className="time-slots-grid" style={{
                                                                                            display: 'grid',
                                                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                                                                                            gap: '0.4rem'
                                                                                        }}>
                                                                                            {sortedSlots.slice(0, 6).map((slot, index) => (
                                                                                                <div 
                                                                                                    key={index}
                                                                                                    className="time-slot-compact"
                                                                                                    style={{ 
                                                                                                        fontSize: '0.7rem',
                                                                                                        padding: '0.35rem 0.25rem',
                                                                                                        backgroundColor: '#007bff',
                                                                                                        color: '#ffffff',
                                                                                                        borderRadius: '4px',
                                                                                                        textAlign: 'center',
                                                                                                        fontWeight: '500',
                                                                                                        border: '1px solid #0056b3'
                                                                                                    }}
                                                                                                >
                                                                                                    {formatTime(slot.start_time)}
                                                        </div>
                                                                                            ))}
                                                                                            {sortedSlots.length > 6 && (
                                                                                                <div 
                                                                                                    className="more-slots-indicator"
                                                                                                    style={{ 
                                                                                                        fontSize: '0.7rem',
                                                                                                        padding: '0.35rem 0.25rem',
                                                                                                        backgroundColor: '#6c757d',
                                                                                                        color: '#ffffff',
                                                                                                        borderRadius: '4px',
                                                                                                        textAlign: 'center',
                                                                                                        fontWeight: '500',
                                                                                                        border: '1px solid #545b62'
                                                                                                    }}
                                                                                                    title={`${sortedSlots.length - 6} more slots: ${sortedSlots.slice(6).map(s => formatTime(s.start_time)).join(', ')}`}
                                                                                                >
                                                                                                    +{sortedSlots.length - 6}
                                                                    </div>
                                            )}
                                                        </div>
                                                    </div>
                                                                                );
                                                                            });
                                                                    })()}
                                                </div>
                                                            ) : (
                                                                <div className="no-schedule text-muted" style={{ 
                                                                    fontSize: '0.9rem',
                                                                    textAlign: 'center',
                                                                    padding: '2rem 1rem',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e9ecef'
                                                                }}>
                                                                    <i className="bi bi-calendar-x mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
                                                                    Chưa thiết lập lịch làm việc
                                        </div>
                                                            )}

                                                            {/* Action Button */}
                                                            <div className="mt-3 pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <button
                                                onClick={() => handleViewProfile(consultant.id_consultant)}
                                                                    className="btn btn-primary w-100"
                                                                    style={{ 
                                                                        borderRadius: '6px', 
                                                                        padding: '0.6rem 1rem',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '500'
                                                                    }}
                                            >
                                                <i className="bi bi-person me-2"></i>
                                                                    Xem hồ sơ & Đặt lịch
                                            </button>
                                                                
                                                                <div className="mt-2 text-center">
                                                                    <small className="text-success" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                                                                        <i className="bi bi-camera-video me-1"></i>
                                                                        {consultant.google_meet_link !== 'N/A' && consultant.google_meet_link ? 
                                                                            'Google Meet có sẵn' : 'Link Meet chưa thiết lập'}
                                                                    </small>
                                        </div>
                                    </div>
                                </div>
                    </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                                        ) : (
                                            <div className="no-results text-center py-5" style={{ backgroundColor: '#ffffff', margin: '2rem 0', padding: '3rem 1rem' }}>
                                <i className="bi bi-search display-4 text-muted mb-3"></i>
                                                <h5 style={{ color: '#666', fontWeight: '600' }}>Không tìm thấy tư vấn viên</h5>
                                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Hãy thử điều chỉnh bộ lọc để xem thêm tùy chọn.</p>
                        </div>
                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Note Modal */}
            {showNoteModal && selectedNoteBooking && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Ghi chú cuộc hẹn</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowNoteModal(false)}
                                ></button>
                                        </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <strong>Ngày hẹn:</strong> {formatBookingDate(selectedNoteBooking.booking_date)}
                                    </div>
                                <div className="mb-3">
                                    <strong>Trạng thái:</strong> {getStatusInfo(selectedNoteBooking.status).label}
                                        </div>
                                <div className="mb-3">
                                    <strong>Ghi chú:</strong>
                                    <div className="mt-2 p-3 bg-light rounded">
                                        {selectedNoteBooking.notes || 'Không có ghi chú'}
                                    </div>
                                        </div>
                                    </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNoteModal(false)}
                                >
                                    Đóng
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>
            )}
        </div>
    );
};

export default BookingPage;