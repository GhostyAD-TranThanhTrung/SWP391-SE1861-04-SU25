import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TestPage.scss';
import { FaClipboardCheck, FaChartLine } from 'react-icons/fa';

const TestPage = () => {
    const navigate = useNavigate();

    const handleStartExam = () => {
        navigate('/choosetype');
    };

    return (
        <div className="test-page">
            <div className="test-content">
                <div className="test-card">
                    <div className="test-header">
                        <h2>Substance Addiction Risk Assessment Survey</h2>
                        <p className="subtitle">
                            Based on international surveys such as ASSIST, CRAFFT, and other validated assessment tools.
                            This comprehensive evaluation helps identify potential substance use risks and provides personalized feedback.
                        </p>
                    </div>

                    <button className="start-button" onClick={handleStartExam}>
                        Start Assessment
                        <i className="fas fa-arrow-right"></i>
                    </button>

                    <div className="exam-result">
                        <div className="result-header">
                            <FaChartLine className="result-icon" />
                            <h4>Previous Results</h4>
                        </div>
                        <p className="no-results">No previous assessments found. Take your first assessment now!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
