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
                    bio: profile.bio_json || ''
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

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <>
            <h2 className="mb-4">Hồ sơ của bạn</h2>

            {updateStatus.message && (
                <div className={`alert ${updateStatus.success ? 'alert-success' : 'alert-danger'}`}>
                    {updateStatus.message}
                </div>
            )}

            {profileData && profileData.profile ? (
                <div className="card">
                    <div className="card-body">
                        {!isEditing ? (
                            <>
                                <p><strong>Tên:</strong> {profileData.profile.name}</p>
                                <p><strong>Email:</strong> {profileData.user.email}</p>
                                <p><strong>Nghề nghiệp:</strong> {profileData.profile.job || 'Chưa cập nhật'}</p>
                                <p><strong>Ngày sinh:</strong> {profileData.profile.date_of_birth ? new Date(profileData.profile.date_of_birth).toLocaleDateString() : 'Chưa cập nhật'}</p>
                                <p><strong>Ngày tạo:</strong> {profileData.user.date_create ? new Date(profileData.user.date_create).toLocaleDateString() : 'Chưa cập nhật'}</p>
                                <p><strong>Trạng thái:</strong> {profileData.user.status || 'Chưa cập nhật'}</p>
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
                                    <label htmlFor="bio_json">Tiểu sử:</label>
                                    <textarea
                                        className="form-control"
                                        id="bio_json"
                                        name="bio_json"
                                        value={formData.bio_json}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Nhập tiểu sử của bạn..."
                                    />
                                    {bioJsonError && <div className="text-danger mt-1">{bioJsonError}</div>}
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
                        )}
                    </div>
                </div>
            ) : (
                <p>Không có dữ liệu hồ sơ.</p>
            )}
        </>
    );
};

export default ProfilePage;
