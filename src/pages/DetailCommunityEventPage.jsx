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
    const [userId, setUserId] = useState(null);
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
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setUserId(tokenPayload.userId);

                // Check registration status by fetching user's enrollments for this event
                const res = await fetch(`http://localhost:3000/api/enrollments/user/${tokenPayload.userId}`, {
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
                    user_id: userId,
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
            {/* Header với breadcrumb */}
            <div className="detailcommunity-header">
                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-item">Trang chủ</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/courses" className="breadcrumb-item">Sự kiện cộng đồng</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{program.title}</span>
                </div>
            </div>

            {/* Hero Section for Community Event */}
            <div className="detailcommunity-hero">
                <div className="hero-background">
                    <img
                        src={program.img_link || DefaultImage}
                        alt={program.title}
                        className="hero-bg-image"
                        onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                    />
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content">
                    <div className="event-badge">
                        <i className="bi bi-calendar-heart me-2"></i>
                        Sự kiện Cộng đồng
                    </div>
                    <h1 className="event-title">{program.title}</h1>
                    <div className="event-meta">
                        <div className="meta-item">
                            <i className="bi bi-person-circle me-2"></i>
                            <span>Tổ chức bởi: {program.creator?.name || program.creator?.email || 'Không rõ'}</span>
                        </div>
                        <div className="meta-item">
                            <i className="bi bi-calendar-plus me-2"></i>
                            <span>Ngày tạo: {new Date(program.create_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="meta-item">
                            <i className="bi bi-people me-2"></i>
                            <span>Nhóm tuổi: {program.age_group || 'Mọi lứa tuổi'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="detailcommunity-main">
                {/* Left column - Event Description */}
                <div className="detailcommunity-left">
                    <div className="event-description-card">
                        <h2>
                            <i className="bi bi-info-circle me-2"></i>
                            Giới thiệu sự kiện
                        </h2>
                        <div className="description-content">
                            <p>{program.description}</p>
                        </div>
                        
                        {/* Event Highlights */}
                        <div className="event-highlights">
                            <h3>
                                <i className="bi bi-star me-2"></i>
                                Điểm nổi bật
                            </h3>
                            <div className="highlights-grid">
                                <div className="highlight-item">
                                    <i className="bi bi-people-fill"></i>
                                    <span>Kết nối cộng đồng</span>
                                </div>
                                <div className="highlight-item">
                                    <i className="bi bi-heart-fill"></i>
                                    <span>Hỗ trợ tinh thần</span>
                                </div>
                                <div className="highlight-item">
                                    <i className="bi bi-trophy-fill"></i>
                                    <span>Chia sẻ kinh nghiệm</span>
                                </div>
                                <div className="highlight-item">
                                    <i className="bi bi-lightbulb-fill"></i>
                                    <span>Học hỏi mới</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Registration Info */}
                <div className="detailcommunity-right">
                    <div className="registration-section">
                        <div className="registration-card">
                            {checkingRegistration ? (
                                <div className="registration-checking">
                                    <div className="loading-spinner"></div>
                                    <p>Đang kiểm tra trạng thái đăng ký...</p>
                                </div>
                            ) : isRegistered ? (
                                <div className="registered-info">
                                    <div className="registered-status">
                                        {isCompleted ? (
                                            <>
                                                <div className="completed-icon">
                                                    <i className="bi bi-check-circle-fill"></i>
                                                </div>
                                                <h3>Chúc mừng! Bạn đã hoàn thành sự kiện</h3>
                                                <p>Cảm ơn bạn đã tham gia sự kiện cộng đồng này. Hi vọng bạn đã có những trải nghiệm bổ ích!</p>
                                                {enrollmentData?.complete_at && (
                                                    <p className="completion-date">
                                                        Hoàn thành vào: {new Date(enrollmentData.complete_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="registered-icon">
                                                    <i className="bi bi-calendar-check"></i>
                                                </div>
                                                <h3>Bạn đã đăng ký tham gia sự kiện này</h3>
                                                <p>Bạn có thể xem tất cả thông tin và tài liệu sự kiện bên dưới. Chúc bạn có những trải nghiệm tuyệt vời!</p>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Progress Bar for Community Event */}
                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <h4>Mức độ tham gia</h4>
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
                                                    {enrollmentData.progress.filter(item => item.complete).length} / {enrollmentData.progress.length} hoạt động đã tham gia
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Survey Section */}
                                    <div className="survey-section">
                                        {!checkingSurveyStatus && surveysChecked && (
                                            <>
                                                {/* Show pre-assessment button if survey exists and not completed */}
                                                {preAssessmentExists && !isCompleted && !preAssessmentCompleted && (
                                                    <button
                                                        className="survey-btn pre-assessment-btn"
                                                        onClick={() => triggerSurvey('pre-assessment')}
                                                    >
                                                        <span className="survey-icon">📋</span>
                                                        Take Pre-Event Assessment
                                                    </button>
                                                )}
                                                
                                                {/* Show post-assessment button if survey exists and event completed */}
                                                {postAssessmentExists && isCompleted && !postAssessmentCompleted && (
                                                    <button
                                                        className="survey-btn post-assessment-btn"
                                                        onClick={() => triggerSurvey('post-assessment')}
                                                    >
                                                        <span className="survey-icon">📊</span>
                                                        Take Post-Event Assessment
                                                    </button>
                                                )}

                                                {/* Show completion status for pre-assessment */}
                                                {preAssessmentExists && preAssessmentCompleted && !isCompleted && (
                                                    <div className="survey-status">
                                                        <span className="completed-icon">✅</span>
                                                        Pre-event assessment completed
                                                    </div>
                                                )}

                                                {/* Show completion status when all assessments are done */}
                                                {postAssessmentExists && postAssessmentCompleted && isCompleted && (
                                                    <div className="survey-status">
                                                        <span className="completed-icon">✅</span>
                                                        All assessments completed
                                                    </div>
                                                )}

                                                {/* Show message when no surveys are available */}
                                                {!preAssessmentExists && !postAssessmentExists && (
                                                    <div className="no-surveys-message">
                                                        <span className="info-icon">ℹ️</span>
                                                        No assessments are currently available for this event.
                                                    </div>
                                                )}

                                                {/* Show partial survey availability messages */}
                                                {!preAssessmentExists && postAssessmentExists && !isCompleted && (
                                                    <div className="survey-info">
                                                        <span className="info-icon">📝</span>
                                                        Post-event assessment will be available after completion.
                                                    </div>
                                                )}

                                                {!postAssessmentExists && preAssessmentExists && isCompleted && (
                                                    <div className="survey-info">
                                                        <span className="info-icon">📝</span>
                                                        Post-event assessment is not available for this event.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        {checkingSurveyStatus && (
                                            <div className="survey-loading">
                                                <span className="loading-icon">⏳</span>
                                                Checking survey status...
                                            </div>
                                        )}
                                    </div>

                                    {/* Cancel Registration Button */}
                                    <div className="registration-actions">
                                        <button
                                            className={`cancel-registration-btn ${cancelling ? 'cancelling' : ''}`}
                                            onClick={handleCancelRegistration}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? (
                                                <>
                                                    <span className="cancel-spinner"></span>
                                                    Đang hủy đăng ký...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="cancel-icon">
                                                        <i className="bi bi-x-circle"></i>
                                                    </span>
                                                    Hủy đăng ký tham gia
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : userId ? (
                                <div className="register-info">
                                    <div className="register-icon">
                                        <i className="bi bi-calendar-plus"></i>
                                    </div>
                                    <h3>Đăng ký tham gia sự kiện</h3>
                                    <p>Tham gia sự kiện cộng đồng này để kết nối, chia sẻ và học hỏi cùng với mọi người</p>
                                    <div className="register-benefits">
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            <span>Miễn phí tham gia</span>
                                        </div>
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            <span>Nhận tài liệu sự kiện</span>
                                        </div>
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            <span>Kết nối cộng đồng</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`register-btn ${registering ? 'registering' : ''}`}
                                        onClick={handleRegister}
                                        disabled={registering}
                                    >
                                        {registering ? (
                                            <>
                                                <span className="register-spinner"></span>
                                                Đang đăng ký...
                                            </>
                                        ) : (
                                            <>
                                                <span className="register-icon">
                                                    <i className="bi bi-calendar-heart"></i>
                                                </span>
                                                Đăng ký tham gia ngay
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="login-required">
                                    <div className="login-icon">
                                        <i className="bi bi-person-circle"></i>
                                    </div>
                                    <h3>Cần đăng nhập để tham gia</h3>
                                    <p>Vui lòng đăng nhập để có thể đăng ký tham gia sự kiện cộng đồng này</p>
                                    <button
                                        className="login-btn"
                                        onClick={() => navigate('/login')}
                                    >
                                        <span className="login-icon">
                                            <i className="bi bi-box-arrow-in-right"></i>
                                        </span>
                                        Đăng nhập ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Materials/Content */}
            <div className="detailcommunity-content-section">
                <div className="content-header">
                    <h2>
                        <i className="bi bi-folder2-open me-2"></i>
                        Tài liệu và Hoạt động Sự kiện
                    </h2>
                </div>
                <div className="detailcommunity-content-card">
                    <div className="detailcommunity-content">
                        {contentLoading ? (
                            <div className="content-loading">
                                <div className="loading-spinner"></div>
                                <p>Đang tải tài liệu sự kiện...</p>
                            </div>
                        ) : contentPreview.length > 0 ? (
                            <div className="content-preview-list">
                                <div className="preview-header">
                                    <h3>Danh sách tài liệu và hoạt động ({contentPreview.length} mục)</h3>
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
                                                    {content.type === 'article' ? 'Bài viết' : 
                                                     content.type === 'video' ? 'Video' : 
                                                     content.type === 'audio' ? 'Âm thanh' : content.type}
                                                </span>
                                            </div>
                                        </div>
                                        {isRegistered && (
                                            <div className="content-actions">
                                                <button
                                                    className="view-content-btn"
                                                    onClick={() => handleViewContent(content.content_id)}
                                                >
                                                    <span className="view-icon">
                                                        <i className="bi bi-eye"></i>
                                                    </span>
                                                    Xem tài liệu
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-content">
                                <span className="no-content-icon">📋</span>
                                <p>Tài liệu sự kiện sẽ được cập nhật sớm nhất</p>
                            </div>
                        )}
                    </div>
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