import React, { useState, useEffect } from 'react';
import '../styles/SurveyModal.scss';

const SurveyModal = ({ 
    isOpen, 
    onClose, 
    programId, 
    surveyType, // 'pre-assessment' or 'post-assessment'
    onComplete 
}) => {
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [alreadyResponded, setAlreadyResponded] = useState(false);
    const [checkingResponse, setCheckingResponse] = useState(true);
    const [surveyNotFound, setSurveyNotFound] = useState(false);

    useEffect(() => {
        if (isOpen && programId && surveyType) {
            // Reset states when modal opens
            setSurveyNotFound(false);
            setAlreadyResponded(false);
            setError(null);
            setCurrentQuestionIndex(0);
            setQuestions([]);
            setSurvey(null);
            setAnswers({});
            console.log('[SurveyModal] Modal opened. programId:', programId, 'surveyType:', surveyType);
            checkExistingResponse();
        }
    }, [isOpen, programId, surveyType]);

    const checkExistingResponse = async () => {
        setCheckingResponse(true);
        setError(null);
        setSurveyNotFound(false);
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            // First fetch the survey to get survey_id
            console.log('[SurveyModal] Fetching survey for check:', programId, surveyType);
            const surveyResponse = await fetch(
                `http://localhost:3000/api/surveys/program/${programId}/type/${surveyType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('[SurveyModal] Survey fetch response status:', surveyResponse.status);
            if (!surveyResponse.ok) {
                if (surveyResponse.status === 404) {
                    setSurveyNotFound(true);
                    setCheckingResponse(false);
                    console.log('[SurveyModal] Survey not found (404)');
                    return;
                }
                throw new Error(`Failed to fetch survey: ${surveyResponse.status}`);
            }

            const surveyData = await surveyResponse.json();
            console.log('[SurveyModal] Survey fetch data:', surveyData);
            
            if (surveyData.success && surveyData.data && surveyData.data.length > 0) {
                const survey = surveyData.data[0];
                console.log('[SurveyModal] Survey found:', survey);
                
                // Now check if user has already responded to this survey
                const checkResponse = await fetch(
                    `http://localhost:3000/api/survey-responses/check/${survey.survey_id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('[SurveyModal] Check response status:', checkResponse.status);
                if (checkResponse.ok) {
                    const checkData = await checkResponse.json();
                    console.log('[SurveyModal] Check response data:', checkData);
                    if (checkData.success && checkData.hasResponded) {
                        setAlreadyResponded(true);
                        setCheckingResponse(false);
                        console.log('[SurveyModal] User has already responded to this survey.');
                        return;
                    }
                }

                // If user hasn't responded, proceed to fetch survey details
                await fetchSurvey();
                setCheckingResponse(false);
            } else {
                // No survey found in response data
                setSurveyNotFound(true);
                setCheckingResponse(false);
                console.log('[SurveyModal] No survey found in response data.');
            }
        } catch (err) {
            console.error('[SurveyModal] Error checking existing response:', err);
            setError(err.message);
            setCheckingResponse(false);
        }
    };

    const fetchSurvey = async () => {
        setLoading(true);
        setError(null);
        setSurveyNotFound(false);
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            console.log('[SurveyModal] Fetching survey details:', programId, surveyType);
            const response = await fetch(
                `http://localhost:3000/api/surveys/program/${programId}/type/${surveyType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('[SurveyModal] Survey details fetch status:', response.status);
            if (!response.ok) {
                if (response.status === 404) {
                    setSurveyNotFound(true);
                    setLoading(false);
                    console.log('[SurveyModal] Survey details not found (404)');
                    return;
                }
                throw new Error(`Failed to fetch survey: ${response.status}`);
            }

            const data = await response.json();
            console.log('[SurveyModal] Survey details fetch data:', data);
            
            if (data.success && data.data && data.data.length > 0) {
                const surveyData = data.data[0]; // Get the first survey
                setSurvey(surveyData);
                console.log('[SurveyModal] Survey data set:', surveyData);
                
                // Parse questions from JSON
                let parsedQuestions = [];
                try {
                    const questionsData = JSON.parse(surveyData.questions_json);
                    parsedQuestions = questionsData.questions || [];
                    console.log('[SurveyModal] Parsed questions:', parsedQuestions);
                } catch (e) {
                    console.error('[SurveyModal] Error parsing survey questions:', e);
                    throw new Error('Survey data is corrupted. Please contact support.');
                }
                
                if (parsedQuestions.length === 0) {
                    throw new Error('This survey has no questions configured.');
                }
                
                setQuestions(parsedQuestions);
                // Initialize answers object
                const initialAnswers = {};
                parsedQuestions.forEach(q => {
                    initialAnswers[q.id] = '';
                });
                setAnswers(initialAnswers);
                console.log('[SurveyModal] Answers initialized:', initialAnswers);
            } else {
                // No survey found for this program and type
                setSurveyNotFound(true);
                console.log('[SurveyModal] No survey found for this program and type.');
            }
        } catch (err) {
            console.error('[SurveyModal] Error fetching survey:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
        console.log('[SurveyModal] Answer changed:', questionId, answer);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            console.log('[SurveyModal] Next question:', currentQuestionIndex + 2);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            console.log('[SurveyModal] Previous question:', currentQuestionIndex);
        }
    };

    const handleSubmit = async () => {
        if (!survey) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Cần đăng nhập để thực hiện khảo sát');
            }

            // Format responses according to the key-value API format
            const responses = questions.map(question => ({
                id: question.id,
                question: question.question,
                answer: answers[question.id] || ''
            }));

            const submissionData = {
                survey_id: survey.survey_id,
                program_id: programId,
                responses: responses,
                submitted_at: new Date().toISOString(),
                total_questions: questions.length
            };

            console.log('[SurveyModal] Submitting survey:', submissionData);
            const response = await fetch('http://localhost:3000/api/survey-responses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            console.log('[SurveyModal] Survey submit response status:', response.status);
            if (!response.ok) {
                throw new Error('Gửi khảo sát thất bại');
            }

            const result = await response.json();
            console.log('[SurveyModal] Survey submit result:', result);
            if (result.success) {
                alert('Gửi khảo sát thành công! Cảm ơn bạn đã phản hồi.');
                if (onComplete) onComplete();
                onClose();
            } else {
                throw new Error(result.message || 'Gửi khảo sát thất bại');
            }
        } catch (err) {
            console.error('[SurveyModal] Error submitting survey:', err);
            alert('Lỗi gửi khảo sát: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        const confirmed = window.confirm('Bạn có chắc chắn muốn bỏ qua khảo sát này? Bạn có thể thực hiện sau tại trang khóa học.');
        if (confirmed) {
            if (onComplete) onComplete();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="survey-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="survey-modal">
                <div className="modal-header">
                    <h2>
                        {surveyType === 'pre-assessment' ? 'Khảo sát trước khóa học' : 'Khảo sát sau khóa học'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {checkingResponse ? (
                        <div className="survey-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang kiểm tra trạng thái khảo sát...</p>
                        </div>
                    ) : alreadyResponded ? (
                        <div className="already-responded">
                            <div className="success-icon">✅</div>
                            <h3>Đã hoàn thành khảo sát</h3>
                            <p>
                                Bạn đã hoàn thành {surveyType === 'pre-assessment' ? 'khảo sát trước khóa học' : 'khảo sát sau khóa học'} cho chương trình này.
                            </p>
                            <p>Cảm ơn bạn đã phản hồi!</p>
                            <button className="close-btn" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    ) : surveyNotFound ? (
                        <div className="survey-not-found">
                            <div className="not-found-icon">📋❌</div>
                            <h3>Không có khảo sát</h3>
                            <p>
                                {surveyType === 'pre-assessment' ? 'Khảo sát trước khóa học' : 'Khảo sát sau khóa học'} hiện chưa có cho chương trình này.
                            </p>
                            <div className="not-found-reasons">
                                <p><strong>Có thể do:</strong></p>
                                <ul>
                                    <li>Khảo sát chưa được tạo</li>
                                    <li>Đang bảo trì tạm thời</li>
                                    <li>Chương trình này không yêu cầu khảo sát</li>
                                </ul>
                            </div>
                            <p>
                                Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ hỗ trợ hoặc thử lại sau.
                            </p>
                            <button className="close-btn" onClick={onClose}>
                                Tiếp tục
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="survey-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang tải khảo sát...</p>
                        </div>
                    ) : error ? (
                        <div className="survey-error">
                            <div className="error-icon">⚠️</div>
                            <h3>Lỗi tải khảo sát</h3>
                            <p>{error}</p>
                            <div className="error-actions">
                                <button className="retry-btn" onClick={checkExistingResponse}>
                                    Thử lại
                                </button>
                                <button className="close-btn" onClick={onClose}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    ) : !survey || questions.length === 0 ? (
                        <div className="no-survey">
                            <div className="no-survey-icon">📋</div>
                            <h3>Không thể tải khảo sát</h3>
                            <p>Nội dung khảo sát không thể tải đúng cách.</p>
                            <div className="error-actions">
                                <button className="retry-btn" onClick={fetchSurvey}>
                                    Thử lại
                                </button>
                                <button className="close-btn" onClick={onClose}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="survey-content">
                            <div className="survey-intro">
                                <p>
                                    {surveyType === 'pre-assessment' 
                                        ? 'Vui lòng hoàn thành khảo sát ngắn này trước khi bắt đầu khóa học. Điều này giúp chúng tôi hiểu rõ kiến thức hiện tại của bạn và cá nhân hóa trải nghiệm.'
                                        : 'Vui lòng hoàn thành khảo sát này để giúp chúng tôi hiểu khóa học đã hỗ trợ bạn như thế nào và cải thiện các chương trình sau.'
                                    }
                                </p>
                            </div>

                            <div className="progress-bar">
                                <div className="progress-info">
                                    <span>Câu hỏi {currentQuestionIndex + 1} / {questions.length}</span>
                                    <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% hoàn thành</span>
                                </div>
                                <div className="progress-track">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {questions.length > 0 && (
                                <div className="question-container">
                                    <div className="question">
                                        <h3>{questions[currentQuestionIndex].question}</h3>
                                        <div className="answer-options">
                                            {questions[currentQuestionIndex].options.map((option, index) => (
                                                <label key={index} className="option-label">
                                                    <input
                                                        type="radio"
                                                        name={`question-${questions[currentQuestionIndex].id}`}
                                                        value={option}
                                                        checked={answers[questions[currentQuestionIndex].id] === option}
                                                        onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                                                    />
                                                    <span className="option-text">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="navigation-buttons">
                                        <button 
                                            className="nav-btn prev-btn" 
                                            onClick={handlePrevious}
                                            disabled={currentQuestionIndex === 0}
                                        >
                                            Trước
                                        </button>

                                        {currentQuestionIndex < questions.length - 1 ? (
                                            <button 
                                                className="nav-btn next-btn" 
                                                onClick={handleNext}
                                                disabled={!answers[questions[currentQuestionIndex].id]}
                                            >
                                                Tiếp
                                            </button>
                                        ) : (
                                            <button 
                                                className="submit-btn" 
                                                onClick={handleSubmit}
                                                disabled={submitting || !answers[questions[currentQuestionIndex].id]}
                                            >
                                                {submitting ? 'Đang gửi...' : 'Gửi khảo sát'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="survey-actions">
                                <button className="skip-btn" onClick={handleSkip}>
                                    Bỏ qua khảo sát
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurveyModal;
