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
    const [communityEvents, setCommunityEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [showAllEvents, setShowAllEvents] = useState(false);
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
                    // Set first non-Community Event category as default selected
                    const filteredCategories = res.data.filter(category => category.name !== 'Community Event');
                    if (filteredCategories.length > 0) {
                        setSelectedCategory(filteredCategories[0]);
                    }
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
                
                // Filter out community events from regular programs display
                const filteredPrograms = (res.data || []).filter(program => {
                    // Exclude programs that have category name "Community Event"
                    // Also handle cases where category might be null/undefined
                    return !program.category || program.category.name !== 'Community Event';
                });
                
                console.log('Filtered programs (excluding community events):', filteredPrograms);
                setPrograms(filteredPrograms);
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
                    // Filter only enrolled programs and exclude community events
                    const enrolledOnly = res.data.filter(program => 
                        program.enrollment_status.is_enrolled && 
                        (!program.category || program.category.name !== 'Community Event')
                    );
                    console.log('Enrolled programs (excluding community events):', enrolledOnly);
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

    // Fetch community events
    useEffect(() => {
        const fetchCommunityEvents = async () => {
            setEventsLoading(true);
            setEventsError(null);
            try {
                console.log('Fetching community events...');
                const response = await fetch('http://localhost:3000/api/programs/community-events', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch community events');
                }

                const res = await response.json();
                console.log('Community events fetched successfully:', res);

                if (res.success && res.data) {
                    // Sort by create_at date (newest first) - get all events
                    const sortedEvents = res.data
                        .sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
                    console.log(`Community events loaded: ${sortedEvents.length} total (showing 1 by default)`);
                    setCommunityEvents(sortedEvents);
                } else {
                    setCommunityEvents([]);
                }
            } catch (err) {
                console.error('💥 Error fetching community events:', err);
                setEventsError('Không thể tải sự kiện cộng đồng. Vui lòng thử lại sau.');
            } finally {
                setEventsLoading(false);
            }
        };

        fetchCommunityEvents();
    }, []);

    // Helper function to get display name for category (name only)
    const getCategoryDisplayName = (category) => {
        if (category.name) {
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

    // Helper functions for community events
    const getVisibleEvents = () => {
        if (showAllEvents || communityEvents.length <= 1) {
            return communityEvents;
        }
        return communityEvents.slice(0, 1);
    };

    const shouldShowToggleButton = () => {
        return communityEvents.length > 1;
    };

    const toggleShowAllEvents = () => {
        setShowAllEvents(!showAllEvents);
    };

    // Helper function to render community event cards
    const renderCommunityEventCard = (event, isLatest = false) => {
        if (isLatest) {
            // Featured layout for the latest event
            return (
                <div className="col-12 mb-4" key={event.program_id}>
                    <Link to={`/community-event/${event.program_id}`} className="custom-card-link" style={{ textDecoration: 'none' }}>
                        <div 
                            className="featured-community-event-card" 
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.25)';
                            }}
                            style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                            borderRadius: '25px',
                            padding: '2.5rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '220px',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.25)',
                            transition: 'all 0.4s ease'
                        }}>
                            {/* Animated Background Pattern */}
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                                animation: 'pulse 4s ease-in-out infinite alternate'
                            }}></div>

                            {/* LATEST Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                                padding: '8px 16px',
                                borderRadius: '25px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                zIndex: 10,
                                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                                animation: 'glow 2s ease-in-out infinite alternate'
                            }}>
                                <i className="bi bi-star-fill me-1"></i>
                                MỚI NHẤT
                            </div>

                            {/* Content */}
                            <div className="row w-100" style={{ position: 'relative', zIndex: 5 }}>
                                <div className="col-md-8">
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h2 style={{
                                            fontWeight: 'bold',
                                            fontSize: '2.2rem',
                                            marginBottom: '1rem',
                                            lineHeight: '1.2',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                        }}>
                                            {event.title}
                                        </h2>
                                        <p style={{
                                            fontSize: '1.1rem',
                                            opacity: 0.95,
                                            marginBottom: '1.5rem',
                                            lineHeight: '1.6',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {event.description}
                                        </p>
                                    </div>

                                    {/* Event Info */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.25)',
                                            padding: '10px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)'
                                        }}>
                                            <i className="bi bi-calendar-event me-2"></i>
                                            {event.create_at ? new Date(event.create_at).toLocaleDateString('vi-VN') : ''}
                                        </div>
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.25)',
                                            padding: '10px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)'
                                        }}>
                                            <i className="bi bi-people-fill me-2"></i>
                                            Sự kiện Cộng đồng
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4 text-center">
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        backdropFilter: 'blur(15px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        <i className="bi bi-calendar-heart" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.9 }}></i>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Tham gia ngay</h4>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0 }}>
                                            Đừng bỏ lỡ cơ hội kết nối cộng đồng
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            );
        } else {
            // Regular layout for other events
            return (
                <div className="col-md-6" key={event.program_id}>
                    <Link to={`/community-event/${event.program_id}`} className="custom-card-link" style={{ textDecoration: 'none' }}>
                        <div 
                            className="regular-community-event-card" 
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                            }}
                            style={{
                            background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Background Pattern */}
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                right: '-30px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                opacity: 0.6
                            }}></div>

                            {/* Event Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'rgba(255, 255, 255, 0.25)',
                                backdropFilter: 'blur(10px)',
                                padding: '4px 10px',
                                borderRadius: '15px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                zIndex: 10
                            }}>
                                <i className="bi bi-calendar-event me-1"></i>
                                Sự kiện
                            </div>

                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 5, flex: 1 }}>
                                <h5 style={{
                                    fontWeight: 'bold',
                                    fontSize: '1.4rem',
                                    marginBottom: '0.8rem',
                                    lineHeight: '1.3',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {event.title}
                                </h5>
                                <p style={{
                                    fontSize: '0.95rem',
                                    opacity: 0.9,
                                    lineHeight: '1.5',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {event.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div style={{ position: 'relative', zIndex: 5, marginTop: '1rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                        <i className="bi bi-clock me-1"></i>
                                        {event.create_at ? new Date(event.create_at).toLocaleDateString('vi-VN') : ''}
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        <i className="bi bi-people me-1"></i>
                                        Cộng đồng
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            );
        }
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
        // Filter out Community Event category from the display
        const filteredCategories = categories.filter(category => 
            category.name !== 'Community Event'
        );
        
        if (showAllCategories || filteredCategories.length <= maxVisibleCategories) {
            return filteredCategories;
        }
        return filteredCategories.slice(0, maxVisibleCategories);
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

                {/* Community Events Section */}
                <section className="community-events-section mb-5" style={{
                    background: 'linear-gradient(135deg, #f6f9ff 0%, #e8f4fd 100%)',
                    borderRadius: '25px',
                    padding: '3rem 2rem',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background decoration */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '50%',
                        filter: 'blur(30px)'
                    }}></div>

                    <div className="text-center mb-4" style={{ position: 'relative', zIndex: 10 }}>
                        <h2 style={{ 
                            color: '#2c3e50', 
                            fontWeight: 'bold', 
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            <i className="bi bi-calendar-heart me-2" style={{ color: '#667eea' }}></i>
                            Sự kiện Cộng đồng Mới nhất
                        </h2>
                        <p style={{ color: '#546e7a', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Tham gia các hoạt động cộng đồng và kết nối với những người có cùng hành trình
                        </p>
                    </div>

                    {eventsLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-2 text-muted">Đang tải sự kiện cộng đồng...</p>
                        </div>
                    ) : eventsError ? (
                        <div className="text-center py-4">
                            <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
                            <h4 className="mt-3 text-warning">Có lỗi xảy ra</h4>
                            <p className="text-muted">{eventsError}</p>
                        </div>
                    ) : communityEvents.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            <h4 className="mt-3 text-muted">Chưa có sự kiện nào</h4>
                            <p className="text-muted">Các sự kiện cộng đồng sẽ được cập nhật sớm. Hãy quay lại sau!</p>
                        </div>
                    ) : (
                        <>
                            <div className="row gx-4 gy-4" style={{ position: 'relative', zIndex: 10 }}>
                                {getVisibleEvents().map((event, index) => renderCommunityEventCard(event, index === 0))}
                            </div>
                            
                            {/* Toggle Button for More Events - Only show if there are more than 1 event */}
                            {shouldShowToggleButton() && (
                                <div className="text-center mt-4" style={{ position: 'relative', zIndex: 10 }}>
                                    <button
                                        className="btn btn-outline-secondary btn-lg toggle-events-btn"
                                        onClick={toggleShowAllEvents}
                                        style={{
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontWeight: 'bold',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            border: '2px solid #6c757d',
                                            color: '#6c757d',
                                            transition: 'all 0.3s ease',
                                            marginBottom: '1rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#6c757d';
                                            e.target.style.color = 'white';
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(108, 117, 125, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                                            e.target.style.color = '#6c757d';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {showAllEvents ? (
                                            <>
                                                <i className="bi bi-chevron-up me-2"></i>
                                                Ẩn bớt sự kiện
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-chevron-down me-2"></i>
                                                Xem thêm {communityEvents.length - 1} sự kiện
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

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

                                {categories.filter(category => category.name !== 'Community Event').length > maxVisibleCategories && (
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
                                                    Xem thêm {categories.filter(category => category.name !== 'Community Event').length - maxVisibleCategories} danh mục
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