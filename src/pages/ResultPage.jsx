import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/ResultPage.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, type } = location.state || {};
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState(null);

    const generateAssessmentId = () => {
        // Simple incremental assessment_id generation (in real app, use UUID or DB auto-increment)
        return Math.floor(Math.random() * 1000) + 1;
    };

    const saveAssessmentResult = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            if (!result || !type) {
                setError('Missing result or test type');
                return;
            }

            const requestData = {
                type,
                score: result.score,
                results: [{
                    questionId: "1",
                    selectedOption: "A1",
                    score: result.score
                }]
            };

            console.log('Sending assessment data:', requestData);

            const response = await axios.post(
                'http://localhost:3000/api/assessments/take-test',
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                console.log('Assessment saved successfully:', response.data);
                setAssessmentResult(response.data.data);
            } else {
                setError(response.data.message || 'Failed to save assessment');
            }
        } catch (error) {
            console.error('Error saving assessment:', error);
            if (error.response) {
                // Server responded with error
                switch (error.response.status) {
                    case 401:
                        navigate('/login');
                        break;
                    case 400:
                        setError(error.response.data.message || 'Invalid assessment data');
                        break;
                    case 404:
                        setError(error.response.data.message || 'Resource not found');
                        break;
                    default:
                        setError(error.response.data.message || 'An error occurred while saving the assessment');
                }
            } else if (error.request) {
                // Request made but no response
                setError('No response from server. Please try again.');
            } else {
                // Other errors
                setError('Failed to send assessment. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (result) {
            saveAssessmentResult();
        }
    }, [result]);

    if (loading) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-info">
                        Đang xử lý kết quả...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-danger">
                        {error}
                        <button 
                            className="btn btn-outline-danger ms-3"
                            onClick={() => navigate('/choosetype')}
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-danger">
                        Không tìm thấy kết quả. Vui lòng thực hiện bài đánh giá trước.
                        <button 
                            className="btn btn-outline-danger ms-3"
                            onClick={() => navigate('/choosetype')}
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getRiskLevelClass = (riskLevel) => {
        switch (riskLevel.toLowerCase()) {
            case 'thấp':
                return 'low';
            case 'trung bình':
                return 'moderate';
            case 'cao':
                return 'high';
            default:
                return '';
        }
    };

    const getRecommendations = (riskLevel) => {
        switch (riskLevel.toLowerCase()) {
            case 'thấp':
                return [
                    'Tiếp tục duy trì lối sống lành mạnh',
                    'Tham gia các hoạt động thể chất thường xuyên',
                    'Duy trì chế độ ăn uống cân bằng',
                    'Thực hiện kiểm tra sức khỏe định kỳ'
                ];
            case 'trung bình':
                return [
                    'Cân nhắc tham khảo ý kiến chuyên gia y tế',
                    'Theo dõi và ghi chép các triệu chứng',
                    'Tăng cường hoạt động thể chất',
                    'Thực hiện các biện pháp giảm stress'
                ];
            case 'cao':
                return [
                    'Cần gặp chuyên gia y tế ngay lập tức',
                    'Thực hiện theo hướng dẫn của bác sĩ',
                    'Tìm kiếm hỗ trợ từ gia đình và bạn bè',
                    'Tham gia các nhóm hỗ trợ'
                ];
            default:
                return [];
        }
    };

    return (
        <motion.div
            className="result-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container">
                <motion.div
                    className="result-card"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="card-header">
                        <h2>Kết Quả Đánh Giá {type?.toUpperCase()}</h2>
                    </div>
                    <div className="card-body">
                        <div className="result-summary">
                            <h3>Mức độ nguy cơ của bạn:</h3>
                            <div className={`risk-level ${getRiskLevelClass(result.riskLevel)}`}>
                                {result.riskLevel}
                            </div>
                        </div>

                        <div className="result-details">
                            <div className="detail-item">
                                <div className="score-circle">
                                    <span className="score-value">{result.score}</span>
                                    <span className="score-label">Điểm</span>
                                </div>
                            </div>
                        </div>

                        {assessmentResult?.recommended_action && (
                            <div className="recommendations">
                                <h4>Khuyến nghị từ hệ thống:</h4>
                                <p>{assessmentResult.recommended_action.description}</p>
                            </div>
                        )}

                        <div className="recommendations">
                            <h4>Khuyến nghị chung:</h4>
                            <ul>
                                {getRecommendations(result.riskLevel).map((rec, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        {rec}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/exam/${type}`)}
                            >
                                Làm Lại Bài Đánh Giá
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/choosetype')}
                            >
                                Quay Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ResultPage;