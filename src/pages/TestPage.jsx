import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TestPage.scss';
import { FaClipboardCheck, FaChartLine, FaArrowRight, FaChevronDown, FaChevronUp, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const TestPage = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRecommendations, setExpandedRecommendations] = useState({});
    const [expandedAnswers, setExpandedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false); // Hidden by default

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

            // Check if this is ASSIST assessment
            const isAssist = assessment.type && assessment.type.toLowerCase() === 'assist';

            // Hiển thị điểm số nếu có
            if (resultData && resultData.score !== undefined) {
                return (
                    <div className="result-score">
                        <span className="score-label">Điểm đánh giá:</span>
                        <span className="score-value">{resultData.score}</span>
                        {isAssist && (
                            <div className="assist-score-info mt-2">
                                <small className="text-muted">
                                    <i className="fas fa-info-circle me-1"></i>
                                    {resultData.score <= 3 ? 'Nguy cơ thấp' : 
                                     resultData.score <= 26 ? 'Nguy cơ trung bình' : 'Nguy cơ cao'}
                                </small>
                            </div>
                        )}
                    </div>
                );
            } else {
                // Hiển thị dạng rút gọn của kết quả
                return (
                    <div className="result-summary">
                        <div>Đã hoàn thành đánh giá</div>
                        {isAssist && (
                            <small className="text-muted">
                                <i className="fas fa-clipboard-list me-1"></i>
                                ASSIST - Đánh giá rủi ro sử dụng chất
                            </small>
                        )}
                    </div>
                );
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

    // Hàm để chuyển đổi trạng thái hiển thị câu trả lời
    const toggleAnswers = (assessmentId) => {
        setExpandedAnswers(prev => ({
            ...prev,
            [assessmentId]: !prev[assessmentId]
        }));
    };

    // Hàm để hiển thị câu trả lời chi tiết
    const renderAnswerDetails = (assessment) => {
        try {
            const resultData = typeof assessment.result_json === 'string'
                ? JSON.parse(assessment.result_json)
                : assessment.result_json;

            if (!resultData || !resultData.result) {
                return <div>Không có dữ liệu câu trả lời chi tiết</div>;
            }

            // Check if this is ASSIST assessment
            const isAssist = assessment.type && assessment.type.toLowerCase() === 'assist';

            return (
                <div className="answers-details">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Câu hỏi</th>
                                    <th>Câu trả lời</th>
                                    <th>Điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultData.result.map((answer, index) => {
                                    // For ASSIST, check if this is the first question (multi-select)
                                    const isFirstQuestion = isAssist && answer.questionId === "1";
                                    
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className="question-text">
                                                    <strong>Câu {answer.questionId}:</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {answer.question || `Câu hỏi ${answer.questionId}`}
                                                    </small>
                                                    {isFirstQuestion && (
                                                        <div className="question-note mt-1">
                                                            <small className="text-info">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                Câu hỏi đa lựa chọn
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="answer-content">
                                                    {answer.selectedOption || 'Không có câu trả lời'}
                                                    {isFirstQuestion && answer.selectedOption && (
                                                        <div className="answer-note mt-1">
                                                            <small className="text-muted">
                                                                <i className="fas fa-check-circle me-1"></i>
                                                                Đã chọn {answer.selectedOption.split(', ').length} lựa chọn
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{answer.score}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Additional info for ASSIST assessments */}
                    {isAssist && (
                        <div className="assist-info mt-3">
                            <div className="alert alert-info">
                                <h6><i className="fas fa-info-circle me-2"></i>Thông tin về bài đánh giá ASSIST</h6>
                                <ul className="mb-0 mt-2">
                                    <li>Câu hỏi 1: Chọn tất cả các chất bạn đã từng sử dụng</li>
                                    <li>Câu hỏi 2-15: Dựa trên các chất đã chọn ở câu 1</li>
                                    <li>Điểm số được tính dựa trên tần suất và mức độ nghiêm trọng của việc sử dụng chất</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            );
        } catch (err) {
            return <div className="result-error">Không thể hiển thị chi tiết câu trả lời</div>;
        }
    };

    // Hàm để chuyển đến trang kết quả chi tiết
    const navigateToResultDetail = (assessmentId) => {
        navigate(`/result?id=${assessmentId}`);
    };

    // Hàm để toggle hiển thị kết quả
    const toggleResults = () => {
        setShowResults(!showResults);
        if (!showResults) {
            // Đóng tất cả các chi tiết mở rộng khi ẩn kết quả
            setExpandedAnswers({});
            setExpandedRecommendations({});
        }
    };

    // Cấu hình cho carousel
    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        adaptiveHeight: true,
        autoplay: false,
        pauseOnHover: true,
        swipeToSlide: true,
        afterChange: (current) => {
            // Đóng tất cả các chi tiết mở rộng khi chuyển slide
            setExpandedAnswers({});
            setExpandedRecommendations({});
        },
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true
                }
            }
        ]
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
                            <button 
                                className={`toggle-results-button ${
                                    loading ? 'loading' : 
                                    error ? 'error' : 
                                    assessments.length === 0 ? 'no-results' : 
                                    assessments.length > 0 ? 'has-results' : ''
                                }`}
                                onClick={toggleResults}
                                disabled={loading || error || assessments.length === 0}
                            >
                                {loading ? (
                                    'Đang tải...'
                                ) : error ? (
                                    'Lỗi'
                                ) : assessments.length === 0 ? (
                                    'Chưa có kết quả'
                                ) : showResults ? (
                                    <>
                                        <FaEyeSlash className="toggle-icon" />
                                        Ẩn kết quả
                                    </>
                                ) : (
                                    <>
                                        <FaEye className="toggle-icon" />
                                        Xem kết quả ({assessments.length})
                                    </>
                                )}
                            </button>
                        </div>
                        {showResults && (
                            <>
                                {loading ? (
                                    <p className="loading-text">Đang tải kết quả...</p>
                                ) : error ? (
                                    <p className="error-text">{error}</p>
                                ) : assessments.length === 0 ? (
                                    <div className="no-results-container">
                                        <p className="no-results">Không tìm thấy đánh giá nào trước đây. Hãy thực hiện đánh giá đầu tiên của bạn ngay bây giờ!</p>
                                    </div>
                                ) : (
                                    <div className="results-carousel-container">
                                        <div className="results-carousel">
                                            <Slider {...sliderSettings}>
                                                {assessments.map((assessment, index) => (
                                                    <div key={index} className="carousel-item">
                                                        <div className="result-item">
                                                            <div className="result-header-row">
                                                                <div className="result-date">{formatDate(assessment.create_at)}</div>
                                                                <button
                                                                    className="view-details-icon"
                                                                    onClick={() => toggleAnswers(assessment.assessment_id)}
                                                                    title={expandedAnswers[assessment.assessment_id] ? "Ẩn chi tiết" : "Xem chi tiết"}
                                                                >
                                                                    {expandedAnswers[assessment.assessment_id] ? <FaEyeSlash /> : <FaEye />}
                                                                </button>
                                                            </div>
                                                            <div className="result-type">Loại: {assessment.type}</div>
                                                            {renderResultContent(assessment)}

                                                            {/* Hiển thị chi tiết câu trả lời khi nhấn vào icon con mắt */}
                                                            {expandedAnswers[assessment.assessment_id] && (
                                                                <div className="answer-details-container">
                                                                    {renderAnswerDetails(assessment)}
                                                                </div>
                                                            )}

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
                                                    </div>
                                                ))}
                                            </Slider>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage; 