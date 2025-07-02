import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ProfilePage.scss';

const ProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        job: '',
        date_of_birth: '',
        bio: ''
    });
    const [updateStatus, setUpdateStatus] = useState({ success: false, message: '' });
    const location = useLocation();

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
                    bio: profile.bio_json || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
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
        setUpdateStatus({ success: false, message: '' });

        const submitData = {
            profile: {
                name: formData.name,
                job: formData.job,
                date_of_birth: formData.date_of_birth,
                bio_json: formData.bio // Gửi vào key bio_json như backend yêu cầu
            }
        };

        try {
            await axios.put('http://localhost:3000/api/user/profile-combined', submitData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });

            setUpdateStatus({ success: true, message: 'Cập nhật thông tin thành công!' });
            fetchProfileData();
            setIsEditing(false);
        } catch (error) {
            setUpdateStatus({ success: false, message: 'Có lỗi xảy ra khi cập nhật thông tin.' });
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="profile-container d-flex justify-content-center align-items-start py-5">
            <div className="profile-card-wrapper row w-100" style={{ maxWidth: '900px' }}>
                {/* Cột trái: Avatar và thông tin cơ bản */}
                <div className="col-md-4 mb-4 mb-md-0">
                    <div className="profile-sidebar bg-white rounded shadow p-4 text-center h-100">
                        <div style={{ width: '120px', height: '120px', margin: '0 auto 16px auto' }}>
                            {profileData?.profile?.avatar_url ? (
                                <img
                                    src={profileData.profile.avatar_url}
                                    alt="Avatar"
                                    className="rounded-circle mb-3"
                                    style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #066688' }}
                                />
                            ) : (
                                <svg viewBox="0 0 120 120" width="120" height="120" className="mb-3" style={{ display: 'block', borderRadius: '50%', border: '4px solid #066688', background: '#f8f9fa' }}>
                                    <circle cx="60" cy="60" r="56" fill="#e9ecef" />
                                    <circle cx="60" cy="50" r="28" fill="#b0bec5" />
                                    <ellipse cx="60" cy="92" rx="36" ry="20" fill="#b0bec5" />
                                </svg>
                            )}
                        </div>
                        <h4 className="mb-1">{profileData?.profile?.name || 'Chưa cập nhật'}</h4>
                        <p className="text-muted mb-2">{profileData?.user?.email || ''}</p>
                        <p className="mb-2"><strong>Nghề nghiệp:</strong> {profileData?.profile?.job || 'Chưa cập nhật'}</p>
                        <p className="mb-2"><strong>Ngày sinh:</strong> {profileData?.profile?.date_of_birth ? new Date(profileData.profile.date_of_birth).toLocaleDateString() : 'Chưa cập nhật'}</p>
                        <p className="mb-2"><strong>Trạng thái:</strong> {profileData?.user?.status || 'Chưa cập nhật'}</p>
                        <p className="mb-0"><strong>Ngày tạo:</strong> {profileData?.user?.date_create ? new Date(profileData.user.date_create).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    </div>
                </div>
                {/* Cột phải: Thông tin chi tiết và form chỉnh sửa */}
                <div className="col-md-8">
                    <div className="profile-detail bg-white rounded shadow p-4 h-100">
                        <h2 className="mb-4 page-title">Hồ sơ của bạn</h2>
                        {updateStatus.message && (
                            <div className={`alert ${updateStatus.success ? 'alert-success' : 'alert-danger'}`}>
                                {updateStatus.message}
                            </div>
                        )}
                        {profileData && profileData.profile ? (
                            !isEditing ? (
                                <>
                                    <p><strong>Tiểu sử:</strong> {profileData.profile.bio_json || 'Chưa cập nhật'}</p>
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Cập nhật thông tin
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <label htmlFor="name">Tên:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="email">Email:</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={profileData.user.email}
                                            disabled
                                        />
                                        <small className="form-text text-muted">Email không thể thay đổi</small>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="job">Nghề nghiệp:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="job"
                                            name="job"
                                            value={formData.job}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="date_of_birth">Ngày sinh:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="bio">Tiểu sử:</label>
                                        <textarea
                                            className="form-control"
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Nhập tiểu sử của bạn..."
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-success">Lưu thông tin</button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <p>Không có dữ liệu hồ sơ.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
