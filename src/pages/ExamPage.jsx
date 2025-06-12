import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crafft_Data, resultInitalState as crafftInitial, assessRiskLevel as assessCrafftRisk } from '../QuizData/Crafft-Data';
import { Assist_Data, resultInitalState as assistInitial, assessRiskLevel as assessAssistRisk } from '../QuizData/Assist_Data';
import { motion } from 'framer-motion';
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const lowerType = type.toLowerCase();
        setIsLoading(true);

        setTimeout(() => {
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
            setIsLoading(false);
        }, 500);
    }, [type, navigate]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleNextQuestion = () => {
        if (selectedOption === null) {
            alert('Vui lòng chọn một câu trả lời trước khi tiếp tục.');
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
        if (window.confirm('Bạn có chắc chắn muốn thoát khỏi bài đánh giá không?')) {
            navigate('/choosetype');
        }
    };

    if (isLoading) {
        return (
            <div className="exam-page">
                <div className="container d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!quizData || !result) {
        return (
            <div className="exam-page">
                <div className="container">
                    <div className="card">
                        <div className="card-body">
                            <div className="alert alert-danger">
                                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    return (
        <motion.div
            className="exam-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container">
                <motion.div
                    className="card"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="card-header">
                        <h3>{type.toUpperCase()} Assessment</h3>
                        <p>Câu hỏi {currentQuestionIndex + 1} / {quizData.questions.length}</p>
                    </div>
                    <div className="card-body">
                        <div className="progress">
                            <motion.div
                                className="progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            >
                                {Math.round(progress)}%
                            </motion.div>
                        </div>

                        <motion.div
                            className="question-section"
                            key={currentQuestionIndex}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h4 className="question-text">
                                {currentQuestion.question}
                            </h4>
                            <div className="options">
                                {currentQuestion.options.map((option, index) => (
                                    <motion.div
                                        className="form-check"
                                        key={option.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        onClick={() => handleOptionSelect(option)}
                                    >
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="option"
                                            id={`option-${option.id}`}
                                            checked={selectedOption?.id === option.id}
                                            onChange={() => { }}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`option-${option.id}`}
                                        >
                                            {option.text}
                                        </label>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="btn-group">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                            >
                                Câu trước
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleNextQuestion}
                            >
                                {currentQuestionIndex === quizData.questions.length - 1
                                    ? 'Hoàn thành'
                                    : 'Câu tiếp theo'}
                            </button>
                        </div>
                    </div>
                    <div className="quit-button">
                        <button
                            className="btn btn-danger"
                            onClick={handleQuit}
                        >
                            <i className="fas fa-times"></i>
                            Thoát khỏi bài đánh giá
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ExamPage;
