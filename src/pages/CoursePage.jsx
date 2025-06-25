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
    const itemsPerPage = 4;
    const maxVisibleCategories = 4;

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                console.log('🏷️ Fetching categories from API...');
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
                console.log('✅ Categories fetched successfully:', res);
                
                if (res.success && res.data && res.data.length > 0) {
                    setCategories(res.data);
                    // Set first category as default selected
                    setSelectedCategory(res.data[0]);
                } else {
                    console.warn('⚠️ No categories found or invalid response');
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
                console.log(`📚 Fetching programs for category: ${selectedCategory.category_id} (${selectedCategory.name || selectedCategory.description})`);
                const response = await fetch(`http://localhost:3000/api/programs/category/${selectedCategory.category_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log('📊 Fetch response for category', selectedCategory.category_id, response.status);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const res = await response.json();
                console.log('✅ Programs fetched for category', selectedCategory.category_id, res);
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
                                            title={cat.description || cat.name}
                                        >
                                            <i className={getCategoryIcon(cat.name || cat.description)}></i>
                                            <span className="category-text">{cat.name || cat.description}</span>
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
                            {selectedCategory ? (selectedCategory.name || selectedCategory.description) : 'Chọn Danh mục'}
                        </h2>
                        <p className="section-subtitle">
                            {selectedCategory 
                                ? `Duyệt qua ${(selectedCategory.name || selectedCategory.description).toLowerCase()} của chúng tôi`
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