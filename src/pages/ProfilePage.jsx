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
    const [activeTab, setActiveTab] = useState('profile'); // profile, blogs, programs, history
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
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin hồ sơ...</p>
            </div>
        );
    }

    return (
        <div className="profile-page-container">
            {/* Sidebar */}
            <div className="profile-sidebar">
                <div className="sidebar-header">
                    <h3>Cài đặt tài khoản</h3>
                </div>
                <div className="sidebar-nav">
                    <button 
                        className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <i className="bi bi-person-circle"></i>
                        <span>Hồ sơ của bạn</span>
                    </button>
                    <button 
                        className={`sidebar-nav-item ${activeTab === 'blogs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blogs')}
                    >
                        <i className="bi bi-file-text"></i>
                        <span>Blog đã viết</span>
                    </button>
                    <button 
                        className={`sidebar-nav-item ${activeTab === 'programs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('programs')}
                    >
                        <i className="bi bi-mortarboard"></i>
                        <span>Chương trình khác</span>
                    </button>
                    <button 
                        className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <i className="bi bi-list-ul"></i>
                        <span>Lịch sử đánh giá</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="profile-main-content">
                <div className="content-header">
                    <h1>Cài đặt tài khoản</h1>
                </div>

                {/* Alert Messages */}
                {updateStatus.message && (
                    <div className={`alert ${updateStatus.success ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                        <i className={`bi ${updateStatus.success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                        {updateStatus.message}
                    </div>
                )}

                {activeTab === 'profile' && profileData && (
                    <div className="profile-content">
                        {/* Personal Profile Section */}
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>Hồ sơ cá nhân</h2>
                                <p>Quản lý thông tin tài khoản và cài đặt cá nhân của bạn</p>
                                {!isEditing && (
                                    <button
                                        className="edit-profile-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                        Chỉnh sửa hồ sơ
                                    </button>
                                )}
                            </div>

                            <div className="profile-grid">
                                {/* Left Column - Avatar and Basic Info */}
                                <div className="profile-left">
                                    <div className="profile-avatar-section">
                                        <div className="profile-avatar-container">
                                            <div className="profile-avatar">
                                                <i className="bi bi-person-fill"></i>
                                            </div>
                                            <div className={`status-indicator ${profileData.user.status === 'active' ? 'active' : 'inactive'}`}>
                                                {profileData.user.status === 'active' ? 'HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                                            </div>
                                        </div>
                                        <div className="profile-basic-info">
                                            <h3>{profileData.profile.name || 'Chưa cập nhật'}</h3>
                                            <p>{profileData.user.email}</p>
                                        </div>
                                        <div className="profile-stats">
                                            <div className="stat-item">
                                                <i className="bi bi-calendar-plus"></i>
                                                <div>
                                                    <span className="stat-value">
                                                        {profileData.user.date_create ? new Date(profileData.user.date_create).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                                    </span>
                                                    <span className="stat-label">Ngày tham gia</span>
                                                </div>
                                            </div>
                                            <div className="stat-item">
                                                <i className="bi bi-briefcase"></i>
                                                <div>
                                                    <span className="stat-value">
                                                        {profileData.profile.job || 'Chưa cập nhật'}
                                                    </span>
                                                    <span className="stat-label">Nghề nghiệp</span>
                                                </div>
                                            </div>
                                            {profileData.profile.date_of_birth && (
                                                <div className="stat-item">
                                                    <i className="bi bi-cake"></i>
                                                    <div>
                                                        <span className="stat-value">
                                                            {new Date(profileData.profile.date_of_birth).toLocaleDateString('vi-VN')}
                                                        </span>
                                                        <span className="stat-label">Ngày sinh</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Profile Details */}
                                <div className="profile-right">
                                    {!isEditing ? (
                                        <div className="profile-details">
                                            {/* Personal Information */}
                                            <div className="detail-section">
                                                <h4>Thông tin cá nhân</h4>
                                                <div className="detail-grid">
                                                    <div className="detail-item">
                                                        <label>HỌ VÀ TÊN</label>
                                                        <span>{profileData.profile.name || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>NGHỀ NGHIỆP</label>
                                                        <span>{profileData.profile.job || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>EMAIL</label>
                                                        <span>{profileData.user.email}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>NGÀY SINH</label>
                                                        <span>
                                                            {profileData.profile.date_of_birth ? 
                                                                new Date(profileData.profile.date_of_birth).toLocaleDateString('vi-VN') : 
                                                                'Chưa cập nhật'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Account Information */}
                                            <div className="detail-section">
                                                <h4>Thông tin tài khoản</h4>
                                                <div className="detail-grid">
                                                    <div className="detail-item">
                                                        <label>ID NGƯỜI DÙNG</label>
                                                        <span>#{profileData.user.user_id}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>VAI TRÒ</label>
                                                        <span className={`role-badge ${profileData.user.role}`}>
                                                            {profileData.user.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 
                                                             profileData.user.role === 'staff' ? 'NHÂN VIÊN' : 
                                                             profileData.user.role === 'consultant' ? 'TƯ VẤN VIÊN' : 'THÀNH VIÊN'}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>NGÀY TẠO TÀI KHOẢN</label>
                                                        <span>
                                                            {profileData.user.date_create ? 
                                                                new Date(profileData.user.date_create).toLocaleDateString('vi-VN') : 
                                                                'Chưa xác định'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>TRẠNG THÁI TÀI KHOẢN</label>
                                                        <span className={`status-badge ${profileData.user.status}`}>
                                                            {profileData.user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="edit-form">
                                            <h4>Chỉnh sửa hồ sơ</h4>
                                            <form onSubmit={handleSubmit}>
                                                <div className="form-grid">
                                                    <div className="form-group">
                                                        <label htmlFor="name">
                                                            <i className="bi bi-person"></i>
                                                            Họ và tên <span className="required">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Nhập họ và tên"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="email">
                                                            <i className="bi bi-envelope"></i>
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            value={profileData.user.email}
                                                            disabled
                                                            placeholder="Email không thể thay đổi"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="job">
                                                            <i className="bi bi-briefcase"></i>
                                                            Nghề nghiệp
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="job"
                                                            name="job"
                                                            value={formData.job}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập nghề nghiệp"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="date_of_birth">
                                                            <i className="bi bi-calendar-heart"></i>
                                                            Ngày sinh
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="date_of_birth"
                                                            name="date_of_birth"
                                                            value={formData.date_of_birth}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="form-group full-width">
                                                        <label htmlFor="bio_json">
                                                            <i className="bi bi-file-text"></i>
                                                            Tiểu sử
                                                        </label>
                                                        <textarea
                                                            id="bio_json"
                                                            name="bio_json"
                                                            value={formData.bio_json}
                                                            onChange={handleInputChange}
                                                            rows="5"
                                                            placeholder="Chia sẻ về bản thân bạn..."
                                                        />
                                                        {bioJsonError && <div className="error-message">{bioJsonError}</div>}
                                                    </div>
                                                </div>
                                                
                                                <div className="form-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-cancel"
                                                        onClick={() => setIsEditing(false)}
                                                    >
                                                        <i className="bi bi-x-circle"></i>
                                                        Hủy bỏ
                                                    </button>
                                                    <button 
                                                        type="submit" 
                                                        className="btn-save"
                                                    >
                                                        <i className="bi bi-check-circle"></i>
                                                        Lưu thay đổi
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'blogs' && (
                    <div className="content-section">
                        <h2>Blog đã viết</h2>
                        <div className="empty-state">
                            <i className="bi bi-file-text"></i>
                            <p>Chưa có blog nào được viết</p>
                        </div>
                    </div>
                )}

                {activeTab === 'programs' && (
                    <div className="content-section">
                        <h2>Chương trình khác</h2>
                        <div className="empty-state">
                            <i className="bi bi-mortarboard"></i>
                            <p>Chưa có chương trình nào được tham gia</p>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="content-section">
                        <h2>Lịch sử đánh giá</h2>
                        <div className="empty-state">
                            <i className="bi bi-list-ul"></i>
                            <p>Chưa có lịch sử đánh giá nào</p>
                        </div>
                    </div>
                )}

                {!profileData && (
                    <div className="content-section">
                        <div className="empty-state">
                            <i className="bi bi-person-x"></i>
                            <h3>Không có dữ liệu hồ sơ</h3>
                            <p>Hồ sơ của bạn chưa được tạo hoặc có lỗi xảy ra khi tải dữ liệu.</p>
                            <button 
                                className="btn-primary"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="bi bi-plus-circle"></i>
                                Tạo hồ sơ mới
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
