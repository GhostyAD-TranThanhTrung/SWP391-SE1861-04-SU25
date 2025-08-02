import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/DetailCommunityEventPage.scss';
import DefaultImage from '../images/Images.jpg';
import SurveyModal from '../components/SurveyModal';

const DetailCommunityEventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [contentPreview, setContentPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(true);
    // Removed userId state; backend will get userId from token
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Survey modal states
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [surveyType, setSurveyType] = useState(''); // 'pre-assessment' or 'post-assessment'
    const [justRegistered, setJustRegistered] = useState(false);
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
                if (!res.ok) throw new Error('Không thể tải dữ liệu sự kiện cộng đồng');
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

        const checkRegistrationStatus = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setCheckingRegistration(false);
                return;
            }

            try {
                // Decode token to get user ID
                // Do NOT decode token on frontend. Backend will get userId from token.
                setUserId(null); // Optionally clear userId, or remove this line if not needed

                // Check registration status by fetching user's enrollments for this event
                const res = await fetch(`http://localhost:3000/api/enrollments/my`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Check if user is registered for this specific event
                    const registrationInEvent = data.data && data.data.find(enrollment =>
                        enrollment.program_id === parseInt(id)
                    );

                    if (registrationInEvent) {
                        setIsRegistered(true);
                        setEnrollmentData(registrationInEvent);

                        // Calculate progress percentage
                        if (registrationInEvent.progress && Array.isArray(registrationInEvent.progress)) {
                            const totalContent = registrationInEvent.progress.length;
                            const completedContent = registrationInEvent.progress.filter(item => item.complete).length;
                            const percentage = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
                            setProgressPercentage(percentage);

                            // Check if event is completed
                            const allCompleted = totalContent > 0 && completedContent === totalContent;
                            setIsCompleted(!!registrationInEvent.complete_at || allCompleted);

                            // If all content is complete but complete_at is not set, update it
                            if (allCompleted && !registrationInEvent.complete_at) {
                                updateRegistrationCompletion(tokenPayload.userId, parseInt(id));
                            }
                        }
                    } else {
                        setIsRegistered(false);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi kiểm tra trạng thái đăng ký:', err);
                setIsRegistered(false);
            } finally {
                setCheckingRegistration(false);
            }
        };

        fetchProgram();
        fetchContentPreview();
        checkRegistrationStatus();
    }, [id]);

    // Check survey status when registration status changes
    useEffect(() => {
        if (isRegistered && !checkingRegistration) {
            checkSurveyStatus();
        }
    }, [isRegistered, checkingRegistration]);

    // Survey modal functions
    const triggerSurvey = (type) => {
        // Check if survey exists before opening modal
        if (type === 'pre-assessment' && !preAssessmentExists) {
            alert('Pre-event assessment is not available for this community event yet.');
            return;
        }
        if (type === 'post-assessment' && !postAssessmentExists) {
            alert('Post-event assessment is not available for this community event yet.');
            return;
        }

        setSurveyType(type);
        setShowSurveyModal(true);
    };

    const handleSurveyComplete = () => {
        setShowSurveyModal(false);
        setJustRegistered(false);
        setJustCompleted(false);
        // Refresh survey status after completion
        checkSurveyStatus();
    };

    const closeSurveyModal = () => {
        setShowSurveyModal(false);
        setJustRegistered(false);
        setJustCompleted(false);
    };

    // Function to check survey completion status
    const checkSurveyStatus = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token || !isRegistered) return;

        setCheckingSurveyStatus(true);
        try {
            // Check for pre-assessment survey
            const preResponse = await fetch(
                `http://localhost:3000/api/surveys/program/${id}/type/pre-assessment`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            let preExists = false;
            let preCompleted = false;

            if (preResponse.ok) {
                const preData = await preResponse.json();
                if (preData.success && preData.data && preData.data.length > 0) {
                    preExists = true;
                    const preSurvey = preData.data[0];

                    // Check if user has responded
                    const preCheckResponse = await fetch(
                        `http://localhost:3000/api/survey-responses/check/${preSurvey.survey_id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (preCheckResponse.ok) {
                        const preCheckData = await preCheckResponse.json();
                        preCompleted = preCheckData.success && preCheckData.hasResponded;
                    }
                }
            }

            // Check for post-assessment survey
            const postResponse = await fetch(
                `http://localhost:3000/api/surveys/program/${id}/type/post-assessment`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            let postExists = false;
            let postCompleted = false;

            if (postResponse.ok) {
                const postData = await postResponse.json();
                if (postData.success && postData.data && postData.data.length > 0) {
                    postExists = true;
                    const postSurvey = postData.data[0];

                    // Check if user has responded
                    const postCheckResponse = await fetch(
                        `http://localhost:3000/api/survey-responses/check/${postSurvey.survey_id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (postCheckResponse.ok) {
                        const postCheckData = await postCheckResponse.json();
                        postCompleted = postCheckData.success && postCheckData.hasResponded;
                    }
                }
            }

            // Update states
            setPreAssessmentExists(preExists);
            setPostAssessmentExists(postExists);
            setPreAssessmentCompleted(preCompleted);
            setPostAssessmentCompleted(postCompleted);
            setSurveysChecked(true);

        } catch (err) {
            console.error('Error checking survey status:', err);
            // Set defaults if there's an error
            setPreAssessmentExists(false);
            setPostAssessmentExists(false);
            setPreAssessmentCompleted(false);
            setPostAssessmentCompleted(false);
            setSurveysChecked(true);
        } finally {
            setCheckingSurveyStatus(false);
        }
    };

    // Function to update registration completion
    const updateRegistrationCompletion = async (userId, programId) => {
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
                console.log('Event participation updated successfully');

                // Trigger post-assessment survey
                setTimeout(() => {
                    triggerSurvey('post-assessment');
                }, 1000); // Small delay to let completion state update
            }
        } catch (err) {
            console.error('Error updating event participation:', err);
        }
    };

    // Function to cancel registration
    const handleCancelRegistration = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này? Tất cả thông tin tham gia sẽ bị xóa.');
        if (!confirmed) return;

        setCancelling(true);
        console.log('🚀 Starting cancel registration process...');
        console.log('📋 Program ID:', id);
        console.log('🔑 Token available:', !!token);

        try {
            const apiUrl = `http://localhost:3000/api/enrollments/my/${id}`;
            console.log('📡 Making DELETE request to:', apiUrl);

            const res = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📨 Response status:', res.status);
            console.log('✅ Response ok:', res.ok);

            if (res.ok) {
                const responseData = await res.json();
                console.log('🎉 Cancel registration successful:', responseData);

                // Reset all registration-related states
                setIsRegistered(false);
                setEnrollmentData(null);
                setProgressPercentage(0);
                setIsCompleted(false);
                alert('Đã hủy đăng ký tham gia sự kiện thành công!');
            } else {
                const errorData = await res.json();
                console.error('❌ Cancel registration failed:', errorData);
                alert(errorData.message || 'Có lỗi xảy ra khi hủy đăng ký');
            }
        } catch (err) {
            console.error('💥 Error cancelling registration:', err);
            alert('Có lỗi xảy ra khi hủy đăng ký tham gia sự kiện');
        } finally {
            setCancelling(false);
            console.log('🏁 Cancel registration process completed');
        }
    };

    const handleRegister = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setRegistering(true);
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
                alert('Đăng ký tham gia sự kiện thành công!');
                setIsRegistered(true);
                setJustRegistered(true);

                // Check survey status after registration
                setTimeout(() => {
                    checkSurveyStatus();
                }, 500);

                // Trigger pre-assessment survey after successful registration
                setTimeout(() => {
                    triggerSurvey('pre-assessment');
                }, 1500); // Small delay to let registration success message show
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Có lỗi xảy ra khi đăng ký');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi đăng ký tham gia sự kiện');
        } finally {
            setRegistering(false);
        }
    };

    const handleViewContent = (contentId) => {
        // Navigate to content page in same tab
        navigate(`/content/${contentId}`);
    };

    if (loading) return (
        <div className="detailcommunity-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin sự kiện cộng đồng...</p>
        </div>
    );

    if (error) return (
        <div className="detailcommunity-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <Link to="/courses" className="error-back-btn">Quay lại danh sách sự kiện</Link>
        </div>
    );

    if (!program) return (
        <div className="detailcommunity-notfound">
            <div className="notfound-icon">🔍</div>
            <p>Không tìm thấy sự kiện cộng đồng.</p>
            <Link to="/courses" className="notfound-back-btn">Quay lại danh sách sự kiện</Link>
        </div>
    );

    return (
        <div className="detailcommunity-container">
            {/* Event Overview Section */}
            <div className="event-overview-section">
                <div className="event-overview-left">
                    <div className="event-image-container">
                        <img
                            src={program.img_link || DefaultImage}
                            alt={program.title}
                            className="event-image"
                            onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                        />
                        <div className="event-badge">
                            <span>🎉 Sự kiện Cộng đồng</span>
                        </div>
                    </div>
                </div>
                <div className="event-overview-right">
                    <div className="event-info">
                        <h1 className="event-name">{program.title}</h1>
                        <div className="event-meta">
                            <div className="meta-item">
                                <span className="meta-label">Tổ chức bởi:</span>
                                <span className="meta-value">{program.creator?.name || program.creator?.email || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Nhóm tuổi:</span>
                                <span className="meta-value">{program.age_group || 'Mọi lứa tuổi'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Ngày tạo:</span>
                                <span className="meta-value">{new Date(program.create_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="event-description">
                            <p>{program.description}</p>
                        </div>
                    </div>

                    <div className="register-section">
                        {checkingRegistration ? (
                            <div className="registration-checking">
                                <div className="loading-spinner"></div>
                                <p>Đang kiểm tra trạng thái đăng ký...</p>
                            </div>
                        ) : isRegistered ? (
                            <div className="registered-status">
                                {isCompleted ? (
                                    <div className="completion-message">
                                        <span className="completion-icon">🎊</span>
                                        <h3>Chúc mừng! Bạn đã hoàn thành sự kiện</h3>
                                        <p>Cảm ơn bạn đã tham gia sự kiện cộng đồng này!</p>
                                        {enrollmentData?.complete_at && (
                                            <p>Hoàn thành vào: {new Date(enrollmentData.complete_at).toLocaleDateString('vi-VN')}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="registered-message">
                                        <span className="registered-icon">✅</span>
                                        <h3>Bạn đã đăng ký tham gia sự kiện này</h3>
                                        <p>Bạn có thể xem tất cả tài liệu và hoạt động sự kiện bên dưới</p>
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
                                                📋 Làm đánh giá trước sự kiện
                                            </button>
                                        )}
                                        {isCompleted && !postAssessmentCompleted && postAssessmentExists && (
                                            <button
                                                className="survey-btn post-assessment-btn"
                                                onClick={() => triggerSurvey('post-assessment')}
                                            >
                                                📊 Làm đánh giá sau sự kiện
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Cancel Registration Button */}
                                {!isCompleted && (
                                    <button
                                        className={`cancel-registration-btn ${cancelling ? 'cancelling' : ''}`}
                                        onClick={handleCancelRegistration}
                                        disabled={cancelling}
                                    >
                                        {cancelling ? 'Đang hủy đăng ký...' : 'Hủy đăng ký tham gia'}
                                    </button>
                                )}
                            </div>
                        ) : userId ? (
                            <div className="register-button-section">
                                <div className="register-benefits">
                            
                                </div>
                                <button
                                    className={`register-button ${registering ? 'registering' : ''}`}
                                    onClick={handleRegister}
                                    disabled={registering}
                                >
                                    {registering ? 'Đang đăng ký...' : 'Đăng ký tham gia sự kiện'}
                                </button>
                            </div>
                        ) : (
                            <div className="login-required">
                                <p>Vui lòng đăng nhập để tham gia sự kiện cộng đồng</p>
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
            {isRegistered && (
                <div className="progress-section">
                    <div className="progress-header">
                        <h3>Mức độ tham gia</h3>
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
                                {enrollmentData.progress.filter(item => item.complete).length} / {enrollmentData.progress.length} hoạt động đã tham gia
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Event Content Section */}
            <div className="event-content-section">
                <div className="content-header">
                    <h2>Tài liệu và Hoạt động Sự kiện</h2>
                </div>
                <div className="content-table-container">
                    {contentLoading ? (
                        <div className="content-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang tải tài liệu sự kiện...</p>
                        </div>
                    ) : contentPreview.length > 0 ? (
                        <table className="content-table">
                            <thead>
                                <tr>
                                    <th>Thứ tự</th>
                                    <th>Tên tài liệu/hoạt động</th>
                                    <th>Loại nội dung</th>
                                    <th>Tham gia</th>
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
                                                {isRegistered ? (
                                                    <span className={`participation-status ${isCompleted ? 'completed' : 'pending'}`}>
                                                        {isCompleted ? '✅' : '⏳'}
                                                    </span>
                                                ) : (
                                                    <span className="not-registered">-</span>
                                                )}
                                            </td>
                                            <td className="action-cell">
                                                {isRegistered ? (
                                                    <button
                                                        className="view-content-btn"
                                                        onClick={() => handleViewContent(content.content_id)}
                                                    >
                                                        Xem tài liệu
                                                    </button>
                                                ) : (
                                                    <span className="register-required">Cần đăng ký</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-content">
                            <span className="no-content-icon">📋</span>
                            <p>Tài liệu sự kiện sẽ được cập nhật sớm nhất</p>
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

export default DetailCommunityEventPage; 