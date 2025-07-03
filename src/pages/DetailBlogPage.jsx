import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/DetailBlogPage.scss';
import DefaultImage from '../images/Images.jpg';
import FlagModal from '../components/FlagModal';
import { flagBlog, removeFlag, checkUserFlaggedBlog, isAuthenticated, getUserFromToken } from '../service/api';

const DetailBlogPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [flagModalOpen, setFlagModalOpen] = useState(false);
    const [userFlagInfo, setUserFlagInfo] = useState({ flagged: false, flagId: null });
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isOwnBlog, setIsOwnBlog] = useState(false);

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

        const checkAuthAndFlagStatus = async () => {
            const authenticated = isAuthenticated();
            setUserAuthenticated(authenticated);

            if (authenticated) {
                try {
                    const user = getUserFromToken();
                    setCurrentUser(user);

                    const flagInfo = await checkUserFlaggedBlog(id);
                    setUserFlagInfo(flagInfo);
                } catch (error) {
                    console.error('Error checking flag status:', error);
                }
            }
        };

        fetchBlog();
        checkAuthAndFlagStatus();
    }, [id]);

    // Check if the current user is the author of this blog
    useEffect(() => {
        if (blog && currentUser) {
            setIsOwnBlog(blog.author_id === currentUser.userId);
        }
    }, [blog, currentUser]);

    const toggleFavorite = () => {
        setIsFavorite(prev => !prev);
    };

    const handleFlagSubmit = async (reason) => {
        try {
            const response = await flagBlog(id, reason);

            if (response.success) {
                setUserFlagInfo({ flagged: true, flagId: response.data.flag_id });
                alert('Báo cáo đã được gửi thành công. Cảm ơn bạn đã đóng góp để cải thiện chất lượng nội dung.');

                // Check if blog was hidden
                if (response.blogHidden) {
                    alert('Bài viết đã bị ẩn do nhận báo cáo.');
                }

                // Check if author was banned
                if (response.authorBanned) {
                    alert(`Thông báo: Tác giả của bài viết này đã bị khóa tài khoản do có ${response.flaggedPostsCount} bài viết bị báo cáo.`);
                }
            }
        } catch (error) {
            if (error.message.includes('already flagged')) {
                alert('Bạn đã báo cáo bài viết này rồi.');
                // Refresh flag status
                const flagInfo = await checkUserFlaggedBlog(id);
                setUserFlagInfo(flagInfo);
            } else {
                alert('Có lỗi xảy ra khi gửi báo cáo: ' + error.message);
            }
        }
    };

    const handleRemoveFlag = async () => {
        if (!userFlagInfo.flagId) return;

        if (!window.confirm('Bạn có chắc muốn gỡ báo cáo này không?')) return;

        try {
            const response = await removeFlag(userFlagInfo.flagId);

            if (response.success) {
                setUserFlagInfo({ flagged: false, flagId: null });
                alert('Đã gỡ báo cáo thành công.');
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi gỡ báo cáo: ' + error.message);
        }
    };

    const handleFlagClick = () => {
        if (!userAuthenticated) {
            alert('Vui lòng đăng nhập để báo cáo bài viết.');
            return;
        }

        if (isOwnBlog) {
            alert('Bạn không thể báo cáo bài viết của chính mình.');
            return;
        }

        if (userFlagInfo.flagged) {
            handleRemoveFlag();
        } else {
            setFlagModalOpen(true);
        }
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
                            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        </button>

                        {/* !isOwnBlog && (
                            <button
                                className={`btn-report ${userFlagInfo.flagged ? 'flagged' : ''}`}
                                onClick={handleFlagClick}
                                title={userFlagInfo.flagged ? 'Gỡ báo cáo' : 'Báo cáo bài viết'}
                            >
                                <i className={`bi ${userFlagInfo.flagged ? 'bi-flag-fill' : 'bi-flag'}`}></i>
                            </button>
                        )*/}
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

            <FlagModal
                isOpen={flagModalOpen}
                onClose={() => setFlagModalOpen(false)}
                onSubmit={handleFlagSubmit}
                blogId={id}
                blogTitle={blog?.title || 'Bài viết'}
            />
        </div>
    );
};

export default DetailBlogPage;
