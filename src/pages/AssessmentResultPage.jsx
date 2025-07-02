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
        <Container className="assessment-result-page mt-4">
            <h2 className="mb-4">Kết quả kiểm tra của bạn</h2>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : results.length === 0 ? (
                <Alert variant="info">Bạn chưa có bài kiểm tra nào.</Alert>
            ) : (
                <Table striped bordered hover responsive className="result-table">
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
            )}
        </Container>
    );
};

export default AssessmentResultPage;
