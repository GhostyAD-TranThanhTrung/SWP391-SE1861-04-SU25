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
            console.log('Profile data response:', response.data);
            setProfileData(response.data.data);

            // Khởi tạo formData với dữ liệu hiện tại
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
        setUpdateStatus({ success: false, message: '' });
        setLoading(true);
        
        try {
            // Validate bio_json if provided
            if (formData.bio_json && formData.bio_json.trim()) {
                try {
                    JSON.parse(formData.bio_json);
                } catch (error) {
                    setBioJsonError('Bio JSON phải có định dạng JSON hợp lệ');
                    setLoading(false);
                    return;
                }
            }
            
            // Send profile fields directly (not wrapped in profile object)
            const submitData = {
                name: formData.name || null,
                job: formData.job || null,
                date_of_birth: formData.date_of_birth || null,
                bio_json: formData.bio_json || null
            };
            
            const response = await axios.put('http://localhost:3000/api/user/profile-combined', submitData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });

            setUpdateStatus({
                success: true,
                message: 'Cập nhật thông tin thành công!'
            });
            
            // Refresh profile data
            await fetchProfileData();
            setIsEditing(false);
            
        } catch (error) {
            console.error('Update error:', error);
            setUpdateStatus({
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.'
            });
        } finally {
            setLoading(false);
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

            {profileData ? (
                <div className="card">
                    <div className="card-body">
                        {!isEditing ? (
                            <>
                                <p><strong>Tên:</strong> {profileData.profile?.name || 'Chưa cập nhật'}</p>
                                <p><strong>Email:</strong> {profileData.user?.email || 'Chưa cập nhật'}</p>
                                <p><strong>Vai trò:</strong> {profileData.user?.role || 'Chưa cập nhật'}</p>
                                <p><strong>Nghề nghiệp:</strong> {profileData.profile?.job || 'Chưa cập nhật'}</p>
                                <p><strong>Ngày sinh:</strong> {profileData.profile?.date_of_birth ? new Date(profileData.profile.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                <p><strong>Ngày tạo tài khoản:</strong> {profileData.user?.date_create ? new Date(profileData.user.date_create).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                <p><strong>Trạng thái:</strong> {profileData.user?.status || 'Chưa cập nhật'}</p>
                                <div>
                                    <strong>Tiểu sử:</strong>
                                    <pre style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        marginTop: '5px',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'inherit',
                                        fontSize: '14px'
                                    }}>
                                        {formatBioJson(profileData.profile?.bio_json)}
                                    </pre>
                                </div>

                                <button
                                    className="btn btn-primary mt-3"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setUpdateStatus({ success: false, message: '' });
                                        setBioJsonError('');
                                    }}
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
                                        value={profileData.user?.email || ''}
                                        disabled
                                    />
                                    <small className="form-text text-muted">Email không thể thay đổi</small>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="role">Vai trò:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="role"
                                        value={profileData.user?.role || ''}
                                        disabled
                                    />
                                    <small className="form-text text-muted">Vai trò không thể thay đổi</small>
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
                                    <label htmlFor="bio_json">Tiểu sử (JSON):</label>
                                    <textarea
                                        className={`form-control ${bioJsonError ? 'is-invalid' : ''}`}
                                        id="bio_json"
                                        name="bio_json"
                                        value={formData.bio_json}
                                        onChange={handleInputChange}
                                        rows="6"
                                        placeholder='Nhập tiểu sử dưới dạng JSON, ví dụ: {"bio": "Giới thiệu về bản thân", "skills": ["JavaScript", "React"], "interests": ["đọc sách", "thể thao"]}'
                                        style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                    />
                                    <small className="form-text text-muted">
                                        Tiểu sử phải được viết dưới dạng JSON hợp lệ. Để trống nếu không muốn cập nhật.
                                    </small>
                                    {bioJsonError && <div className="invalid-feedback">{bioJsonError}</div>}
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-success" disabled={loading}>
                                        {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setBioJsonError('');
                                            setUpdateStatus({ success: false, message: '' });
                                            // Reset form data to current profile data
                                            if (profileData && profileData.profile) {
                                                const profile = profileData.profile;
                                                setFormData({
                                                    name: profile.name || '',
                                                    job: profile.job || '',
                                                    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '',
                                                    bio_json: profile.bio_json || ''
                                                });
                                            }
                                        }}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body text-center">
                        <h5>Chưa có thông tin hồ sơ</h5>
                        <p className="text-muted">Bạn chưa có thông tin hồ sơ. Hãy tạo hồ sơ để bắt đầu.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setIsEditing(true);
                                setUpdateStatus({ success: false, message: '' });
                                setBioJsonError('');
                            }}
                        >
                            Tạo hồ sơ
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;