import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/BookingPage.scss';
import Image from '../images/Images.jpg';

const BookingPage = () => {
    const navigate = useNavigate();
    const [selectedSpecialization, setSelectedSpecialization] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [scheduledBookings, setScheduledBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    // Các slot dựa trên database sample.sql (9 AM - 5 PM theo giờ)
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

    // Hàm gọi API để lấy tất cả consultants
    const fetchAllConsultants = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/consultants', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy danh sách tư vấn viên');
            }

            return data.data.consultants;
        } catch (error) {
            throw error;
        }
    };

    // Chuyển đổi dữ liệu API sang định dạng component dựa trên cấu trúc controller đã cập nhật
    const transformConsultantsArray = (apiConsultants) => {
        if (!apiConsultants || !Array.isArray(apiConsultants)) return [];

        return apiConsultants.map(apiConsultant => {
            return {
                // Các trường bảng Consultant
                id_consultant: apiConsultant.id_consultant || 'N/A',
                cost: apiConsultant.cost || 'N/A',
                certification: apiConsultant.certification || 'N/A',
                speciality: apiConsultant.speciality || 'N/A',

                // Các trường bảng Users
                user_id: apiConsultant.user_id || 'N/A',
                date_create: apiConsultant.date_create || 'N/A',
                role: apiConsultant.role || 'N/A',
                email: apiConsultant.email || 'N/A',
                status: apiConsultant.status || 'N/A',
                img_link: apiConsultant.img_link || null,

                // Các trường bảng Profile
                name: apiConsultant.name || 'N/A',
                bio_json: apiConsultant.bio_json || 'N/A',
                date_of_birth: apiConsultant.date_of_birth || 'N/A',
                job: apiConsultant.job || 'N/A'
            };
        });
    };

    // Lấy chuyên môn từ trường speciality (không cần parse bios nữa)
    const getSpecializationFromSpeciality = (speciality) => {
        if (!speciality || speciality === 'N/A') return 'Tư vấn tổng quát';
        return speciality;
    };

    // Định dạng thời gian từ định dạng thời gian API
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
            return timeString; // Trả về gốc nếu parse thất bại
        }
    };

    // Tạo cấu trúc dữ liệu booking dựa trên database schema
    const createBookingData = (consultantId, slotId, selectedDate) => {
        return {
            consultant_id: consultantId,
            member_id: null, // Sẽ được set khi hệ thống xác thực người dùng được implement
            slot_id: slotId,
            booking_date: selectedDate,
            status: 'pending',
            notes: 'Đặt lịch tư vấn qua ứng dụng web'
        };
    };

    // Lấy danh sách lịch hẹn đã lên lịch
    const fetchScheduledBookings = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/booking-sessions/scheduled', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });

            const data = await response.json();
            console.log('Dữ liệu booking lấy về:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy danh sách lịch hẹn đã lên lịch');
            }

            return data.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách lịch hẹn đã lên lịch:', error);
            return [];
        }
    };

    // Load dữ liệu consultants và scheduled bookings
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
                setScheduledBookings(bookings);
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

    // Hàm kiểm tra đăng nhập
    const checkLoginStatus = () => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('authToken');
        return !!token;
    };

    // Hàm xử lý khi click vào nút "Xem hồ sơ"
    const handleViewProfile = (consultantId) => {
        if (!checkLoginStatus()) {
            // Lưu đường dẫn đích để redirect sau khi login
            sessionStorage.setItem('redirectAfterLogin', `/consultant/${consultantId}`);

            // Hiển thị cảnh báo và chuyển hướng
            alert('Vui lòng đăng nhập để xem hồ sơ tư vấn viên');
            navigate('/login');
            return;
        }

        // Nếu đã đăng nhập, chuyển hướng trực tiếp
        navigate(`/consultant/${consultantId}`);
    };

    const bookConsultation = (consultantId, slotId) => {
        // Kiểm tra trạng thái xác thực (placeholder cho đến khi hệ thống auth được implement)
        const isLoggedIn = localStorage.getItem('authToken') || false;

        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để đặt lịch tư vấn');
            return;
        }

        if (!selectedDate) {
            alert('Vui lòng chọn ngày cho buổi tư vấn của bạn');
            return;
        }

        // Tìm dữ liệu consultant và slot
        const consultant = consultants.find(c => c.id_consultant === consultantId);
        const slot = databaseSlots.find(s => s.slot_id === slotId);

        if (consultant && slot) {
            const consultantName = consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên';
            setBookingStatus({
                type: 'success',
                message: `Yêu cầu tư vấn đã được gửi cho ${consultantName} vào ngày ${selectedDate} lúc ${formatTime(slot.start_time)}. Trạng thái: Đang chờ phê duyệt.`
            });

            // Tạo cấu trúc dữ liệu booking cho việc implement API trong tương lai
            const bookingData = createBookingData(consultantId, slotId, selectedDate);
            console.log('Dữ liệu booking đã chuẩn bị:', bookingData);
        } else {
            setBookingStatus({
                type: 'error',
                message: 'Không thể gửi yêu cầu tư vấn. Vui lòng thử lại.'
            });
        }
    };

    const specializations = [
        { value: 'all', label: 'Tất cả chuyên môn' },
        { value: 'Prevention Specialist', label: 'Chuyên gia phòng ngừa' },
        { value: 'Counseling & Therapy', label: 'Tư vấn & Trị liệu' },
        { value: 'Community Outreach', label: 'Tiếp cận cộng đồng' },
        { value: 'Clinical Psychology', label: 'Tâm lý học lâm sàng' },
        { value: 'Rehabilitation', label: 'Phục hồi chức năng' }
    ];

    const filteredConsultants = consultants.filter(consultant => {
        const specialization = getSpecializationFromSpeciality(consultant.speciality);
        return selectedSpecialization === 'all' || specialization === selectedSpecialization;
    });

    if (loading) {
        return (
            <div className="booking-page">
                <div className="container text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải danh sách tư vấn viên...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            {/* Phần Hero */}
            <section className="booking-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12 text-center">
                            <h1 className="hero-title">
                                Đặt lịch tư vấn
                            </h1>
                            <p className="hero-subtitle">
                                Kết nối với các chuyên gia giàu kinh nghiệm của chúng tôi để được hướng dẫn và hỗ trợ cá nhân hóa.
                                Tất cả các buổi tư vấn đều miễn phí và hoàn toàn bảo mật.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                {/* Phần lịch hẹn đã lên lịch */}
                <section className="scheduled-bookings mb-5">
                    <div className="section-header text-center mb-4">
                        <h2 className="section-title">Lịch tư vấn đã đặt của bạn</h2>
                    </div>
                    {loadingBookings ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-2">Đang tải lịch hẹn...</p>
                        </div>
                    ) : scheduledBookings && scheduledBookings.length > 0 ? (
                        <div className="scheduled-bookings-container">
                            {scheduledBookings.map((booking) => {
                                const consultant = consultants.find(c => c.id_consultant === booking.consultant_id);
                                const slot = databaseSlots.find(s => s.slot_id === booking.slot_id);
                                const hasMeetLink = !!booking.google_meet_link;
                                const statusClass = booking.status === 'confirmed' ? 'status-confirmed' :
                                    booking.status === 'pending' ? 'status-pending' :
                                        booking.status === 'cancelled' ? 'status-cancelled' : 'status-default';

                                return (
                                    <div key={booking.id || booking.booking_id} className="booking-card">
                                        <div className="booking-card-header">
                                            <div className="consultant-avatar">
                                                <img
                                                    src={consultant && consultant.img_link ? `http://localhost:3000${consultant.img_link}` : Image}
                                                    alt={consultant ? consultant.name : (booking.consultant_name || 'Tư vấn viên')}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = Image;
                                                    }}
                                                />
                                            </div>
                                            <div className="booking-info">
                                                <h5 className="consultant-name">
                                                    {consultant ? consultant.name : (booking.consultant_name || 'Tư vấn viên')}
                                                </h5>
                                                <p className="consultant-speciality">
                                                    {consultant ? getSpecializationFromSpeciality(consultant.speciality) : 'Tư vấn viên chuyên nghiệp'}
                                                </p>
                                            </div>
                                            <div className={`booking-status ${statusClass}`}>
                                                {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                                    booking.status === 'pending' ? 'Đang chờ' :
                                                        booking.status === 'cancelled' ? 'Đã hủy' : booking.status}
                                            </div>
                                        </div>
                                        <div className="booking-card-body">
                                            <div className="booking-details">
                                                <div className="booking-detail-item">
                                                    <i className="bi bi-calendar-date"></i>
                                                    <span>{booking.booking_date}</span>
                                                </div>
                                                <div className="booking-detail-item">
                                                    <i className="bi bi-clock"></i>
                                                    <span>{slot ? formatTime(slot.start_time) : (booking.start_time ? formatTime(booking.start_time) : 'N/A')}</span>
                                                </div>
                                            </div>
                                            <div className="booking-actions">
                                                {hasMeetLink ? (
                                                    <a
                                                        href={booking.google_meet_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-meet"
                                                    >
                                                        <i className="bi bi-camera-video-fill me-2"></i>
                                                        Vào Google Meet
                                                    </a>
                                                ) : (
                                                    <button className="btn-meet disabled" disabled>
                                                        <i className="bi bi-camera-video me-2"></i>
                                                        Chưa có link
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-bookings">
                            <div className="no-bookings-icon">
                                <i className="bi bi-calendar-x"></i>
                            </div>
                            <h4>Bạn chưa có lịch hẹn nào</h4>
                            <p>Hãy đặt lịch với các chuyên gia của chúng tôi để được tư vấn.</p>
                        </div>
                    )}
                </section>

                {/* Thông báo trạng thái đặt lịch */}
                {bookingStatus && (
                    <div className={`alert alert-${bookingStatus.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                        {bookingStatus.message}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setBookingStatus(null)}
                        ></button>
                    </div>
                )}

                {/* Phần bộ lọc */}
                <section className="filter-section mb-5">
                    <div className="section-header text-center mb-4">
                        <h2 className="section-title">Tìm chuyên gia của bạn</h2>
                        <p className="section-subtitle">Lọc theo chuyên môn và lịch trống để tìm tư vấn viên phù hợp</p>
                    </div>

                    <div className="filter-controls">
                        <div className="row justify-content-center">
                            <div className="col-lg-3 col-md-6 mb-3">
                                <label className="filter-label">Chuyên môn</label>
                                <select
                                    className="form-select filter-select"
                                    value={selectedSpecialization}
                                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                                >
                                    {specializations.map(spec => (
                                        <option key={spec.value} value={spec.value}>{spec.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                                <label className="filter-label">Chọn ngày</label>
                                <input
                                    type="date"
                                    className="form-control filter-select"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Lưới tư vấn viên */}
                <section className="consultants-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Các chuyên gia của chúng tôi</h2>
                        <p className="section-subtitle">
                            {filteredConsultants.length} tư vấn viên có sẵn
                        </p>
                    </div>

                    <div className="row">
                        {filteredConsultants.map((consultant) => (
                            <div key={consultant.id_consultant} className="col-lg-6 col-md-6 mb-4">
                                <div className="consultant-card">
                                    <div className="consultant-header">
                                        <div className="consultant-image">
                                            <img
                                                src={consultant.img_link ? `http://localhost:3000${consultant.img_link}` : Image}
                                                alt={consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}
                                                className="img-fluid"
                                                onError={(e) => {
                                                    e.target.onerror = null; // Ngăn vòng lặp vô hạn
                                                    e.target.src = Image; // Fallback về ảnh mặc định
                                                }}
                                            />
                                        </div>
                                        <div className="consultant-info">
                                            <h4 className="consultant-name">{consultant.name !== 'N/A' ? consultant.name : 'N/A'}</h4>
                                            <p className="consultant-title">{consultant.job !== 'N/A' ? consultant.job : 'N/A'}</p>
                                            <p className="consultant-specialization">
                                                <i className="bi bi-award me-2"></i>
                                                {getSpecializationFromSpeciality(consultant.speciality)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="consultant-body">
                                        <p className="consultant-description">
                                            {consultant.bio_json !== 'N/A' ? (() => {
                                                try {
                                                    const bioData = typeof consultant.bio_json === 'string'
                                                        ? JSON.parse(consultant.bio_json)
                                                        : consultant.bio_json;
                                                    return bioData?.bio || consultant.bio_json;
                                                } catch (error) {
                                                    return consultant.bio_json;
                                                }
                                            })() : 'Không có tiểu sử'}
                                        </p>

                                        <div className="consultant-qualifications">
                                            {consultant.certification !== 'N/A' && (
                                                <span className="qualification-badge">
                                                    {consultant.certification}
                                                </span>
                                            )}
                                            <span className="qualification-badge">
                                                Chuyên gia có giấy phép
                                            </span>
                                        </div>

                                        <div className="consultant-details">
                                            <div className="detail-item" style={{ padding: '10px 0', marginBottom: '15px' }}>
                                                <i className="bi bi-currency-dollar me-2"></i>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                                                    {consultant.cost !== 'N/A' ? `${Number(consultant.cost).toLocaleString('vi-VN')}VNĐ mỗi buổi` : 'Giá N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="consultant-footer">
                                            <button
                                                onClick={() => handleViewProfile(consultant.id_consultant)}
                                                className="btn btn-outline-primary"
                                            >
                                                <i className="bi bi-person me-2"></i>
                                                Xem hồ sơ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredConsultants.length === 0 && (
                        <div className="no-results">
                            <div className="text-center">
                                <i className="bi bi-search display-4 text-muted mb-3"></i>
                                <h4>Không tìm thấy tư vấn viên</h4>
                                <p className="text-muted">Hãy thử điều chỉnh bộ lọc để xem thêm tùy chọn.</p>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                        setSelectedSpecialization('all');
                                    }}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Phần thông tin */}
                <section className="info-section">
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="info-card">
                                <h3 className="info-title">
                                    <i className="bi bi-shield-heart me-2"></i>
                                    Cách thức hoạt động
                                </h3>
                                <div className="row">
                                    <div className="col-md-4 text-center mb-3">
                                        <div className="step-icon">
                                            <i className="bi bi-1-circle-fill"></i>
                                        </div>
                                        <h5>Chọn chuyên gia</h5>
                                        <p>Chọn tư vấn viên dựa trên chuyên môn và lịch trống của họ.</p>
                                    </div>
                                    <div className="col-md-4 text-center mb-3">
                                        <div className="step-icon">
                                            <i className="bi bi-2-circle-fill"></i>
                                        </div>
                                        <h5>Đặt lịch</h5>
                                        <p>Chọn khung giờ và gửi yêu cầu tư vấn để được phê duyệt.</p>
                                    </div>
                                    <div className="col-md-4 text-center mb-3">
                                        <div className="step-icon">
                                            <i className="bi bi-3-circle-fill"></i>
                                        </div>
                                        <h5>Nhận hỗ trợ</h5>
                                        <p>Nhận hướng dẫn và hỗ trợ cá nhân hóa từ các chuyên gia giàu kinh nghiệm.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BookingPage;