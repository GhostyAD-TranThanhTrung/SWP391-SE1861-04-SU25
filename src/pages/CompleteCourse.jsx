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

    // Lọc chỉ các khóa học đã hoàn thành
    const completedCourses = courses.filter(course => course.enrollment_status?.has_complete);

    if (loading) {
        return <div className="loading-spinner"><Spinner animation="border" /></div>;
    }

    return (
        <Container className="complete-course-page mt-4">
            <h2 className="mb-4">Khóa học đã hoàn thành</h2>
            {completedCourses.length === 0 ? (
                <div className="text-center py-4">
                    <i className="bi bi-book" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <h4 className="mt-3 text-muted">Chưa có khóa học nào hoàn thành</h4>
                    <p className="text-muted">Bạn chưa hoàn thành khóa học nào. Hãy tiếp tục học tập nhé!</p>
                </div>
            ) : (
                <Row>
                    {completedCourses.map(course => (
                        <Col key={course.program_id || course.id} md={6} lg={4} className="mb-4">
                            <Link to={`/program/${course.program_id || course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card className="course-card h-100">
                                    <Card.Img variant="top" src={course.img_link ? course.img_link : Image} />
                                    <Card.Body>
                                        <Card.Title>{course.title || course.program_title}</Card.Title>
                                        <Card.Text>{course.description || course.program_description}</Card.Text>
                                        <div className="progress-section mb-2">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Tiến độ</span>
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4caf50' }}>
                                                    {course.enrollment_status?.progress_percentage}%
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
                                                    width: `${course.enrollment_status?.progress_percentage || 0}%`,
                                                    height: '100%',
                                                    backgroundColor: '#4caf50',
                                                    transition: 'width 0.3s ease',
                                                    borderRadius: '4px'
                                                }}></div>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                                                {course.enrollment_status?.completed_content} / {course.enrollment_status?.total_content} nội dung hoàn thành
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#4caf50', fontSize: 14, fontWeight: 'bold' }}>
                                            <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }}></i>
                                            <span>Hoàn thành: {course.enrollment_status?.completion_date ? new Date(course.enrollment_status.completion_date).toLocaleDateString('vi-VN') : ''}</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default CompleteCourse;
