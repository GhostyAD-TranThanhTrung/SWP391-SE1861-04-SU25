import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/WriteBlogs.scss';
import { Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const WriteBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserBlogs = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Bạn cần đăng nhập để xem blog của mình.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:3000/api/blogs/my', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setBlogs(response.data.data);
            } catch (err) {
                console.error(err);
                setError('Không thể tải blog của bạn.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserBlogs();
    }, []);

    // Hàm loại bỏ thẻ HTML để lấy text thuần
    const stripHtml = (html) => {
        if (!html) return '';
        // Loại bỏ tất cả thẻ HTML bằng regex
        return html.replace(/<[^>]+>/g, '').trim();
    };

    return (
        <div className="setting-blogs-page">
            <div className="blogs-header">
                <h2>Blog đã viết</h2>
                <p>Quản lý và xem lại các bài viết blog của bạn</p>
            </div>

            {loading && (
                <div className="setting-loading">
                    <Spinner animation="border" variant="primary" />
                    <p>Đang tải blog của bạn...</p>
                </div>
            )}

            {error && (
                <div className="setting-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>{error}</p>
                </div>
            )}

            {!loading && blogs.length === 0 && (
                <div className="empty-state">
                    <i className="bi bi-journal-text"></i>
                    <h3>Chưa có blog nào</h3>
                    <p>Bạn chưa viết blog nào. Hãy bắt đầu tạo blog đầu tiên của bạn!</p>
                </div>
            )}

            {blogs.length > 0 && (
                <div className="setting-blogs-grid">
                    {blogs.map((blog) => {
                        // Lấy text thuần từ content nếu có, nếu không thì lấy body
                        const previewText = blog.content
                            ? stripHtml(blog.content)
                            : (blog.body || '');
                        return (
                            <div className="setting-blog-card" key={blog.blog_id}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <Card.Title className="setting-blog-title">{blog.title}</Card.Title>
                                        <Card.Text className="setting-blog-preview">
                                            {previewText.length > 150
                                                ? previewText.slice(0, 150) + '...'
                                                : previewText}
                                        </Card.Text>
                                        <div className="setting-blog-meta">
                                            <span className="setting-blog-date">
                                                <i className="bi bi-calendar3"></i>
                                                {blog.created_at ? new Date(blog.created_at).toLocaleDateString('vi-VN') : 'Không rõ'}
                                            </span>
                                        </div>
                                        <div className="setting-blog-actions">
                                            <Link to={`/blog/${blog.blog_id}`} className="btn btn-outline-primary btn-sm">
                                                <i className="bi bi-eye"></i>
                                                Xem chi tiết
                                            </Link>
                                            <Link to="/blog" className="btn btn-primary btn-sm">
                                                <i className="bi bi-pencil"></i>
                                                Chỉnh sửa
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WriteBlogs;
