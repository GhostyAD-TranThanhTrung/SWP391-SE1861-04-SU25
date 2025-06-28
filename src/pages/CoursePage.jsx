import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CoursePage.scss';
import Image from '../images/Images.jpg';

const CoursePage = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [enrolledPrograms, setEnrolledPrograms] = useState([]);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const itemsPerPage = 4;
    const maxVisibleCategories = 4;

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                console.log('Fetching categories from API...');
                const response = await fetch('http://localhost:3000/api/categories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const res = await response.json();
                console.log('Categories fetched successfully:', res);

                if (res.success && res.data && res.data.length > 0) {
                    setCategories(res.data);
                    // Set first category as default selected
                    setSelectedCategory(res.data[0]);
                } else {
                    console.warn('No categories found or invalid response');
                    setCategories([]);
                }
            } catch (err) {
                console.error('💥 Error fetching categories:', err);
                setError('Không thể tải danh mục. Vui lòng thử lại sau.');
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch programs based on selected category
    useEffect(() => {
        if (!selectedCategory) return; // Don't fetch if no category selected

        const fetchPrograms = async () => {
            setLoading(true);
            setError(null);
            try {
                const categoryDisplayName = getCategoryDisplayName(selectedCategory);
                console.log(`Fetching programs for category: ${selectedCategory.category_id} (${categoryDisplayName})`);
                const response = await fetch(`http://localhost:3000/api/programs/category/${selectedCategory.category_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Fetch response for category', selectedCategory.category_id, response.status);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const res = await response.json();
                console.log('Programs fetched for category', selectedCategory.category_id, res);
                setPrograms(res.data || []);
            } catch (err) {
                console.error('💥 Error fetching programs:', err);
                setError('Không thể tải chương trình. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [selectedCategory]);

    // Fetch enrolled programs if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const fetchEnrolledPrograms = async () => {
            setEnrollmentLoading(true);
            try {
                console.log('Fetching enrolled programs for logged-in user...');
                const response = await fetch('http://localhost:3000/api/programs/my-enrollment-status', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch enrolled programs');
                }

                const res = await response.json();
                console.log('Enrolled programs fetched successfully:', res);

                if (res.success && res.data) {
                    // Filter only enrolled programs
                    const enrolledOnly = res.data.filter(program => program.enrollment_status.is_enrolled);
                    setEnrolledPrograms(enrolledOnly);
                }
            } catch (err) {
                console.error('💥 Error fetching enrolled programs:', err);
            } finally {
                setEnrollmentLoading(false);
            }
        };

        fetchEnrolledPrograms();
    }, []);

    // Helper function to get display name for category (name + description)
    const getCategoryDisplayName = (category) => {
        if (category.name && category.description) {
            return `${category.name} - ${category.description}`;
        } else if (category.name) {
            return category.name;
        } else if (category.description) {
            return category.description;
        } else {
            return 'Danh mục không xác định';
        }
    };

    // Helper function to get short display name for category buttons
    const getCategoryShortName = (category) => {
        return category.name || category.description || 'Danh mục';
    };

    // Helper functions for enrolled programs
    const getCompletedPrograms = () => {
        return enrolledPrograms.filter(program => program.enrollment_status.has_complete);
    };

    const getOngoingPrograms = () => {
        return enrolledPrograms.filter(program => !program.enrollment_status.has_complete);
    };

    const renderEnrolledProgramCard = (program) => (
        <div className="col-md-3" key={program.program_id}>
            <Link to={`/program/${program.program_id}`} className="custom-card-link" style={{ textDecoration: 'none' }}>
                <div className="custom-card" style={{
                    borderRadius: 20,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    minHeight: 480,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 0,
                    position: 'relative',
                    border: program.enrollment_status.has_complete ? '2px solid #4caf50' : '2px solid #2196f3'
                }}>
                    {/* Status Badge */}
                    <div className="status-badge" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: program.enrollment_status.has_complete ? '#4caf50' : '#2196f3',
                        color: 'white',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                        {program.enrollment_status.has_complete ? 'Hoàn thành' : 'Đang học'}
                    </div>

                    {/* Image Section */}
                    <div style={{ height: 160, width: '100%', background: '#f7f7f7', borderTopLeftRadius: 20, borderTopRightRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img
                            src={program.img_link || Image}
                            alt={program.title || 'Hình ảnh chương trình'}
                            style={{ maxHeight: 140, maxWidth: '90%', objectFit: 'cover', borderRadius: 12, margin: '0 auto', display: 'block' }}
                            onError={e => { e.target.onerror = null; e.target.src = Image; }}
                        />
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <hr className="card-divider" />
                        <h5 className="card-title" style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{program.title}</h5>
                        <p className="card-description" style={{ marginBottom: 12, color: '#444', fontSize: 15, minHeight: 38, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {program.description}
                        </p>

                        {/* Progress Section */}
                        <div className="progress-section" style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Tiến độ</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: program.enrollment_status.has_complete ? '#4caf50' : '#2196f3' }}>
                                    {program.enrollment_status.progress_percentage}%
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: 4
                            }}>
                                <div style={{
                                    width: `${program.enrollment_status.progress_percentage}%`,
                                    height: '100%',
                                    backgroundColor: program.enrollment_status.has_complete ? '#4caf50' : '#2196f3',
                                    transition: 'width 0.3s ease',
                                    borderRadius: '4px'
                                }}></div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                                {program.enrollment_status.completed_content} / {program.enrollment_status.total_content} nội dung hoàn thành
                            </div>
                        </div>

                        <p className="card-meta" style={{ fontSize: 14, marginBottom: 8 }}>
                            <strong>Người tạo:</strong> {program.creator?.name || program.creator?.email || 'Không xác định'}<br />
                            <strong>Nhóm tuổi:</strong> {program.age_group || 'N/A'}
                        </p>
                    </div>

                    {/* Footer Section */}
                    <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {program.enrollment_status.completion_date ? (
                            <div style={{ display: 'flex', alignItems: 'center', color: '#4caf50', fontSize: 14, fontWeight: 'bold' }}>
                                <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }}></i>
                                <span>Hoàn thành: {new Date(program.enrollment_status.completion_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                        ) : program.enrollment_status.enrollment_date && (
                            <div style={{ display: 'flex', alignItems: 'center', color: '#2196f3', fontSize: 14 }}>
                                <i className="bi bi-calendar-event" style={{ marginRight: 6 }}></i>
                                <span>Bắt đầu: {new Date(program.enrollment_status.enrollment_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6c63ff', fontSize: 14 }}>
                            <i className="bi bi-calendar-plus" style={{ marginRight: 6 }}></i>
                            <span style={{ color: '#6c63ff' }}>Tạo: {program.create_at ? new Date(program.create_at).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    // Helper function to get icon based on category name or description
    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('article') || name.includes('articles') || name.includes('bài viết') || name.includes('text') || name.includes('reading')) {
            return 'bi bi-book me-2';
        } else if (name.includes('video') || name.includes('videos') || name.includes('visual') || name.includes('watch')) {
            return 'bi bi-play-circle me-2';
        } else if (name.includes('audio') || name.includes('podcast') || name.includes('podcasts') || name.includes('sound') || name.includes('listen')) {
            return 'bi bi-mic me-2';
        } else if (name.includes('mental') || name.includes('tâm lý') || name.includes('health') || name.includes('sức khỏe')) {
            return 'bi bi-heart me-2';
        } else if (name.includes('substance') || name.includes('chất') || name.includes('addiction') || name.includes('nghiện')) {
            return 'bi bi-shield-exclamation me-2';
        } else if (name.includes('family') || name.includes('gia đình') || name.includes('relationship') || name.includes('mối quan hệ')) {
            return 'bi bi-people me-2';
        } else if (name.includes('youth') || name.includes('trẻ em') || name.includes('teen') || name.includes('child')) {
            return 'bi bi-person-check me-2';
        } else {
            return 'bi bi-bookmark me-2'; // Default icon
        }
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setPageIndex(0);
    };

    const toggleShowAllCategories = () => {
        setShowAllCategories(!showAllCategories);
    };

    const getVisibleCategories = () => {
        if (showAllCategories || categories.length <= maxVisibleCategories) {
            return categories;
        }
        return categories.slice(0, maxVisibleCategories);
    };

    const handlePrev = () => {
        setPageIndex(Math.max(0, pageIndex - itemsPerPage));
    };

    const handleNext = () => {
        setPageIndex(Math.min(Math.max(0, programs.length - itemsPerPage), pageIndex + itemsPerPage));
    };

    const renderCards = () => {
        if (categoriesLoading) return <div className="text-center">Đang tải danh mục...</div>;
        if (loading) return <div className="text-center">Đang tải chương trình...</div>;
        if (error) return <div className="text-center text-danger">{error}</div>;
        if (!selectedCategory) return <div className="text-center">Vui lòng chọn một danh mục</div>;
        if (!programs.length) return <div className="text-center">Không có chương trình nào trong danh mục này</div>;
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
                            Next
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
                {/* Enrolled Programs Section - Only show if user is logged in */}
                {(localStorage.getItem('token') || sessionStorage.getItem('token')) && (
                    <section className="enrolled-programs-section mb-5" style={{
                        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid #e1e7ff'
                    }}>
                        <div className="text-center mb-4">
                            <h2 style={{ color: '#2c3e50', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <i className="bi bi-person-workspace me-2"></i>
                                Khóa học của tôi
                            </h2>
                            <p style={{ color: '#546e7a', fontSize: '1.1rem' }}>
                                Theo dõi tiến độ học tập và quản lý các khóa học đã đăng ký
                            </p>
                        </div>

                        {enrollmentLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-2 text-muted">Đang tải khóa học của bạn...</p>
                            </div>
                        ) : enrolledPrograms.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="bi bi-book" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                <h4 className="mt-3 text-muted">Chưa có khóa học nào</h4>
                                <p className="text-muted">Bạn chưa đăng ký khóa học nào. Hãy khám phá và đăng ký khóa học bên dưới!</p>
                            </div>
                        ) : (
                            <>
                                {/* Ongoing Programs */}
                                {getOngoingPrograms().length > 0 && (
                                    <div className="ongoing-section mb-4">
                                        <h4 style={{ color: '#2196f3', fontWeight: 'bold', marginBottom: '1rem' }}>
                                            <i className="bi bi-play-circle me-2"></i>
                                            Đang học ({getOngoingPrograms().length})
                                        </h4>
                                        <div className="row gx-4 gy-4">
                                            {getOngoingPrograms().map(program => renderEnrolledProgramCard(program))}
                                        </div>
                                    </div>
                                )}

                                {/* Completed Programs */}
                                {getCompletedPrograms().length > 0 && (
                                    <div className="completed-section">
                                        <h4 style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '1rem' }}>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Đã hoàn thành ({getCompletedPrograms().length})
                                        </h4>
                                        <div className="row gx-4 gy-4">
                                            {getCompletedPrograms().map(program => renderEnrolledProgramCard(program))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* Category Tabs */}
                <div className="category-section mb-4">
                    {categoriesLoading ? (
                        <div className="text-center">Đang tải danh mục...</div>
                    ) : categories.length === 0 ? (
                        <div className="text-center text-muted">Không có danh mục nào</div>
                    ) : (
                        <>
                            <div className="category-tabs-wrapper">
                                <div className="category-tabs d-flex justify-content-center flex-wrap mb-3">
                                    {getVisibleCategories().map((cat) => (
                                        <button
                                            key={cat.category_id}
                                            className={`category-btn${selectedCategory && selectedCategory.category_id === cat.category_id ? ' active' : ''}`}
                                            onClick={() => handleCategoryChange(cat)}
                                            title={getCategoryDisplayName(cat)}
                                        >
                                            <i className={getCategoryIcon(getCategoryShortName(cat))}></i>
                                            <span className="category-text">{getCategoryShortName(cat)}</span>
                                        </button>
                                    ))}
                                </div>

                                {categories.length > maxVisibleCategories && (
                                    <div className="text-center">
                                        <button
                                            className="btn btn-outline-primary btn-sm toggle-categories-btn"
                                            onClick={toggleShowAllCategories}
                                        >
                                            {showAllCategories ? (
                                                <>
                                                    <i className="bi bi-chevron-up me-2"></i>
                                                    Ẩn bớt danh mục
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-chevron-down me-2"></i>
                                                    Xem thêm {categories.length - maxVisibleCategories} danh mục
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                {/* Programs Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">
                            {selectedCategory ? getCategoryDisplayName(selectedCategory) : 'Chọn Danh mục'}
                        </h2>
                        <p className="section-subtitle">
                            {selectedCategory
                                ? `Duyệt qua ${getCategoryDisplayName(selectedCategory).toLowerCase()} của chúng tôi`
                                : 'Vui lòng chọn một danh mục để xem chương trình'
                            }
                        </p>
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