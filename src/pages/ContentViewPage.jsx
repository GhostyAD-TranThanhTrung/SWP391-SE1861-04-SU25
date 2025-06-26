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

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

            console.log('Toggle response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Toggle successful! Response data:', data);
                
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
                    <div className="content-display markdown-display">
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(contentFile.content) }} />
                        {contentFile.metadata && (
                            <div className="content-metadata">
                                                                <h3>Thông tin bổ sung</h3>
                                <div className="metadata-grid">
                                    {contentFile.metadata.author && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon"></div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Tác giả</span>
                                                <span className="metadata-value">{contentFile.metadata.author}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.readingTime && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon"></div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Thời gian đọc</span>
                                                <span className="metadata-value">{contentFile.metadata.readingTime}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.difficulty && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon"></div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Độ khó</span>
                                                <span className="metadata-value">{contentFile.metadata.difficulty}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'youtube':
                return (
                    <div className="content-display video-display">
                        <div className="video-wrapper">
                            <div className="video-container">
                                <iframe
                                    src={`https://www.youtube.com/embed/${contentFile.videoId}`}
                                    title={content.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                        {contentFile.metadata && (
                            <div className="content-metadata">
                                <h3>Thông tin video</h3>
                                <div className="metadata-grid">
                                    {contentFile.metadata.duration && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon"></div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Thời lượng</span>
                                                <span className="metadata-value">{contentFile.metadata.duration}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.instructor && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon"></div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Giảng viên</span>
                                                <span className="metadata-value">{contentFile.metadata.instructor}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.expert && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon"></div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Chuyên gia</span>
                                                <span className="metadata-value">{contentFile.metadata.expert}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'youtube_audio':
                return (
                    <div className="content-display audio-display">
                        <div className="audio-wrapper">
                            <div className="audio-container">
                                <iframe
                                    src={`https://www.youtube.com/embed/${contentFile.videoId}`}
                                    title={content.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                        {contentFile.metadata && (
                            <div className="content-metadata">
                                <h3>Thông tin podcast</h3>
                                <div className="metadata-grid">
                                    {contentFile.metadata.duration && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon">•</div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Thời lượng</span>
                                                <span className="metadata-value">{contentFile.metadata.duration}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.host && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon">•</div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Người dẫn</span>
                                                <span className="metadata-value">{contentFile.metadata.host}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.guest && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon">•</div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Khách mời</span>
                                                <span className="metadata-value">{contentFile.metadata.guest}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'external_link':
                return (
                    <div className="content-display external-display">
                        <div className="external-wrapper">
                            <div className="external-icon">→</div>
                            <h3>Nội dung bên ngoài</h3>
                            <p>Nội dung này được lưu trữ trên một trang web bên ngoài.</p>
                            <a
                                href={contentFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-btn"
                            >
                                <i className="bi bi-box-arrow-up-right"></i>
                                <span>Mở liên kết</span>
                            </a>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="content-display default-display">
                        <div className="default-wrapper">
                            <div className="default-icon">•</div>
                            <h3>Loại nội dung không được hỗ trợ</h3>
                            <p>Loại nội dung: {contentFile.type}</p>
                            {content.content_file_link && (
                                <a
                                    href={content.content_file_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="external-btn"
                                >
                                    <i className="bi bi-box-arrow-up-right"></i>
                                    <span>Mở liên kết gốc</span>
                                </a>
                            )}
                        </div>
                    </div>
                );
        }
    };

    const formatMarkdown = (markdown) => {
        if (!markdown) return '';

        // Enhanced markdown to HTML conversion with image support
        let html = markdown
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-image" />')
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // Lists
            .replace(/^\d+\. (.*$)/gim, '<li class="ordered">$1</li>')
            .replace(/^[-*+] (.*$)/gim, '<li class="unordered">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n/gim, '<br/>');

        // Wrap consecutive <li> elements in appropriate lists
        html = html.replace(/(<li class="ordered">.*?<\/li>)/gims, '<ol>$1</ol>');
        html = html.replace(/(<li class="unordered">.*?<\/li>)/gims, '<ul>$1</ul>');

        return html;
    };

    const getContentTypeIcon = () => {
        switch (content?.type) {
            case 'article': return '•';
            case 'video': return '▶';
            case 'podcast': return '♪';
            case 'module': return '■';
            default: return '•';
        }
    };

    if (loading) return (
        <div className="content-page-state">
            <div className="state-container">
                <div className="loading-animation">
                    <div className="loading-spinner"></div>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <h3>Đang tải nội dung...</h3>
                <p>Vui lòng chờ một chút</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="content-page-state error-state">
            <div className="state-container">
                <div className="state-icon">!</div>
                <h3>Không thể tải nội dung</h3>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="state-btn">
                    <i className="bi bi-arrow-left"></i>
                    <span>Quay lại</span>
                </button>
            </div>
        </div>
    );

    if (!content) return (
        <div className="content-page-state notfound-state">
            <div className="state-container">
                <div className="state-icon">🔍</div>
                <h3>Không tìm thấy nội dung</h3>
                <p>Nội dung bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <button onClick={() => navigate(-1)} className="state-btn">
                    <i className="bi bi-arrow-left"></i>
                    <span>Quay lại</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="content-view-page">
            {/* Header Navigation */}
            <header className="content-header">
                <div className="header-container">
                    <div className="header-left">
                        <button onClick={() => navigate(-1)} className="back-button">
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div className="breadcrumb">
                            <span className="breadcrumb-item">Khóa học</span>
                            <i className="bi bi-chevron-right"></i>
                            <span className="breadcrumb-item">Bài {content.orders}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        {enrollmentData && !checkingCompletion && (
                            <button 
                                onClick={handleToggleCompletion} 
                                className={`completion-toggle ${isCompleted ? 'completed' : 'incomplete'}`}
                                disabled={updatingCompletion}
                            >
                                {updatingCompletion ? (
                                    <>
                                        <div className="mini-spinner"></div>
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className={`bi ${isCompleted ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                                        <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="content-main">
                <div className="content-container">
                    {/* Content Title Section */}
                    <section className="content-title-section">
                        <div className="title-container">
                            <div className="title-meta">
                                <div className="content-type-badge">
                                    <span className="type-icon">{getContentTypeIcon()}</span>
                                    <span className="type-text">{content.type}</span>
                                </div>
                                <div className="content-order">
                                    <span>Bài {content.orders}</span>
                                </div>
                                {enrollmentData && (
                                    <div className={`status-indicator ${isCompleted ? 'completed' : 'incomplete'}`}>
                                        <i className={`bi ${isCompleted ? 'bi-check-circle-fill' : 'bi-clock'}`}></i>
                                        <span>{isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="content-title">{content.title}</h1>
                        </div>
                    </section>

                    {/* Content Body */}
                    <section className="content-body-section">
                        <div className="content-wrapper">
                            {contentFile ? (
                                renderContent()
                            ) : (
                                <div className="no-content-state">
                                    <div className="no-content-icon">•</div>
                                    <h3>Không có nội dung</h3>
                                    <p>Nội dung này hiện chưa có file đính kèm.</p>
                                    {content.content_file_link && (
                                        <a
                                            href={content.content_file_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="external-btn"
                                        >
                                            <i className="bi bi-box-arrow-up-right"></i>
                                            <span>Mở liên kết gốc</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ContentViewPage; 