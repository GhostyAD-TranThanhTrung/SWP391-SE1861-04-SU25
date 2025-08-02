import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/DetailCoursePage.scss';
import DefaultImage from '../images/Images.jpg';
import SurveyModal from '../components/SurveyModal';

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
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Survey modal states
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [surveyType, setSurveyType] = useState(''); // 'pre-assessment' or 'post-assessment'
    const [justEnrolled, setJustEnrolled] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    // Survey status states
    const [preAssessmentCompleted, setPreAssessmentCompleted] = useState(false);
    const [postAssessmentCompleted, setPostAssessmentCompleted] = useState(false);
    const [checkingSurveyStatus, setCheckingSurveyStatus] = useState(false);
    const [preAssessmentExists, setPreAssessmentExists] = useState(false);
    const [postAssessmentExists, setPostAssessmentExists] = useState(false);
    const [surveysChecked, setSurveysChecked] = useState(false);

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
            const token = sessionStorage.getItem('token');
            if (!token) {
                setCheckingEnrollment(false);
                return;
            }

            try {
                // Check registration status by fetching user's enrollments for this event
                const res = await fetch(`http://localhost:3000/api/enrollments/my`, {
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
                                updateEnrollmentCompletion(enrollmentInProgram.user_id, parseInt(id));
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

    // Check survey status when enrollment status changes
    useEffect(() => {
        if (isEnrolled && !checkingEnrollment) {
            checkSurveyStatus();
        }
    }, [isEnrolled, checkingEnrollment]);

    // Survey modal functions
    const triggerSurvey = (type) => {
        setSurveyType(type);
        setShowSurveyModal(true);
    };

    const handleSurveyComplete = () => {
        setShowSurveyModal(false);
        setJustEnrolled(false);
        setJustCompleted(false);
        // Refresh survey status after completion
        checkSurveyStatus();
    };

    const closeSurveyModal = () => {
        setShowSurveyModal(false);
        setJustEnrolled(false);
        setJustCompleted(false);
    };

    // Function to check survey completion status
    const checkSurveyStatus = async () => {
        // Simplified survey status check - just set default states
        setPreAssessmentExists(false);
        setPostAssessmentExists(false);
        setPreAssessmentCompleted(false);
        setPostAssessmentCompleted(false);
        setSurveysChecked(true);
        setCheckingSurveyStatus(false);
    };

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
                setJustCompleted(true);
                console.log('Course completion updated successfully');
            }
        } catch (err) {
            console.error('Error updating course completion:', err);
        }
    };

    // Function to delete enrollment
    const handleDeleteEnrollment = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đăng ký khóa học này? Tất cả tiến độ học tập sẽ bị xóa.');
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await fetch(`http://localhost:3000/api/enrollments/my/${id}`, {
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
                    program_id: parseInt(id)
                })
            });

            if (res.ok) {
                alert('Đăng ký khóa học thành công!');
                setIsEnrolled(true);
                setJustEnrolled(true);

                // Check survey status after enrollment
                setTimeout(() => {
                    checkSurveyStatus();
                }, 500);
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
            {/* Course Overview Section */}
            <div className="course-overview-section">
                <div className="course-overview-left">
                    <div className="course-image-container">
                        <img
                            src={program.img_link || DefaultImage}
                            alt={program.title}
                            className="course-image"
                            onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                        />
                    </div>
                </div>
                <div className="course-overview-right">
                    <div className="course-info">
                        <h1 className="course-name">{program.title}</h1>
                        <div className="course-meta">
                            <div className="meta-item">
                                <span className="meta-label">Người tạo:</span>
                                <span className="meta-value">{program.creator?.name || program.creator?.email || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Nhóm tuổi:</span>
                                <span className="meta-value">{program.age_group || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Ngày tạo:</span>
                                <span className="meta-value">{new Date(program.create_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="course-description">
                            <p>{program.description}</p>
                        </div>
                    </div>

                    <div className="enroll-section">
                        {checkingEnrollment ? (
                            <div className="enrollment-checking">
                                <div className="loading-spinner"></div>
                                <p>Đang kiểm tra trạng thái đăng ký...</p>
                            </div>
                        ) : isEnrolled ? (
                            <div className="enrolled-status">
                                {isCompleted ? (
                                    <div className="completion-message">
                                        <span className="completion-icon">🎉</span>
                                        <h3>Chúc mừng! Bạn đã hoàn thành khóa học</h3>
                                        {enrollmentData?.complete_at && (
                                            <p>Hoàn thành vào: {new Date(enrollmentData.complete_at).toLocaleDateString('vi-VN')}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="enrolled-message">
                                        <span className="enrolled-icon">✅</span>
                                        <h3>Bạn đã đăng ký khóa học này</h3>
                                        <p>Bạn có thể xem tất cả nội dung khóa học bên dưới</p>
                                    </div>
                                )}

                                {/* Survey Buttons */}
                                {!checkingSurveyStatus && surveysChecked && (
                                    <div className="survey-buttons">
                                        {!isCompleted && !preAssessmentCompleted && preAssessmentExists && (
                                            <button
                                                className="survey-btn pre-assessment-btn"
                                                onClick={() => triggerSurvey('pre-assessment')}
                                            >
                                                📋 Làm đánh giá trước khóa học
                                            </button>
                                        )}
                                        {isCompleted && !postAssessmentCompleted && postAssessmentExists && (
                                            <button
                                                className="survey-btn post-assessment-btn"
                                                onClick={() => triggerSurvey('post-assessment')}
                                            >
                                                📊 Làm đánh giá sau khóa học
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Delete Enrollment Button */}
                                {!isCompleted && (
                                    <button
                                        className={`delete-enrollment-btn ${deleting ? 'deleting' : ''}`}
                                        onClick={handleDeleteEnrollment}
                                        disabled={deleting}
                                    >
                                        {deleting ? 'Đang hủy đăng ký...' : 'Hủy đăng ký khóa học'}
                                    </button>
                                )}
                            </div>
                        ) : (sessionStorage.getItem('token')) ? (
                            <div className="enroll-button-section">
                                <button
                                    className={`enroll-button ${enrolling ? 'enrolling' : ''}`}
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                >
                                    {enrolling ? 'Đang đăng ký...' : 'Đăng ký khóa học'}
                                </button>
                            </div>
                        ) : (
                            <div className="login-required">
                                <p>Vui lòng đăng nhập để đăng ký khóa học</p>
                                <button
                                    className="login-button"
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập ngay
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar Section */}
            {isEnrolled && (
                <div className="progress-section">
                    <div className="progress-header">
                        <h3>Tiến độ học tập</h3>
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
                            <span>
                                {enrollmentData.progress.filter(item => item.complete).length} / {enrollmentData.progress.length} nội dung đã hoàn thành
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Course Content Section */}
            <div className="course-content-section">
                <div className="content-header">
                    <h2>Nội dung khóa học</h2>
                </div>
                <div className="content-table-container">
                    {contentLoading ? (
                        <div className="content-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang tải nội dung khóa học...</p>
                        </div>
                    ) : contentPreview.length > 0 ? (
                        <table className="content-table">
                            <thead>
                                <tr>
                                    <th>Thứ tự</th>
                                    <th>Tên nội dung</th>
                                    <th>Loại nội dung</th>
                                    <th>Hoàn thành</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contentPreview.map((content, index) => {
                                    const isCompleted = enrollmentData?.progress?.find(p => p.content_id === content.content_id)?.complete || false;
                                    return (
                                        <tr key={index} className={isCompleted ? 'completed-row' : ''}>
                                            <td className="order-cell">{content.orders}</td>
                                            <td className="title-cell">{content.title}</td>
                                            <td className="type-cell">
                                                <span className={`content-type ${content.type}`}>
                                                    {content.type === 'article' ? 'Bài viết' :
                                                        content.type === 'video' ? 'Video' :
                                                            content.type === 'audio' ? 'Âm thanh' : content.type}
                                                </span>
                                            </td>
                                            <td className="complete-cell">
                                                {isEnrolled ? (
                                                    <span className={`completion-status ${isCompleted ? 'completed' : 'pending'}`}>
                                                        {isCompleted ? '✅' : '⏳'}
                                                    </span>
                                                ) : (
                                                    <span className="not-enrolled">-</span>
                                                )}
                                            </td>
                                            <td className="action-cell">
                                                {isEnrolled ? (
                                                    <button
                                                        className="view-content-btn"
                                                        onClick={() => handleViewContent(content.content_id)}
                                                    >
                                                        Xem nội dung
                                                    </button>
                                                ) : (
                                                    <span className="enroll-required">Cần đăng ký</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-content">
                            <span className="no-content-icon">📚</span>
                            <p>Nội dung khóa học sẽ được cập nhật sớm nhất</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Survey Modal */}
            <SurveyModal
                isOpen={showSurveyModal}
                onClose={closeSurveyModal}
                programId={parseInt(id)}
                surveyType={surveyType}
                onComplete={handleSurveyComplete}
            />
        </div>
    );
};

export default DetailCoursePage;
