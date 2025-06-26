import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/DetailCoursePage.scss';
import DefaultImage from '../images/Images.jpg';

const DetailCoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [contentPreview, setContentPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState(true);
    const [userId, setUserId] = useState(null);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchProgram = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/programs/${id}`);
                if (!res.ok) throw new Error('Không thể tải dữ liệu chương trình');
                const data = await res.json();
                setProgram(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchContentPreview = async () => {
            setContentLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/content/preview/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setContentPreview(data.data || []);
                } else {
                    console.warn('Không thể tải nội dung preview');
                    setContentPreview([]);
                }
            } catch (err) {
                console.error('Lỗi khi tải content preview:', err);
                setContentPreview([]);
            } finally {
                setContentLoading(false);
            }
        };

        const checkEnrollmentStatus = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setCheckingEnrollment(false);
                return;
            }

            try {
                // Decode token to get user ID
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setUserId(tokenPayload.userId);

                // Check enrollment status by fetching user's enrollments for this program
                const res = await fetch(`http://localhost:3000/api/enrollments/user/${tokenPayload.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Check if user is enrolled in this specific program
                    const enrollmentInProgram = data.data && data.data.find(enrollment =>
                        enrollment.program_id === parseInt(id)
                    );
                    
                    if (enrollmentInProgram) {
                        setIsEnrolled(true);
                        setEnrollmentData(enrollmentInProgram);
                        
                        // Calculate progress percentage
                        if (enrollmentInProgram.progress && Array.isArray(enrollmentInProgram.progress)) {
                            const totalContent = enrollmentInProgram.progress.length;
                            const completedContent = enrollmentInProgram.progress.filter(item => item.complete).length;
                            const percentage = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
                            setProgressPercentage(percentage);
                            
                            // Check if course is completed
                            const allCompleted = totalContent > 0 && completedContent === totalContent;
                            setIsCompleted(!!enrollmentInProgram.complete_at || allCompleted);
                            
                            // If all content is complete but complete_at is not set, update it
                            if (allCompleted && !enrollmentInProgram.complete_at) {
                                updateEnrollmentCompletion(tokenPayload.userId, parseInt(id));
                            }
                        }
                    } else {
                        setIsEnrolled(false);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi kiểm tra trạng thái đăng ký:', err);
                setIsEnrolled(false);
            } finally {
                setCheckingEnrollment(false);
            }
        };

        fetchProgram();
        fetchContentPreview();
        checkEnrollmentStatus();
    }, [id]);

    // Function to update enrollment completion
    const updateEnrollmentCompletion = async (userId, programId) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        try {
            const enrollId = `${userId}_${programId}`;
            const res = await fetch(`http://localhost:3000/api/enrollments/${enrollId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setEnrollmentData(data.data);
                setIsCompleted(true);
                setProgressPercentage(100);
                console.log('Course completion updated successfully');
            }
        } catch (err) {
            console.error('Error updating course completion:', err);
        }
    };

    // Function to delete enrollment
    const handleDeleteEnrollment = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token || !userId) return;

        const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đăng ký khóa học này? Tất cả tiến độ học tập sẽ bị xóa.');
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await fetch(`http://localhost:3000/api/enrollments/${userId}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Reset all enrollment-related states
                setIsEnrolled(false);
                setEnrollmentData(null);
                setProgressPercentage(0);
                setIsCompleted(false);
                alert('Đã hủy đăng ký khóa học thành công!');
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Có lỗi xảy ra khi hủy đăng ký');
            }
        } catch (err) {
            console.error('Error deleting enrollment:', err);
            alert('Có lỗi xảy ra khi hủy đăng ký khóa học');
        } finally {
            setDeleting(false);
        }
    };

    const handleEnroll = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            const res = await fetch(`http://localhost:3000/api/enrollments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    program_id: parseInt(id)
                })
            });

            if (res.ok) {
                alert('Đăng ký khóa học thành công!');
                setIsEnrolled(true);
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Có lỗi xảy ra khi đăng ký');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi đăng ký khóa học');
        } finally {
            setEnrolling(false);
        }
    };

    const handleViewContent = (contentId) => {
        // Navigate to content page in same tab
        navigate(`/content/${contentId}`);
    };

    if (loading) return (
        <div className="detailcourse-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin khóa học...</p>
        </div>
    );

    if (error) return (
        <div className="detailcourse-error">
            <div className="error-icon"></div>
            <p>{error}</p>
            <Link to="/courses" className="error-back-btn">Quay lại danh sách khóa học</Link>
        </div>
    );

    if (!program) return (
        <div className="detailcourse-notfound">
            <div className="notfound-icon">🔍</div>
            <p>Không tìm thấy chương trình.</p>
            <Link to="/courses" className="notfound-back-btn">Quay lại danh sách khóa học</Link>
        </div>
    );

    return (
        <div className="detailcourse-container">
            {/* Header với breadcrumb */}
            <div className="detailcourse-header">
                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-item">Trang chủ</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/courses" className="breadcrumb-item">Khóa học</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{program.title}</span>
                </div>
            </div>

            {/* Main content */}
            <div className="detailcourse-main">
                {/* Left column - Image */}
                <div className="detailcourse-left">
                    <div className="detailcourse-img-container">
                        <img
                            src={program.img_link || DefaultImage}
                            alt={program.title}
                            className="detailcourse-img"
                            onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                        />
                        <div className="img-overlay">
                            <div className="overlay-content">
                                <span className="course-badge">Khóa học</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Info */}
                <div className="detailcourse-right">
                    <div className="course-header">
                        <h1 className="detailcourse-title">{program.title}</h1>
                        <div className="course-meta">
                            <div className="meta-item">
                                <span className="meta-icon"></span>
                                <span className="meta-label">Người tạo:</span>
                                <span className="meta-value">{program.creator?.name || program.creator?.email || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon"></span>
                                <span className="meta-label">Nhóm tuổi:</span>
                                <span className="meta-value">{program.age_group || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span className="meta-label">Ngày tạo:</span>
                                <span className="meta-value">{new Date(program.create_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="course-description">
                        <h3>Mô tả khóa học</h3>
                        <p>{program.description}</p>
                    </div>

                    {/* Enroll/Status section */}
                    <div className="enroll-section">
                        <div className="enroll-card">
                            {checkingEnrollment ? (
                                <div className="enrollment-checking">
                                    <div className="loading-spinner"></div>
                                    <p>Đang kiểm tra trạng thái đăng ký...</p>
                                </div>
                            ) : isEnrolled ? (
                                <div className="enrolled-info">
                                    <div className="enrolled-status">
                                        {isCompleted ? (
                                            <>
                                                <span className="completed-icon"></span>
                                                <h3>Chúc mừng! Bạn đã hoàn thành khóa học</h3>
                                                <p>Bạn đã hoàn thành tất cả nội dung của khóa học này. Chúc mừng bạn!</p>
                                                {enrollmentData?.complete_at && (
                                                    <p className="completion-date">
                                                        Hoàn thành vào: {new Date(enrollmentData.complete_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <span className="enrolled-icon"></span>
                                                <h3>Bạn đã đăng ký khóa học này</h3>
                                                <p>Bạn có thể xem tất cả nội dung khóa học bên dưới. Chúc bạn học tập hiệu quả!</p>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <h4>Tiến độ học tập</h4>
                                            <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ width: `${progressPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        {enrollmentData?.progress && (
                                            <div className="progress-details">
                                                <span className="progress-text">
                                                    {enrollmentData.progress.filter(item => item.complete).length} / {enrollmentData.progress.length} nội dung đã hoàn thành
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete Enrollment Button */}
                                    <div className="enrollment-actions">
                                        <button
                                            className={`delete-enrollment-btn ${deleting ? 'deleting' : ''}`}
                                            onClick={handleDeleteEnrollment}
                                            disabled={deleting}
                                        >
                                            {deleting ? (
                                                <>
                                                    <span className="delete-spinner"></span>
                                                    Đang hủy đăng ký...
                                                </>
                                            ) : (
                                                <>
                                                                                                <span className="delete-icon"></span>
                                            Hủy đăng ký khóa học
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : userId ? (
                                <div className="enroll-info">
                                    <h3>Đăng ký khóa học</h3>
                                    <p>Tham gia khóa học này để nâng cao kiến thức và kỹ năng của bạn</p>
                                    <button
                                        className={`enroll-btn ${enrolling ? 'enrolling' : ''}`}
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                    >
                                        {enrolling ? (
                                            <>
                                                <span className="enroll-spinner"></span>
                                                Đang đăng ký...
                                            </>
                                        ) : (
                                            <>
                                                                                            <span className="enroll-icon"></span>
                                            Đăng ký ngay
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="login-required">
                                    <h3>Cần đăng nhập để đăng ký</h3>
                                    <p>Vui lòng đăng nhập để có thể đăng ký khóa học này</p>
                                    <button
                                        className="login-btn"
                                        onClick={() => navigate('/login')}
                                    >
                                        <span className="login-icon"></span>
                                        Đăng nhập ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course content */}
            <div className="detailcourse-content-section">
                <div className="content-header">
                    <h2>Nội dung chi tiết khóa học</h2>
                </div>
                <div className="detailcourse-content-card">
                    <div className="detailcourse-content">
                        {contentLoading ? (
                            <div className="content-loading">
                                <div className="loading-spinner"></div>
                                <p>Đang tải nội dung khóa học...</p>
                            </div>
                        ) : contentPreview.length > 0 ? (
                            <div className="content-preview-list">
                                <div className="preview-header">
                                    <h3>Danh sách nội dung ({contentPreview.length} mục)</h3>
                                </div>
                                {contentPreview.map((content, index) => (
                                    <div key={index} className="content-preview-item">
                                        <div className="content-order">
                                            <span className="order-number">{content.orders}</span>
                                        </div>
                                        <div className="content-info">
                                            <h4 className="content-title">{content.title}</h4>
                                            <div className="content-type-badge">
                                                <span className={`type-badge ${content.type}`}>
                                                    {content.type}
                                                </span>
                                            </div>
                                        </div>
                                        {isEnrolled && (
                                            <div className="content-actions">
                                                <button
                                                    className="view-content-btn"
                                                    onClick={() => handleViewContent(content.content_id)}
                                                >
                                                    <span className="view-icon"></span>
                                                    Xem nội dung
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-content">
                                <span className="no-content-icon"></span>
                                <p>Nội dung chi tiết sẽ được cập nhật sớm nhất</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailCoursePage;
