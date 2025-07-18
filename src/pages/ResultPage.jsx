import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/ResultPage.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, type, userAnswers } = location.state || {};
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [hasSaved, setHasSaved] = useState(false); // Track if assessment has been saved
    const [showResults, setShowResults] = useState(true); // Always show results, but save separately

    const generateAssessmentId = () => {
        // Simple incremental assessment_id generation (in real app, use UUID or DB auto-increment)
        return Math.floor(Math.random() * 1000) + 1;
    };

    const saveAssessmentResult = async () => {
        // Prevent duplicate saves
        if (hasSaved) {
            console.log('Assessment already saved, skipping...');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSaved(true); // Mark as being saved
        
        console.log('🔄 MANUAL SAVE: Saving assessment result for type:', type);
        console.log('📊 Assessment data to save:', { result, type, userAnswers });
        
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

            // Chuyển đổi userAnswers thành định dạng API mong muốn
            const answersData = userAnswers ? Object.entries(userAnswers).map(([questionIndex, answerData]) => {
                const questionId = parseInt(questionIndex) + 1;
                
                // Handle ASSIST dynamic question text
                let questionText = answerData.question;
                if (type.toLowerCase() === 'assist' && questionIndex > 0) {
                    // For ASSIST questions after the first, ensure substance replacement is preserved
                    const firstQuestionAnswer = userAnswers[0];
                    if (firstQuestionAnswer && firstQuestionAnswer.selectedOptions) {
                        const selectedSubstances = firstQuestionAnswer.selectedOptions
                            .filter(opt => opt.id !== 11)
                            .map(opt => opt.text);
                        
                        if (selectedSubstances.length > 0) {
                            const substanceText = selectedSubstances.join(' hoặc ');
                            questionText = questionText.replace(/\[chất\]/g, substanceText);
                        } else {
                            questionText = questionText.replace(/\[chất\]/g, 'chất gây nghiện');
                        }
                    }
                }
                
                // Xử lý cả trường hợp answer là mảng (cho câu hỏi nhiều lựa chọn)
                const selectedOption = answerData.selectedOptions
                    ? answerData.selectedOptions.map(a => a.text).join(', ')
                    : answerData.selectedOption?.text || '';

                return {
                    questionId: questionId.toString(),
                    question: questionText || `Câu hỏi ${questionId}`, // Include question text with fallback
                    selectedOption: selectedOption,
                    score: answerData.selectedOptions
                        ? answerData.selectedOptions.reduce((sum, a) => sum + a.score, 0)
                        : answerData.selectedOption?.score || 0
                }
            }) : [{
                questionId: "1",
                question: "Câu hỏi 1", // Fallback question text
                selectedOption: "Không có câu trả lời",
                score: result.score
            }];

            const requestData = {
                type,
                score: result.score,
                results: answersData
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
                console.log('✅ Assessment saved successfully:', response.data);
                setAssessmentResult(response.data.data);
                // Keep hasSaved as true since save was successful
            } else {
                console.error('❌ Failed to save assessment:', response.data.message);
                setError(response.data.message || 'Failed to save assessment');
                setHasSaved(false); // Reset flag on failure so user can retry
            }
        } catch (error) {
            console.error('💥 Error saving assessment:', error);
            setHasSaved(false); // Reset flag on error so user can retry
            
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

    // Manual submit function to save assessment
    const handleSubmitAssessment = async () => {
        if (!hasSaved) {
            console.log('🎯 User clicked submit - saving assessment result...');
            await saveAssessmentResult();
        }
    };

    // Remove automatic saving - only validate that we have the required data
    useEffect(() => {
        if (!result || !type) {
            console.log('❌ Missing result or type data, redirecting...');
            navigate('/choosetype');
        } else {
            console.log('✅ ResultPage loaded with data:', { type, score: result.score, riskLevel: result.riskLevel });
            console.log('⏳ Assessment will NOT be saved automatically - waiting for user to click Submit');
        }
    }, [result, type, navigate]);

    // Remove the loading screen - we'll show loading state in the button instead

    if (error) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-danger">
                        <strong>Lỗi lưu kết quả:</strong> {error}
                        <div className="mt-3">
                            <button
                                className="btn btn-primary me-2"
                                onClick={() => {
                                    setError(null);
                                    setHasSaved(false);
                                    saveAssessmentResult();
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Đang thử lại...' : 'Thử lại'}
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/choosetype')}
                            >
                                Quay lại trang chủ
                            </button>
                        </div>
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
                        {!hasSaved && (
                            <div className="alert alert-warning mt-2 mb-0">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                <small>Kết quả chưa được lưu vào hệ thống. Nhấn "Lưu Kết Quả" để lưu.</small>
                            </div>
                        )}
                        {assessmentResult && hasSaved && (
                            <div className="alert alert-success mt-2 mb-0">
                                <i className="fas fa-check-circle me-2"></i>
                                <small>Kết quả đã được lưu thành công vào hệ thống!</small>
                            </div>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="result-summary">
                            <h3>Mức độ nguy cơ của bạn:</h3>
                            <div className={`risk-level ${getRiskLevelClass(result.riskLevel)}`}>
                                {result.riskLevel}
                            </div>
                            {!hasSaved && (
                                <div className="mt-3">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Đây là kết quả tạm thời. Nhấn "Lưu Kết Quả" để lưu vào hệ thống của bạn.
                                    </small>
                                </div>
                            )}
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

                        {userAnswers && (
                            <div className="user-answers">
                                <button
                                    className="btn btn-outline-primary mb-3"
                                    onClick={() => setShowAnswers(!showAnswers)}
                                >
                                    {showAnswers ? 'Ẩn câu trả lời' : 'Xem câu trả lời của bạn'}
                                </button>

                                {showAnswers && (
                                    <div className="answers-container">
                                        <h4>Câu trả lời của bạn:</h4>
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
                                                    {Object.entries(userAnswers).map(([questionIndex, answerData]) => {
                                                        const questionNumber = parseInt(questionIndex) + 1;
                                                        return (
                                                            <tr key={questionIndex}>
                                                                <td>
                                                                    <div className="question-text">
                                                                        <strong>Câu {questionNumber}:</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {answerData.question}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {answerData.selectedOptions
                                                                        ? answerData.selectedOptions.map(a => a.text).join(', ')
                                                                        : answerData.selectedOption?.text || 'Không có câu trả lời'}
                                                                </td>
                                                                <td>
                                                                    {answerData.selectedOptions
                                                                        ? answerData.selectedOptions.reduce((sum, a) => sum + a.score, 0)
                                                                        : answerData.selectedOption?.score || 0}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="action-buttons">
                            {!hasSaved && (
                                <button
                                    className="btn btn-success btn-lg"
                                    onClick={handleSubmitAssessment}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Lưu Kết Quả
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/exam/${type}`)}
                            >
                                <i className="fas fa-redo me-2"></i>
                                Làm Lại Bài Đánh Giá
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/test')}
                            >
                                <i className="fas fa-home me-2"></i>
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