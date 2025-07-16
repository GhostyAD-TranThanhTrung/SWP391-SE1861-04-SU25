import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/CompleteCourse.scss';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import Image from '../images/Images.jpg';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CompleteCourse = () => {
    const [enrolledPrograms, setEnrolledPrograms] = useState([]);
    const [communityEvents, setCommunityEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);

    useEffect(() => {
        fetchEnrolledPrograms();
        fetchCommunityEvents();
    }, []);

    const fetchEnrolledPrograms = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:3000/api/programs/my-enrollment-status', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.data) {
                // Filter out community events from regular programs
                const regularPrograms = response.data.data.filter(program => 
                    program.enrollment_status?.is_enrolled && 
                    (!program.category || program.category.name !== 'Community Event')
                );
                setEnrolledPrograms(regularPrograms);
            }
        } catch (err) {
            console.error('Failed to fetch enrolled programs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCommunityEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/programs/community-events', {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success && response.data.data) {
                setCommunityEvents(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch community events:', err);
        } finally {
            setEventsLoading(false);
        }
    };

    // Separate enrolled programs by completion status
    const completedPrograms = enrolledPrograms.filter(program => program.enrollment_status?.has_complete);
    const ongoingPrograms = enrolledPrograms.filter(program => !program.enrollment_status?.has_complete);

    const renderEnrolledProgramCard = (program, isCompleted = false) => (
        <Col key={program.program_id} md={6} lg={3} className="mb-3">
            <Link to={`/program/${program.program_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card className={`program-card compact h-100 ${isCompleted ? 'completed-card' : 'ongoing-card'}`}>
                    <div className="status-badge-container">
                        <Badge bg={isCompleted ? 'success' : 'primary'} className="status-badge">
                            <i className={`bi ${isCompleted ? 'bi-check-circle-fill' : 'bi-play-circle-fill'} me-1`}></i>
                            {isCompleted ? 'Hoàn thành' : 'Đang học'}
                        </Badge>
                    </div>
                    <div className="card-image-container">
                        <Card.Img 
                            variant="top" 
                            src={program.img_link || Image} 
                            className="program-image"
                            onError={e => { e.target.onerror = null; e.target.src = Image; }}
                        />
                    </div>
                    <Card.Body className="compact-body">
                        <Card.Title className="program-title compact">{program.title}</Card.Title>
                        <div className="progress-section">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="progress-label">Tiến độ</span>
                                <span className={`progress-percentage ${isCompleted ? 'completed' : 'ongoing'}`}>
                                    {program.enrollment_status?.progress_percentage || 0}%
                                </span>
                            </div>
                            <div className="progress-bar-container">
                                <div 
                                    className={`progress-bar-fill ${isCompleted ? 'completed' : 'ongoing'}`}
                                    style={{ width: `${program.enrollment_status?.progress_percentage || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="program-meta compact">
                            <i className="bi bi-person me-1"></i>
                            {program.creator?.name || program.creator?.email || 'N/A'}
                        </div>
                    </Card.Body>
                </Card>
            </Link>
        </Col>
    );

    const renderCommunityEventCard = (event) => (
        <Col key={event.program_id} md={6} lg={3} className="mb-3">
            <Link to={`/community-event/${event.program_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card className="community-event-card compact h-100">
                    <div className="status-badge-container">
                        <Badge bg="warning" className="status-badge">
                            <i className="bi bi-calendar-event me-1"></i>
                            Sự kiện
                        </Badge>
                    </div>
                    <div className="card-image-container">
                        <Card.Img 
                            variant="top" 
                            src={event.img_link || Image} 
                            className="program-image"
                            onError={e => { e.target.onerror = null; e.target.src = Image; }}
                        />
                    </div>
                    <Card.Body className="compact-body">
                        <Card.Title className="program-title compact">{event.title}</Card.Title>
                        <div className="program-meta compact">
                            <i className="bi bi-people me-1"></i>
                            Sự kiện cộng đồng
                        </div>
                    </Card.Body>
                </Card>
            </Link>
        </Col>
    );

    if (loading && eventsLoading) {
        return (
            <Container className="complete-course-page compact">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Đang tải...</p>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="complete-course-page compact">
            {/* Compact Header */}
            <div className="page-header compact mb-3">
                <h2 className="page-title compact">
                    <i className="bi bi-journal-bookmark me-2"></i>
                    Chương trình của tôi
                </h2>
            </div>

            {/* All Sections in One Page */}
            {/* Ongoing Programs */}
            {ongoingPrograms.length > 0 && (
                <div className="section compact mb-4">
                    <h4 className="section-title compact">
                        <i className="bi bi-play-circle text-primary me-2"></i>
                        Đang học ({ongoingPrograms.length})
                    </h4>
                    <Row>
                        {ongoingPrograms.map(program => renderEnrolledProgramCard(program, false))}
                    </Row>
                </div>
            )}

            {/* Completed Programs */}
            {completedPrograms.length > 0 && (
                <div className="section compact mb-4">
                    <h4 className="section-title compact">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Đã hoàn thành ({completedPrograms.length})
                    </h4>
                    <Row>
                        {completedPrograms.map(program => renderEnrolledProgramCard(program, true))}
                    </Row>
                </div>
            )}

            {/* Community Events */}
            {communityEvents.length > 0 && (
                <div className="section compact mb-4">
                    <h4 className="section-title compact">
                        <i className="bi bi-calendar-heart text-warning me-2"></i>
                        Sự kiện cộng đồng ({communityEvents.length})
                    </h4>
                    <Row>
                        {communityEvents.map(event => renderCommunityEventCard(event))}
                    </Row>
                </div>
            )}

            {/* Empty State */}
            {enrolledPrograms.length === 0 && communityEvents.length === 0 && !loading && !eventsLoading && (
                <div className="empty-state compact">
                    <i className="bi bi-book" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <h4 className="mt-2 text-muted">Chưa có nội dung</h4>
                    <p className="text-muted">Chưa có khóa học hoặc sự kiện nào.</p>
                    <Link to="/courses" className="btn btn-primary mt-2">
                        <i className="bi bi-search me-1"></i>
                        Khám phá khóa học
                    </Link>
                </div>
            )}
        </Container>
    );
};

export default CompleteCourse;
