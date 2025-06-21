import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BlogPage.scss';
import Image from '../images/Images.jpg';

const BlogPage = () => {
    const posts = [
        {
            title: 'Lạm dụng chất kích thích: Nhận thức & Phòng ngừa',
            date: '31/05/2025',
            author: 'Bác sĩ Sarah Johnson',
            image: Image,
            excerpt: 'Tìm hiểu về các chiến lược và phương pháp mới nhất để phòng ngừa lạm dụng chất kích thích trong cộng đồng.',
            id: 1
        },
        {
            title: '12 cách phòng ngừa lạm dụng ma túy',
            date: '28/05/2025',
            author: 'Michael Chen',
            image: Image,
            excerpt: 'Những mẹo thực tế và phương pháp dựa trên bằng chứng để giúp phòng ngừa lạm dụng ma túy ở thanh thiếu niên và người lớn.',
            id: 2
        },
        {
            title: 'Nhận thức về lạm dụng ma túy',
            date: '25/05/2025',
            author: 'Lisa Rodriguez',
            image: Image,
            excerpt: 'Hiểu về các dấu hiệu, triệu chứng và tác động của lạm dụng ma túy đối với cá nhân và gia đình.',
            id: 3
        },
        {
            title: 'Tác động của việc sử dụng ma túy lâu dài',
            date: '22/05/2025',
            author: 'Bác sĩ Sarah Johnson',
            image: Image,
            excerpt: 'Phân tích toàn diện về các tác động thể chất, tinh thần và xã hội của việc sử dụng chất kích thích kéo dài.',
            id: 4
        },
        {
            title: 'Xây dựng khả năng phục hồi chống lại nghiện ngập',
            date: '19/05/2025',
            author: 'Michael Chen',
            image: Image,
            excerpt: 'Chiến lược phát triển khả năng phục hồi cá nhân và cộng đồng để phòng ngừa nghiện ngập.',
            id: 5
        },
        {
            title: 'Hỗ trợ hành trình phục hồi',
            date: '16/05/2025',
            author: 'Lisa Rodriguez',
            image: Image,
            excerpt: 'Cách gia đình và cộng đồng có thể cung cấp hỗ trợ hiệu quả trong quá trình phục hồi.',
            id: 6
        },
    ];

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
                                    <img src={featuredPost.image} alt={featuredPost.title} className="img-fluid rounded-3" />
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <div className="featured-content">
                                    <h3 className="featured-title">{featuredPost.title}</h3>
                                    <p className="featured-meta">
                                        <i className="bi bi-calendar me-2"></i>
                                        {featuredPost.date}
                                        <span className="mx-2">|</span>
                                        <i className="bi bi-person me-2"></i>
                                        {featuredPost.author}
                                    </p>
                                    <p className="featured-excerpt">{featuredPost.excerpt}</p>
                                    <Link to={`/blog/${featuredPost.id}`} className="btn btn-primary">
                                        <i className="bi bi-arrow-right me-2"></i>
                                        Đọc thêm
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Latest Articles Section */}
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
                                        <img src={post.image} alt={post.title} className="img-fluid" />
                                    </div>
                                    <div className="article-content">
                                        <h4 className="article-title">{post.title}</h4>
                                        <p className="article-meta">
                                            <i className="bi bi-calendar me-2"></i>
                                            {post.date}
                                            <span className="mx-2">|</span>
                                            <i className="bi bi-person me-2"></i>
                                            {post.author}
                                        </p>
                                        <p className="article-excerpt">{post.excerpt}</p>
                                        <Link to={`/blog/${post.id}`} className="btn btn-outline-primary">
                                            Đọc bài viết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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