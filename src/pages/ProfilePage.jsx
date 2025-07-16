import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/ProfilePage.scss';

const ProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        job: '',
        date_of_birth: '',
        bio_json: ''
    });
    const [updateStatus, setUpdateStatus] = useState({ success: false, message: '' });
    const [bioJsonError, setBioJsonError] = useState('');
    const location = useLocation();

    // Helper function to format bio_json for display
    const formatBioJson = (bioJson) => {
        if (!bioJson) return 'Chưa cập nhật';

        try {
            const parsed = JSON.parse(bioJson);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            return bioJson; // Return as-is if not valid JSON
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [location]);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/user/profile-combined', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setProfileData(response.data.data);

            if (response.data.data && response.data.data.profile) {
                const profile = response.data.data.profile;
                setFormData({
                    name: profile.name || '',
                    job: profile.job || '',
                    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '',
                    bio_json: profile.bio_json || ''
                });
            } else {
                // Initialize empty form if no profile exists
                setFormData({
                    name: '',
                    job: '',
                    date_of_birth: '',
                    bio_json: ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setUpdateStatus({
                success: false,
                message: 'Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBioJsonError('');

        // Bọc dữ liệu vào object profile
        const submitData = {
            profile: {
                name: formData.name,
                job: formData.job,
                date_of_birth: formData.date_of_birth,
                bio_json: formData.bio_json
            }
        };

        try {
            const response = await axios.put('http://localhost:3000/api/user/profile-combined', submitData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });

            setUpdateStatus({
                success: true,
                message: 'Cập nhật thông tin thành công!'
            });
            fetchProfileData();
            setIsEditing(false);

        } catch (error) {
            setUpdateStatus({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật thông tin.'
            });
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải thông tin hồ sơ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page-container">
            {/* Header */}
            <div className="profile-header mb-4">
                <div className="row align-items-center">
                    <div className="col">
                        <h1 className="profile-title mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            Hồ sơ cá nhân
                        </h1>
                        <p className="profile-subtitle text-muted mb-0">
                            Quản lý thông tin tài khoản và cài đặt cá nhân của bạn
                        </p>
                    </div>
                    {!isEditing && profileData && profileData.profile && (
                        <div className="col-auto">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => setIsEditing(true)}
                                style={{ borderRadius: '12px', padding: '12px 24px' }}
                            >
                                <i className="bi bi-pencil-square me-2"></i>
                                Chỉnh sửa hồ sơ
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert Messages */}
            {updateStatus.message && (
                <div className={`alert ${updateStatus.success ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} 
                     style={{ borderRadius: '12px', border: 'none' }}>
                    <i className={`bi ${updateStatus.success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                    {updateStatus.message}
                </div>
            )}

            {profileData && profileData.profile ? (
                <div className="row">
                    {/* Profile Avatar and Basic Info */}
                    <div className="col-lg-4 mb-4">
                        <div className="profile-card h-100">
                            <div className="text-center mb-4">
                                <div className="profile-avatar-container mb-3">
                                    <div className="profile-avatar">
                                        <i className="bi bi-person-fill"></i>
                                    </div>
                                    <div className={`status-indicator ${profileData.user.status === 'active' ? 'status-active' : 'status-inactive'}`}></div>
                                </div>
                                <h3 className="profile-name mb-1">{profileData.profile.name || 'Chưa cập nhật'}</h3>
                                <p className="profile-email text-muted mb-2">{profileData.user.email}</p>
                                <span className={`badge ${profileData.user.status === 'active' ? 'bg-success' : 'bg-secondary'} profile-status-badge`}>
                                    <i className={`bi ${profileData.user.status === 'active' ? 'bi-check-circle' : 'bi-pause-circle'} me-1`}></i>
                                    {profileData.user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </div>

                            {/* Quick Stats */}
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <i className="bi bi-calendar-plus text-primary"></i>
                                    <div>
                                        <div className="stat-value">
                                            {profileData.user.date_create ? new Date(profileData.user.date_create).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                        </div>
                                        <div className="stat-label">Ngày tham gia</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <i className="bi bi-briefcase text-success"></i>
                                    <div>
                                        <div className="stat-value">
                                            {profileData.profile.job || 'Chưa cập nhật'}
                                        </div>
                                        <div className="stat-label">Nghề nghiệp</div>
                                    </div>
                                </div>
                                {profileData.profile.date_of_birth && (
                                    <div className="stat-item">
                                        <i className="bi bi-cake text-warning"></i>
                                        <div>
                                            <div className="stat-value">
                                                {new Date(profileData.profile.date_of_birth).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="stat-label">Ngày sinh</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Details and Forms */}
                    <div className="col-lg-8">
                        {!isEditing ? (
                            /* View Mode */
                            <div className="profile-details">
                                {/* Personal Information */}
                                <div className="profile-card mb-4">
                                    <div className="profile-card-header">
                                        <h4 className="card-title">
                                            <i className="bi bi-person-lines-fill me-2"></i>
                                            Thông tin cá nhân
                                        </h4>
                                    </div>
                                    <div className="profile-card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-person me-2"></i>
                                                        Họ và tên
                                                    </label>
                                                    <div className="info-value">{profileData.profile.name || 'Chưa cập nhật'}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-envelope me-2"></i>
                                                        Email
                                                    </label>
                                                    <div className="info-value">{profileData.user.email}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-briefcase me-2"></i>
                                                        Nghề nghiệp
                                                    </label>
                                                    <div className="info-value">{profileData.profile.job || 'Chưa cập nhật'}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-calendar-heart me-2"></i>
                                                        Ngày sinh
                                                    </label>
                                                    <div className="info-value">
                                                        {profileData.profile.date_of_birth ? 
                                                            new Date(profileData.profile.date_of_birth).toLocaleDateString('vi-VN') : 
                                                            'Chưa cập nhật'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="profile-card mb-4">
                                    <div className="profile-card-header">
                                        <h4 className="card-title">
                                            <i className="bi bi-shield-check me-2"></i>
                                            Thông tin tài khoản
                                        </h4>
                                    </div>
                                    <div className="profile-card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-key me-2"></i>
                                                        ID Người dùng
                                                    </label>
                                                    <div className="info-value">#{profileData.user.user_id}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-person-badge me-2"></i>
                                                        Vai trò
                                                    </label>
                                                    <div className="info-value">
                                                        <span className={`badge ${profileData.user.role === 'admin' ? 'bg-danger' : profileData.user.role === 'staff' ? 'bg-warning' : 'bg-primary'}`}>
                                                            {profileData.user.role === 'admin' ? 'Quản trị viên' : 
                                                             profileData.user.role === 'staff' ? 'Nhân viên' : 
                                                             profileData.user.role === 'consultant' ? 'Tư vấn viên' : 'Thành viên'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-calendar-plus me-2"></i>
                                                        Ngày tạo tài khoản
                                                    </label>
                                                    <div className="info-value">
                                                        {profileData.user.date_create ? 
                                                            new Date(profileData.user.date_create).toLocaleDateString('vi-VN') : 
                                                            'Chưa xác định'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="info-item">
                                                    <label className="info-label">
                                                        <i className="bi bi-activity me-2"></i>
                                                        Trạng thái tài khoản
                                                    </label>
                                                    <div className="info-value">
                                                        <span className={`badge ${profileData.user.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {profileData.user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Biography */}
                                <div className="profile-card">
                                    <div className="profile-card-header">
                                        <h4 className="card-title">
                                            <i className="bi bi-file-text me-2"></i>
                                            Tiểu sử
                                        </h4>
                                    </div>
                                    <div className="profile-card-body">
                                        <div className="bio-content">
                                            {profileData.profile.bio_json ? (
                                                <p className="bio-text">{profileData.profile.bio_json}</p>
                                            ) : (
                                                <div className="text-center text-muted py-4">
                                                    <i className="bi bi-chat-square-text" style={{ fontSize: '2rem' }}></i>
                                                    <p className="mt-2 mb-0">Chưa có tiểu sử</p>
                                                    <small>Thêm tiểu sử để người khác hiểu hơn về bạn</small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <div className="profile-card">
                                <div className="profile-card-header">
                                    <h4 className="card-title">
                                        <i className="bi bi-pencil-square me-2"></i>
                                        Chỉnh sửa hồ sơ
                                    </h4>
                                </div>
                                <div className="profile-card-body">
                            <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="name" className="form-label">
                                                    <i className="bi bi-person me-2"></i>
                                                    Họ và tên <span className="text-danger">*</span>
                                                </label>
                                    <input
                                        type="text"
                                                    className="form-control form-control-lg"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                                    placeholder="Nhập họ và tên"
                                                    style={{ borderRadius: '12px' }}
                                    />
                                </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="email" className="form-label">
                                                    <i className="bi bi-envelope me-2"></i>
                                                    Email
                                                </label>
                                    <input
                                        type="email"
                                                    className="form-control form-control-lg"
                                        id="email"
                                        value={profileData.user.email}
                                        disabled
                                                    style={{ borderRadius: '12px', backgroundColor: '#f8f9fa' }}
                                    />
                                                <small className="form-text text-muted">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Email không thể thay đổi
                                                </small>
                                </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="job" className="form-label">
                                                    <i className="bi bi-briefcase me-2"></i>
                                                    Nghề nghiệp
                                                </label>
                                    <input
                                        type="text"
                                                    className="form-control form-control-lg"
                                        id="job"
                                        name="job"
                                        value={formData.job}
                                        onChange={handleInputChange}
                                                    placeholder="Nhập nghề nghiệp"
                                                    style={{ borderRadius: '12px' }}
                                    />
                                </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="date_of_birth" className="form-label">
                                                    <i className="bi bi-calendar-heart me-2"></i>
                                                    Ngày sinh
                                                </label>
                                    <input
                                        type="date"
                                                    className="form-control form-control-lg"
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                                    style={{ borderRadius: '12px' }}
                                    />
                                </div>
                                            <div className="col-12 mb-4">
                                                <label htmlFor="bio_json" className="form-label">
                                                    <i className="bi bi-file-text me-2"></i>
                                                    Tiểu sử
                                                </label>
                                    <textarea
                                                    className="form-control form-control-lg"
                                        id="bio_json"
                                        name="bio_json"
                                        value={formData.bio_json}
                                        onChange={handleInputChange}
                                                    rows="5"
                                                    placeholder="Chia sẻ về bản thân bạn..."
                                                    style={{ borderRadius: '12px', resize: 'vertical' }}
                                    />
                                    {bioJsonError && <div className="text-danger mt-1">{bioJsonError}</div>}
                                </div>
                                        </div>
                                        
                                        <div className="d-flex gap-3 justify-content-end">
                                    <button
                                        type="button"
                                                className="btn btn-outline-secondary btn-lg"
                                        onClick={() => setIsEditing(false)}
                                                style={{ borderRadius: '12px', padding: '12px 24px' }}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>
                                                Hủy bỏ
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn btn-success btn-lg"
                                                style={{ borderRadius: '12px', padding: '12px 24px' }}
                                            >
                                                <i className="bi bi-check-circle me-2"></i>
                                                Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-5">
                    <div className="profile-card">
                        <div className="profile-card-body text-center py-5">
                            <i className="bi bi-person-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                            <h3 className="mt-3 text-muted">Không có dữ liệu hồ sơ</h3>
                            <p className="text-muted">Hồ sơ của bạn chưa được tạo hoặc có lỗi xảy ra khi tải dữ liệu.</p>
                            <button 
                                className="btn btn-primary btn-lg mt-3"
                                onClick={() => setIsEditing(true)}
                                style={{ borderRadius: '12px' }}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Tạo hồ sơ mới
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
