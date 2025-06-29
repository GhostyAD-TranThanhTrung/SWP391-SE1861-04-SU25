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
            const surveyResponse = await fetch(
                `http://localhost:3000/api/surveys/program/${programId}/type/${surveyType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!surveyResponse.ok) {
                if (surveyResponse.status === 404) {
                    setSurveyNotFound(true);
                    setCheckingResponse(false);
                    return;
                }
                throw new Error(`Failed to fetch survey: ${surveyResponse.status}`);
            }

            const surveyData = await surveyResponse.json();
            
            if (surveyData.success && surveyData.data && surveyData.data.length > 0) {
                const survey = surveyData.data[0];
                
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

                if (checkResponse.ok) {
                    const checkData = await checkResponse.json();
                    if (checkData.success && checkData.hasResponded) {
                        setAlreadyResponded(true);
                        setCheckingResponse(false);
                        return;
                    }
                }

                // If user hasn't responded, proceed to fetch survey details
                fetchSurvey();
            } else {
                // No survey found in response data
                setSurveyNotFound(true);
                setCheckingResponse(false);
            }
        } catch (err) {
            console.error('Error checking existing response:', err);
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

            const response = await fetch(
                `http://localhost:3000/api/surveys/program/${programId}/type/${surveyType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setSurveyNotFound(true);
                    setLoading(false);
                    return;
                }
                throw new Error(`Failed to fetch survey: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
                const surveyData = data.data[0]; // Get the first survey
                setSurvey(surveyData);
                
                // Parse questions from JSON
                let parsedQuestions = [];
                try {
                    const questionsData = JSON.parse(surveyData.questions_json);
                    parsedQuestions = questionsData.questions || [];
                } catch (e) {
                    console.error('Error parsing survey questions:', e);
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
            } else {
                // No survey found for this program and type
                setSurveyNotFound(true);
            }
        } catch (err) {
            console.error('Error fetching survey:', err);
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
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!survey) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
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

            const response = await fetch('http://localhost:3000/api/survey-responses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit survey');
            }

            const result = await response.json();
            if (result.success) {
                alert('Survey submitted successfully! Thank you for your feedback.');
                if (onComplete) onComplete();
                onClose();
            } else {
                throw new Error(result.message || 'Failed to submit survey');
            }
        } catch (err) {
            console.error('Error submitting survey:', err);
            alert('Error submitting survey: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        const confirmed = window.confirm('Are you sure you want to skip this survey? You can take it later from your course page.');
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
                        {surveyType === 'pre-assessment' ? 'Pre-Course Assessment' : 'Post-Course Assessment'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {checkingResponse ? (
                        <div className="survey-loading">
                            <div className="loading-spinner"></div>
                            <p>Checking survey status...</p>
                        </div>
                    ) : alreadyResponded ? (
                        <div className="already-responded">
                            <div className="success-icon">✅</div>
                            <h3>Survey Already Completed</h3>
                            <p>
                                You have already completed the {surveyType === 'pre-assessment' ? 'pre-course' : 'post-course'} assessment for this program.
                            </p>
                            <p>Thank you for your feedback!</p>
                            <button className="close-btn" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    ) : surveyNotFound ? (
                        <div className="survey-not-found">
                            <div className="not-found-icon">📋❌</div>
                            <h3>Survey Not Available</h3>
                            <p>
                                The {surveyType === 'pre-assessment' ? 'pre-course' : 'post-course'} assessment 
                                is not currently available for this program.
                            </p>
                            <div className="not-found-reasons">
                                <p><strong>This could be because:</strong></p>
                                <ul>
                                    <li>The assessment hasn't been created yet</li>
                                    <li>It's temporarily unavailable for maintenance</li>
                                    <li>This program doesn't require an assessment</li>
                                </ul>
                            </div>
                            <p>
                                If you believe this is an error, please contact support or check back later.
                            </p>
                            <button className="close-btn" onClick={onClose}>
                                Continue
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="survey-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading survey...</p>
                        </div>
                    ) : error ? (
                        <div className="survey-error">
                            <div className="error-icon">⚠️</div>
                            <h3>Error Loading Survey</h3>
                            <p>{error}</p>
                            <div className="error-actions">
                                <button className="retry-btn" onClick={checkExistingResponse}>
                                    Try Again
                                </button>
                                <button className="close-btn" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : !survey || questions.length === 0 ? (
                        <div className="no-survey">
                            <div className="no-survey-icon">📋</div>
                            <h3>Survey Unavailable</h3>
                            <p>The survey content could not be loaded properly.</p>
                            <div className="error-actions">
                                <button className="retry-btn" onClick={fetchSurvey}>
                                    Retry
                                </button>
                                <button className="close-btn" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="survey-content">
                            <div className="survey-intro">
                                <p>
                                    {surveyType === 'pre-assessment' 
                                        ? 'Please complete this brief assessment before starting the course. This helps us understand your current knowledge and tailor the experience.'
                                        : 'Please complete this assessment to help us understand how the course has helped you and improve future offerings.'
                                    }
                                </p>
                            </div>

                            <div className="progress-bar">
                                <div className="progress-info">
                                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                    <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
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
                                            Previous
                                        </button>

                                        {currentQuestionIndex < questions.length - 1 ? (
                                            <button 
                                                className="nav-btn next-btn" 
                                                onClick={handleNext}
                                                disabled={!answers[questions[currentQuestionIndex].id]}
                                            >
                                                Next
                                            </button>
                                        ) : (
                                            <button 
                                                className="submit-btn" 
                                                onClick={handleSubmit}
                                                disabled={submitting || !answers[questions[currentQuestionIndex].id]}
                                            >
                                                {submitting ? 'Submitting...' : 'Submit Survey'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="survey-actions">
                                <button className="skip-btn" onClick={handleSkip}>
                                    Skip Survey
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
