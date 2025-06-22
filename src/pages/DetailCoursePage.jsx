import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/DetailCoursePage.scss';
import DefaultImage from '../images/Images.jpg';

const DetailCoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [contentPreview, setContentPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchProgram = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/programs/${id}`);
                if (!res.ok) throw new Error('Không thể tải dữ liệu chương trình');
                const data = await res.json();
                setProgram(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchContentPreview = async () => {
            setContentLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/content/preview/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setContentPreview(data.data || []);
                } else {
                    console.warn('Không thể tải nội dung preview');
                    setContentPreview([]);
                }
            } catch (err) {
                console.error('Lỗi khi tải content preview:', err);
                setContentPreview([]);
            } finally {
                setContentLoading(false);
            }
        };

        fetchProgram();
        fetchContentPreview();
    }, [id]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            // Thêm logic enroll ở đây
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`http://localhost:3000/api/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    program_id: id
                })
            });

            if (res.ok) {
                alert('Đăng ký khóa học thành công!');
                navigate('/dashboard');
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Có lỗi xảy ra khi đăng ký');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi đăng ký khóa học');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return (
        <div className="detailcourse-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin khóa học...</p>
        </div>
    );

    if (error) return (
        <div className="detailcourse-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <Link to="/courses" className="error-back-btn">Quay lại danh sách khóa học</Link>
        </div>
    );

    if (!program) return (
        <div className="detailcourse-notfound">
            <div className="notfound-icon">🔍</div>
            <p>Không tìm thấy chương trình.</p>
            <Link to="/courses" className="notfound-back-btn">Quay lại danh sách khóa học</Link>
        </div>
    );

    return (
        <div className="detailcourse-container">
            {/* Header với breadcrumb */}
            <div className="detailcourse-header">
                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-item">Trang chủ</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/courses" className="breadcrumb-item">Khóa học</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{program.title}</span>
                </div>
            </div>

            {/* Main content */}
            <div className="detailcourse-main">
                {/* Left column - Image */}
                <div className="detailcourse-left">
                    <div className="detailcourse-img-container">
                        <img
                            src={program.img_link || DefaultImage}
                            alt={program.title}
                            className="detailcourse-img"
                            onError={e => { e.target.onerror = null; e.target.src = DefaultImage; }}
                        />
                        <div className="img-overlay">
                            <div className="overlay-content">
                                <span className="course-badge">Khóa học</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Info */}
                <div className="detailcourse-right">
                    <div className="course-header">
                        <h1 className="detailcourse-title">{program.title}</h1>
                        <div className="course-meta">
                            <div className="meta-item">
                                <span className="meta-icon">👤</span>
                                <span className="meta-label">Người tạo:</span>
                                <span className="meta-value">{program.creator?.name || program.creator?.email || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">🎯</span>
                                <span className="meta-label">Nhóm tuổi:</span>
                                <span className="meta-value">{program.age_group || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span className="meta-label">Ngày tạo:</span>
                                <span className="meta-value">{new Date(program.create_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="course-description">
                        <h3>Mô tả khóa học</h3>
                        <p>{program.description}</p>
                    </div>

                    {/* Enroll section */}
                    <div className="enroll-section">
                        <div className="enroll-card">
                            <div className="enroll-info">
                                <h3>Đăng ký khóa học</h3>
                                <p>Tham gia khóa học này để nâng cao kiến thức và kỹ năng của bạn</p>
                            </div>
                            <button
                                className={`enroll-btn ${enrolling ? 'enrolling' : ''}`}
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling ? (
                                    <>
                                        <span className="enroll-spinner"></span>
                                        Đang đăng ký...
                                    </>
                                ) : (
                                    <>
                                        <span className="enroll-icon">📚</span>
                                        Đăng ký ngay
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course content */}
            <div className="detailcourse-content-section">
                <div className="content-header">
                    <h2>Nội dung chi tiết khóa học</h2>
                    <div className="content-badge">Chi tiết</div>
                </div>
                <div className="detailcourse-content-card">
                    <div className="detailcourse-content">
                        {contentLoading ? (
                            <div className="content-loading">
                                <div className="loading-spinner"></div>
                                <p>Đang tải nội dung khóa học...</p>
                            </div>
                        ) : contentPreview.length > 0 ? (
                            <div className="content-preview-list">
                                <div className="preview-header">
                                    <h3>Danh sách nội dung ({contentPreview.length} mục)</h3>
                                </div>
                                {contentPreview.map((content, index) => (
                                    <div key={index} className="content-preview-item">
                                        <div className="content-order">
                                            <span className="order-number">{content.orders}</span>
                                        </div>
                                        <div className="content-info">
                                            <h4 className="content-title">{content.title}</h4>
                                            <div className="content-type-badge">
                                                <span className={`type-badge ${content.type}`}>
                                                    {content.type === 'article' && '📄'}
                                                    {content.type === 'video' && '🎥'}
                                                    {content.type === 'podcast' && '🎧'}
                                                    {content.type === 'module' && '📚'}
                                                    {!['article', 'video', 'podcast', 'module'].includes(content.type) && '📝'}
                                                    {content.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="content-actions">
                                            <button className="preview-btn" disabled>
                                                <span className="preview-icon">👁️</span>
                                                Xem trước
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-content">
                                <span className="no-content-icon">📝</span>
                                <p>Nội dung chi tiết sẽ được cập nhật sớm nhất</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailCoursePage;
