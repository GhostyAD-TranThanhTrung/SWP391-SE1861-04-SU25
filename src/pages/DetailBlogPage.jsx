import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/DetailBlogPage.scss';
import DefaultImage from '../images/Images.jpg';

const DetailBlogPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/blogs/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) throw new Error('Không thể tải dữ liệu bài viết');
                const data = await res.json();
                setBlog(data.data);
                window.scrollTo(0, 0);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) return (
        <div className="detail-blog-page">
            <div className="container text-center loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải bài viết...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="detail-blog-page">
            <div className="container text-center error-container">
                <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {error}
                </div>
                <Link to="/blog" className="btn btn-primary btn-sm mt-2">
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                </Link>
            </div>
        </div>
    );

    if (!blog) return (
        <div className="detail-blog-page">
            <div className="container text-center not-found-container">
                <div className="alert alert-info" role="alert">
                    <i className="bi bi-info-circle me-1"></i>
                    Không tìm thấy bài viết.
                </div>
                <Link to="/blog" className="btn btn-primary btn-sm mt-2">
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                </Link>
            </div>
        </div>
    );

    const formattedDate = blog.date
        ? new Date(blog.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className="detail-blog-page">
            <div className="blog-header">
                <div className="container">
                    <nav aria-label="breadcrumb" className="blog-breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                            <li className="breadcrumb-item"><Link to="/blog">Blog</Link></li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container blog-container">
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <article className="blog-article">
                            <div className="blog-meta-top">
                                <span className="blog-category">Sức khỏe tinh thần</span>
                                <span className="blog-date">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {formattedDate}
                                </span>
                            </div>

                            <h1 className="blog-title">{blog.title}</h1>

                            <div className="blog-author-info">
                                <div className="author-avatar">
                                    <i className="bi bi-person-circle"></i>
                                </div>
                                <div className="author-details">
                                    <span className="author-name">{blog.author || 'Tác giả'}</span>
                                    <span className="author-role">Chuyên gia tư vấn</span>
                                </div>
                            </div>

                            <div className="blog-image">
                                <img
                                    src={blog.image || DefaultImage}
                                    alt={blog.title}
                                    className="img-fluid"
                                    onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                                />
                            </div>

                            <div className="blog-content">
                                {blog.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                                ) : (
                                    <p>{blog.body || 'Nội dung bài viết sẽ được cập nhật sớm.'}</p>
                                )}
                            </div>

                            <div className="blog-tags">
                                <i className="bi bi-tags me-1"></i>
                                <span className="tag">Sức khỏe</span>
                                <span className="tag">Tâm lý</span>
                                <span className="tag">Tư vấn</span>
                            </div>

                            <div className="blog-footer">
                                <Link to="/blog" className="btn btn-outline-primary">
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Quay lại danh sách bài viết
                                </Link>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailBlogPage;