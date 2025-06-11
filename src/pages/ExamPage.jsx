import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crafft_Data, resultInitalState as crafftInitial, assessRiskLevel as assessCrafftRisk } from '../QuizData/Crafft-Data';
import { Assist_Data, resultInitalState as assistInitial, assessRiskLevel as assessAssistRisk } from '../QuizData/Assist_Data';
import '../styles/ExamPage.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExamPage = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [assessRiskLevel, setAssessRiskLevel] = useState(() => () => 'Chưa xác định');

    useEffect(() => {
        const lowerType = type.toLowerCase();

        if (lowerType === 'crafft') {
            setQuizData(Crafft_Data);
            setResult(crafftInitial);
            setAssessRiskLevel(() => assessCrafftRisk);
        } else if (lowerType === 'assist') {
            setQuizData(Assist_Data);
            setResult(assistInitial);
            setAssessRiskLevel(() => assessAssistRisk);
        } else {
            navigate('/choosetype');
        }
    }, [type, navigate]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleNextQuestion = () => {
        if (selectedOption === null) {
            alert('Please select an option before proceeding.');
            return;
        }

        const newScore = result.score + (selectedOption.score || 0);

        setResult((prev) => ({
            ...prev,
            score: newScore,
            correctAnswers: prev.correctAnswers + (selectedOption.score === 0 ? 1 : 0),
            wrongAnswers: prev.wrongAnswers + (selectedOption.score > 0 ? 1 : 0),
        }));

        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
        } else {
            const riskLevel = assessRiskLevel(newScore);
            navigate('/result', {
                state: {
                    result: { ...result, score: newScore, riskLevel },
                    type
                }
            });
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedOption(null);
        }
    };

    const handleQuit = () => {
        if (window.confirm('Are you sure you want to quit the assessment?')) {
            navigate('/choosetype');
        }
    };

    if (!quizData || !result) {
        return <div className="container text-center mt-5">Loading...</div>;
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    return (
        <div className="exam-page">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h3 className="mb-0">{type.toUpperCase()} Assessment</h3>
                            </div>
                            <div className="card-body">
                                {/* Progress Bar */}
                                <div className="progress mb-4">
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${progress}%` }}
                                        aria-valuenow={progress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {Math.round(progress)}%
                                    </div>
                                </div>

                                {/* Question Section */}
                                <div className="question-section mb-4">
                                    <h4 className="question-text">
                                        {currentQuestionIndex + 1}. {currentQuestion.question}
                                    </h4>
                                    <div className="options">
                                        {currentQuestion.options.map((option) => (
                                            <div className="form-check mb-2" key={option.id}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="option"
                                                    id={`option-${option.id}`}
                                                    checked={selectedOption?.id === option.id}
                                                    onChange={() => handleOptionSelect(option)}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`option-${option.id}`}
                                                >
                                                    {option.text}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Previous
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNextQuestion}
                                    >
                                        {currentQuestionIndex === quizData.questions.length - 1
                                            ? 'Finish'
                                            : 'Next'}
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-footer text-end">
                                <button
                                    className="btn btn-danger"
                                    onClick={handleQuit}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Quit Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
