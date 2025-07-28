import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL, CONTENT_BASE_URL, CONTENT_URLS, getAuthHeaders } from '../service/config';
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

    // New state for navigation between contents
    const [programContents, setProgramContents] = useState([]);
    const [currentContentIndex, setCurrentContentIndex] = useState(-1);
    const [loadingNavigation, setLoadingNavigation] = useState(false);

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
                const contentUrl = `${API_URL}/content/${contentId}`;
                console.log('📡 GET content from:', contentUrl);
                const contentRes = await fetch(contentUrl, {
                    headers: getAuthHeaders()
                });

                if (!contentRes.ok) {
                    throw new Error('Không thể tải nội dung');
                }

                const contentData = await contentRes.json();
                console.log('✅ Content data received:', contentData);
                setContent(contentData.data);

                // Get content file
                const fileUrl = `${API_URL}/content/file/${contentId}`;
                console.log('📡 GET content file from:', fileUrl);
                const fileRes = await fetch(fileUrl, {
                    headers: getAuthHeaders()
                });

                if (fileRes.ok) {
                    const fileData = await fileRes.json();
                    console.log('✅ Content file data received:', fileData);

                    // Handle both new direct content format and legacy file-based format
                    if (fileData.success && fileData.data) {
                        setContentFile(fileData.data);
                        console.log('📄 Content type detected:', fileData.data.type);

                        // Log specific handling for markdown content
                        if (fileData.data.type === 'markdown') {
                            console.log('📝 Markdown content length:', fileData.data.content?.length || 0, 'characters');
                        }
                    } else {
                        console.warn('⚠️ Unexpected file response format:', fileData);
                    }
                } else {
                    console.warn('⚠️ Failed to fetch content file, status:', fileRes.status);
                    // Don't treat this as a critical error, content might not have a file
                }

                // Check enrollment status for this content's program
                if (contentData.data && contentData.data.program_id) {
                    await checkEnrollmentAndCompletion(contentData.data.program_id, parseInt(contentId), token);
                    // Fetch all contents in the same program for navigation
                    await fetchProgramContents(contentData.data.program_id);
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

    // Handle image errors after content loads
    useEffect(() => {
        const handleImageErrors = () => {
            const imageContainers = document.querySelectorAll('.image-container');
            const directImages = document.querySelectorAll('.content-image:not(.image-container .content-image)');

            console.log('🔍 Image error detection running:', {
                imageContainers: imageContainers.length,
                directImages: directImages.length
            });

            // Handle markdown images in containers
            imageContainers.forEach(container => {
                const img = container.querySelector('.content-image');
                const fallback = container.querySelector('.image-error-fallback');
                const isBackend = container.getAttribute('data-is-backend') === 'true';
                const isExternal = container.getAttribute('data-is-external') === 'true';
                
                if (img && fallback) {
                    const showFallback = () => {
                        console.log(`❌ Image failed to load: ${img.src} (Backend: ${isBackend}, External: ${isExternal})`);
                        img.style.display = 'none';
                        fallback.style.display = 'block';
                    };

                    // More aggressive error detection
                    const checkImageFailed = () => {
                        return (img.complete && img.naturalHeight === 0) || 
                               (img.complete && img.naturalWidth === 0) ||
                               img.src === '' || 
                               img.src === window.location.href;
                    };

                    // Check if image already failed to load
                    if (checkImageFailed()) {
                        console.log('🚨 Image already failed, showing fallback immediately');
                        showFallback();
                    } else {
                        // Set up error handlers
                        img.onerror = showFallback;
                        
                        // Set a timeout to check for CORS/network errors that don't trigger onerror
                        const timeoutId = setTimeout(() => {
                            if (checkImageFailed()) {
                                console.log('⏰ Image timeout detected, showing fallback');
                                showFallback();
                            }
                        }, 5000); // 5 second timeout
                        
                        // For backend images, also check if they load successfully
                        if (isBackend) {
                            img.onload = () => {
                                console.log(`✅ Backend image loaded successfully: ${img.src}`);
                                clearTimeout(timeoutId);
                                fallback.style.display = 'none';
                                img.style.display = 'block';
                            };
                        } else if (isExternal) {
                            // For external images, be more aggressive about showing fallbacks
                            img.onload = () => {
                                console.log(`✅ External image loaded successfully: ${img.src}`);
                                clearTimeout(timeoutId);
                                fallback.style.display = 'none';
                                img.style.display = 'block';
                            };
                        }
                    }
                }
            });

            // Handle direct images (create enhanced fallback dynamically)
            directImages.forEach(img => {
                const isBackend = img.src.includes('localhost:3000') || img.src.includes('/api/images/');
                const isExternal = !isBackend && (img.src.startsWith('http://') || img.src.startsWith('https://'));
                
                const checkImageFailed = () => {
                    return (img.complete && img.naturalHeight === 0) || 
                           (img.complete && img.naturalWidth === 0) ||
                           img.src === '' || 
                           img.src === window.location.href;
                };
                
                if (checkImageFailed()) {
                    createDirectImageFallback(img, isBackend, isExternal);
                } else {
                    img.onerror = function() {
                        createDirectImageFallback(this, isBackend, isExternal);
                    };
                    
                    // Set timeout for external images
                    if (isExternal) {
                        setTimeout(() => {
                            if (checkImageFailed()) {
                                console.log('⏰ Direct image timeout detected');
                                createDirectImageFallback(img, isBackend, isExternal);
                            }
                        }, 5000);
                    }
                }
            });
        };

        const createDirectImageFallback = (img, isBackend, isExternal) => {
            const src = img.src;
            let errorMessage, linkText;
            
            if (isBackend) {
                errorMessage = "Không thể tải hình ảnh từ server";
                linkText = "Thử tải lại hình ảnh";
            } else if (isExternal) {
                errorMessage = "Không thể tải hình ảnh từ nguồn bên ngoài";
                linkText = "Mở liên kết gốc";
            } else {
                errorMessage = "Không thể tải hình ảnh";
                linkText = "Xem liên kết";
            }
            
            const fallbackHtml = `
                <div class="image-error-fallback" style="padding: 15px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; margin: 10px 0;">
                    <div class="error-message" style="color: #dc3545; font-weight: 500; margin-bottom: 10px;">
                        <i class="bi bi-exclamation-triangle" style="margin-right: 5px;"></i>
                        ${errorMessage}
                    </div>
                    <div class="error-actions" style="margin-bottom: 10px;">
                        <a href="${src}" target="_blank" rel="noopener noreferrer" class="image-link" style="display: inline-flex; align-items: center; color: #0066cc; text-decoration: none; font-size: 14px;">
                            <i class="bi bi-box-arrow-up-right" style="margin-right: 5px;"></i>
                            <span class="link-text">${linkText}</span>
                        </a>
                        ${isBackend ? `
                        <button onclick="this.previousElementSibling.style.display='none'; this.parentElement.parentElement.style.display='none'; this.parentElement.parentElement.previousElementSibling.src='${src}?t=' + Date.now(); this.parentElement.parentElement.previousElementSibling.style.display='block';" 
                            style="margin-left: 10px; padding: 4px 8px; background: #0066cc; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                            <i class="bi bi-arrow-clockwise" style="margin-right: 3px;"></i>
                            Thử lại
                        </button>` : ''}
                    </div>
                    <div class="url-preview" style="margin-top: 8px; padding: 8px; background: #fff; border: 1px solid #e9ecef; border-radius: 4px;">
                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Đường dẫn hình ảnh:</div>
                        <div style="font-size: 11px; color: #495057; word-break: break-all; font-family: monospace;">${src}</div>
                    </div>
                </div>
            `;
            
            console.log(`❌ Image failed to load: ${src} (Backend: ${isBackend}, External: ${isExternal})`);
            img.style.display = 'none';
            img.insertAdjacentHTML('afterend', fallbackHtml);
        };

        // Run immediately and then with delays to catch different types of failures
        if (!loading) {
            // Immediate check
            setTimeout(handleImageErrors, 10);
            // Secondary check for slower loading/CORS issues
            setTimeout(handleImageErrors, 500);
            // Final check for timeout issues
            setTimeout(handleImageErrors, 2000);
        }
    }, [loading, content, contentFile]);

    const fetchProgramContents = async (programId) => {
        setLoadingNavigation(true);
        console.log('📚 Fetching all contents for program:', programId);

        try {
            const contentsUrl = `${API_URL}/content/program/${programId}`;
            console.log('📡 GET program contents from:', contentsUrl);
            const contentsRes = await fetch(contentsUrl, {
                headers: getAuthHeaders()
            });

            if (contentsRes.ok) {
                const contentsData = await contentsRes.json();
                console.log('✅ Program contents received:', contentsData);

                if (contentsData.success && contentsData.data) {
                    const contents = contentsData.data;
                    setProgramContents(contents);

                    // Find current content index
                    const currentIndex = contents.findIndex(c => c.content_id === parseInt(contentId));
                    setCurrentContentIndex(currentIndex);
                    console.log('📍 Current content index:', currentIndex, 'of', contents.length);
                }
            } else {
                console.warn('⚠️ Failed to fetch program contents, status:', contentsRes.status);
            }
        } catch (err) {
            console.error('💥 Error fetching program contents:', err);
        } finally {
            setLoadingNavigation(false);
        }
    };

    const navigateToContent = (direction) => {
        if (currentContentIndex === -1 || programContents.length === 0) {
            return;
        }

        let targetIndex;
        if (direction === 'next') {
            targetIndex = currentContentIndex + 1;
            if (targetIndex >= programContents.length) {
                return;
            }
        } else if (direction === 'prev') {
            targetIndex = currentContentIndex - 1;
            if (targetIndex < 0) {
                console.log('❌ Already at first content');
                return;
            }
        } else {
            return;
        }

        const targetContent = programContents[targetIndex];
        navigate(`/content/${targetContent.content_id}`);
    };

    const canNavigateNext = () => {
        // Chỉ cho phép chuyển tiếp khi content hiện tại đã hoàn thành
        return currentContentIndex >= 0 &&
            currentContentIndex < programContents.length - 1 &&
            isCompleted;
    };

    const canNavigatePrev = () => {
        // Luôn cho phép quay lại content trước đó
        return currentContentIndex > 0;
    };

    const getNextContentTitle = () => {
        if (!canNavigateNext()) return null;
        const nextContent = programContents[currentContentIndex + 1];
        return nextContent.title;
    };

    const getPrevContentTitle = () => {
        if (!canNavigatePrev()) return null;
        const prevContent = programContents[currentContentIndex - 1];
        return prevContent.title;
    };

    const checkEnrollmentAndCompletion = async (programId, contentIdNum, token) => {
        setCheckingCompletion(true);

        try {
            // Check if user is enrolled in this program
            const enrollmentUrl = `${API_URL}/enrollments/check/${programId}`;
            const enrollmentRes = await fetch(enrollmentUrl, {
                headers: getAuthHeaders()
            });

            if (enrollmentRes.ok) {
                const enrollmentData = await enrollmentRes.json();

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
            return;
        }

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            return;
        }

        setUpdatingCompletion(true);

        try {
            // Create composite enroll_id in format "userId_programId"
            const enrollId = `${enrollmentData.user_id}_${enrollmentData.program_id}`;

            const url = `${API_URL}/enrollments/${enrollId}/content/${contentId}/toggle`;

            const res = await fetch(url, {
                method: 'PATCH',
                headers: getAuthHeaders()
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
                        <div className="podcast-header">
                            <div className="podcast-icon">🎧</div>
                            <h3>Podcast Audio</h3>
                        </div>
                        <div className="audio-wrapper">
                            <div className="audio-container podcast-container">
                                <iframe
                                    src={`https://www.youtube.com/embed/${contentFile.videoId}`}
                                    title={content.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="podcast-iframe"
                                ></iframe>
                            </div>
                        </div>
                        {contentFile.metadata && (
                            <div className="content-metadata podcast-metadata">
                                <h3>Thông tin podcast</h3>
                                <div className="metadata-grid">
                                    {contentFile.metadata.duration && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon">⏱️</div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Thời lượng</span>
                                                <span className="metadata-value">{contentFile.metadata.duration}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.host && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon">🎙️</div>
                                            <div className="metadata-content">
                                                <span className="metadata-label">Người dẫn</span>
                                                <span className="metadata-value">{contentFile.metadata.host}</span>
                                            </div>
                                        </div>
                                    )}
                                    {contentFile.metadata.guest && (
                                        <div className="metadata-card">
                                            <div className="metadata-icon">👤</div>
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
        if (!markdown) {
            console.warn('⚠️ No markdown content provided to formatMarkdown');
            return '';
        }

        console.log('📝 Processing markdown content:', {
            length: markdown.length,
            startsWithHash: markdown.startsWith('#'),
            hasNewlines: markdown.includes('\n'),
            firstLine: markdown.split('\n')[0]
        });

        // Enhanced markdown to HTML conversion with image support using new API endpoint
        let html = markdown
            // Images - enhanced to handle base64, URLs, and API paths (process with gs flag for multiline base64)
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/gs, (match, alt, src) => {
                console.log('🔍 Found image in markdown:', { 
                    alt, 
                    srcLength: src.length,
                    srcStart: src.substring(0, 50),
                    isBase64: src.startsWith('data:image/')
                });
                
                let finalSrc = src.trim(); // Remove any whitespace and newlines
                let isBackendImage = false;
                let isExternalUrl = false;
                
                // Handle base64 images
                if (finalSrc.startsWith('data:image/')) {
                    console.log('✅ Base64 image detected:', {
                        mimeType: finalSrc.split(',')[0],
                        dataLength: finalSrc.length
                    });
                    // Use base64 directly, no modifications needed
                }
                // Handle full external URLs (http/https) - but check if it's our backend
                else if (finalSrc.startsWith('http://') || finalSrc.startsWith('https://')) {
                    if (finalSrc.includes('localhost:3000') || finalSrc.includes('/api/images/')) {
                        console.log('� Detected backend API image URL');
                        isBackendImage = true;
                    } else {
                        console.log('�🌐 Detected external online image URL');
                        isExternalUrl = true;
                    }
                }
                // Handle relative paths - convert through backend API
                else {
                    console.log('📁 Detected relative path, converting via backend API');
                    isBackendImage = true;
                    
                    // Convert relative paths starting with ../image/ to absolute API URLs
                    if (finalSrc.startsWith('../image/')) {
                        const filename = finalSrc.replace('../image/', '');
                        finalSrc = `http://localhost:3000/api/images/${filename}`;
                        console.log('Converted ../image/ path:', finalSrc);
                    } else if (finalSrc.startsWith('./image/')) {
                        const filename = finalSrc.replace('./image/', '');
                        finalSrc = `http://localhost:3000/api/images/${filename}`;
                        console.log('Converted ./image/ path:', finalSrc);
                    } else if (finalSrc.startsWith('/image/')) {
                        const filename = finalSrc.replace('/image/', '');
                        finalSrc = `http://localhost:3000/api/images/${filename}`;
                        console.log('Converted /image/ path:', finalSrc);
                    } else if (finalSrc.includes('/image/')) {
                        // Handle any path containing /image/
                        const filename = finalSrc.substring(finalSrc.lastIndexOf('/image/') + 7);
                        finalSrc = `http://localhost:3000/api/images/${filename}`;
                        console.log('Converted generic /image/ path:', finalSrc);
                    } else if (CONTENT_URLS && CONTENT_URLS.CONVERT_IMAGE_PATH) {
                        finalSrc = CONTENT_URLS.CONVERT_IMAGE_PATH(finalSrc);
                    } else {
                        // Assume it's a filename that should be served by backend
                        finalSrc = `http://localhost:3000/api/images/${finalSrc}`;
                        console.log('Converted filename to backend API path:', finalSrc);
                    }
                }
                
                // Create appropriate error message based on image source type
                let errorMessage, linkText;
                if (isBackendImage) {
                    errorMessage = "Không thể tải hình ảnh từ server";
                    linkText = "Thử tải lại hình ảnh";
                } else if (isExternalUrl) {
                    errorMessage = "Không thể tải hình ảnh từ nguồn bên ngoài";
                    linkText = "Mở liên kết gốc";
                } else {
                    errorMessage = "Không thể tải hình ảnh";
                    linkText = "Xem liên kết";
                }
                
                console.log('🎯 Final image src:', finalSrc.startsWith('data:image/') ? `base64 image (${finalSrc.length} chars)` : finalSrc);
                
                return `<div style="text-align: center !important; margin: 20px auto !important; display: flex !important; justify-content: center !important; align-items: center !important; flex-direction: column !important; width: 100% !important;" class="image-container" data-src="${finalSrc}" data-is-backend="${isBackendImage}" data-is-external="${isExternalUrl}">
                    <img src="${finalSrc}" alt="${alt}" class="content-image img-fluid" style="max-width: 100% !important; height: auto !important; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block !important; margin: 0 auto !important;" />
                    <div class="image-error-fallback" style="display: none; padding: 15px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; margin: 10px auto; max-width: 100%; text-align: center;">
                        <div class="error-icon" style="text-align: center; margin-bottom: 15px;">
                            <div style="width: 200px; height: 150px; background: #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 2px dashed #dee2e6;">
                                <div style="text-align: center; color: #6c757d;">
                                    <i class="bi bi-image" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                                    <span style="font-size: 12px;">Image failed to load</span>
                                </div>
                            </div>
                        </div>
                        <div class="error-message" style="color: #dc3545; font-weight: 500; margin-bottom: 10px;">
                            <i class="bi bi-exclamation-triangle" style="margin-right: 5px;"></i>
                            ${errorMessage}
                        </div>
                        <div class="error-actions" style="margin-bottom: 10px;">
                            <a href="${finalSrc}" target="_blank" rel="noopener noreferrer" class="image-link" style="display: inline-flex; align-items: center; color: #0066cc; text-decoration: none; font-size: 14px;">
                                <i class="bi bi-box-arrow-up-right" style="margin-right: 5px;"></i>
                                <span class="link-text">${linkText}</span>
                            </a>
                            ${isBackendImage ? `
                            <button onclick="this.closest('.image-container').querySelector('.content-image').src='${finalSrc}?t=' + Date.now(); this.closest('.image-error-fallback').style.display='none'; this.closest('.image-container').querySelector('.content-image').style.display='block';" 
                                style="margin-left: 10px; padding: 4px 8px; background: #0066cc; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                <i class="bi bi-arrow-clockwise" style="margin-right: 3px;"></i>
                                Thử lại
                            </button>` : ''}
                        </div>
                        <div class="url-preview" style="margin-top: 8px; padding: 8px; background: #fff; border: 1px solid #e9ecef; border-radius: 4px;">
                            <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Đường dẫn hình ảnh:</div>
                            <div style="font-size: 11px; color: #495057; word-break: break-all; font-family: monospace;">${finalSrc.startsWith('data:image/') ? 'Base64 encoded image data (' + Math.round(finalSrc.length/1000) + 'KB)' : finalSrc}</div>
                        </div>
                    </div>
                </div>`;
            })
            // Headers (process in order from most specific to least specific)
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/__(.*?)__/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/_(.*?)_/gim, '<em>$1</em>')
            // Code blocks (process before inline code)
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // Lists - improved regex to handle multi-line items
            .replace(/^\d+\.\s+(.*$)/gim, '<li class="ordered">$1</li>')
            .replace(/^[-*+]\s+(.*$)/gim, '<li class="unordered">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Horizontal rules
            .replace(/^---+$/gim, '<hr>')
            // Line breaks (convert to br tags)
            .replace(/\n/gim, '<br/>');

        // Wrap consecutive <li> elements in appropriate lists
        html = html.replace(/(<li class="ordered">.*?<\/li>(?:\s*<br\/>\s*<li class="ordered">.*?<\/li>)*)/gims, '<ol>$1</ol>');
        html = html.replace(/(<li class="unordered">.*?<\/li>(?:\s*<br\/>\s*<li class="unordered">.*?<\/li>)*)/gims, '<ul>$1</ul>');

        // Handle tables
        const tableRegex = /(\|.*\|.*<br\/>)+/gm;
        html = html.replace(tableRegex, (match) => {
            const rows = match.trim().split('<br/>').filter(row => row.trim());
            if (rows.length < 2) return match;
            
            let tableHtml = '<table class="table table-bordered table-striped table-responsive">';
            
            // Header row
            const headerCells = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
            if (headerCells.length > 0) {
                tableHtml += '<thead><tr>';
                headerCells.forEach(cell => {
                    tableHtml += `<th>${cell}</th>`;
                });
                tableHtml += '</tr></thead>';
            }
            
            // Skip separator row (usually contains dashes)
            const dataRows = rows.slice(2);
            if (dataRows.length > 0) {
                tableHtml += '<tbody>';
                dataRows.forEach(row => {
                    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                    if (cells.length > 0) {
                        tableHtml += '<tr>';
                        cells.forEach(cell => {
                            tableHtml += `<td>${cell}</td>`;
                        });
                        tableHtml += '</tr>';
                    }
                });
                tableHtml += '</tbody>';
            }
            
            tableHtml += '</table>';
            return tableHtml;
        });

        // Clean up extra br tags around lists, headers, and tables
        html = html.replace(/<br\/>\s*(<[ou]l>)/gim, '$1');
        html = html.replace(/(<\/[ou]l>)\s*<br\/>/gim, '$1');
        html = html.replace(/<br\/>\s*(<h[1-6]>)/gim, '$1');
        html = html.replace(/(<\/h[1-6]>)\s*<br\/>/gim, '$1');
        html = html.replace(/<br\/>\s*(<table)/gim, '$1');
        html = html.replace(/(<\/table>)\s*<br\/>/gim, '$1');

        console.log('📝 Markdown processing complete:', {
            originalLength: markdown.length,
            htmlLength: html.length,
            hasHeaders: html.includes('<h'),
            hasLists: html.includes('<li'),
            hasImages: html.includes('<img')
        });

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
                <p>Đang xử lý dữ liệu từ API mới</p>
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
            <style>
                {`
                    .content-view-page .markdown-content .image-container {
                        text-align: center !important;
                        margin: 20px auto !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        flex-direction: column !important;
                        width: 100% !important;
                    }
                    .content-view-page .markdown-content .content-image {
                        display: block !important;
                        margin: 0 auto !important;
                        max-width: 100% !important;
                        height: auto !important;
                    }
                `}
            </style>
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
                            ) : content?.content_file_link ? (
                                // Fallback: Try to render direct markdown content from content_file_link
                                (() => {
                                    const directContent = content.content_file_link;
                                    console.log('🔄 Attempting fallback rendering for direct content:', {
                                        hasContent: !!directContent,
                                        startsWithHash: directContent?.startsWith('#'),
                                        isUrl: directContent?.startsWith('http'),
                                        length: directContent?.length
                                    });

                                    // Check if content_file_link contains direct markdown
                                    if (directContent && (directContent.startsWith('#') || directContent.includes('\n') || directContent.includes('![') || directContent.includes('data:image/'))) {
                                        console.log('✅ Detected direct markdown/content in content_file_link, rendering inline');
                                        
                                        // Special handling for base64 images that might be stored directly
                                        let processedContent = directContent;
                                        
                                        // If content contains base64 image data, wrap it in markdown format if not already
                                        if (directContent.includes('data:image/') && !directContent.includes('![')) {
                                            const base64Match = directContent.match(/(data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+)/);
                                            if (base64Match) {
                                                console.log('📸 Found standalone base64 image, wrapping in markdown');
                                                processedContent = `![Image](${base64Match[1]})`;
                                            }
                                        }
                                        
                                        return (
                                            <div className="content-display markdown-display">
                                                <div className="fallback-notice">
                                                    <i className="bi bi-info-circle"></i>
                                                    <span>Hiển thị nội dung trực tiếp</span>
                                                </div>
                                                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(processedContent) }} />
                                            </div>
                                        );
                                    }
                                    // Check if content_file_link is a direct image URL or base64
                                    else if (directContent && (
                                        directContent.startsWith('data:image/') ||
                                        directContent.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) ||
                                        (directContent.startsWith('http') && directContent.includes('image'))
                                    )) {
                                        console.log('🖼️ Detected direct image content in content_file_link');
                                        const isBackend = directContent.includes('localhost:3000') || directContent.includes('/api/images/');
                                        const isExternal = !isBackend && (directContent.startsWith('http://') || directContent.startsWith('https://'));
                                        
                                        let errorMessage, linkText;
                                        if (isBackend) {
                                            errorMessage = "Không thể tải hình ảnh từ server";
                                            linkText = "Thử tải lại hình ảnh";
                                        } else if (isExternal) {
                                            errorMessage = "Không thể tải hình ảnh từ nguồn bên ngoài";
                                            linkText = "Mở liên kết gốc";
                                        } else {
                                            errorMessage = "Không thể tải hình ảnh";
                                            linkText = "Xem liên kết";
                                        }
                                        
                                        return (
                                            <div className="content-display image-display">
                                                <div className="image-wrapper" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center'}}>
                                                    <div className="image-container" data-src={directContent} data-is-backend={isBackend} data-is-external={isExternal}>
                                                        <img 
                                                            src={directContent} 
                                                            alt={content.title || 'Content Image'} 
                                                            className="content-image direct-image"
                                                            style={{
                                                                maxHeight: '60vw',
                                                                width: 'auto',
                                                                display: 'block',
                                                                margin: '20px auto',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                        <div className="image-error-fallback" style={{display: 'none', padding: '15px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', marginTop: '10px'}}>
                                                            <div className="error-message" style={{color: '#dc3545', fontWeight: '500', marginBottom: '10px'}}>
                                                                <i className="bi bi-exclamation-triangle" style={{marginRight: '5px'}}></i>
                                                                {errorMessage}
                                                            </div>
                                                            <div className="error-actions">
                                                                <a href={directContent} target="_blank" rel="noopener noreferrer" className="image-link" style={{display: 'inline-flex', alignItems: 'center', color: '#0066cc', textDecoration: 'none', fontSize: '14px'}}>
                                                                    <i className="bi bi-box-arrow-up-right" style={{marginRight: '5px'}}></i>
                                                                    <span className="link-text">{linkText}</span>
                                                                </a>
                                                                {isBackend && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            const container = e.target.closest('.image-container');
                                                                            const img = container.querySelector('.content-image');
                                                                            const fallback = container.querySelector('.image-error-fallback');
                                                                            img.src = directContent + '?t=' + Date.now();
                                                                            fallback.style.display = 'none';
                                                                            img.style.display = 'block';
                                                                        }}
                                                                        style={{marginLeft: '10px', padding: '4px 8px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer'}}
                                                                    >
                                                                        <i className="bi bi-arrow-clockwise" style={{marginRight: '3px'}}></i>
                                                                        Thử lại
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="url-preview" style={{marginTop: '8px', padding: '8px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px'}}>
                                                                <div style={{fontSize: '12px', color: '#6c757d', marginBottom: '4px'}}>Đường dẫn hình ảnh:</div>
                                                                <div style={{fontSize: '11px', color: '#495057', wordBreak: 'break-all', fontFamily: 'monospace'}}>
                                                                    {directContent.startsWith('data:image/') ? `Base64 encoded image data (${Math.round(directContent.length/1000)}KB)` : directContent}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    // If it's a URL, show external link
                                    else if (directContent && directContent.startsWith('http')) {
                                        console.log('🔗 Detected URL in content_file_link');
                                        return (
                                            <div className="content-display external-display">
                                                <div className="external-wrapper">
                                                    <div className="external-icon">→</div>
                                                    <h3>Nội dung bên ngoài</h3>
                                                    <p>Nội dung này được lưu trữ trên một trang web bên ngoài.</p>
                                                    <a
                                                        href={directContent}
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
                                    }
                                    // Otherwise show no content state
                                    else {
                                        console.log('❌ Could not determine content type from content_file_link');
                                        return (
                                            <div className="no-content-state">
                                                <div className="no-content-icon">•</div>
                                                <h3>Không có nội dung</h3>
                                                <p>Nội dung này hiện chưa có file đính kèm.</p>
                                                {directContent && (
                                                    <div className="debug-info">
                                                        <details>
                                                            <summary>Thông tin debug</summary>
                                                            <pre>{directContent.substring(0, 200)}...</pre>
                                                        </details>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                })()
                            ) : (
                                <div className="no-content-state">
                                    <div className="no-content-icon">•</div>
                                    <h3>Không có nội dung</h3>
                                    <p>Nội dung này hiện chưa có file đính kèm.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Completion Section */}
                    {enrollmentData && !checkingCompletion && (
                        <section className="content-completion-section">
                            <div className="completion-container">
                                <div className="completion-info">
                                    <h3>Hoàn thành bài học</h3>
                                    <p>Đánh dấu bài học này là đã hoàn thành để tiếp tục với bài học tiếp theo.</p>
                                </div>
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
                            </div>
                        </section>
                    )}

                    {/* Navigation Section */}
                    {programContents.length > 0 && (
                        <section className="content-navigation-section">
                            <div className="navigation-container">
                                <div className="navigation-info">
                                    <span className="navigation-counter">
                                        Bài {currentContentIndex + 1} của {programContents.length}
                                    </span>
                                </div>
                                <div className="navigation-buttons">
                                    <button
                                        onClick={() => navigateToContent('prev')}
                                        className={`nav-button prev-button ${!canNavigatePrev() ? 'disabled' : ''}`}
                                        disabled={!canNavigatePrev() || loadingNavigation}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                        <div className="nav-button-content">
                                            <span className="nav-button-label">Bài trước</span>
                                            {getPrevContentTitle() && (
                                                <span className="nav-button-title">{getPrevContentTitle()}</span>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => navigateToContent('next')}
                                        className={`nav-button next-button ${!canNavigateNext() ? 'disabled' : ''} ${isCompleted ? 'completed' : 'incomplete'}`}
                                        disabled={!canNavigateNext() || loadingNavigation}
                                        title={!isCompleted ? 'Hãy hoàn thành bài học này trước khi chuyển sang bài tiếp theo' : ''}
                                    >
                                        <div className="nav-button-content">
                                            <span className="nav-button-label">Bài tiếp theo</span>
                                            {getNextContentTitle() && (
                                                <span className="nav-button-title">{getNextContentTitle()}</span>
                                            )}
                                            {!isCompleted && (
                                                <span className="nav-button-hint">(Cần hoàn thành bài này)</span>
                                            )}
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ContentViewPage; 