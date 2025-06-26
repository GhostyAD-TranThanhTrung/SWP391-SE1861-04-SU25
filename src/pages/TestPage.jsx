import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TestPage.scss';
import { FaClipboardCheck, FaChartLine, FaArrowRight, FaChevronDown, FaChevronUp, FaEye } from 'react-icons/fa';
import axios from 'axios';

const TestPage = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRecommendations, setExpandedRecommendations] = useState({});

    // Fetch assessments when component mounts
    useEffect(() => {
        const fetchAssessments = async () => {
            const token = sessionStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/assessments/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAssessments(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải kết quả trước đây. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchAssessments();
    }, []);

    const handleStartExam = () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để tiếp tục!');
            navigate('/login');
            return;
        }
        navigate('/choosetype');
    };

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Hàm xử lý hiển thị kết quả
    const renderResultContent = (assessment) => {
        try {
            // Phân tích chuỗi JSON kết quả
            const resultData = typeof assessment.result_json === 'string'
                ? JSON.parse(assessment.result_json)
                : assessment.result_json;

            // Hiển thị điểm số nếu có
            if (resultData && resultData.score !== undefined) {
                return (
                    <div className="result-score">
                        <span className="score-label">Điểm đánh giá:</span>
                        <span className="score-value">{resultData.score}</span>
                    </div>
                );
            } else {
                // Hiển thị dạng rút gọn của kết quả
                return <div className="result-summary">Đã hoàn thành đánh giá</div>;
            }
        } catch (err) {
            return <div className="result-error">Không thể hiển thị kết quả</div>;
        }
    };

    // Hàm để chuyển đổi trạng thái hiển thị khuyến nghị
    const toggleRecommendation = (assessmentId) => {
        setExpandedRecommendations(prev => ({
            ...prev,
            [assessmentId]: !prev[assessmentId]
        }));
    };

    // Hàm để chuyển đến trang kết quả chi tiết
    const navigateToResultDetail = (assessmentId) => {
        navigate(`/result?id=${assessmentId}`);
    };

    return (
        <div className="test-page">
            <div className="test-content">
                <div className="test-card">
                    <div className="test-header">
                        <h2>Khảo sát Đánh giá Rủi ro Nghiện Chất</h2>
                        <p className="subtitle">
                            Dựa trên các khảo sát quốc tế như ASSIST, CRAFFT và các công cụ đánh giá được xác thực khác.
                            Đánh giá toàn diện này giúp xác định các rủi ro sử dụng chất tiềm ẩn và cung cấp phản hồi cá nhân hóa.
                        </p>
                    </div>

                    <button className="start-button" onClick={handleStartExam}>
                        Bắt đầu Đánh giá
                        <FaArrowRight className="arrow-icon" />
                    </button>

                    <div className="exam-result">
                        <div className="result-header">
                            <FaChartLine className="result-icon" />
                            <h4>Kết quả Trước đây</h4>
                        </div>
                        {loading ? (
                            <p className="loading-text">Đang tải kết quả...</p>
                        ) : error ? (
                            <p className="error-text">{error}</p>
                        ) : assessments.length === 0 ? (
                            <p className="no-results">Không tìm thấy đánh giá nào trước đây. Hãy thực hiện đánh giá đầu tiên của bạn ngay bây giờ!</p>
                        ) : (
                            <div className="results-list">
                                {assessments.map((assessment, index) => (
                                    <div key={index} className="result-item">
                                        <div className="result-header-row">
                                            <div className="result-date">{formatDate(assessment.create_at)}</div>
                                            <button
                                                className="view-details-icon"
                                                onClick={() => navigateToResultDetail(assessment.assessment_id)}
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                        </div>
                                        <div className="result-type">Loại: {assessment.type}</div>
                                        {renderResultContent(assessment)}
                                        {assessment.action && (
                                            <>
                                                <button
                                                    className="recommendation-toggle"
                                                    onClick={() => toggleRecommendation(assessment.assessment_id)}
                                                >
                                                    <div className="toggle-content">
                                                        <span>Khuyến nghị</span>
                                                        {expandedRecommendations[assessment.assessment_id] ?
                                                            <FaChevronUp className="toggle-icon" /> :
                                                            <FaChevronDown className="toggle-icon" />
                                                        }
                                                    </div>
                                                </button>
                                                {expandedRecommendations[assessment.assessment_id] && (
                                                    <div className="result-action">
                                                        <div className="action-description">{assessment.action.description}</div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage; 