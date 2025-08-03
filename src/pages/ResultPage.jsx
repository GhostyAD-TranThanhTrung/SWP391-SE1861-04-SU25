import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ResultPage.scss';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, type } = location.state || {};
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!result || !type) {
            navigate('/choosetype');
        }
    }, [result, type, navigate]);

    if (error) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-danger">
                        <strong>Lỗi:</strong> {error}
                        <button
                            className="btn btn-outline-secondary ms-3"
                            onClick={() => navigate('/choosetype')}
                        >
                            Quay lại
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
                            onClick={() => navigate('/test')}
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
                    'Duy trì chế độ ăn uống cân bằng'
                ];
            case 'trung bình':
                return [
                    'Cân nhắc tham khảo ý kiến chuyên gia y tế',
                    'Theo dõi và ghi chép các triệu chứng',
                    'Tăng cường hoạt động thể chất'
                ];
            case 'cao':
                return [
                    'Cần gặp chuyên gia y tế ngay lập tức',
                    'Thực hiện theo hướng dẫn của bác sĩ',
                    'Tìm kiếm hỗ trợ từ gia đình và bạn bè'
                ];
            default:
                return [];
        }
    };

    return (
        <div className="result-page">
            <div className="container">
                <div className="result-card">
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

                        <div className="recommendations">
                            <h4>Khuyến nghị:</h4>
                            <ul>
                                {getRecommendations(result.riskLevel).map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary me-2"
                                onClick={() => navigate(`/exam/${type}`)}
                            >
                                Làm Lại Bài Đánh Giá
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/test')}
                            >
                                Quay Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;