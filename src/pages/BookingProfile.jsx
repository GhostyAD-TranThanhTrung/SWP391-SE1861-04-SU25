import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BookingProfile.scss';
import Image from '../images/Images.jpg';
import BookingModal from '../components/BookingModal';

const BookingProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
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
            cost: apiConsultant.cost || 'N/A',
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
            job: apiConsultant.job || 'N/A'
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

    // Helper functions to parse actual data structure from sample_data.sql
    const parseBioJson = (bioJson) => {
        if (!bioJson || bioJson === 'N/A') {
            return { bio: 'Không có tiểu sử', education: '' };
        }

        if (typeof bioJson === 'string') {
            try {
                const parsed = JSON.parse(bioJson);
                return {
                    bio: parsed.bio || 'Không có tiểu sử',
                    education: parsed.education || ''
                };
            } catch (e) {
                return { bio: bioJson, education: '' };
            }
        }

        return {
            bio: bioJson.bio || 'Không có tiểu sử',
            education: bioJson.education || ''
        };
    };

    // Format specialization - handle comma-separated values from sample data
    const formatSpecialization = (speciality) => {
        if (!speciality || speciality === 'N/A') return 'Tư vấn chung';
        return speciality;
    };

    // The only service offered is video consultation
    const getServices = () => {
        return [{
            title: 'Tư vấn qua video',
            icon: 'bi-camera-video'
        }];
    };

    // Calculate years of experience from bio (simplified estimation)
    const getExperienceYears = (bioData) => {
        const bio = bioData.bio || '';
        const match = bio.match(/(\d+)\s+years?\s+of\s+experience/i);
        return match ? match[1] : null;
    };

    // Format cost with proper currency
    const formatCost = (cost) => {
        if (!cost || cost === 'N/A') return 'Liên hệ để biết giá';
        return `${parseFloat(cost).toFixed(0)} VNĐ`;
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

    const specialization = formatSpecialization(consultant.speciality);
    const qualifications = [
        consultant.certification !== 'N/A' ? consultant.certification : null,
        'Chuyên gia được cấp phép',
        'Chuyên gia phòng chống ma túy'
    ].filter(Boolean);

    return (
        <div className="booking-profile-v2">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="consultant-intro">
                            <div className="consultant-image-wrapper">
                                <img
                                    src={consultant.img_link ? `http://localhost:3000${consultant.img_link}` : Image}
                                    alt={consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}
                                    className="consultant-avatar"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = Image; // Fallback to default image
                                    }}
                                />
                                <div className="status-indicator online"></div>
                            </div>
                            <div className="consultant-info">
                                <h1 className="consultant-name">{consultant.name !== 'N/A' ? consultant.name : 'N/A'}</h1>
                                <p className="consultant-title">{consultant.job !== 'N/A' ? consultant.job : 'N/A'}</p>
                                <div className="consultant-meta">
                                    <div className="specialization-tag">
                                        <i className="bi bi-shield-check"></i>
                                        {specialization}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hero-actions">
                            <button
                                className="btn btn-outline-light btn-lg"
                                onClick={() => setIsBookingModalOpen(true)}
                            >
                                <i className="bi bi-calendar-check me-2"></i>
                                Đặt lịch tư vấn
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="profile-navigation">
                <div className="container">
                    <div className="nav-tabs-wrapper">
                        <button
                            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <i className="bi bi-person-badge"></i>
                            Tổng quan
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'experience' ? 'active' : ''}`}
                            onClick={() => setActiveTab('experience')}
                        >
                            <i className="bi bi-award"></i>
                            Kinh nghiệm
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            <i className="bi bi-heart-pulse"></i>
                            Dịch vụ
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <i className="bi bi-telephone"></i>
                            Liên hệ
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="profile-content">
                <div className="container">
                    {activeTab === 'overview' && (
                        <div className="tab-content overview-content">
                            <div className="row g-4 h-100">
                                <div className="col-lg-7 col-md-12 h-100">
                                    <div className="content-card about-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-person-heart"></i> Về {consultant.name !== 'N/A' ? consultant.name : 'Tư vấn viên'}</h3>
                                        </div>
                                        <div className="card-body">
                                            <p className="bio-text">
                                                {(() => {
                                                    if (!consultant.bio_json || consultant.bio_json === 'N/A') {
                                                        return 'Không có tiểu sử';
                                                    }

                                                    // If it's a string that looks like JSON, parse it
                                                    if (typeof consultant.bio_json === 'string') {
                                                        try {
                                                            const parsed = JSON.parse(consultant.bio_json);
                                                            return parsed.bio || 'Không có tiểu sử';
                                                        } catch (e) {
                                                            // If JSON parsing fails, return the string as-is
                                                            return consultant.bio_json;
                                                        }
                                                    }

                                                    // If it's already an object
                                                    if (typeof consultant.bio_json === 'object') {
                                                        return consultant.bio_json.bio || 'Không có tiểu sử';
                                                    }

                                                    return consultant.bio_json;
                                                })()}
                                            </p>
                                            {(() => {
                                                let education = '';

                                                if (consultant.bio_json && consultant.bio_json !== 'N/A') {
                                                    if (typeof consultant.bio_json === 'string') {
                                                        try {
                                                            const parsed = JSON.parse(consultant.bio_json);
                                                            education = parsed.education || '';
                                                        } catch (e) {
                                                            education = '';
                                                        }
                                                    } else if (typeof consultant.bio_json === 'object') {
                                                        education = consultant.bio_json.education || '';
                                                    }
                                                }

                                                return education && (
                                                    <div className="education-section mb-3">
                                                        <h5><i className="bi bi-mortarboard-fill me-2"></i>Học vấn</h5>
                                                        <p className="education-text text-muted">{education}</p>
                                                    </div>
                                                );
                                            })()}
                                            <div className="key-stats">
                                                <div className="stat-item">
                                                    <div className="stat-value">{formatCost(consultant.cost)}</div>
                                                    <div className="stat-label">Mỗi buổi tư vấn</div>
                                                </div>
                                                <div className="stat-item">
                                                    <div className="stat-value">{(() => {
                                                        let bio = '';
                                                        if (consultant.bio_json && consultant.bio_json !== 'N/A') {
                                                            if (typeof consultant.bio_json === 'string') {
                                                                try {
                                                                    const parsed = JSON.parse(consultant.bio_json);
                                                                    bio = parsed.bio || '';
                                                                } catch (e) {
                                                                    bio = consultant.bio_json;
                                                                }
                                                            } else if (typeof consultant.bio_json === 'object') {
                                                                bio = consultant.bio_json.bio || '';
                                                            }
                                                        }

                                                        const match = bio.match(/(\d+)\s+years?\s+of\s+experience/i);
                                                        const years = match ? match[1] : null;
                                                        return years ? `${years}+` : (consultant.status !== 'N/A' ? consultant.status.charAt(0).toUpperCase() + consultant.status.slice(1) : 'Có sẵn');
                                                    })()}</div>
                                                    <div className="stat-label">{(() => {
                                                        let bio = '';
                                                        if (consultant.bio_json && consultant.bio_json !== 'N/A') {
                                                            if (typeof consultant.bio_json === 'string') {
                                                                try {
                                                                    const parsed = JSON.parse(consultant.bio_json);
                                                                    bio = parsed.bio || '';
                                                                } catch (e) {
                                                                    bio = consultant.bio_json;
                                                                }
                                                            } else if (typeof consultant.bio_json === 'object') {
                                                                bio = consultant.bio_json.bio || '';
                                                            }
                                                        }

                                                        const match = bio.match(/(\d+)\s+years?\s+of\s+experience/i);
                                                        const years = match ? match[1] : null;
                                                        return years ? 'Năm kinh nghiệm' : 'Trạng thái';
                                                    })()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-12 h-100">
                                    <div className="content-card quick-info-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-info-circle me-2"></i>Thông tin nhanh</h3>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="info-list">
                                                <div className="info-item specialization-item">
                                                    <div className="info-content">
                                                        <div className="info-label">
                                                            <i className="bi bi-award-fill me-2"></i>
                                                            Chuyên môn
                                                        </div>
                                                        <div className="info-value specialization-value">
                                                            {specialization.includes(',') ? (
                                                                <div className="specialization-list">
                                                                    {specialization.split(',').map((spec, index) => (
                                                                        <div key={index} className="spec-item">
                                                                            • {spec.trim()}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                specialization
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <div className="info-content">
                                                        <div className="info-label">
                                                            <i className="bi bi-person-badge me-2"></i>
                                                            Vai trò
                                                        </div>
                                                        <div className="info-value">
                                                            {consultant.role !== 'N/A' ?
                                                                consultant.role.charAt(0).toUpperCase() + consultant.role.slice(1).toLowerCase()
                                                                : 'N/A'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <div className="info-content">
                                                        <div className="info-label">
                                                            <i className="bi bi-currency-dollar me-2"></i>
                                                            Chi phí buổi tư vấn
                                                        </div>
                                                        <div className="info-value cost-value">
                                                            {formatCost(consultant.cost)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <div className="info-content">
                                                        <div className="info-label">
                                                            <i className="bi bi-envelope me-2"></i>
                                                            Email
                                                        </div>
                                                        <div className="info-value email-value">
                                                            {consultant.email !== 'N/A' ? consultant.email : 'Liên hệ khi đặt lịch'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="tab-content experience-content">
                            <div className="row g-4">
                                <div className="col-12">
                                    <div className="content-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-trophy"></i> Chứng chỉ</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="certification-list">
                                                {consultant.certification !== 'N/A' && consultant.certification ? (
                                                    consultant.certification.split(',').map((cert, index) => (
                                                        <div key={index} className="cert-item">
                                                            <div className="cert-icon">
                                                                <i className="bi bi-award-fill"></i>
                                                            </div>
                                                            <div className="cert-details">
                                                                <h4>{cert.trim()}</h4>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="cert-item">
                                                        <div className="cert-icon">
                                                            <i className="bi bi-shield-check"></i>
                                                        </div>
                                                        <div className="cert-details">
                                                            <h4>Không có chứng chỉ được liệt kê</h4>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Show education from actual DB data if available */}
                                                {(() => {
                                                    let education = '';

                                                    if (consultant.bio_json && consultant.bio_json !== 'N/A') {
                                                        if (typeof consultant.bio_json === 'string') {
                                                            try {
                                                                const parsed = JSON.parse(consultant.bio_json);
                                                                education = parsed.education || '';
                                                            } catch (e) {
                                                                education = '';
                                                            }
                                                        } else if (typeof consultant.bio_json === 'object') {
                                                            education = consultant.bio_json.education || '';
                                                        }
                                                    }

                                                    return education && (
                                                        <div className="cert-item">
                                                            <div className="cert-icon">
                                                                <i className="bi bi-mortarboard-fill"></i>
                                                            </div>
                                                            <div className="cert-details">
                                                                <h4>{education}</h4>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="tab-content services-content">
                            <div className="content-card">
                                <div className="card-header">
                                    <h3><i className="bi bi-heart-pulse"></i> Dịch vụ có sẵn</h3>
                                </div>
                                <div className="card-body">
                                    <div className="services-grid">
                                        {getServices().map((service, index) => (
                                            <div key={index} className="service-item">
                                                <div className="service-icon">
                                                    <i className={`bi ${service.icon}`}></i>
                                                </div>
                                                <h4>{service.title}</h4>
                                                <div className="service-price">{formatCost(consultant.cost)}/buổi</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="tab-content contact-content">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="content-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-envelope"></i> Liên hệ</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="contact-methods">
                                                <div className="contact-method">
                                                    <i className="bi bi-envelope-fill"></i>
                                                    <div>
                                                        <strong>Email</strong>
                                                        <p>{consultant.email !== 'N/A' ? consultant.email : 'Email không có sẵn'}</p>
                                                    </div>
                                                </div>
                                                <div className="contact-method">
                                                    <i className="bi bi-camera-video-fill"></i>
                                                    <div>
                                                        <strong>Gọi video</strong>
                                                        <p>Có sẵn</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="content-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-calendar-check"></i> Lịch làm việc</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="availability-info">
                                                <div className="availability-item">
                                                    <span className="day">Thứ 2 - Thứ 6</span>
                                                    <span className="time">9:00 AM - 5:00 PM</span>
                                                </div>
                                                <div className="availability-item">
                                                    <span className="day">Thứ 7</span>
                                                    <span className="time">10:00 AM - 2:00 PM</span>
                                                </div>
                                                <div className="availability-item">
                                                    <span className="day">Chủ nhật</span>
                                                    <span className="time">Chỉ khẩn cấp</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Thêm BookingModal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                consultantId={consultant?.id_consultant}
            />
        </div>
    );
};

export default BookingProfile;