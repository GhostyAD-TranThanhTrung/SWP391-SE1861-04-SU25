import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/CompleteCourse.scss';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import Image from '../images/Images.jpg';
import { Link } from 'react-router-dom';

const CompleteCourse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        axios.get('http://localhost:3000/api/programs/my-enrollment-status', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setCourses(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch enrollment status:', err);
                setLoading(false);
            });
    }, []);

    // Lọc các khóa học đã hoàn thành và chưa hoàn thành
    const completedCourses = courses.filter(course => course.enrollment_status?.has_complete);
    const incompleteCourses = courses.filter(course => 
        course.enrollment_status?.is_enrolled && !course.enrollment_status?.has_complete
    );

    if (loading) {
        return (
            <div className="setting-loading">
                <Spinner animation="border" variant="primary" />
                <p>Đang tải dữ liệu khóa học...</p>
            </div>
        );
    }

    return (
        <div className="setting-courses-page">
            <div className="courses-header">
                <h2>Tiến Độ Học Tập Của Tôi</h2>
                <p>Danh sách các khóa học bạn đã đăng ký và tiến độ học tập</p>
            </div>
            
            {/* Incomplete Courses Section */}
            {incompleteCourses.length > 0 && (
                <div className="mb-5">
                    <div className="courses-section-header">
                        <h3>Khóa học đang học</h3>
                        <p>Các khóa học bạn đang tham gia và chưa hoàn thành</p>
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

                    {/* Incomplete Courses List */}
                    <div className="row g-3 mb-5">
                        {incompleteCourses.map(course => (
                            <div className="col-12 mb-3" key={`incomplete-${course.program_id || course.id}`}>
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
                                                    {course.title || course.program_title}
                                                </h6>
                                                <small className="badge bg-primary">
                                                    Đang học
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
                                                    {course.description || course.program_description}
                                                </p>
                                                <div className="d-flex flex-column align-items-center gap-1">
                                                    <small className="text-muted">
                                                        <i className="bi bi-person me-1"></i>
                                                        <strong>Tác giả:</strong> {course.creator?.name || course.creator?.email || 'Không xác định'}
                                                    </small>
                                                    <small className="text-muted">
                                                        <i className="bi bi-tag me-1"></i>
                                                        <strong>Nhóm tuổi:</strong> {course.age_group || 'Mọi lứa tuổi'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tiến độ khóa học */}
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="progress mb-2" style={{ height: '8px' }}>
                                                    <div 
                                                        className="progress-bar bg-primary" 
                                                        style={{
                                                            width: `${course.enrollment_status?.progress_percentage || 0}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <small className="fw-bold text-primary">
                                                    {course.enrollment_status?.progress_percentage || 0}% Hoàn thành
                                                </small>
                                                <br/>
                                                <small className="text-muted">
                                                    {course.enrollment_status?.completed_content || 0} / {course.enrollment_status?.total_content || 0} bài học
                                                </small>
                                            </div>
                                        </div>

                                        {/* Vào khóa học */}
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <Link 
                                                    to={`/program/${course.program_id || course.id}`} 
                                                    className="btn btn-sm btn-primary"
                                                    style={{ borderRadius: '20px', padding: '0.5rem 1.5rem' }}
                                                >
                                                    <i className="bi bi-play-circle me-1"></i>
                                                    Tiếp tục
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Completed Courses Section */}
            <div className="courses-section-header">
                <h3>Khóa học đã hoàn thành</h3>
                <p>Danh sách các khóa học bạn đã hoàn thành thành công</p>
            </div>
            
            {completedCourses.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-mortarboard"></i>
                    <h3>Chưa có khóa học nào hoàn thành</h3>
                    <p>Bạn chưa hoàn thành khóa học nào. Hãy tiếp tục học tập để đạt được chứng chỉ!</p>
                </div>
            ) : (
                <div className="setting-courses-grid">
                    {completedCourses.map(course => (
                        <div key={`completed-${course.program_id || course.id}`} className="setting-course-card">
                            <Link to={`/program/${course.program_id || course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card className="h-100">
                                    <Card.Img variant="top" src={course.img_link ? course.img_link : Image} />
                                    <Card.Body>
                                        <Card.Title className="setting-course-title">{course.title || course.program_title}</Card.Title>
                                        <Card.Text className="setting-course-description">{course.description || course.program_description}</Card.Text>
                                        <div className="setting-progress-section">
                                            <div className="setting-progress-header">
                                                <span className="setting-progress-label">Tiến độ</span>
                                                <span className="setting-progress-percentage">
                                                    {course.enrollment_status?.progress_percentage}%
                                                </span>
                                            </div>
                                            <div className="setting-progress-bar">
                                                <div 
                                                    className="setting-progress-fill"
                                                    style={{
                                                        width: `${course.enrollment_status?.progress_percentage || 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="setting-progress-info">
                                                {course.enrollment_status?.completed_content} / {course.enrollment_status?.total_content} nội dung hoàn thành
                                            </div>
                                        </div>
                                        <div className="setting-completion-info">
                                            <i className="bi bi-check-circle-fill"></i>
                                            <span>Hoàn thành: {course.enrollment_status?.completion_date ? new Date(course.enrollment_status.completion_date).toLocaleDateString('vi-VN') : ''}</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Show message if no courses at all */}
            {completedCourses.length === 0 && incompleteCourses.length === 0 && (
                <div className="empty-state">
                    <i className="bi bi-book"></i>
                    <h3>Chưa có khóa học nào</h3>
                    <p>Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học và bắt đầu học tập!</p>
                    <Link to="/courses" className="btn btn-primary">
                        <i className="bi bi-search me-1"></i>
                        Khám phá khóa học
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CompleteCourse;
