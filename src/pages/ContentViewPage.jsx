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

    useEffect(() => {
        const fetchContent = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                // Get content details
                const contentRes = await fetch(`http://localhost:3000/api/content/${contentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!contentRes.ok) {
                    throw new Error('Không thể tải nội dung');
                }

                const contentData = await contentRes.json();
                setContent(contentData.data);

                // Get content file
                const fileRes = await fetch(`http://localhost:3000/api/content/file/${contentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (fileRes.ok) {
                    const fileData = await fileRes.json();
                    setContentFile(fileData.data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [contentId, navigate]);

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
            <div className="content-view-header">
                <div className="header-info">
                    <h1 className="content-title">{content.title}</h1>
                    <div className="content-meta">
                        <span className="content-type-badge">
                            {content.type === 'article' && '📄'}
                            {content.type === 'video' && '🎥'}
                            {content.type === 'podcast' && '🎧'}
                            {content.type === 'module' && '📚'}
                            {!['article', 'video', 'podcast', 'module'].includes(content.type) && '📝'}
                            {content.type}
                        </span>
                        <span className="content-order">Bài {content.orders}</span>
                    </div>
                </div>
                <button onClick={() => navigate(-1)} className="close-btn">
                    <span className="close-icon">←</span>
                    Quay lại
                </button>
            </div>

            <div className="content-view-body">
                {contentFile ? (
                    <div className="content-display">
                        {renderContent()}
                    </div>
                ) : (
                    <div className="no-content-file">
                        <p>Không có nội dung file để hiển thị</p>
                        {content.content_file_link && (
                            <a
                                href={content.content_file_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                Mở liên kết ngoài
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentViewPage; 