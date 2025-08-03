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

            // The backend now filters for published blogs, so we can use the data directly
            setPosts(data.data);
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
        const validStatuses = ['draft', 'pending', 'published', 'Đã xuất bản'];
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
            'draft': { text: 'Bản nháp', class: 'text-dark' },
            'pending': { text: 'Chờ duyệt', class: 'text-dark' },
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
            <div className="container-fluid" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-9">
                        {/* Featured Blog Section */}
                        {activeTab === 'view' && posts.length > 0 && (
                            <div className="featured-blog-section mb-5">
                                <h2 className="section-title mb-3">Newest blog</h2>
                                <div className="featured-blog-card">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <Link to={`/blog/${posts[0].blog_id}`} className="text-decoration-none">
                                                <div className="featured-image">
                                                    <img
                                                        src={getImageUrl(posts[0].img_link)}
                                                        alt={posts[0].title}
                                                        className="img-fluid rounded"
                                                        onError={handleImageError}
                                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="featured-content">
                                                <Link to={`/blog/${posts[0].blog_id}`} className="text-decoration-none">
                                                    <h3 className="featured-title mb-2">{posts[0].title}</h3>
                                                </Link>
                                                <div className="featured-body mb-3">
                                                    <div dangerouslySetInnerHTML={createMarkup(truncateText(posts[0].body, 200))} className="blog-content-display"></div>
                                                </div>
                                                <div className="featured-meta d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <small className="text-muted">
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {formatDate(posts[0].created_at)}
                                                        </small>
                                                        <span className="mx-2">|</span>
                                                        <small className="text-muted">
                                                            Post by: {posts[0].author?.name || posts[0].author?.email || 'Anonymous'}
                                                        </small>
                                                    </div>
                                                    {getStatusBadge(posts[0].status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blog List Section */}
                        <div className="blog-list-section">
                            {activeTab === 'view' && (
                                <>
                                    <h2 className="section-title mb-4">Blog list</h2>
                                    {posts.length === 0 ? (
                                        <div className="text-center">
                                            <div className="alert alert-info" role="alert">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Hiện tại chưa có bài viết nào.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {posts.slice(1).map((post) => (
                                                <div key={post.blog_id} className="col-lg-4 col-md-6 mb-4">
                                                    <Link to={`/blog/${post.blog_id}`} className="text-decoration-none">
                                                        <div className="blog-card h-100">
                                                        <div className="blog-image">
                                                            <img
                                                                src={getImageUrl(post.img_link)}
                                                                alt={post.title}
                                                                className="img-fluid"
                                                                onError={handleImageError}
                                                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div className="blog-content p-3">
                                                            <h5 className="blog-title mb-2">{post.title}</h5>
                                                            <div className="blog-excerpt mb-3">
                                                                <div dangerouslySetInnerHTML={createMarkup(truncateText(post.body, 100))} className="blog-content-display small"></div>
                                                            </div>
                                                            <div className="blog-meta d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <small className="text-muted">
                                                                        <i className="bi bi-calendar me-1"></i>
                                                                        {formatDate(post.created_at)}
                                                                    </small>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        Post by: {post.author?.email || 'Anonymous'}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* My Blogs Tab Content */}
                            {activeTab === 'my-blogs' && isLoggedIn && (
                                <div className="my-blogs-section">
                                    <h2 className="section-title mb-4">Câu chuyện của tôi</h2>
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
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleUpdateBlogStatus(blog.blog_id, 'pending')}
                                                                                >
                                                                                    <i className="bi bi-send me-2"></i>
                                                                                    Gửi để duyệt
                                                                                </button>
                                                                            </li>
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
                                                                                    onClick={() => handleUpdateBlogStatus(blog.blog_id, 'draft')}
                                                                                >
                                                                                    <i className="bi bi-arrow-left me-2"></i>
                                                                                    Chuyển về bản nháp
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

                            {/* Create Blog Tab Content */}
                            {activeTab === 'create' && isLoggedIn && (
                                <div className="create-blog-section">
                                    <h2 className="section-title mb-4">{editingBlog ? 'Chỉnh sửa câu chuyện' : 'Chia sẻ câu chuyện'}</h2>

                                    <div className="create-blog-form">
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
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="col-lg-3">
                        <div className="blog-sidebar">
                            {/* Navigation Buttons */}
                            <div className="sidebar-section mb-4">
                                <div className="d-grid gap-2">
                                    {isLoggedIn ? (
                                        <>
                                            <button
                                                className={`btn ${activeTab === 'my-blogs' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => handleTabChange('my-blogs')}
                                            >
                                                <i className="bi bi-person-lines-fill me-2"></i>
                                                Your blog post
                                            </button>
                                            <button
                                                className={`btn ${activeTab === 'create' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => handleTabChange('create')}
                                            >
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Create
                                            </button>
                                            <button
                                                className={`btn ${activeTab === 'view' ? 'btn-info' : 'btn-outline-info'}`}
                                                onClick={() => handleTabChange('view')}
                                            >
                                                <i className="bi bi-eye me-2"></i>
                                                All blog
                                            </button>
                                        </>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Đăng nhập để tạo và quản lý blog của bạn
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Filter Section */}
                            <div className="sidebar-section">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="bi bi-funnel me-2"></i>
                                            Filter by date
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="filter-options">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="dateFilter" id="last30" defaultChecked />
                                                <label className="form-check-label" htmlFor="last30">
                                                    Last 30 days
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="dateFilter" id="last7" />
                                                <label className="form-check-label" htmlFor="last7">
                                                    Last 7 days
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="dateFilter" id="all" />
                                                <label className="form-check-label" htmlFor="all">
                                                    All time
                                                </label>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-outline-primary mt-3 w-100">
                                            <i className="bi bi-search me-1"></i>
                                            Apply Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter Section - Only show on view tab */}
            {activeTab === 'view' && (
                <section className="newsletter-section py-4 bg-light">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <h4 className="newsletter-title mb-2">Luôn cập nhật</h4>
                                <p className="newsletter-description mb-0">
                                    Đăng ký nhận bản tin của chúng tôi để nhận các bài viết mới nhất và cập nhật
                                    trực tiếp vào hộp thư của bạn.
                                </p>
                            </div>
                            <div className="col-lg-4 text-lg-end">
                                <Link to="/newsletter" className="btn btn-primary">
                                    <i className="bi bi-envelope me-2"></i>
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default BlogPage;