import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/BlogPage.scss';
import Image from '../images/Images.jpg';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('view');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userBlogs, setUserBlogs] = useState([]);
    const [userBlogsLoading, setUserBlogsLoading] = useState(false);
    const [newBlog, setNewBlog] = useState({
        title: '',
        body: '',
        status: 'draft'
    });
    const [editingBlog, setEditingBlog] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageUploadProgress, setImageUploadProgress] = useState(0);
    const [expandedBlogs, setExpandedBlogs] = useState(new Set());
    const [contentError, setContentError] = useState('');

    // Suppress React Quill deprecation warnings
    useEffect(() => {
        // Store original console methods
        const originalWarn = console.warn;
        const originalError = console.error;

        // Filter out React Quill deprecation warnings
        console.warn = (...args) => {
            const message = args[0];
            if (typeof message === 'string' &&
                (message.includes('findDOMNode') ||
                    message.includes('DOMNodeInserted') ||
                    message.includes('react-quill'))) {
                return; // Suppress these warnings
            }
            originalWarn.apply(console, args);
        };

        console.error = (...args) => {
            const message = args[0];
            if (typeof message === 'string' &&
                (message.includes('findDOMNode') ||
                    message.includes('DOMNodeInserted') ||
                    message.includes('react-quill'))) {
                return; // Suppress these errors
            }
            originalError.apply(console, args);
        };

        // Cleanup function to restore original console methods
        return () => {
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    // Danh sách từ cấm
    const bannedWords = [
        'đụ', 'địt', 'lồn', 'cặc', 'buồi', 'dái', 'đéo', 'đĩ', 'đít', 'đm',
        'đmm', 'dmm', 'đcm', 'đcmm', 'đkm', 'đkmm', 'cc', 'cl', 'clm', 'cmm', 'cmnr',
        'đjt', 'djt', 'đụ má', 'đụ mẹ', 'địt mẹ', 'đcm', 'vl', 'vcl', 'vãi', 'vkl',
        'fuck', 'shit', 'bitch', 'dick', 'cock', 'pussy', 'asshole', 'motherfucker'
    ];

    // Cấu hình cho React Quill - Updated to reduce deprecation warnings
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent',
        'color', 'background',
        'link'
    ];

    useEffect(() => {
        // Check if user is logged in
        const token = sessionStorage.getItem('token');
        setIsLoggedIn(!!token);

        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const endpoint = 'http://localhost:3000/api/blogs';
            console.log('📡 Fetching blogs from:', endpoint);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('📡 Fetch blogs response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Fetch blogs error:', errorText);
                throw new Error('Không thể tải dữ liệu blog');
            }

            const data = await response.json();
            console.log('📊 Blogs data received:', data);

            // Filter out hidden blogs for public view
            const visibleBlogs = data.data.filter(blog => blog.status !== 'hidden');
            setPosts(visibleBlogs);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu blog:', err);
            setError('Có lỗi xảy ra khi tải dữ liệu blog');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBlogs = async () => {
        if (!isLoggedIn) return;

        try {
            setUserBlogsLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/blogs/my', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Không thể tải blog của bạn');
            }

            const data = await response.json();
            setUserBlogs(data.data);
        } catch (err) {
            console.error('Lỗi khi tải blog của người dùng:', err);
            alert('Có lỗi xảy ra khi tải blog của bạn');
        } finally {
            setUserBlogsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBlog(prev => ({
            ...prev,
            [name]: value
        }));

        // Kiểm tra từ cấm trong tiêu đề
        if (name === 'title') {
            checkForBannedWords(value, 'title');
        }
    };

    const handleEditorChange = (content) => {
        setNewBlog(prev => ({
            ...prev,
            body: content
        }));

        // Kiểm tra từ cấm trong nội dung
        checkForBannedWords(content, 'body');
    };

    // Hàm kiểm tra từ cấm
    const checkForBannedWords = (content, field) => {
        // Tạo một div tạm để parse HTML và lấy text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        // Chuyển về chữ thường để so sánh
        const lowerCaseText = plainText.toLowerCase();

        // Kiểm tra từng từ cấm
        const foundBannedWords = bannedWords.filter(word =>
            lowerCaseText.includes(word.toLowerCase())
        );

        if (foundBannedWords.length > 0) {
            setContentError(`Nội dung chứa từ ngữ không phù hợp: ${foundBannedWords.join(', ')}`);
            return true;
        } else {
            setContentError('');
            return false;
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh!');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB!');
                return;
            }

            setIsImageLoading(true);
            setImageUploadProgress(0);
            setSelectedImage(file);

            // Create preview with loading simulation
            const reader = new FileReader();

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setImageUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 15;
                });
            }, 100);

            reader.onloadstart = () => {
                setImageUploadProgress(10);
            };

            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentLoaded = Math.round((e.loaded / e.total) * 80) + 10; // 10-90%
                    setImageUploadProgress(percentLoaded);
                }
            };

            reader.onload = (e) => {
                clearInterval(progressInterval);
                setImageUploadProgress(100);
                setImagePreview(e.target.result);

                // Complete loading after a short delay
                setTimeout(() => {
                    setIsImageLoading(false);
                    setImageUploadProgress(0);
                }, 500);
            };

            reader.onerror = () => {
                clearInterval(progressInterval);
                setIsImageLoading(false);
                setImageUploadProgress(0);
                alert('Có lỗi xảy ra khi tải hình ảnh!');
            };

            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setIsImageLoading(false);
        setImageUploadProgress(0);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmitBlog = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!newBlog.title.trim()) {
            alert('Vui lòng nhập tiêu đề câu chuyện');
            return;
        }

        if (!newBlog.body.trim()) {
            alert('Vui lòng nhập nội dung câu chuyện');
            return;
        }

        // Validate status
        const validStatuses = ['draft', 'pending', 'published'];
        if (!validStatuses.includes(newBlog.status)) {
            console.error('❌ Invalid status:', newBlog.status);
            alert('Trạng thái không hợp lệ. Vui lòng chọn lại.');
            return;
        }

        console.log('📊 Blog data before submission:', newBlog);

        // Kiểm tra từ cấm trước khi submit
        const hasTitleBannedWords = checkForBannedWords(newBlog.title, 'title');
        const hasBodyBannedWords = checkForBannedWords(newBlog.body, 'body');

        if (hasTitleBannedWords || hasBodyBannedWords) {
            alert('Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa trước khi đăng.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = sessionStorage.getItem('token');
            const isEditing = !!editingBlog;

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('title', newBlog.title);
            formData.append('body', newBlog.body);
            formData.append('status', newBlog.status);

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            let endpoint, method;

            if (isEditing) {
                // Chỉnh sửa blog hiện có
                endpoint = selectedImage
                    ? `http://localhost:3000/api/blogs/${editingBlog.blog_id}/with-image`
                    : `http://localhost:3000/api/blogs/${editingBlog.blog_id}`;
                method = 'PUT';
            } else {
                // Tạo blog mới
                endpoint = selectedImage
                    ? 'http://localhost:3000/api/blogs/with-image'
                    : 'http://localhost:3000/api/blogs';
                method = 'POST';
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // Don't set Content-Type for FormData, let browser set it with boundary
            if (!selectedImage) {
                headers['Content-Type'] = 'application/json';
            }

            // Show upload progress for image uploads
            if (selectedImage) {
                setImageUploadProgress(0);
            }

            console.log('📡 Making request to:', endpoint);
            console.log('📝 Method:', method);
            console.log('📋 Headers:', headers);
            console.log('💾 Has image:', !!selectedImage);
            console.log('📄 Request body type:', selectedImage ? 'FormData' : 'JSON');

            const response = await fetch(endpoint, {
                method: method,
                headers: headers,
                body: selectedImage ? formData : JSON.stringify(newBlog)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`${isEditing ? 'Không thể cập nhật câu chuyện' : 'Không thể tạo câu chuyện mới'} (${response.status}): ${errorText}`);
            }

            // Simulate completion progress
            if (selectedImage) {
                setImageUploadProgress(100);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Reset form
            setNewBlog({
                title: '',
                body: '',
                status: 'draft'
            });
            setSelectedImage(null);
            setImagePreview(null);
            setIsImageLoading(false);
            setImageUploadProgress(0);
            setEditingBlog(null);
            setContentError('');

            // Reset file input
            const fileInput = document.getElementById('image');
            if (fileInput) {
                fileInput.value = '';
            }

            // Refresh user blogs
            await fetchUserBlogs();

            alert(isEditing ? 'Câu chuyện đã được cập nhật thành công!' : 'Câu chuyện đã được chia sẻ thành công!');

            // Nếu đang chỉnh sửa, chuyển về tab blog của tôi
            if (isEditing) {
                setActiveTab('my-blogs');
            }
        } catch (err) {
            console.error('Lỗi khi xử lý câu chuyện:', err);
            alert('Có lỗi xảy ra khi xử lý câu chuyện');
        } finally {
            setIsSubmitting(false);
            setImageUploadProgress(0);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu chuyện này?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/blogs/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể xóa bài viết');
            }

            // Refresh user blogs
            await fetchUserBlogs();
            alert('Câu chuyện đã được xóa thành công!');
        } catch (err) {
            console.error('Lỗi khi xóa bài viết:', err);
            alert('Có lỗi xảy ra khi xóa bài viết');
        }
    };

    const handleUpdateBlogStatus = async (blogId, newStatus) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/blogs/${blogId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Không thể cập nhật trạng thái bài viết');
            }

            // Refresh user blogs
            await fetchUserBlogs();
            alert('Trạng thái câu chuyện đã được cập nhật!');
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const handleEditBlog = (blogId) => {
        // Tìm blog cần chỉnh sửa
        const blogToEdit = userBlogs.find(blog => blog.blog_id === blogId);
        if (!blogToEdit) return;

        // Cập nhật state để chuyển sang chế độ chỉnh sửa
        setEditingBlog(blogToEdit);
        setNewBlog({
            title: blogToEdit.title,
            body: blogToEdit.body,
            status: blogToEdit.status
        });

        // Nếu blog có hình ảnh, hiển thị preview
        if (blogToEdit.img_link) {
            setImagePreview(getImageUrl(blogToEdit.img_link));
        } else {
            setImagePreview(null);
            setSelectedImage(null);
        }

        // Chuyển sang tab tạo blog (sẽ dùng làm tab chỉnh sửa)
        setActiveTab('create');
    };

    const toggleExpandBlog = (blogId) => {
        const newExpanded = new Set(expandedBlogs);
        if (newExpanded.has(blogId)) {
            newExpanded.delete(blogId);
        } else {
            newExpanded.add(blogId);
        }
        setExpandedBlogs(newExpanded);
    };

    // Hàm để hiển thị nội dung HTML an toàn
    const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
    };

    const truncateText = (text, maxLength = 300) => {
        if (!text) return '';

        // Nếu là HTML, xử lý đặc biệt để loại bỏ tags
        if (text.includes('<') && text.includes('>')) {
            // Tạo một div tạm để parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';

            if (plainText.length <= maxLength) return text;

            // Trả về một phần của HTML gốc, không phải plainText
            // Đây là cách đơn giản, không hoàn hảo để cắt HTML
            return text.substring(0, maxLength + 50) + '...';
        }

        // Xử lý text thông thường
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không có ngày';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImageUrl = (imgLink) => {
        if (!imgLink) {
            return Image; // Default placeholder from imports
        }

        // If it's a full URL, return as is
        if (imgLink.startsWith('http')) {
            return imgLink;
        }

        // If it's a relative path, construct full URL
        return `http://localhost:3000${imgLink}`;
    };

    const handleImageError = (e) => {
        // Fallback to default image if the image fails to load
        e.target.src = Image;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'published': { text: 'Đã xuất bản', class: 'badge-success' },
            'draft': { text: 'Bản nháp', class: 'badge-warning' },
            'pending': { text: 'Chờ duyệt', class: 'badge-info' },
            'hidden': { text: 'Đã ẩn', class: 'badge-secondary' }
        };
        const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
        return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    // Switch to user blogs tab and fetch data
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'my-blogs' && isLoggedIn) {
            fetchUserBlogs();
        }
        if (tab === 'view') {
            fetchBlogs();
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="blog-page">
                <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-3">Đang tải dữ liệu blog...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="blog-page">
                <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                    <div className="text-center">
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <section className="blog-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12 text-center">
                            <h1 className="hero-title">
                                Chia sẻ câu chuyện của bạn
                            </h1>
                            <p className="hero-subtitle">
                                Chia sẻ hành trình phục hồi, trải nghiệm sử dụng website và câu chuyện cá nhân của bạn.
                                Cùng nhau xây dựng một cộng đồng hỗ trợ và truyền cảm hứng cho những người khác.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
                {/* Tab Navigation */}
                {isLoggedIn && (
                    <div className="blog-tabs mb-4">
                        <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('view')}
                                    type="button"
                                >
                                    <i className="bi bi-eye me-2"></i>
                                    Xem tất cả blog
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'my-blogs' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('my-blogs')}
                                    type="button"
                                >
                                    <i className="bi bi-person-lines-fill me-2"></i>
                                    Blog của tôi
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('create')}
                                    type="button"
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Tạo blog mới
                                </button>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Tab Content */}
                <div className="tab-content">
                    {/* View All Blogs Tab */}
                    {activeTab === 'view' && (
                        <div className="tab-pane active">
                            {posts.length === 0 ? (
                                <div className="text-center">
                                    <div className="alert alert-info" role="alert">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Hiện tại chưa có bài viết nào.
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Featured Story Section */}
                                    <section className="featured-section mb-5">
                                        <div className="section-header text-center mb-5">
                                            <h2 className="section-title">Câu chuyện nổi bật</h2>
                                            <p className="section-subtitle">Những chia sẻ truyền cảm hứng và ý nghĩa nhất từ cộng đồng</p>
                                        </div>

                                        {posts.length > 0 && (
                                            <div className="featured-post">
                                                <div className="row align-items-center">
                                                    <div className="col-lg-4">
                                                        <div className="featured-image">
                                                            <img
                                                                src={getImageUrl(posts[0].img_link)}
                                                                alt={posts[0].title}
                                                                className="img-fluid rounded-3"
                                                                onError={handleImageError}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-8">
                                                        <div className="featured-content">
                                                            <h3 className="featured-title">{posts[0].title}</h3>
                                                            <p className="featured-meta">
                                                                <i className="bi bi-calendar me-2"></i>
                                                                {formatDate(posts[0].created_at)}
                                                                <span className="mx-2">|</span>
                                                                {getStatusBadge(posts[0].status)}
                                                            </p>
                                                            <div className="featured-excerpt">
                                                                {expandedBlogs.has(posts[0].blog_id) ? (
                                                                    <div>
                                                                        <div dangerouslySetInnerHTML={createMarkup(posts[0].body)} className="blog-content-display"></div>
                                                                        <button
                                                                            className="btn btn-link p-0 text-decoration-none"
                                                                            onClick={() => toggleExpandBlog(posts[0].blog_id)}
                                                                        >
                                                                            <i className="bi bi-chevron-up me-1"></i>
                                                                            Thu gọn
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div dangerouslySetInnerHTML={createMarkup(truncateText(posts[0].body))} className="blog-content-display"></div>
                                                                        {posts[0].body && posts[0].body.length > 300 && (
                                                                            <button
                                                                                className="btn btn-link p-0 text-decoration-none"
                                                                                onClick={() => toggleExpandBlog(posts[0].blog_id)}
                                                                            >
                                                                                <i className="bi bi-chevron-down me-1"></i>
                                                                                Xem thêm
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Link to={`/blog/${posts[0].blog_id}`} className="btn btn-primary mt-3">
                                                                <i className="bi bi-arrow-right me-2"></i>
                                                                Đọc thêm
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* Latest Stories Section */}
                                    {posts.length > 1 && (
                                        <section className="articles-section mb-5">
                                            <div className="section-header text-center mb-5">
                                                <h2 className="section-title">Câu chuyện mới nhất</h2>
                                                <p className="section-subtitle">Những chia sẻ và trải nghiệm mới nhất từ cộng đồng của chúng ta</p>
                                            </div>

                                            <div className="row">
                                                {posts.slice(1).map((post) => (
                                                    <div key={post.blog_id} className="col-lg-4 col-md-6 mb-4">
                                                        <div className="article-card">
                                                            <div className="article-image">
                                                                <img
                                                                    src={getImageUrl(post.img_link)}
                                                                    alt={post.title}
                                                                    className="img-fluid"
                                                                    onError={handleImageError}
                                                                />
                                                            </div>
                                                            <div className="article-content">
                                                                <h4 className="article-title">{post.title}</h4>
                                                                <p className="article-meta">
                                                                    <i className="bi bi-calendar me-2"></i>
                                                                    {formatDate(post.created_at)}
                                                                    <span className="mx-2">|</span>
                                                                    {getStatusBadge(post.status)}
                                                                </p>
                                                                <div className="article-excerpt">
                                                                    {expandedBlogs.has(post.blog_id) ? (
                                                                        <div>
                                                                            <div dangerouslySetInnerHTML={createMarkup(post.body)} className="blog-content-display"></div>
                                                                            <button
                                                                                className="btn btn-link p-0 text-decoration-none small"
                                                                                onClick={() => toggleExpandBlog(post.blog_id)}
                                                                            >
                                                                                <i className="bi bi-chevron-up me-1"></i>
                                                                                Thu gọn
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <div dangerouslySetInnerHTML={createMarkup(truncateText(post.body))} className="blog-content-display"></div>
                                                                            {post.body && post.body.length > 300 && (
                                                                                <button
                                                                                    className="btn btn-link p-0 text-decoration-none small"
                                                                                    onClick={() => toggleExpandBlog(post.blog_id)}
                                                                                >
                                                                                    <i className="bi bi-chevron-down me-1"></i>
                                                                                    Xem thêm
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Link to={`/blog/${post.blog_id}`} className="btn btn-outline-primary mt-2">
                                                                    Đọc bài viết
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* My Blogs Tab */}
                    {activeTab === 'my-blogs' && isLoggedIn && (
                        <div className="tab-pane active">
                            <div className="section-header text-center mb-5">
                                <h2 className="section-title">Câu chuyện của tôi</h2>
                                <p className="section-subtitle">Quản lý và xem các câu chuyện bạn đã chia sẻ</p>
                            </div>

                            {userBlogsLoading ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <p className="mt-3">Đang tải blog của bạn...</p>
                                </div>
                            ) : userBlogs.length === 0 ? (
                                <div className="text-center">
                                    <div className="alert alert-info" role="alert">
                                        <i className="bi bi-heart me-2"></i>
                                        Bạn chưa chia sẻ câu chuyện nào.
                                        <button
                                            className="btn btn-link p-0 ms-1"
                                            onClick={() => setActiveTab('create')}
                                        >
                                            Chia sẻ câu chuyện đầu tiên của bạn!
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="user-blogs-list">
                                    {userBlogs.map((blog) => (
                                        <div key={blog.blog_id} className="user-blog-card mb-4">
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div>
                                                            <h5 className="card-title">{blog.title}</h5>
                                                            <p className="card-text text-muted">
                                                                <i className="bi bi-calendar me-2"></i>
                                                                {formatDate(blog.created_at)}
                                                                <span className="mx-2">|</span>
                                                                {getStatusBadge(blog.status)}
                                                            </p>
                                                        </div>
                                                        <div className="dropdown">
                                                            <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                                <i className="bi bi-three-dots"></i>
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                {blog.status === 'draft' && (
                                                                    <>
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item"
                                                                                onClick={() => handleUpdateBlogStatus(blog.blog_id, 'pending')}
                                                                            >
                                                                                <i className="bi bi-send me-2"></i>
                                                                                Gửi để duyệt
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item"
                                                                                onClick={() => handleUpdateBlogStatus(blog.blog_id, 'published')}
                                                                            >
                                                                                <i className="bi bi-share me-2"></i>
                                                                                Chia sẻ công khai
                                                                            </button>
                                                                        </li>
                                                                    </>
                                                                )}
                                                                {blog.status === 'pending' && (
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleUpdateBlogStatus(blog.blog_id, 'draft')}
                                                                        >
                                                                            <i className="bi bi-arrow-left me-2"></i>
                                                                            Chuyển về bản nháp
                                                                        </button>
                                                                    </li>
                                                                )}
                                                                {blog.status === 'published' && (
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleUpdateBlogStatus(blog.blog_id, 'hidden')}
                                                                        >
                                                                            <i className="bi bi-eye-slash me-2"></i>
                                                                            Ẩn câu chuyện
                                                                        </button>
                                                                    </li>
                                                                )}
                                                                {blog.status === 'hidden' && (
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleUpdateBlogStatus(blog.blog_id, 'published')}
                                                                        >
                                                                            <i className="bi bi-share me-2"></i>
                                                                            Chia sẻ lại
                                                                        </button>
                                                                    </li>
                                                                )}
                                                                <li><hr className="dropdown-divider" /></li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handleEditBlog(blog.blog_id)}
                                                                        disabled={blog.status === 'pending'}
                                                                    >
                                                                        <i className="bi bi-pencil me-2"></i>
                                                                        Chỉnh sửa
                                                                        {blog.status === 'pending' && <small className="text-muted ms-1">(Không thể chỉnh sửa khi đang chờ duyệt)</small>}
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => handleDeleteBlog(blog.blog_id)}
                                                                        disabled={blog.status === 'pending'}
                                                                    >
                                                                        <i className="bi bi-trash me-2"></i>
                                                                        Xóa
                                                                        {blog.status === 'pending' && <small className="text-muted ms-1">(Không thể xóa khi đang chờ duyệt)</small>}
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="blog-content">
                                                        {expandedBlogs.has(blog.blog_id) ? (
                                                            <div>
                                                                <div dangerouslySetInnerHTML={createMarkup(blog.body)} className="blog-content-display"></div>
                                                                <button
                                                                    className="btn btn-link p-0 text-decoration-none"
                                                                    onClick={() => toggleExpandBlog(blog.blog_id)}
                                                                >
                                                                    <i className="bi bi-chevron-up me-1"></i>
                                                                    Thu gọn
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div dangerouslySetInnerHTML={createMarkup(truncateText(blog.body))} className="blog-content-display"></div>
                                                                {blog.body && blog.body.length > 300 && (
                                                                    <button
                                                                        className="btn btn-link p-0 text-decoration-none"
                                                                        onClick={() => toggleExpandBlog(blog.blog_id)}
                                                                    >
                                                                        <i className="bi bi-chevron-down me-1"></i>
                                                                        Xem thêm
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Blog Tab */}
                    {activeTab === 'create' && isLoggedIn && (
                        <div className="tab-pane active">
                            <div className="section-header text-center mb-5">
                                <h2 className="section-title">{editingBlog ? 'Chỉnh sửa câu chuyện' : 'Chia sẻ câu chuyện'}</h2>
                                <p className="section-subtitle">
                                    {editingBlog
                                        ? 'Cập nhật nội dung câu chuyện của bạn'
                                        : 'Kể về hành trình, trải nghiệm và cảm hứng của bạn với cộng đồng'}
                                </p>
                            </div>

                            <div className="create-blog-form">
                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        {/* Submission Progress Overlay */}
                                        {isSubmitting && selectedImage && (
                                            <div className="submission-overlay">
                                                <div className="submission-progress">
                                                    <div className="text-center mb-3">
                                                        <div className="spinner-border text-primary mb-2" style={{ width: '3rem', height: '3rem' }}>
                                                            <span className="visually-hidden">Đang tải lên...</span>
                                                        </div>
                                                        <h5 className="text-primary">Đang tải lên câu chuyện của bạn</h5>
                                                        <p className="text-muted mb-0">Vui lòng đợi trong giây lát...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmitBlog}>
                                            <div className="mb-4">
                                                <label htmlFor="title" className="form-label">
                                                    <i className="bi bi-heart me-2"></i>
                                                    Tiêu đề câu chuyện *
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control form-control-lg ${contentError && contentError.includes('tiêu đề') ? 'is-invalid' : ''}`}
                                                    id="title"
                                                    name="title"
                                                    value={newBlog.title}
                                                    onChange={handleInputChange}
                                                    placeholder="VD: Hành trình 6 tháng phục hồi của tôi..."
                                                    required
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="image" className="form-label">
                                                    <i className="bi bi-image me-2"></i>
                                                    Hình ảnh minh họa (tùy chọn)
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="image"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    disabled={isImageLoading || isSubmitting}
                                                />
                                                <div className="form-text">
                                                    Chọn hình ảnh để minh họa cho câu chuyện của bạn. Kích thước tối đa: 5MB
                                                </div>

                                                {/* Loading State */}
                                                {isImageLoading && (
                                                    <div className="mt-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <small className="text-muted">
                                                                <i className="bi bi-cloud-upload me-1"></i>
                                                                Đang tải hình ảnh...
                                                            </small>
                                                            <small className="text-primary fw-bold">
                                                                {Math.round(imageUploadProgress)}%
                                                            </small>
                                                        </div>
                                                        <div className="progress mb-3" style={{ height: '8px' }}>
                                                            <div
                                                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                                                role="progressbar"
                                                                style={{ width: `${imageUploadProgress}%` }}
                                                                aria-valuenow={imageUploadProgress}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>
                                                        <div className="image-preview-loading">
                                                            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                                <div className="text-center">
                                                                    <div className="spinner-border text-primary mb-2" role="status">
                                                                        <span className="visually-hidden">Đang tải...</span>
                                                                    </div>
                                                                    <div className="text-muted small">Đang xử lý hình ảnh...</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Image Preview */}
                                                {imagePreview && !isImageLoading && (
                                                    <div className="mt-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <small className="text-success">
                                                                <i className="bi bi-check-circle me-1"></i>
                                                                Hình ảnh đã sẵn sàng
                                                            </small>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={removeImage}
                                                                disabled={isSubmitting}
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Xóa
                                                            </button>
                                                        </div>
                                                        <div className="image-preview">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="img-fluid rounded"
                                                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="body" className="form-label">
                                                    <i className="bi bi-chat-heart me-2"></i>
                                                    Nội dung câu chuyện *
                                                </label>
                                                <ReactQuill
                                                    key={editingBlog ? `edit-${editingBlog.blog_id}` : 'new-blog'}
                                                    value={newBlog.body}
                                                    onChange={handleEditorChange}
                                                    modules={modules}
                                                    formats={formats}
                                                    placeholder="Chia sẻ hành trình của bạn: những thử thách, thành công, bài học và cảm hứng..."
                                                    className={`blog-editor ${contentError ? 'is-invalid' : ''}`}
                                                    theme="snow"
                                                />
                                                <div className="form-text">
                                                    Kể về trải nghiệm phục hồi, cách sử dụng website, hoặc những câu chuyện truyền cảm hứng của bạn.
                                                </div>

                                                {/* Hiển thị thông báo lỗi từ cấm */}
                                                {contentError && (
                                                    <div className="invalid-feedback d-block mt-2">
                                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                                        {contentError}
                                                    </div>
                                                )}

                                                {/* Thông tin về bộ lọc từ cấm */}
                                                <div className="alert alert-info mt-3" role="alert">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    <strong>Lưu ý:</strong> Nội dung của bạn sẽ được kiểm tra từ ngữ không phù hợp trước khi đăng.
                                                    Vui lòng sử dụng ngôn ngữ lịch sự và tôn trọng.
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="status" className="form-label">
                                                    <i className="bi bi-eye me-2"></i>
                                                    Trạng thái xuất bản
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="status"
                                                    name="status"
                                                    value={newBlog.status}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="draft">Bản nháp (chỉ bạn có thể xem)</option>
                                                    <option value="pending">Gửi để duyệt (chờ nhân viên phê duyệt)</option>
                                                </select>
                                                <div className="form-text">
                                                    <strong>Bản nháp:</strong> Chỉ bạn có thể xem và chỉnh sửa<br />
                                                    <strong>Gửi để duyệt:</strong> Nhân viên sẽ kiểm tra và phê duyệt trước khi xuất bản công khai
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        if (editingBlog) {
                                                            setActiveTab('my-blogs');
                                                        } else {
                                                            setActiveTab('view');
                                                        }
                                                        setEditingBlog(null);
                                                        setNewBlog({
                                                            title: '',
                                                            body: '',
                                                            status: 'draft'
                                                        });
                                                        setSelectedImage(null);
                                                        setImagePreview(null);
                                                        setContentError('');
                                                    }}
                                                >
                                                    <i className="bi bi-arrow-left me-2"></i>
                                                    Quay lại
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={isSubmitting || isImageLoading || !!contentError}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            {selectedImage ? 'Đang tải lên...' : editingBlog ? 'Đang cập nhật...' : 'Đang tạo...'}
                                                        </>
                                                    ) : isImageLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Đang xử lý hình ảnh...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className={editingBlog ? "bi bi-pencil-square me-2" : "bi bi-heart me-2"}></i>
                                                            {editingBlog ? 'Cập nhật câu chuyện' : 'Chia sẻ câu chuyện'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Newsletter Subscription - Only show on view tab */}
                {activeTab === 'view' && (
                    <section className="newsletter-section py-5 mt-5">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <h3 className="newsletter-title">Luôn cập nhật</h3>
                                <p className="newsletter-description">
                                    Đăng ký nhận bản tin của chúng tôi để nhận các bài viết mới nhất và cập nhật
                                    trực tiếp vào hộp thư của bạn.
                                </p>
                            </div>
                            <div className="col-lg-4 text-lg-end">
                                <Link to="/newsletter" className="btn btn-cta btn-lg">
                                    <i className="bi bi-envelope me-2"></i>
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default BlogPage;