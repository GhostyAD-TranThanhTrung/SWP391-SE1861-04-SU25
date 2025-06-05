import React from 'react';
import '../styles/TestPage.scss'; // Assuming you have a TestPage.scss file for styles

const TestPage = () => {
    return (
        <div className="test-page">
            <div className="test-content">
                <h2>Substance Addiction Risk Assessment Survey</h2>
                <p>
                    Based on international surveys <br />
                    such as ASSIST, CRAFFT,...
                </p>
                <button className="start-button">Start Exam</button>

                <div className="exam-result">
                    <h4>Exam Result</h4>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
