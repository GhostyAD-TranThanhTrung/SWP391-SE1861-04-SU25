import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CoursePage.scss';
import Image from '../images/Images.jpg';

const CATEGORIES = [
    { id: 1, label: 'Bài viết', icon: 'bi bi-book me-2' },
    { id: 2, label: 'Video', icon: 'bi bi-play-circle me-2' },
    { id: 3, label: 'Podcast', icon: 'bi bi-mic me-2' }
];

const CoursePage = () => {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(0);
    const itemsPerPage = 4;

    useEffect(() => {
        const fetchPrograms = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3000/api/programs/category/${selectedCategory.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Fetch response for category', selectedCategory.id, response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const res = await response.json();
                console.log('Parsed JSON for category', selectedCategory.id, res);
                setPrograms(res.data || []);
            } catch (err) {
                setError('Không thể tải chương trình. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, [selectedCategory]);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setPageIndex(0);
    };

    const handlePrev = () => {
        setPageIndex(Math.max(0, pageIndex - itemsPerPage));
    };

    const handleNext = () => {
        setPageIndex(Math.min(Math.max(0, programs.length - itemsPerPage), pageIndex + itemsPerPage));
    };

    const renderCards = () => {
        if (loading) return <div className="text-center">Đang tải...</div>;
        if (error) return <div className="text-center text-danger">{error}</div>;
        if (!programs.length) return <div className="text-center">Không có chương trình nào</div>;
        const visibleData = programs.slice(pageIndex, pageIndex + itemsPerPage);
        return (
            <div className="position-relative">
                <div className="row gx-4 gy-4">
                    {visibleData.map((item) => (
                        <div className="col-md-3" key={item.program_id}>
                            <Link to={`/program/${item.program_id}`} className="custom-card-link" style={{ textDecoration: 'none' }}>
                                <div className="custom-card" style={{ borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 0 }}>
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
                                        <h5 className="card-title" style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h5>
                                        <p className="card-description" style={{ marginBottom: 8, color: '#444', fontSize: 15, minHeight: 38, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>
                                        <p className="card-meta" style={{ fontSize: 14, marginBottom: 0 }}>
                                            <strong>Người tạo:</strong> {item.creator?.name || item.creator?.email || 'Không xác định'}<br />
                                            <strong>Nhóm tuổi:</strong> {item.age_group || 'N/A'}
                                        </p>
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
                {programs.length > itemsPerPage && (
                    <>
                        <button
                            className="arrow-btn round-arrow-btn position-absolute start-0 top-50 translate-middle-y"
                            onClick={handlePrev}
                            disabled={pageIndex === 0}
                            style={{
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                cursor: pageIndex === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ←
                        </button>
                        <button
                            className="arrow-btn round-arrow-btn position-absolute end-0 top-50 translate-middle-y"
                            onClick={handleNext}
                            disabled={pageIndex + itemsPerPage >= programs.length}
                            style={{
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                cursor: pageIndex + itemsPerPage >= programs.length ? 'not-allowed' : 'pointer'
                            }}
                        >
                            →
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="course-page">
            {/* Hero Section */}
            <section className="course-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h1 className="hero-title">
                                Khám phá Lộ trình Học tập
                            </h1>
                            <p className="hero-subtitle">
                                Khám phá bộ sưu tập toàn diện các tài nguyên giáo dục, khóa học và cập nhật mới nhất
                                được thiết kế để hỗ trợ hành trình nhận thức và phục hồi của bạn.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                {/* Category Tabs */}
                <div className="category-tabs d-flex justify-content-center mb-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-btn${selectedCategory.id === cat.id ? ' active' : ''}`}
                            onClick={() => handleCategoryChange(cat)}
                        >
                            <i className={cat.icon}></i>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
                {/* Programs Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">{selectedCategory.label}</h2>
                        <p className="section-subtitle">Duyệt qua {selectedCategory.label.toLowerCase()} của chúng tôi</p>
                    </div>
                    {renderCards()}
                </section>

                {/* Call to Action */}
                <section className="cta-section py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h3 className="cta-title">Sẵn sàng Bắt đầu Hành trình Học tập?</h3>
                            <p className="cta-description">
                                Tham gia cùng hàng nghìn người học đã thay đổi cuộc sống của họ thông qua giáo dục và nhận thức.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/signup" className="btn btn-cta btn-lg">
                                <i className="bi bi-person-plus me-2"></i>
                                Bắt đầu Ngay hôm nay
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CoursePage;