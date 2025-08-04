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
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [quizData, setQuizData] = useState(null);
    const [assessRiskLevel, setAssessRiskLevel] = useState(() => () => 'Chưa xác định');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedAnswers, setSavedAnswers] = useState({});

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
        }, 1000);
    }, [type, navigate]);

    const handleOptionSelect = (option) => {
        if (currentQuestionIndex === 0 && type.toLowerCase() === 'assist') {
            setSelectedOptions(prev => {
                const newOptions = prev.find(opt => opt.id === option.id)
                    ? prev.filter(opt => opt.id !== option.id)
                    : [...prev, option];

                // Lưu đáp án đã chọn với câu hỏi
                setSavedAnswers(prev => ({
                    ...prev,
                    [currentQuestionIndex]: {
                        question: quizData.questions[currentQuestionIndex].question,
                        selectedOptions: newOptions
                    }
                }));

                return newOptions;
            });
        } else {
            setSelectedOption(option);
            // Lưu đáp án đã chọn với câu hỏi
            setSavedAnswers(prev => ({
                ...prev,
                [currentQuestionIndex]: {
                    question: getCurrentQuestionText(),
                    selectedOption: option
                }
            }));
        }
    };

    // Function to get current question text with substance replacement for ASSIST
    const getCurrentQuestionText = () => {
        const currentQuestion = quizData.questions[currentQuestionIndex];
        let questionText = currentQuestion.question;
        
        // For ASSIST, replace [chất] with selected substances
        if (type.toLowerCase() === 'assist' && currentQuestionIndex > 0) {
            const firstQuestionAnswer = savedAnswers[0];
            if (firstQuestionAnswer && firstQuestionAnswer.selectedOptions) {
                const selectedSubstances = firstQuestionAnswer.selectedOptions
                    .filter(opt => opt.id !== 11) // Exclude "Tôi chưa từng sử dụng bất kỳ chất nào"
                    .map(opt => opt.text);
                
                if (selectedSubstances.length > 0) {
                    const substanceText = selectedSubstances.join(' hoặc ');
                    questionText = questionText.replace(/\[chất\]/g, substanceText);
                } else {
                    // If no substances selected, use a generic term
                    questionText = questionText.replace(/\[chất\]/g, 'chất gây nghiện');
                }
            } else {
                // Fallback if no first question answer
                questionText = questionText.replace(/\[chất\]/g, 'chất gây nghiện');
            }
        }
        
        return questionText;
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex === 0 && type.toLowerCase() === 'assist') {
            if (selectedOptions.length === 0) {
                alert('Vui lòng chọn ít nhất một đáp án trước khi tiếp tục.');
                return;
            }
        } else if (selectedOption === null) {
            alert('Vui lòng chọn một câu trả lời trước khi tiếp tục.');
            return;
        }

        // For ASSIST, check if user selected "never used" option
        if (type.toLowerCase() === 'assist' && currentQuestionIndex === 0) {
            const hasNeverUsed = selectedOptions.some(opt => opt.id === 11);
            const hasSubstances = selectedOptions.some(opt => opt.id !== 11);
            
            // If they selected "never used" and no substances, skip to end
            if (hasNeverUsed && !hasSubstances) {
                const userAnswers = {
                    0: {
                        question: quizData.questions[0].question,
                        selectedOptions: selectedOptions
                    }
                };
                
                navigate('/result', {
                    state: {
                        result: { ...result, score: 0, riskLevel: 'Thấp' },
                        type,
                        userAnswers: userAnswers
                    }
                });
                return;
            }
        }

        // Calculate score differently for CRAFFT vs ASSIST
        const scoreToAdd = type.toLowerCase() === 'crafft' 
            ? (currentQuestionIndex >= 3 ? (selectedOption?.score || 0) : 0) // Only Part B (questions 4-9) count for CRAFFT score
            : (currentQuestionIndex === 0 && type.toLowerCase() === 'assist' 
                ? selectedOptions.reduce((sum, opt) => sum + (opt.score || 0), 0) // Sum scores for multiple choice
                : (selectedOption?.score || 0)); // Single choice score

        const newScore = result.score + scoreToAdd;

        // Update savedAnswers with current answer for final calculation
        const updatedAnswers = {
            ...savedAnswers,
            [currentQuestionIndex]: currentQuestionIndex === 0 && type.toLowerCase() === 'assist' 
                ? {
                    question: quizData.questions[currentQuestionIndex].question,
                    selectedOptions: selectedOptions
                }
                : {
                    question: getCurrentQuestionText(),
                    selectedOption: selectedOption
                }
        };

        setSavedAnswers(updatedAnswers);

        setResult((prev) => ({
            ...prev,
            score: newScore,
        }));

        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            // Khôi phục đáp án đã lưu cho câu hỏi tiếp theo
            const nextQuestionAnswer = savedAnswers[currentQuestionIndex + 1];
            if (nextQuestionAnswer) {
                if (nextQuestionAnswer.selectedOptions) {
                    setSelectedOptions(nextQuestionAnswer.selectedOptions);
                    setSelectedOption(null);
                } else if (nextQuestionAnswer.selectedOption) {
                    setSelectedOption(nextQuestionAnswer.selectedOption);
                    setSelectedOptions([]);
                }
            } else {
                setSelectedOption(null);
                setSelectedOptions([]);
            }
        } else {
            // Enhanced risk assessment for CRAFFT, simple for ASSIST
            setIsSubmitting(true);
            let riskLevel;
            try {
                if (type.toLowerCase() === 'crafft') {
                    riskLevel = assessRiskLevel(newScore, updatedAnswers);
                } else {
                    // For ASSIST, await the async function
                    riskLevel = await assessRiskLevel(newScore);
                }
                
                // Ensure riskLevel is a string, not a Promise or other object
                if (typeof riskLevel !== 'string') {
                    riskLevel = 'Chưa xác định';
                }
            } catch (error) {
                console.error('Error calculating risk level:', error);
                riskLevel = 'Chưa xác định';
            } finally {
                setIsSubmitting(false);
            }
            
            navigate('/result', {
                state: {
                    result: { ...result, score: newScore, riskLevel },
                    type,
                    userAnswers: updatedAnswers
                }
            });
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            // Khôi phục đáp án đã lưu cho câu hỏi trước đó
            const prevQuestionAnswer = savedAnswers[currentQuestionIndex - 1];
            if (prevQuestionAnswer) {
                if (prevQuestionAnswer.selectedOptions) {
                    setSelectedOptions(prevQuestionAnswer.selectedOptions);
                    setSelectedOption(null);
                } else if (prevQuestionAnswer.selectedOption) {
                    setSelectedOption(prevQuestionAnswer.selectedOption);
                    setSelectedOptions([]);
                }
            } else {
                setSelectedOption(null);
                setSelectedOptions([]);
            }
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
                                {getCurrentQuestionText()}
                            </h4>
                            {currentQuestion.note && (
                                <p className="question-note text-muted">
                                    <i className="fas fa-info-circle me-2"></i>
                                    {currentQuestion.note}
                                </p>
                            )}
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
                                            type={currentQuestionIndex === 0 && type.toLowerCase() === 'assist' ? "checkbox" : "radio"}
                                            name="option"
                                            style={{marginLeft: "0.5rem"}}
                                            id={`option-${option.id}`}
                                            checked={currentQuestionIndex === 0 && type.toLowerCase() === 'assist'
                                                ? selectedOptions.some(opt => opt.id === option.id)
                                                : selectedOption?.id === option.id}
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
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    currentQuestionIndex === quizData.questions.length - 1
                                        ? 'Hoàn thành'
                                        : 'Câu tiếp theo'
                                )}
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
