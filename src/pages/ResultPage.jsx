import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/ResultPage.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, type } = location.state || {};

    if (!result) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-danger">
                        Không tìm thấy kết quả. Vui lòng thực hiện bài đánh giá trước.
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

    const handleRetakeAssessment = () => {
        navigate(`/exam/${type}`);
    };

    const handleBackToHome = () => {
        navigate('/choosetype');
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
                        <h2>Kết Quả Đánh Giá {type.toUpperCase()}</h2>
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

                        <div className="recommendations">
                            <h4>Khuyến nghị:</h4>
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
                                onClick={handleRetakeAssessment}
                            >
                                Làm Lại Bài Đánh Giá
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleBackToHome}
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