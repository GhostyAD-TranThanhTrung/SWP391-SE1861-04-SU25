import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.scss';
import Image from '../images/Images.jpg';
import Image1 from '../images/Image1.jpg';
import Image2 from '../images/Image2.jpg';
import Image3 from '../images/Image3.jpg';
import PreventionImg from '../images/Prevention.jpg';
import SupportImg from '../images/supporthug.jpg';
import GroupSessionImg from '../images/groupsession.jpg';
import OutdoorsImg from '../images/outdoors.jpg';
import axios from 'axios';

const HomePage = () => {

    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [stats, setStats] = useState({ users: 0, courses: 0, consultations: 0, success: 0 });
    const [communityEvents, setCommunityEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [recommendedPrograms, setRecommendedPrograms] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState(null);
    const [recommendedBlogs, setRecommendedBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(true);
    const [blogsError, setBlogsError] = useState(null);
    const token = sessionStorage.getItem("token");
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    // Animated counter effect
    useEffect(() => {
        const targets = { users: 5000, courses: 150, consultations: 2500, success: 95 };
        const duration = 2000; // 2 seconds
        const increment = 50; // Update every 50ms
        const steps = duration / increment;

        const counters = Object.keys(targets).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {});

        const timer = setInterval(() => {
            let allComplete = true;
            Object.keys(targets).forEach(key => {
                if (counters[key] < targets[key]) {
                    counters[key] = Math.min(counters[key] + targets[key] / steps, targets[key]);
                    allComplete = false;
                }
            });

            setStats({ ...counters });

            if (allComplete) {
                clearInterval(timer);
            }
        }, increment);

        return () => clearInterval(timer);
    }, []);

    // Testimonials rotation
    useEffect(() => {
        const testimonialTimer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(testimonialTimer);
    }, []);

    useEffect(() => {
        const fetchCommunityEvents = async () => {
            setEventsLoading(true);
            setEventsError(null);
            try {
                const response = await fetch('http://localhost:3000/api/programs/community-events', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch community events');
                }
                const res = await response.json();
                if (res.success && res.data) {
                    const sortedEvents = res.data.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
                    setCommunityEvents(sortedEvents);
                } else {
                    setCommunityEvents([]);
                }
            } catch (err) {
                setEventsError('Không thể tải sự kiện cộng đồng. Vui lòng thử lại sau.');
                setCommunityEvents([]);
            } finally {
                setEventsLoading(false);
            }
        };
        fetchCommunityEvents();
    }, []);

    // State for user info from recommendations API

    // Gọi API recommendations khi trang load
    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoadingRecommendations(true);
            setRecommendationsError(null);
            try {
                const response = await axios.get('http://localhost:3000/api/programs/recommendations', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const res = response.data;
                if (res.success && res.data) {
                    // Handle new API response structure
                    setUserInfo(res.data.user_info);
                    setRecommendedPrograms(res.data.recommended_programs || []);
                } else {
                    setRecommendedPrograms([]);
                    setUserInfo(null);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setRecommendationsError('Không thể tải chương trình đề xuất. Vui lòng thử lại sau.');
                setRecommendedPrograms([]);
                setUserInfo(null);
            } finally {
                setLoadingRecommendations(false);
            }
        };

        // Only fetch if user is logged in
        if (token) {
            fetchRecommendations();
        } else {
            setLoadingRecommendations(false);
        }
    }, [token]);

    // Fetch recommended blogs
    useEffect(() => {
        const fetchRecommendedBlogs = async () => {
            setLoadingBlogs(true);
            setBlogsError(null);
            try {
                const response = await axios.get('http://localhost:3000/api/blogs', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const res = response.data;
                if (res.success && res.data) {
                    // Sort by creation date and take the most recent ones
                    const sortedBlogs = res.data
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 6); // Get top 6 recent blogs
                    setRecommendedBlogs(sortedBlogs);
                } else {
                    setRecommendedBlogs([]);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setBlogsError('Không thể tải bài viết blog. Vui lòng thử lại sau.');
                setRecommendedBlogs([]);
            } finally {
                setLoadingBlogs(false);
            }
        };

        fetchRecommendedBlogs();
    }, [token]);

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Huấn luyện viên phục hồi",
            content: "SUBSTANCE đã thay đổi cách chúng ta tiếp cận phục hồi nghiện ngập. Các tài nguyên rất toàn diện và thực sự thay đổi cuộc sống.",
            avatar: "👩‍⚕️"
        },
        {
            name: "Michael Chen",
            role: "Phụ huynh",
            content: "Các khóa học phòng ngừa đã giúp tôi hiểu cách bảo vệ con cái và hỗ trợ gia đình chúng tôi vượt qua những thời điểm khó khăn.",
            avatar: "👨‍👦"
        },
        {
            name: "Dr. Emily Rodriguez",
            role: "Chuyên gia nghiện ngập",
            content: "Tôi khuyên dùng SUBSTANCE cho tất cả bệnh nhân của mình. Cách tiếp cận dựa trên bằng chứng và định dạng dễ tiếp cận giúp phục hồi dễ đạt được hơn.",
            avatar: "👩‍⚕️"
        }
    ];

    // Hàm render danh sách chương trình đề xuất
    const renderRecommendedPrograms = () => {
        if (loadingRecommendations) return <div className="text-center">Đang tải chương trình đề xuất...</div>;
        if (recommendationsError) return <div className="text-center text-danger">{recommendationsError}</div>;
        if (!token) return <div className="text-center">Vui lòng đăng nhập để xem chương trình đề xuất</div>;
        if (!recommendedPrograms.length) return <div className="text-center">Không có chương trình đề xuất</div>;

        return (
            <>
                {/* User Info Display */}
                {userInfo && (
                    <div className="user-info-banner mb-4 p-3" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '15px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h5 className="mb-2">
                            <i className="bi bi-person-circle me-2"></i>
                            Xin chào, {userInfo.name}!
                        </h5>
                        <p className="mb-0">
                            <i className="bi bi-calendar-event me-2"></i>
                            Tuổi: {userInfo.age} ({userInfo.age_group_label}) |
                            <i className="bi bi-star-fill ms-3 me-2"></i>
                            {recommendedPrograms.length} chương trình được đề xuất dựa trên hồ sơ của bạn
                        </p>
                    </div>
                )}

                {/* Programs Grid */}
                <div className="row gx-4 gy-4">
                    {recommendedPrograms.slice(0, 8).map((item) => (
                        <div className="col-md-3" key={item.program_id}>
                            <Link to={`/program/${item.program_id}`} className="custom-card-link" style={{ textDecoration: 'none' }}>
                                <div className="custom-card" style={{
                                    borderRadius: 20,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                    minHeight: 450,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    padding: 0,
                                    border: item.recommendation_score >= 80 ? '2px solid #28a745' : 'none'
                                }}>
                                    {/* Recommendation Score Badge */}
                                    {item.recommendation_score && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: item.recommendation_score >= 80 ? '#28a745' : item.recommendation_score >= 60 ? '#ffc107' : '#6c757d',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            zIndex: 1
                                        }}>
                                            {item.recommendation_score}%
                                        </div>
                                    )}

                                    <div style={{ height: 160, width: '100%', background: '#f7f7f7', borderTopLeftRadius: 20, borderTopRightRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img
                                            src={item.img_link || Image}
                                            alt={item.title || 'Hình ảnh chương trình'}
                                            style={{ maxHeight: 140, maxWidth: '90%', objectFit: 'cover', borderRadius: 12, margin: '0 auto', display: 'block' }}
                                            onError={e => { e.target.onerror = null; e.target.src = Image; }}
                                        />
                                    </div>
                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <hr className="card-divider" />
                                        <h5 className="card-title" style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{truncateText(item.title, 30)}</h5>
                                        <p className="card-description" style={{ marginBottom: 8, color: '#444', fontSize: 15, minHeight: 38, overflow: 'hidden', textOverflow: 'ellipsis' }}>{truncateText(item.description, 80)}</p>

                                        {/* Enhanced metadata */}
                                        <div className="card-meta" style={{ fontSize: 14, marginBottom: 12 }}>
                                            <p style={{ marginBottom: 4 }}>
                                                <strong>Người tạo:</strong> {truncateText(
                                                    item.creator?.name || 
                                                    item.creator_name || 
                                                    'SUBSTANCE Team', 20)}
                                            </p>
                                            <p style={{ marginBottom: 4 }}>
                                                <strong>Danh mục:</strong> {truncateText(item.category?.name || 'Chương trình phục hồi', 25)}
                                            </p>
                                            <p style={{ marginBottom: 4 }}>
                                                <strong>Nhóm tuổi:</strong> {item.age_group === 'all' ? 'Tất cả độ tuổi' :
                                                    item.age_group === 'youth' ? 'Thanh thiếu niên (13-18)' :
                                                        item.age_group === 'adult' ? 'Người lớn (18-65)' :
                                                            item.age_group === 'senior' ? 'Người cao tuổi (65+)' : item.age_group}
                                            </p>
                                        </div>

                                        {/* Program statistics */}
                                        <div className="program-stats" style={{ fontSize: 13, color: '#6c757d', marginBottom: 8 }}>
                                            <span className="me-3">
                                                <i className="bi bi-people-fill me-1"></i>
                                                {item.enrollment_count || 0} đăng ký
                                            </span>
                                            <span>
                                                <i className="bi bi-file-text-fill me-1"></i>
                                                {item.content_count || 0} nội dung
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', alignItems: 'center', color: '#6c63ff', fontSize: 15 }}>
                                        <i className="bi bi-calendar-event" style={{ marginRight: 6 }}></i>
                                        <span style={{ color: '#6c63ff' }}>{item.create_at ? new Date(item.create_at).toLocaleDateString() : ''}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Hàm render danh sách blog đề xuất
    const renderRecommendedBlogs = () => {
        if (loadingBlogs) return <div className="text-center">Đang tải bài viết đề xuất...</div>;
        if (blogsError) return <div className="text-center text-danger">{blogsError}</div>;
        if (!recommendedBlogs.length) return <div className="text-center">Không có bài viết nào</div>;

        return (
            <div className="row gx-4 gy-4">
                {recommendedBlogs.map((blog) => (
                    <div className="col-md-4" key={blog.blog_id}>
                        <Link to={`/blog/${blog.blog_id}`} className="text-decoration-none">
                            <div className="blog-card" style={{
                                borderRadius: 15,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                minHeight: 350,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}>
                                {/* Blog Image */}
                                <div style={{ height: 180, width: '100%', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <img
                                        src={blog.img_link || Image}
                                        alt={blog.title || 'Blog image'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { e.target.onerror = null; e.target.src = Image; }}
                                    />
                                </div>
                                
                                {/* Blog Content */}
                                <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h5 className="blog-title" style={{ 
                                        fontWeight: 600, 
                                        fontSize: 18, 
                                        marginBottom: 8, 
                                        color: '#333',
                                        lineHeight: 1.4
                                    }}>
                                        {truncateText(blog.title, 60)}
                                    </h5>
                                    
                                    <p className="blog-description" style={{ 
                                        marginBottom: 12, 
                                        color: '#666', 
                                        fontSize: 14, 
                                        lineHeight: 1.5,
                                        flex: 1
                                    }}>
                                        {truncateText(blog.description, 120)}
                                    </p>

                                    {/* Blog Meta */}
                                    <div className="blog-meta" style={{ fontSize: 13, color: '#888', marginTop: 'auto' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="bi bi-person-circle me-1"></i>
                                                {truncateText(blog.author?.name || blog.author?.email || 'Admin', 15)}
                                            </span>
                                            <span>
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {blog.created_at ? new Date(blog.created_at).toLocaleDateString('vi-VN') : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="homepage">
            {/* Hero Section */}
            < section className="hero-section" >
                <div className="hero-content">
                    <div className="container">
                        <div className="row align-items-center min-vh-100">
                            <div className="col-lg-6">
                                <div className="hero-text">
                                    <h1 className="hero-title">
                                        Hành trình
                                        <span className="highlight"> Phục hồi</span>
                                        <br />của bạn bắt đầu từ đây
                                    </h1>
                                    <p className="hero-description">
                                        Khám phá tài nguyên toàn diện, hướng dẫn chuyên môn và cộng đồng hỗ trợ
                                        dành riêng cho phòng ngừa, phục hồi và chữa lành lạm dụng chất.
                                    </p>
                                    <div className="hero-buttons">
                                        <Link to="/courses" className="btn btn-primary-custom btn-lg">
                                            <i className="bi bi-play-circle me-2"></i>
                                            Bắt đầu học
                                        </Link>
                                        <Link to="/booking" className="btn btn-outline-custom btn-lg">
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Đặt tư vấn
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="hero-carousel">
                                    <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
                                        <div className="carousel-inner">
                                            <div className="carousel-item active">
                                                <img src={GroupSessionImg} className="d-block w-100" alt="Phiên hỗ trợ nhóm" />
                                                <div className="carousel-caption">
                                                    <h5>Hỗ trợ cộng đồng</h5>
                                                    <p>Tham gia cộng đồng hỗ trợ trong hành trình phục hồi của bạn</p>
                                                </div>
                                            </div>
                                            <div className="carousel-item">
                                                <img src={OutdoorsImg} className="d-block w-100" alt="Hoạt động phục hồi ngoài trời" />
                                                <div className="carousel-caption">
                                                    <h5>Chữa lành toàn diện</h5>
                                                    <p>Khám phá các chương trình phục hồi và sức khỏe dựa trên thiên nhiên</p>
                                                </div>
                                            </div>
                                            <div className="carousel-item">
                                                <img src={SupportImg} className="d-block w-100" alt="Hỗ trợ chuyên môn" />
                                                <div className="carousel-caption">
                                                    <h5>Hướng dẫn chuyên môn</h5>
                                                    <p>Truy cập tư vấn chuyên môn và chăm sóc cá nhân hóa</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                                            <span className="carousel-control-prev-icon"></span>
                                        </button>
                                        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                                            <span className="carousel-control-next-icon"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.users).toLocaleString()}+</h3>
                                <p className="stat-label">Cuộc sống được thay đổi</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-book-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.courses)}+</h3>
                                <p className="stat-label">Tài nguyên giáo dục</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-heart-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.consultations)}+</h3>
                                <p className="stat-label">Phiên hỗ trợ</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-trophy-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.success)}%</h3>
                                <p className="stat-label">Tỷ lệ thành công</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container py-5">
                {/* Blog & Assessment Introduction Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">Khám phá Tính năng Nổi bật</h2>
                        <p className="section-subtitle">Cùng tìm hiểu hai chức năng quan trọng giúp bạn trên hành trình phục hồi: Blog và Đánh giá (Assessment)</p>
                    </div>
                    <div className="row gx-5 gy-4 justify-content-center">
                        <div className="col-lg-6 col-md-12 mb-4">
                            <div className="feature-card feature-card-blog">
                                <div className="feature-icon">
                                    <i className="bi bi-journal-text"></i>
                                </div>
                                <h3 className="feature-title">Blog - Trung tâm kiến thức</h3>
                                <p className="feature-desc">Đọc các bài viết chuyên sâu, cập nhật kiến thức mới nhất về phòng ngừa, phục hồi và sức khỏe tâm thần. Blog là nơi bạn tìm thấy thông tin hữu ích từ các chuyên gia và cộng đồng.</p>
                                <Link to="/blog" className="btn btn-feature">
                                    <i className="bi bi-journal-text me-2"></i>
                                    Đến Blog
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 mb-4">
                            <div className="feature-card feature-card-assessment">
                                <div className="feature-icon">
                                    <i className="bi bi-clipboard-check"></i>
                                </div>
                                <h3 className="feature-title">Assessment - Đánh giá bản thân</h3>
                                <p className="feature-desc">Thực hiện các bài đánh giá nhanh để hiểu rõ hơn về tình trạng của bản thân, nhận được gợi ý phù hợp và bắt đầu hành trình phục hồi một cách chủ động.</p>
                                <Link to="/test" className="btn btn-feature">
                                    <i className="bi bi-clipboard-check me-2"></i>
                                    Làm Assessment
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Recommendation Programs Section - Only show if user is logged in */}
                {token && (
                    <section className="section mb-5">
                        <div className="section-header-wrapper text-center mb-5">
                            <h2 className="section-header">
                                {userInfo ? `Chương trình đề xuất cho bạn` : 'Chương trình đề xuất cho bạn'}
                            </h2>
                            <p className="section-subtitle">
                                {userInfo ?
                                    `Các chương trình phù hợp với nhóm tuổi ${userInfo.age_group_label} (${userInfo.age} tuổi) dựa trên hồ sơ của bạn` :
                                    'Các chương trình phù hợp nhất dựa trên hồ sơ của bạn'
                                }
                            </p>
                        </div>
                        {renderRecommendedPrograms()}
                    </section>
                )}

                {/* Blog Recommendations Section - Only show if user is logged in */}
                {token && (
                    <section className="section mb-5">
                        <div className="section-header-wrapper text-center mb-5">
                            <h2 className="section-header">Bài viết đề xuất</h2>
                            <p className="section-subtitle">Khám phá những bài viết hữu ích về phục hồi, phòng ngừa và sức khỏe tâm thần</p>
                        </div>
                        {renderRecommendedBlogs()}
                    </section>
                )}


                {/* Community Events Section */}
                <section className="community-events-section py-5">
                    <div className="container">
                        <div className="section-header-wrapper text-center mb-5">
                            <h2 className="section-header">Sự kiện cộng đồng</h2>
                            <p className="section-subtitle">Các sự kiện nổi bật dành cho cộng đồng phục hồi và phòng ngừa</p>
                        </div>
                        {eventsLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-2 text-muted">Đang tải sự kiện cộng đồng...</p>
                            </div>
                        ) : eventsError ? (
                            <div className="text-center py-4">
                                <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
                                <h4 className="mt-3 text-warning">Có lỗi xảy ra</h4>
                                <p className="text-muted">{eventsError}</p>
                            </div>
                        ) : communityEvents.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                <h4 className="mt-3 text-muted">Chưa có sự kiện nào</h4>
                                <p className="text-muted">Các sự kiện cộng đồng sẽ được cập nhật sớm. Hãy quay lại sau!</p>
                            </div>
                        ) : (
                            <div className="row gx-5 gy-4 justify-content-center">
                                {communityEvents.slice(0, 1).map(event => (
                                    <div className="col-12 mb-4" key={event.program_id || event.id}>
                                        <div className="community-event-modern d-flex flex-column flex-md-row align-items-stretch position-relative">
                                            {/* Badge Mới nhất */}
                                            <div className="event-badge-latest position-absolute top-0 end-0">
                                                <span><i className="bi bi-star-fill me-1"></i> Mới nhất</span>
                                            </div>
                                            {/* Thông tin bên trái */}
                                            <div className="event-modern-info flex-grow-1 p-4 d-flex flex-column justify-content-center">
                                                <h2 className="event-modern-title mb-3">{event.title}</h2>
                                                <p className="event-modern-desc mb-4">{event.description}</p>
                                                <div className="d-flex flex-wrap gap-3">
                                                    <span className="event-modern-badge">
                                                        <i className="bi bi-calendar3 me-2"></i>
                                                        {event.create_at ? new Date(event.create_at).toLocaleDateString('vi-VN') : ''}
                                                    </span>
                                                    <span className="event-modern-badge">
                                                        <i className="bi bi-people-fill me-2"></i>
                                                        Sự kiện Cộng đồng
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Call to action bên phải */}
                                            <div className="event-modern-cta d-flex flex-column align-items-center justify-content-center p-4">
                                                <div className="event-modern-cta-icon mb-3">
                                                    <i className="bi bi-calendar-heart"></i>
                                                </div>
                                                <Link to={`/community-event/${event.program_id || event.id}`} className="event-modern-cta-btn mb-2">
                                                    Tham gia ngay
                                                </Link>
                                                <div className="event-modern-cta-desc">Đừng bỏ lỡ cơ hội kết nối cộng đồng</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Testimonials Section */}
            <section className="testimonials-section py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-header">Cộng đồng chúng tôi nói gì</h2>
                        <p className="section-subtitle">Những câu chuyện thực từ những con người thực trên hành trình phục hồi của họ</p>
                    </div>
                    <div className="testimonial-container">
                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                <div className="quote-icon">
                                    <i className="bi bi-quote"></i>
                                </div>
                                <p className="testimonial-text">"{testimonials[currentTestimonial].content}"</p>
                                <div className="testimonial-author">
                                    <div className="author-info">
                                        <h5 className="author-name">{testimonials[currentTestimonial].name}</h5>
                                        <p className="author-role">{testimonials[currentTestimonial].role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-indicators">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
                                    onClick={() => setCurrentTestimonial(index)}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h2 className="cta-title">Sẵn sàng bắt đầu hành trình phục hồi của bạn?</h2>
                            <p className="cta-description">
                                Thực hiện bước đầu tiên hướng tới chữa lành và thay đổi. Đội ngũ chuyên môn của chúng tôi luôn sẵn sàng hỗ trợ bạn từng bước một.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/booking" className="btn btn-cta btn-lg">
                                <i className="bi bi-calendar-heart me-2"></i>
                                Đặt lịch tư vấn miễn phí
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default HomePage;