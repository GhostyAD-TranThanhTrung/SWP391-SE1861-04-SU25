import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/BlogPage.scss';
import Image from '../images/Images.jpg';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3000/api/blogs', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {

                    throw new Error('Không thể tải dữ liệu blog');
                }

                const data = await response.json();
                setPosts(data.data);
                setError(null);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu blog:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu blog');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

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

    // Empty state
    if (!posts.length) {
        return (
            <div className="blog-page">
                <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                    <div className="text-center">
                        <div className="alert alert-info" role="alert">
                            <i className="bi bi-info-circle me-2"></i>
                            Hiện tại chưa có bài viết nào.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Data available
    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <section className="blog-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12 text-center">
                            <h1 className="hero-title">
                                Kiến thức & Thông tin chi tiết
                            </h1>
                            <p className="hero-subtitle">
                                Khám phá các bài viết mới nhất, phát hiện nghiên cứu và thông tin chi tiết từ chuyên gia về
                                phòng ngừa lạm dụng chất kích thích, nhận thức và hỗ trợ cộng đồng.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                {/* Featured Article Section */}
                <section className="featured-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Bài viết nổi bật</h2>
                        <p className="section-subtitle">Nội dung mới nhất và có tác động mạnh mẽ nhất của chúng tôi</p>
                    </div>

                    <div className="featured-post">
                        <div className="row align-items-center">
                            <div className="col-lg-4">
                                <div className="featured-image">
                                    <img src={featuredPost.image || Image} alt={featuredPost.title} className="img-fluid rounded-3" />
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <div className="featured-content">
                                    <h3 className="featured-title">{featuredPost.title}</h3>
                                    <p className="featured-meta">
                                        <i className="bi bi-calendar me-2"></i>
                                        {featuredPost.date || featuredPost.createdAt}
                                        <span className="mx-2">|</span>
                                        <i className="bi bi-person me-2"></i>
                                        {featuredPost.author || 'Tác giả'}
                                    </p>
                                    <p className="featured-excerpt">{featuredPost.excerpt || featuredPost.content}</p>
                                    <Link to={`/blog/${featuredPost.blog_id}`} className="btn btn-primary">
                                        <i className="bi bi-arrow-right me-2"></i>
                                        Đọc thêm
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Latest Articles Section */}
                {regularPosts.length > 0 && (
                    <section className="articles-section mb-5">
                        <div className="section-header text-center mb-5">
                            <h2 className="section-title">Bài viết mới nhất</h2>
                            <p className="section-subtitle">Cập nhật với những thông tin chi tiết và nghiên cứu mới nhất của chúng tôi</p>
                        </div>

                        <div className="row">
                            {regularPosts.map((post) => (
                                <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="article-card">
                                        <div className="article-image">
                                            <img src={post.image || Image} alt={post.title} className="img-fluid" />
                                        </div>
                                        <div className="article-content">
                                            <h4 className="article-title">{post.title}</h4>
                                            <p className="article-meta">
                                                <i className="bi bi-calendar me-2"></i>
                                                {post.date || post.createdAt}
                                                <span className="mx-2">|</span>
                                                <i className="bi bi-person me-2"></i>
                                                {post.author || 'Tác giả'}
                                            </p>
                                            <p className="article-excerpt">{post.excerpt || post.content}</p>
                                            <Link to={`/blog/${post.blog_id}`} className="btn btn-outline-primary">
                                                Đọc bài viết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Pagination */}
                <section className="pagination-section">
                    <nav aria-label="Phân trang blog" className="d-flex justify-content-center">
                        <ul className="pagination">
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Trước">
                                    <i className="bi bi-chevron-left"></i>
                                </a>
                            </li>
                            <li className="page-item active">
                                <a className="page-link" href="#">1</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#">2</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#">3</a>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#">10</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Tiếp">
                                    <i className="bi bi-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </section>

                {/* Newsletter Subscription */}
                <section className="newsletter-section py-5">
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
            </div>
        </div>
    );
};

export default BlogPage;