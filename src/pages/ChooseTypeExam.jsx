import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChooseTypeExam.scss';

const ChooseTypeExam = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);

    const handleConfirm = () => {
        if (selectedType) {
            console.log('Confirmed exam type:', selectedType);
            navigate(`/exam/${selectedType.toLowerCase()}`);
        } else {
            alert('Please select a type of exam first.');
        }
    };

    const handleCancel = () => {
        navigate('/test');
    };

    const examTypes = [
        {
            id: 'ASSIST',
            title: 'ASSIST Assessment',
            subtitle: 'WHO Screening Tool',
            description: 'A comprehensive WHO-developed screening tool for identifying substance use patterns and related health risks.',
            features: ['Quick 15-questions assessment', 'Evidence-based results', 'Risk level identification'],
            icon: 'bi-clipboard-check'
        },
        {
            id: 'CRAFFT',
            title: 'CRAFFT Assessment',
            subtitle: 'Youth Behavioral Health',
            description: 'A specialized behavioral health screening tool designed specifically for adolescents and young adults.',
            features: ['Age-appropriate questions', 'Behavioral focus', 'Confidential screening'],
            icon: 'bi-person-hearts'
        }
    ];

    return (
        <div className="choose-exam-page">
            {/* Hero Section */}
            <section className="exam-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12 text-center">
                            <h1 className="hero-title">
                                Choose Your Assessment Type
                            </h1>
                            <p className="hero-subtitle">
                                Select the most appropriate screening tool for your needs. Both assessments
                                are professionally validated and provide valuable insights into substance use patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                {/* Assessment Options Section */}
                <section className="assessment-section">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Available Assessments</h2>
                        <p className="section-subtitle">Choose the assessment that best fits your situation</p>
                    </div>

                    <div className="row justify-content-center">
                        {examTypes.map((exam, index) => (
                            <div className="col-lg-5 col-md-6 mb-4" key={exam.id}>
                                <div
                                    className={`assessment-card ${selectedType === exam.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedType(exam.id)}
                                >
                                    <div className="card-header">
                                        <div className="exam-icon">
                                            <i className={exam.icon}></i>
                                        </div>
                                        <div className="exam-info">
                                            <h4 className="exam-title">{exam.title}</h4>
                                            <p className="exam-subtitle">{exam.subtitle}</p>
                                        </div>
                                        <div className="selection-indicator">
                                            {selectedType === exam.id && (
                                                <i className="bi bi-check-circle-fill"></i>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <p className="exam-description">{exam.description}</p>
                                        <ul className="exam-features">
                                            {exam.features.map((feature, idx) => (
                                                <li key={idx}>
                                                    <i className="bi bi-check2 me-2"></i>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Action Buttons Section */}
                <section className="actions-section">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="action-buttons">
                                <button
                                    className="btn btn-primary btn-lg me-3"
                                    onClick={handleConfirm}
                                    disabled={!selectedType}
                                >
                                    <i className="bi bi-arrow-right me-2"></i>
                                    Start Assessment
                                </button>
                                <button className="btn btn-outline-secondary btn-lg" onClick={handleCancel}>
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Go Back
                                </button>
                            </div>
                            {!selectedType && (
                                <p className="selection-hint mt-3">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Please select an assessment type to continue
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Information Section */}
                <section className="info-section">
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="info-card">
                                <h3 className="info-title">
                                    <i className="bi bi-shield-check me-2"></i>
                                    Privacy & Confidentiality
                                </h3>
                                <p className="info-description">
                                    Your assessment results are completely confidential and are used solely
                                    for providing you with personalized recommendations. We do not store or
                                    share your personal information without your explicit consent.
                                </p>
                                <div className="info-features">
                                    <div className="feature-item">
                                        <i className="bi bi-lock-fill"></i>
                                        <span>Secure & Private</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="bi bi-clock-fill"></i>
                                        <span>5-10 Minutes</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="bi bi-award-fill"></i>
                                        <span>Professional Validated</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ChooseTypeExam;
