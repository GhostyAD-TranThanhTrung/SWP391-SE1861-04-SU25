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
    const [enrolledPrograms, setEnrolledPrograms] = useState([]);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const [communityEvents, setCommunityEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
    const itemsPerPage = 4;
    const [enrolledTab, setEnrolledTab] = useState('in_progress'); // 'in_progress' | 'completed'

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/categories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Không thể tải danh mục');
                }

                const res = await response.json();

                if (res.success && res.data && res.data.length > 0) {
                    setCategories(res.data);
                    // Set first non-Community Event category as default selected
                    const filteredCategories = res.data.filter(category => category.name !== 'Community Event');
                    if (filteredCategories.length > 0) {
                        setSelectedCategory(filteredCategories[0]);
                    }
                } else {
                    setCategories([]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh mục. Vui lòng thử lại sau.');
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch programs based on selected category
    useEffect(() => {
        if (!selectedCategory) return;

        const fetchPrograms = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3000/api/programs/category/${selectedCategory.category_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Phản hồi mạng không thành công');
                }

                const res = await response.json();

                setPrograms(res.data);
            } catch (err) {
                console.error('Error fetching programs:', err);
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
                const response = await fetch('http://localhost:3000/api/programs/my-enrollment-status', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    throw new Error('Không thể tải chương trình đã đăng ký');
                }

                const res = await response.json();

                if (res.success && res.data) {
                    // Filter only enrolled programs and exclude community events
                    const enrolledOnly = res.data.filter(program =>
                        program.enrollment_status.is_enrolled &&
                        (!program.category || program.category.name !== 'Community Event')
                    );
                    setEnrolledPrograms(enrolledOnly);
                }
            } catch (err) {
                console.error('Error fetching enrolled programs:', err);
            } finally {
                setEnrollmentLoading(false);
            }
        };

        fetchEnrolledPrograms();
    }, []);

    // Fetch community events
    useEffect(() => {
        const fetchCommunityEvents = async () => {
            setEventsLoading(true);
            setEventsError(null);
            try {
                const response = await fetch('http://localhost:3000/api/programs/community-events', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Không thể tải sự kiện cộng đồng');
                }

                const res = await response.json();

                if (res.success && res.data) {
                    // Sort by create_at date (newest first)
                    const sortedEvents = res.data
                        .sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
                    setCommunityEvents(sortedEvents);
                } else {
                    setCommunityEvents([]);
                }
            } catch (err) {
                console.error('Error fetching community events:', err);
                setEventsError('Không thể tải sự kiện cộng đồng. Vui lòng thử lại sau.');
            } finally {
                setEventsLoading(false);
            }
        };

        fetchCommunityEvents();
    }, []);



    // Helper function to get icon based on category name
    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('article') || name.includes('bài viết')) {
            return 'bi bi-book me-2';
        } else if (name.includes('video')) {
            return 'bi bi-play-circle me-2';
        } else if (name.includes('audio') || name.includes('podcast')) {
            return 'bi bi-mic me-2';
        } else if (name.includes('mental') || name.includes('tâm lý')) {
            return 'bi bi-heart me-2';
        } else if (name.includes('substance') || name.includes('chất')) {
            return 'bi bi-shield-exclamation me-2';
        } else if (name.includes('family') || name.includes('gia đình')) {
            return 'bi bi-people me-2';
        } else if (name.includes('youth') || name.includes('trẻ em')) {
            return 'bi bi-person-check me-2';
        } else {
            return 'bi bi-bookmark me-2';
        }
    };


    const getCategoryShortName = (category) => {
        return category.name || category.description || 'Danh mục';
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setPageIndex(0);
    };

    const handleAgeGroupChange = (ageGroup) => {
        setSelectedAgeGroup(ageGroup);
        setPageIndex(0);
    };

    const getVisibleCategories = () => {
    return categories.filter(category => category.name !== 'Community Event' && category.name !== 'Sự kiện cộng đồng');
    };

    const getVisibleEvents = () => {
        if (showAllEvents || communityEvents.length <= 1) {
            return communityEvents;
        }
        return communityEvents.slice(0, 1);
    };

    // Get unique age groups from programs
    const getUniqueAgeGroups = () => {
        const ageGroups = programs
            .map(program => program.age_group)
            .filter(ageGroup => ageGroup && ageGroup.trim() !== '')
            .filter((ageGroup, index, array) => array.indexOf(ageGroup) === index);
        return ageGroups;
    };

    // Filter programs based on selected filters
    const getFilteredPrograms = () => {
        let filteredPrograms = [...programs];

        if (selectedAgeGroup) {
            filteredPrograms = filteredPrograms.filter(program =>
                program.age_group === selectedAgeGroup
            );
        }

        return filteredPrograms;
    };

    // Thêm hàm lọc enrolledPrograms theo tab
    const getFilteredEnrolledPrograms = () => {
        if (enrolledTab === 'in_progress') {
            return enrolledPrograms.filter(program => !program.enrollment_status.has_complete);
        } else if (enrolledTab === 'completed') {
            return enrolledPrograms.filter(program => program.enrollment_status.has_complete);
        }
        return enrolledPrograms;
    };

    const renderEnrolledProgramCard = (program) => (
        <div className="col-12 mb-3" key={program.program_id}>
            <div className="enrolled-course-card" style={{
                background: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div className="row align-items-center">
                    {/* Tên khóa học */}
                    <div className="col-md-3">
                        <div className="text-center">
                            <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>
                                {program.title}
                            </h6>
                            <small className={`badge ${program.enrollment_status.has_complete ? 'bg-success' : 'bg-primary'}`}>
                                {program.enrollment_status.has_complete ? 'Đã hoàn thành' : 'Đang học'}
                            </small>
                        </div>
                    </div>

                    {/* Thông tin khóa học */}
                    <div className="col-md-3">
                        <div className="text-center">
                            <p className="mb-1 small text-muted" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.85rem'
                            }}>
                                {program.description}
                            </p>
                            <div className="d-flex flex-column align-items-center gap-1">
                                <small className="text-muted">
                                    <i className="bi bi-person me-1"></i>
                                    <strong>Tác giả:</strong> {program.creator?.name || program.creator?.email || 'Không xác định'}
                                </small>
                                {/* Hiển thị nhóm tuổi trong card */}
                                <small className="text-muted d-block">
                                    <i className="bi bi-tag me-1"></i>
                                    <strong>Nhóm tuổi:</strong> {translateAgeGroup(program.age_group) || 'Tất cả độ tuổi'}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Tiến độ khóa học */}
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="progress mb-2" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${program.enrollment_status.progress_percentage}%`,
                                        backgroundColor: program.enrollment_status.has_complete ? '#28a745' : '#007bff'
                                    }}
                                ></div>
                            </div>
                            <small className="fw-bold" style={{
                                color: program.enrollment_status.has_complete ? '#28a745' : '#007bff'
                            }}>
                                {program.enrollment_status.progress_percentage}% Hoàn thành
                            </small>
                            <br />
                            <small className="text-muted">
                                {program.enrollment_status.completed_content} / {program.enrollment_status.total_content} bài học
                            </small>
                        </div>
                    </div>

                    {/* Vào khóa học */}
                    <div className="col-md-3">
                        <div className="text-center">
                            <Link
                                to={`/program/${program.program_id}`}
                                className={`btn btn-sm ${program.enrollment_status.has_complete ? 'btn-success' : 'btn-primary'}`}
                                style={{ borderRadius: '20px', padding: '0.5rem 1.5rem' }}
                            >
                                <i className={`bi ${program.enrollment_status.has_complete ? 'bi-check-circle' : 'bi-play-circle'} me-1`}></i>
                                {program.enrollment_status.has_complete ? 'Xem lại' : 'Tiếp tục'}
                            </Link>
                            {program.enrollment_status.completion_date && (
                                <div className="mt-1">
                                    <small className="text-success">
                                        <i className="bi bi-calendar-check me-1"></i>
                                        Hoàn thành: {new Date(program.enrollment_status.completion_date).toLocaleDateString('vi-VN')}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCommunityEventCard = (event, index) => (
        <div className="col-12 mb-3" key={event.program_id}>
            <Link to={`/community-event/${event.program_id}`} className="text-decoration-none">
                <div className="community-event-card" style={{
                    background: index === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
                    color: index === 0 ? 'white' : '#333',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: index === 0 ? 'none' : '1px solid #dee2e6',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                }}>
                    {index === 0 && (
                        <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge bg-warning text-dark fw-bold">
                                <i className="bi bi-star-fill me-1"></i>
                                MỚI NHẤT
                            </span>
                        </div>
                    )}
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h5 className="fw-bold mb-2">{event.title}</h5>
                            <p className="mb-2" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                opacity: index === 0 ? 0.9 : 0.7
                            }}>
                                {event.description}
                            </p>
                            <small style={{ opacity: index === 0 ? 0.8 : 0.6 }}>
                                <i className="bi bi-calendar-event me-1"></i>
                                {event.create_at ? new Date(event.create_at).toLocaleDateString('vi-VN') : ''}
                            </small>
                        </div>
                        <div className="col-md-4 text-end">
                            <i className={`bi bi-calendar-heart`} style={{
                                fontSize: '2.5rem',
                                opacity: index === 0 ? 0.8 : 0.5
                            }}></i>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    const renderProgramCard = (program) => (
        <div className="col-md-3" key={program.program_id}>
            <Link to={`/program/${program.program_id}`} className="text-decoration-none">
                <div className="program-card h-100" style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #dee2e6',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div className="program-image" style={{
                        height: '160px',
                        background: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={program.img_link || Image}
                            alt={program.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={e => { e.target.onerror = null; e.target.src = Image; }}
                        />
                    </div>
                    <div className="p-3">
                        <h6 className="fw-bold mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {program.title}
                        </h6>
                        <p className="text-muted small mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {program.description}
                        </p>
                        <div className="mb-2">
                            <small className="text-muted d-block">
                                <i className="bi bi-person me-1"></i>
                                <strong>Tác giả:</strong> {program.creator?.name || program.creator?.email || 'Không xác định'}
                            </small>
                            {/* Hiển thị nhóm tuổi trong card */}
                            <small className="text-muted d-block">
                                <i className="bi bi-tag me-1"></i>
                                <strong>Nhóm tuổi:</strong> {translateAgeGroup(program.age_group) || 'Mọi lứa tuổi'}
                            </small>
                        </div>
                        <div className="d-flex justify-content-center">
                            <small className="text-primary">
                                <i className="bi bi-calendar-event me-1"></i>
                                {program.create_at ? new Date(program.create_at).toLocaleDateString('vi-VN') : ''}
                            </small>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    // Hàm dịch nhóm tuổi sang tiếng Việt
    const translateAgeGroup = (ageGroup) => {
        if (!ageGroup || ageGroup.toLowerCase() === 'all') return 'Mọi lứa tuổi';
        // Thêm các trường hợp khác nếu có nhiều nhóm tuổi
        if (ageGroup.toLowerCase() === 'adult') return 'Người lớn';
        if (ageGroup.toLowerCase() === 'youth') return 'Thanh thiếu niên';
        if (ageGroup.toLowerCase() === 'senior') return 'Người già';
        // Nếu không khớp, trả về nguyên bản
        return ageGroup;
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '80px' }}>
            <div className="container" style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>

                {/* Section 1: My Learning Progress */}
                {(localStorage.getItem('token') || sessionStorage.getItem('token')) && enrolledPrograms.length > 0 && (
                    <section className="mb-5">
                        <div style={{
                            border: '2px solid #e0e0e0',
                            borderRadius: '12px',
                            padding: '2rem',
                            backgroundColor: '#ffffff'
                        }}>
                            <h4 className="mb-4 fw-bold text-center">
                                Tiến Độ Học Tập Của Tôi
                            </h4>
                            {/* Filter Tabs */}
                            <div className="d-flex justify-content-center mb-4 gap-2">
                                <button
                                    className={`btn ${enrolledTab === 'in_progress' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    style={{ borderRadius: '20px', minWidth: '150px' }}
                                    onClick={() => setEnrolledTab('in_progress')}
                                >
                                    <i className="bi bi-hourglass-split me-1"></i>
                                    Đang trong quá trình
                                </button>
                                <button
                                    className={`btn ${enrolledTab === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
                                    style={{ borderRadius: '20px', minWidth: '150px' }}
                                    onClick={() => setEnrolledTab('completed')}
                                >
                                    <i className="bi bi-check-circle me-1"></i>
                                    Đã hoàn thành
                                </button>
                            </div>
                            {/* Course Header */}
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        Tên khóa học
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        Thông tin khóa học
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        Tiến độ khóa học
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        Vào khóa học
                                    </div>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="row g-3">
                                {enrollmentLoading ? (
                                    <div className="col-12 text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                        </div>
                                    </div>
                                ) : getFilteredEnrolledPrograms().length === 0 ? (
                                    <div className="col-12 text-center py-4 text-muted">
                                        {enrolledTab === 'in_progress' ? 'Không có khóa học đang trong quá trình' : 'Không có khóa học đã hoàn thành'}
                                    </div>
                                ) : (
                                    getFilteredEnrolledPrograms().map(program => renderEnrolledProgramCard(program))
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 2: Latest Community Events */}
                <section className="mb-5">
                    <div style={{
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '2rem',
                        backgroundColor: '#ffffff'
                    }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold mb-0">Sự kiện cộng đồng mới nhất</h4>
                            {communityEvents.length > 1 && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowAllEvents(!showAllEvents)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    {showAllEvents ? 'Ẩn sự kiện cũ' : 'Hiển thị sự kiện cũ'}
                                </button>
                            )}
                        </div>

                        {eventsLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                            </div>
                        ) : eventsError ? (
                            <div className="text-center py-4 text-danger">{eventsError}</div>
                        ) : communityEvents.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                Chưa có sự kiện cộng đồng nào
                            </div>
                        ) : (
                            <>
                                {getVisibleEvents().map((event, index) => renderCommunityEventCard(event, index))}

                                {showAllEvents && communityEvents.length > 1 && (
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-3">Mở rộng thêm tại đây</small>
                                        <div className="row g-3">
                                            {communityEvents.slice(1).map((event, index) => (
                                                <div className="col-md-4" key={event.program_id}>
                                                    {renderCommunityEventCard(event, index + 1)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Section 3: Filter and Course Grid */}
                <section>
                    <div style={{
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '2rem',
                        backgroundColor: '#ffffff'
                    }}>
                        {/* Filter Section */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-center mb-3">Bộ lọc (theo danh mục/nhóm tuổi)</h5>

                            {/* Category Filters */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-muted mb-2">
                                    <i className="bi bi-bookmark me-2"></i>
                                    Danh mục
                                </h6>
                                <div className="d-flex justify-content-center flex-wrap gap-2">
                                    {categoriesLoading ? (
                                        <div className="text-center">Đang tải danh mục...</div>
                                    ) : (
                                        getVisibleCategories().map((cat) => (
                                            
                                            <button
                                                key={cat.category_id}
                                                className={`btn px-3 py-2 ${selectedCategory && selectedCategory.category_id === cat.category_id ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => handleCategoryChange(cat)}
                                                style={{ borderRadius: '20px', fontSize: '0.9rem' }}
                                            >
                                                <i className={getCategoryIcon(getCategoryShortName(cat))}></i>
                                                {getCategoryShortName(cat)}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mb-4" style={{
                                borderTop: '2px solid #e0e0e0',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#ffffff',
                                    padding: '0 15px',
                                    fontSize: '0.8rem',
                                    color: '#6c757d',
                                    fontWeight: '500'
                                }}>
                                    <i className="bi bi-funnel me-1"></i>
                                    Bộ lọc khác
                                </div>
                            </div>

                            {/* Age Group Filters */}
                            <div className="mb-3">
                                <h6 className="fw-bold text-muted mb-2">
                                    <i className="bi bi-people me-2"></i>
                                    Nhóm tuổi
                                </h6>
                                <div className="d-flex justify-content-center flex-wrap gap-2">
                                    <button
                                        className={`btn px-3 py-2 ${!selectedAgeGroup ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => handleAgeGroupChange(null)}
                                        style={{ borderRadius: '20px', fontSize: '0.9rem' }}
                                    >
                                        <i className="bi bi-star me-1"></i>
                                        {translateAgeGroup('all')}
                                    </button>
                                    {getUniqueAgeGroups().map((ageGroup) => (
                                        <button
                                            key={ageGroup}
                                            className={`btn px-3 py-2 ${selectedAgeGroup === ageGroup ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => handleAgeGroupChange(ageGroup)}
                                            style={{ borderRadius: '20px', fontSize: '0.9rem' }}
                                        >
                                            <i className="bi bi-person me-1"></i>
                                            {translateAgeGroup(ageGroup)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedAgeGroup) && (
                                <div className="text-center">
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => handleAgeGroupChange(null)}
                                        style={{ borderRadius: '15px' }}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Xóa bộ lọc nhóm tuổi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Programs Grid */}
                        <div className="row g-4">
                            {loading ? (
                                <div className="col-12 text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="col-12 text-center py-4 text-danger">{error}</div>
                            ) : !selectedCategory ? (
                                <div className="col-12 text-center py-4 text-muted">
                                    Vui lòng chọn một danh mục
                                </div>
                            ) : getFilteredPrograms().length === 0 ? (
                                <div className="col-12 text-center py-4 text-muted">
                                    {selectedAgeGroup ?
                                        `Không có chương trình nào cho nhóm tuổi "${selectedAgeGroup}" trong danh mục này` :
                                        'Không có chương trình nào trong danh mục này'
                                    }
                                </div>
                            ) : (
                                getFilteredPrograms().slice(pageIndex, pageIndex + itemsPerPage).map(program => renderProgramCard(program))
                            )}
                        </div>

                        {/* Pagination */}
                        {getFilteredPrograms().length > itemsPerPage && (
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setPageIndex(Math.max(0, pageIndex - itemsPerPage))}
                                    disabled={pageIndex === 0}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <span className="btn btn-light disabled">
                                    {Math.floor(pageIndex / itemsPerPage) + 1} / {Math.ceil(getFilteredPrograms().length / itemsPerPage)}
                                </span>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setPageIndex(Math.min(Math.max(0, getFilteredPrograms().length - itemsPerPage), pageIndex + itemsPerPage))}
                                    disabled={pageIndex + itemsPerPage >= getFilteredPrograms().length}
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default CoursePage;