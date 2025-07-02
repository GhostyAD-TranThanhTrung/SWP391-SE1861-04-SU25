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
        <div className="write-blogs container mt-4">
            <h2 className="mb-4">Blog của bạn</h2>

            {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {error && <p className="text-danger">{error}</p>}

            {!loading && blogs.length === 0 && (
                <p>Bạn chưa viết blog nào.</p>
            )}

            <div className="row">
                {blogs.map((blog) => {
                    // Lấy text thuần từ content nếu có, nếu không thì lấy body
                    const previewText = blog.content
                        ? stripHtml(blog.content)
                        : (blog.body || '');
                    return (
                        <div className="col-md-6 mb-4" key={blog.blog_id}>
                            <Card className="blog-card">
                                <Card.Body>
                                    <Card.Title>{blog.title}</Card.Title>
                                    <Card.Text>
                                        {previewText.length > 150
                                            ? previewText.slice(0, 150) + '...'
                                            : previewText}
                                    </Card.Text>
                                    <div className="text-muted small">
                                        Ngày đăng: {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Không rõ'}
                                    </div>
                                    <div className="mt-3 d-flex justify-content-end">
                                        <Link to={`/blog/${blog.blog_id}`} className="btn btn-outline-primary btn-sm me-2">Xem chi tiết</Link>
                                        <Link to="/blog" className="btn btn-primary btn-sm">Chỉnh sửa</Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WriteBlogs;
