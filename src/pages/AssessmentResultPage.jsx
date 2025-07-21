import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Container, Spinner, Alert } from 'react-bootstrap';
import '../styles/AssessmentResultPage.scss';
import { useNavigate } from 'react-router-dom';

const AssessmentResultPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Vui lòng đăng nhập để xem kết quả.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:3000/api/assessments/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setResults(response.data.data || []);
            } catch (err) {
                setError('Không thể tải kết quả. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const getScore = (item) => {
        if (!item.result_json) return '';
        try {
            const result = typeof item.result_json === 'string' ? JSON.parse(item.result_json) : item.result_json;
            return result && result.score !== undefined ? result.score : '';
        } catch {
            return '';
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/test`);
    };

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="setting-assessment-page">
            <div className="assessment-header">
                <h2>Lịch sử đánh giá</h2>
                <p>Xem lại các kết quả kiểm tra và đánh giá của bạn</p>
            </div>

            {loading ? (
                <div className="setting-loading">
                    <Spinner animation="border" variant="primary" />
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : error ? (
                <div className="setting-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>{error}</p>
                </div>
            ) : results.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-clipboard-data"></i>
                    <h3>Chưa có kết quả đánh giá</h3>
                    <p>Bạn chưa thực hiện bài kiểm tra nào. Hãy thử làm một bài kiểm tra để xem kết quả ở đây.</p>
                </div>
            ) : (
                <div className="results-container">
                    <Table striped bordered hover responsive className="setting-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Loại đánh giá</th>
                                <th>Điểm số</th>
                                <th>Ngày làm</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((item, index) => (
                                <tr key={item.assessment_id || index}>
                                    <td>{index + 1}</td>
                                    <td>{item.type}</td>
                                    <td>{getScore(item)}</td>
                                    <td>{formatDate(item.create_at)}</td>
                                    <td>
                                        <Button variant="info" size="sm" onClick={() => handleViewDetails(item.assessment_id)}>
                                            Xem chi tiết
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default AssessmentResultPage;
