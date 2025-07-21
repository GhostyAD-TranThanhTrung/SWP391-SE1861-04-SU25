import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BookingProfile.scss';
import Image from '../images/Images.jpg';
import BookingModal from '../components/BookingModal';

const BookingProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // API call function to get consultant by ID
    const fetchConsultant = async (consultantId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/consultants/${consultantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tải thông tin tư vấn viên');
            }

            return data.data;
        } catch (error) {
            throw error;
        }
    };

    // Transform API data to component format based on updated controller structure
    const transformConsultantData = (apiConsultant) => {
        if (!apiConsultant) return null;

        return {
            // Consultant table fields
            id_consultant: apiConsultant.id_consultant || 'N/A',
                google_meet_link: apiConsultant.google_meet_link || 'N/A',
            certification: apiConsultant.certification || 'N/A',
            speciality: apiConsultant.speciality || 'N/A',

            // Users table fields
            user_id: apiConsultant.user_id || 'N/A',
            date_create: apiConsultant.date_create || 'N/A',
            role: apiConsultant.role || 'N/A',
            email: apiConsultant.email || 'N/A',
            status: apiConsultant.status || 'N/A',
            img_link: apiConsultant.img_link || null,

            // Profile table fields
            name: apiConsultant.name || 'N/A',
            bio_json: apiConsultant.bio_json || 'N/A',
            date_of_birth: apiConsultant.date_of_birth || 'N/A',
            job: apiConsultant.job || 'N/A',

            // Slot information
            available_slots: apiConsultant.available_slots || []
        };
    };

    // Load consultant data on component mount
    useEffect(() => {
        const loadConsultant = async () => {
            try {
                setLoading(true);
                const apiConsultant = await fetchConsultant(id);
                const transformedConsultant = transformConsultantData(apiConsultant);
                setConsultant(transformedConsultant);
                setError(null);
            } catch (err) {
                setError(err.message);
                setConsultant(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadConsultant();
        }
    }, [id]);



    // Format specialization - now handles Vietnamese values from database
    const formatSpecialization = (speciality) => {
        if (!speciality || speciality === 'N/A') return 'Tư vấn chung';
        return speciality; // Return Vietnamese specialization as is
    };

    // Format Google Meet link display
    const formatMeetLink = (googleMeetLink) => {
        if (!googleMeetLink || googleMeetLink === 'N/A') return 'Chưa thiết lập';
        return 'Có sẵn';
    };

    // Format time from API time format
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



    // Thêm hàm xử lý đóng modal
    const handleCloseBookingModal = (success) => {
        setIsBookingModalOpen(false);
        if (success) {
            // Có thể thêm thông báo thành công ở đây
            alert('Đặt lịch thành công!');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="profile-error">
                <div className="container">
                    <div className="error-content">
                        <div className="error-icon">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                        <h2>Đang tải hồ sơ tư vấn viên</h2>
                        <p>Vui lòng chờ trong khi chúng tôi tải thông tin tư vấn viên...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error or consultant not found
    if (error || !consultant) {
        return (
            <div className="profile-error">
                <div className="container">
                    <div className="error-content">
                        <div className="error-icon">
                            <i className="bi bi-person-x"></i>
                        </div>
                        <h2>Không tìm thấy tư vấn viên</h2>
                        <p>{error || 'Tư vấn viên bạn đang tìm kiếm không tồn tại hoặc có thể đã bị xóa.'}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/booking')}>
                            <i className="bi bi-arrow-left me-2"></i>
                            Quay lại đặt lịch
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-profile-simple" style={{ 
            backgroundColor: '#ffffff', 
            minHeight: '100vh', 
            paddingTop: '80px' 
        }}>
            <div className="container" style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '2rem 1rem' 
            }}>
                
                {/* Main Content Layout */}
                <div className="row g-4">
                    
                    {/* Left Column: Consultant Info */}
                    <div className="col-lg-5 col-md-6">
                        <div className="consultant-info-card" style={{
                            border: '2px solid #e0e0e0',
                            borderRadius: '12px',
                            padding: '2rem',
                            backgroundColor: '#ffffff',
                            height: 'fit-content'
                        }}>
                            
                            {/* Icon/Image */}
                            <div className="consultant-image-section mb-4 text-center">
                                <img
                                    src={consultant.img_link ? `http://localhost:3000${consultant.img_link}` : Image}
                                    alt={consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        border: '3px solid #f0f0f0'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = Image;
                                    }}
                                />
                            </div>

                            {/* Name */}
                            <div className="consultant-name mb-3">
                                <h2 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '700', 
                                    color: '#333',
                                    marginBottom: '0.5rem',
                                    textAlign: 'center'
                                }}>
                                    {consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}
                                </h2>
                                    </div>

                            {/* Email */}
                            <div className="consultant-email mb-3">
                                <div style={{ 
                                    fontSize: '0.9rem', 
                                    color: '#666',
                                    textAlign: 'center'
                                }}>
                                    <i className="bi bi-envelope me-2"></i>
                                    <strong>Email:</strong> {consultant.email !== 'N/A' ? consultant.email : 'Chưa cập nhật'}
                                </div>
                            </div>

                            {/* Jobs */}
                            <div className="consultant-job mb-4">
                                <div style={{ 
                                    fontSize: '0.9rem', 
                                    color: '#666',
                                    textAlign: 'center'
                                }}>
                                    <i className="bi bi-briefcase me-2"></i>
                                    <strong>Nghề nghiệp:</strong> {consultant.job !== 'N/A' ? consultant.job : 'Tư vấn viên'}
                    </div>
                </div>

                            {/* Bios */}
                            <div className="consultant-bios mb-4" style={{
                                border: '2px dashed #ddd',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                backgroundColor: '#fafafa'
                            }}>
                                <h5 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '600', 
                                    color: '#333',
                                    marginBottom: '1rem'
                                }}>
                                    <i className="bi bi-person-lines-fill me-2"></i>
                                    Giới thiệu
                                </h5>
                                <p style={{ 
                                    fontSize: '0.9rem', 
                                    lineHeight: '1.6', 
                                    color: '#555',
                                    marginBottom: '0'
                                }}>
                                                {(() => {
                                                    if (!consultant.bio_json || consultant.bio_json === 'N/A') {
                                            return 'Chưa có thông tin giới thiệu chi tiết.';
                                                    }
                                                    
                                                    try {
                                                        const bioData = typeof consultant.bio_json === 'string'
                                                            ? JSON.parse(consultant.bio_json)
                                                            : consultant.bio_json;
                                                        
                                                        const bioContent = bioData?.bio || bioData?.description || bioData?.content;
                                                        
                                                        if (!bioContent || bioContent.trim() === '' || bioContent === 'N/A') {
                                                return 'Chưa có thông tin giới thiệu chi tiết.';
                                                        }
                                                        
                                                        return bioContent;
                                                    } catch (error) {
                                                        const plainText = consultant.bio_json.trim();
                                                        
                                                        if (plainText.startsWith('{') && plainText.includes('"')) {
                                                return 'Chưa có thông tin giới thiệu chi tiết.';
                                                        }
                                                        
                                            return plainText !== '' ? plainText : 'Chưa có thông tin giới thiệu chi tiết.';
                                                    }
                                                })()}
                                            </p>
                                                </div>

                            {/* Certification */}
                            <div className="consultant-certification mb-4">
                                <h5 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '600', 
                                    color: '#333',
                                    marginBottom: '0.75rem'
                                }}>
                                    <i className="bi bi-award me-2"></i>
                                    Chứng chỉ
                                </h5>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <p style={{ 
                                        fontSize: '0.9rem', 
                                        color: '#555',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {consultant.certification !== 'N/A' && consultant.certification ? 
                                            consultant.certification : 'Chưa cập nhật chứng chỉ'}
                                    </p>
                                    <p style={{ 
                                        fontSize: '0.85rem', 
                                        color: '#777',
                                        marginBottom: '0'
                                    }}>
                                        <strong>Chuyên môn:</strong> {formatSpecialization(consultant.speciality)}
                                    </p>
                                                    </div>
                                                </div>

                            {/* Book Consultation Button */}
                            <div className="book-consultation-section">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => setIsBookingModalOpen(true)}
                                    style={{
                                        padding: '1rem',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                                    }}
                                >
                                    <i className="bi bi-calendar-check me-2"></i>
                                    Đăt lịch hẹn
                                </button>
                                
                                {/* Google Meet Status */}
                                <div className="mt-3 text-center">
                                    <small style={{ 
                                        fontSize: '0.85rem',
                                        color: consultant.google_meet_link !== 'N/A' && consultant.google_meet_link ? '#28a745' : '#6c757d',
                                        fontWeight: '500'
                                    }}>
                                        <i className="bi bi-camera-video me-1"></i>
                                        {consultant.google_meet_link !== 'N/A' && consultant.google_meet_link ? 
                                            'Google Meet có sẵn' : 'Google Meet chưa thiết lập'}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Schedule */}
                    <div className="col-lg-7 col-md-6">
                        <div className="schedule-card" style={{
                            border: '2px solid #e0e0e0',
                            borderRadius: '12px',
                            padding: '2rem',
                            backgroundColor: '#ffffff',
                            height: 'fit-content'
                        }}>
                            <h3 style={{ 
                                fontSize: '1.3rem', 
                                fontWeight: '600', 
                                color: '#333',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <i className="bi bi-calendar3 me-2"></i>
                                Slot đặt lịch
                            </h3>

                            <div className="schedule-content" style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                paddingRight: '0.5rem'
                            }}>
                                {consultant.available_slots && consultant.available_slots.length > 0 ? (
                                    <div className="schedule-list">
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
                                                'Monday': 'Thứ Hai',
                                                'Tuesday': 'Thứ Ba', 
                                                'Wednesday': 'Thứ Tư',
                                                'Thursday': 'Thứ Năm',
                                                'Friday': 'Thứ Sáu',
                                                'Saturday': 'Thứ Bảy',
                                                'Sunday': 'Chủ Nhật'
                                            };

                                            return dayOrder
                                                .filter(day => groupedSlots[day])
                                                .map(day => {
                                                    const daySlots = groupedSlots[day];
                                                    const sortedSlots = daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
                                                    
                                                    return (
                                                        <div key={day} className="schedule-day-row mb-3" style={{
                                                            backgroundColor: '#f8f9fa',
                                                            padding: '1rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e9ecef'
                                                        }}>
                                                            <div className="day-name mb-2" style={{ 
                                                                fontSize: '0.95rem', 
                                                                fontWeight: '600',
                                                                color: '#495057'
                                                            }}>
                                                                <i className="bi bi-calendar-day me-2 text-primary"></i>
                                                                {dayLabels[day]}
                                                            </div>
                                                            <div className="day-slots">
                                                                <div className="row g-2">
                                                                    {sortedSlots.map((slot, index) => (
                                                                        <div key={index} className="col-md-4 col-sm-6">
                                                                            <div className="time-slot-box" style={{ 
                                                                                backgroundColor: '#ffffff',
                                                                                border: '1px solid #007bff',
                                                                                borderRadius: '4px',
                                                                                padding: '0.5rem',
                                                                                textAlign: 'center',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '500',
                                                                                color: '#007bff'
                                                                            }}>
                                                                                <i className="bi bi-clock me-1"></i>
                                                                                {formatTime(slot.start_time)}
                                                            </div>
                                                        </div>
                                                                    ))}
                                                            </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                                })()}
                                    </div>
                                ) : (
                                    <div className="no-schedule" style={{
                                        textAlign: 'center',
                                        padding: '3rem',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <i className="bi bi-calendar-x" style={{ 
                                            fontSize: '3rem', 
                                            color: '#6c757d',
                                            marginBottom: '1rem',
                                            display: 'block'
                                        }}></i>
                                        <h5 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                                            Chưa có lịch làm việc
                                        </h5>
                                        <p style={{ color: '#8e9297', fontSize: '0.9rem', marginBottom: '0' }}>
                                            Tư vấn viên chưa thiết lập lịch làm việc. Vui lòng liên hệ để biết thêm thông tin.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                                        </div>

                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                consultantId={consultant?.id_consultant}
            />
        </div>
    );
};

export default BookingProfile;