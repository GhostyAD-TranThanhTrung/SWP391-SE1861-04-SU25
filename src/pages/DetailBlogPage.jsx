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
            <div className="container text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải bài viết...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="detail-blog-page">
            <div className="container text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
                <Link to="/blog" className="btn btn-outline-primary mt-3">Quay lại danh sách bài viết</Link>
            </div>
        </div>
    );

    if (!blog) return (
        <div className="detail-blog-page">
            <div className="container text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                <div className="alert alert-info" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    Không tìm thấy bài viết.
                </div>
                <Link to="/blog" className="btn btn-outline-primary mt-3">Quay lại danh sách bài viết</Link>
            </div>
        </div>
    );

    return (
        <div className="detail-blog-page">
            <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/blog">Blog</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">{blog.title}</li>
                    </ol>
                </nav>

                {/* Blog Content */}
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <h1 className="blog-title">{blog.title}</h1>
                        <p className="blog-meta">
                            <i className="bi bi-calendar me-2"></i>
                            {blog.date || new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                            <span className="mx-2">|</span>
                            <i className="bi bi-person me-2"></i>
                            {blog.author || 'Tác giả'}
                        </p>
                        <div className="blog-image mb-4">
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
                                <p>{blog.excerpt || 'Nội dung bài viết sẽ được cập nhật sớm.'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back to Blog List */}
                <div className="text-center mt-5">
                    <Link to="/blog" className="btn btn-outline-primary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Quay lại danh sách bài viết
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DetailBlogPage;