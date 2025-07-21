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
                <h2>Khóa học đã hoàn thành</h2>
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
                        <div key={course.program_id || course.id} className="setting-course-card">
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
        </div>
    );
};

export default CompleteCourse;
