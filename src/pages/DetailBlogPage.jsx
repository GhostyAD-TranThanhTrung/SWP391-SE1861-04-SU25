import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/DetailBlogPage.scss';
import DefaultImage from '../images/Images.jpg';

const DetailBlogPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/blogs/${id}`);
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

    const toggleFavorite = () => {
        setIsFavorite(prev => !prev);
    };

    if (loading || error || !blog) {
        return (
            <div className="detail-blog-page">
                <div className="container text-center mt-5">
                    {loading && (
                        <>
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2">Đang tải bài viết...</p>
                        </>
                    )}
                    {error && (
                        <>
                            <div className="alert alert-danger">{error}</div>
                            <Link to="/blog" className="btn btn-primary mt-2">Quay lại</Link>
                        </>
                    )}
                    {!loading && !error && !blog && (
                        <>
                            <div className="alert alert-info">Không tìm thấy bài viết.</div>
                            <Link to="/blog" className="btn btn-primary mt-2">Quay lại</Link>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const formattedDate = blog.date
        ? new Date(blog.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className="detail-blog-page">
            <div className="container blog-container">
                <nav className="breadcrumb-nav">
                    <Link to="/">Trang chủ</Link> / <Link to="/blog">Blog</Link> / <span className="current-blog">{blog.title}</span>
                </nav>

                <article className="blog-article">
                    <div className="blog-header improved-blog-header">
                        <span className="blog-category">Sức khỏe tinh thần</span>
                        <span className="blog-date">
                            <i className="bi bi-calendar3 me-1"></i> {formattedDate}
                        </span>
                        <button className={`btn-flag ${isFavorite ? 'favorited' : ''}`} onClick={toggleFavorite} title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}>
                            <i className={`bi ${isFavorite ? 'bi-flag-fill' : 'bi-flag'}`}></i>
                        </button>
                    </div>

                    <h1 className="blog-title improved-blog-title">{blog.title}</h1>

                    <div className="blog-author-info improved-blog-author">
                        <i className="bi bi-person-circle avatar"></i>
                        <div>
                            <div className="author-name">{blog.author || 'Tác giả'}</div>
                            <div className="author-role">Chuyên gia tư vấn</div>
                        </div>
                    </div>

                    <div className="blog-image improved-blog-image">
                        <img
                            src={blog.image || DefaultImage}
                            alt={blog.title}
                            onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                            className="blog-img-thumb"
                        />
                    </div>

                    <div className="blog-content improved-blog-content">
                        {blog.content ? (
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        ) : (
                            <p>{blog.body || 'Nội dung bài viết sẽ được cập nhật sớm.'}</p>
                        )}
                    </div>

                    <div className="blog-tags mt-3 improved-blog-tags">
                        <i className="bi bi-tags me-1"></i>
                        <span className="tag">Sức khỏe</span>
                        <span className="tag">Tâm lý</span>
                        <span className="tag">Tư vấn</span>
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/blog" className="btn btn-outline-primary">
                            <i className="bi bi-arrow-left me-1"></i> Quay lại danh sách
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default DetailBlogPage;
