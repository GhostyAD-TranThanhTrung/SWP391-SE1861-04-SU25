import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ContentViewPage.scss';

const ContentViewPage = () => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [contentFile, setContentFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // New state for enrollment and completion tracking
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [checkingCompletion, setCheckingCompletion] = useState(true);
    const [updatingCompletion, setUpdatingCompletion] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            setLoading(true);
            console.log('📚 Fetching content data for ID:', contentId);
            
            try {
                // Get content details
                console.log('📡 GET content from:', `http://localhost:3000/api/content/${contentId}`);
                const contentRes = await fetch(`http://localhost:3000/api/content/${contentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!contentRes.ok) {
                    throw new Error('Không thể tải nội dung');
                }

                const contentData = await contentRes.json();
                console.log('✅ Content data received:', contentData);
                setContent(contentData.data);

                // Get content file
                console.log('📡 GET content file from:', `http://localhost:3000/api/content/file/${contentId}`);
                const fileRes = await fetch(`http://localhost:3000/api/content/file/${contentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (fileRes.ok) {
                    const fileData = await fileRes.json();
                    console.log('✅ Content file data received:', fileData);
                    setContentFile(fileData.data);
                }

                // Check enrollment status for this content's program
                if (contentData.data && contentData.data.program_id) {
                    await checkEnrollmentAndCompletion(contentData.data.program_id, parseInt(contentId), token);
                }
            } catch (err) {
                console.error('💥 Error fetching content:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [contentId, navigate]);

    const checkEnrollmentAndCompletion = async (programId, contentIdNum, token) => {
        setCheckingCompletion(true);
        console.log('🔍 Checking enrollment for program:', programId, 'content:', contentIdNum);
        
        try {
            // Check if user is enrolled in this program
            console.log('📡 GET enrollment check from:', `http://localhost:3000/api/enrollments/check/${programId}`);
            const enrollmentRes = await fetch(`http://localhost:3000/api/enrollments/check/${programId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (enrollmentRes.ok) {
                const enrollmentData = await enrollmentRes.json();
                console.log('✅ Enrollment check response:', enrollmentData);
                
                if (enrollmentData.data && enrollmentData.data.length > 0) {
                    const enrollment = enrollmentData.data[0];
                    setEnrollmentData(enrollment);
                    console.log('📚 Enrollment found:', enrollment);
                    
                    // Check if this specific content is completed
                    const progress = enrollment.progress || [];
                    const contentProgress = progress.find(p => p.content_id === contentIdNum);
                    const completed = contentProgress ? contentProgress.complete : false;
                    setIsCompleted(completed);
                    console.log(`🎯 Content ${contentIdNum} completion status:`, completed);
                } else {
                    console.log('❌ User not enrolled in this program');
                    setEnrollmentData(null);
                    setIsCompleted(false);
                }
            }
        } catch (err) {
            console.error('💥 Error checking enrollment:', err);
        } finally {
            setCheckingCompletion(false);
        }
    };

    const handleToggleCompletion = async () => {
        if (!enrollmentData || !content) {
            console.log('❌ Cannot toggle - no enrollment or content data');
            return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log('❌ No token available');
            return;
        }

        setUpdatingCompletion(true);
        console.log('🔄 Toggling completion for content:', contentId);

        try {
            // Create composite enroll_id in format "userId_programId"
            const enrollId = `${enrollmentData.user_id}_${enrollmentData.program_id}`;
            console.log('🆔 Using enroll ID:', enrollId);

            const url = `http://localhost:3000/api/enrollments/${enrollId}/content/${contentId}/toggle`;
            console.log('📡 PATCH to:', url);

            const res = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📊 Toggle response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('✅ Toggle successful! Response data:', data);
                
                // Update local state
                setEnrollmentData(data.data);
                const progress = data.data.progress || [];
                const contentProgress = progress.find(p => p.content_id === parseInt(contentId));
                const newCompletionStatus = contentProgress ? contentProgress.complete : false;
                setIsCompleted(newCompletionStatus);
                
                console.log('🎉 Content completion updated to:', newCompletionStatus);
                alert(`Nội dung đã được đánh dấu ${newCompletionStatus ? 'hoàn thành' : 'chưa hoàn thành'}!`);
            } else {
                const errorData = await res.json();
                console.error('❌ Toggle failed:', errorData);
                alert(errorData.message || 'Có lỗi xảy ra khi cập nhật tiến độ');
            }
        } catch (err) {
            console.error('💥 Error toggling completion:', err);
            alert('Có lỗi xảy ra khi cập nhật tiến độ học tập');
        } finally {
            setUpdatingCompletion(false);
        }
    };

    const renderContent = () => {
        if (!contentFile) return null;

        switch (contentFile.type) {
            case 'markdown':
                return (
                    <div className="markdown-content">
                        <div className="markdown-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(contentFile.content) }} />
                        {contentFile.metadata && (
                            <div className="content-metadata">
                                <h3>Thông tin bổ sung:</h3>
                                <div className="metadata-info">
                                    {contentFile.metadata.author && <p><strong>Tác giả:</strong> {contentFile.metadata.author}</p>}
                                    {contentFile.metadata.readingTime && <p><strong>Thời gian đọc:</strong> {contentFile.metadata.readingTime}</p>}
                                    {contentFile.metadata.difficulty && <p><strong>Độ khó:</strong> {contentFile.metadata.difficulty}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'youtube':
                return (
                    <div className="youtube-content">
                        <div className="video-container">
                            <iframe
                                width="100%"
                                height="500"
                                src={`https://www.youtube.com/embed/${contentFile.videoId}`}
                                title={content.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        {contentFile.metadata && (
                            <div className="content-metadata">
                                <h3>Thông tin video:</h3>
                                <div className="metadata-info">
                                    {contentFile.metadata.duration && <p><strong>Thời lượng:</strong> {contentFile.metadata.duration}</p>}
                                    {contentFile.metadata.instructor && <p><strong>Giảng viên:</strong> {contentFile.metadata.instructor}</p>}
                                    {contentFile.metadata.expert && <p><strong>Chuyên gia:</strong> {contentFile.metadata.expert}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'youtube_audio':
                return (
                    <div className="youtube-audio-content">
                        <div className="audio-container">
                            <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${contentFile.videoId}`}
                                title={content.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        {contentFile.metadata && (
                            <div className="content-metadata">
                                <h3>Thông tin podcast:</h3>
                                <div className="metadata-info">
                                    {contentFile.metadata.duration && <p><strong>Thời lượng:</strong> {contentFile.metadata.duration}</p>}
                                    {contentFile.metadata.host && <p><strong>Người dẫn:</strong> {contentFile.metadata.host}</p>}
                                    {contentFile.metadata.guest && <p><strong>Khách mời:</strong> {contentFile.metadata.guest}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'external_link':
                return (
                    <div className="external-link-content">
                        <div className="link-info">
                            <p>Nội dung này được lưu trữ bên ngoài.</p>
                            <a
                                href={contentFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link-btn"
                            >
                                Mở liên kết ngoài
                            </a>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="default-content">
                        <p>Loại nội dung không được hỗ trợ: {contentFile.type}</p>
                        {content.content_file_link && (
                            <a
                                href={content.content_file_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                Mở liên kết gốc
                            </a>
                        )}
                    </div>
                );
        }
    };

    const formatMarkdown = (markdown) => {
        if (!markdown) return '';

        // Simple markdown to HTML conversion
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n/gim, '<br/>');

        // Wrap consecutive <li> elements in <ul>
        html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

        return html;
    };

    if (loading) return (
        <div className="content-view-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải nội dung...</p>
        </div>
    );

    if (error) return (
        <div className="content-view-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="close-btn">Quay lại</button>
        </div>
    );

    if (!content) return (
        <div className="content-view-notfound">
            <div className="notfound-icon">🔍</div>
            <p>Không tìm thấy nội dung.</p>
            <button onClick={() => navigate(-1)} className="close-btn">Quay lại</button>
        </div>
    );

    return (
        <div className="content-view-container">
            {/* Top Navigation Bar */}
            <div className="content-nav-bar">
                <div className="nav-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <i className="bi bi-arrow-left"></i>
                        <span>Quay lại</span>
                    </button>
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">Khóa học</span>
                        <i className="bi bi-chevron-right"></i>
                        <span className="breadcrumb-item current">Bài {content.orders}</span>
                    </div>
                </div>
                <div className="nav-right">
                    {enrollmentData && !checkingCompletion && (
                        <button 
                            onClick={handleToggleCompletion} 
                            className={`completion-btn ${isCompleted ? 'completed' : 'incomplete'} ${updatingCompletion ? 'updating' : ''}`}
                            disabled={updatingCompletion}
                            title={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                        >
                            {updatingCompletion ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Đang cập nhật...</span>
                                </>
                            ) : isCompleted ? (
                                <>
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Đã hoàn thành</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-circle"></i>
                                    <span>Đánh dấu hoàn thành</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="content-main">
                {/* Content Header */}
                <div className="content-header">
                    <div className="content-title-section">
                        <h1 className="content-title">{content.title}</h1>
                        <div className="content-badges">
                            <span className="type-badge">
                                {content.type === 'article' && <i className="bi bi-file-text"></i>}
                                {content.type === 'video' && <i className="bi bi-play-circle"></i>}
                                {content.type === 'podcast' && <i className="bi bi-headphones"></i>}
                                {content.type === 'module' && <i className="bi bi-book"></i>}
                                {!['article', 'video', 'podcast', 'module'].includes(content.type) && <i className="bi bi-file"></i>}
                                <span>{content.type}</span>
                            </span>
                            <span className="order-badge">
                                <i className="bi bi-hash"></i>
                                <span>Bài {content.orders}</span>
                            </span>
                            {enrollmentData && (
                                <span className={`status-badge ${isCompleted ? 'completed' : 'incomplete'}`}>
                                    {checkingCompletion ? (
                                        <>
                                            <div className="spinner-small"></div>
                                            <span>Đang kiểm tra...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className={`bi ${isCompleted ? 'bi-check-circle-fill' : 'bi-clock'}`}></i>
                                            <span>{isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="content-body">
                    {contentFile ? (
                        <div className="content-wrapper">
                            {renderContent()}
                        </div>
                    ) : (
                        <div className="no-content-wrapper">
                            <div className="no-content-icon">
                                <i className="bi bi-file-earmark-x"></i>
                            </div>
                            <h3>Không có nội dung để hiển thị</h3>
                            <p>Nội dung này hiện chưa có file đính kèm hoặc đã bị xóa.</p>
                            {content.content_file_link && (
                                <a
                                    href={content.content_file_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="external-link-btn"
                                >
                                    <i className="bi bi-box-arrow-up-right"></i>
                                    <span>Mở liên kết gốc</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentViewPage; 