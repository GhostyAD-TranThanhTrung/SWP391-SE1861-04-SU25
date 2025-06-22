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
            alert('Vui lòng chọn loại bài kiểm tra trước.');
        }
    };

    const handleCancel = () => {
        navigate('/test');
    };

    const examTypes = [
        {
            id: 'ASSIST',
            title: 'Bài Đánh Giá ASSIST',
            subtitle: 'Công Cụ Sàng Lọc WHO',
            description: 'Một công cụ sàng lọc toàn diện được phát triển bởi WHO để xác định các mô hình sử dụng chất và rủi ro sức khỏe liên quan.',
            features: ['Đánh giá nhanh 15 câu hỏi', 'Kết quả dựa trên bằng chứng', 'Xác định mức độ rủi ro'],
            icon: 'bi-clipboard-check',
            resourceLink: 'https://www.sbirtoregon.org/wp-content/uploads/Modified-ASSIST-English-pdf.pdf',
            resourceTitle: 'Hướng dẫn ASSIST chính thức'
        },
        {
            id: 'CRAFFT',
            title: 'Bài Đánh Giá CRAFFT 2.1',
            subtitle: 'Sức Khỏe Hành Vi Thanh Thiếu Niên',
            description: 'Một công cụ sàng lọc sức khỏe hành vi chuyên biệt được thiết kế đặc biệt cho thanh thiếu niên và người trẻ tuổi.',
            features: ['Câu hỏi phù hợp với độ tuổi', 'Tập trung vào hành vi', 'Sàng lọc bảo mật'],
            icon: 'bi-person-hearts',
            resourceLink: 'https://crafft.org/wp-content/uploads/2021/10/CRAFFT_2.1_Provider-Manual_2021.10.28.pdf',
            resourceTitle: 'Hướng dẫn CRAFFT 2.1 chính thức'
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
                                Chọn Loại Bài Đánh Giá
                            </h1>
                            <p className="hero-subtitle">
                                Chọn công cụ sàng lọc phù hợp nhất cho nhu cầu của bạn. Cả hai bài đánh giá
                                đều được xác thực chuyên nghiệp và cung cấp thông tin có giá trị về các mô hình sử dụng chất.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                {/* Assessment Options Section */}
                <section className="assessment-section">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Các Bài Đánh Giá Có Sẵn</h2>
                        <p className="section-subtitle">Chọn bài đánh giá phù hợp nhất với tình huống của bạn</p>
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
                                        {exam.resourceLink && (
                                            <div className="resource-section mt-3">
                                                <div className="resource-divider"></div>
                                                <a
                                                    href={exam.resourceLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="resource-link"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="bi bi-file-pdf me-2"></i>
                                                    {exam.resourceTitle}
                                                    <i className="bi bi-box-arrow-up-right ms-2"></i>
                                                </a>
                                            </div>
                                        )}
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
                                    Bắt Đầu Đánh Giá
                                </button>
                                <button className="btn btn-outline-secondary btn-lg" onClick={handleCancel}>
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Quay Lại
                                </button>
                            </div>
                            {!selectedType && (
                                <p className="selection-hint mt-3">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Vui lòng chọn loại bài đánh giá để tiếp tục
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
                                    Quyền Riêng Tư & Bảo Mật
                                </h3>
                                <p className="info-description">
                                    Kết quả đánh giá của bạn hoàn toàn bảo mật và chỉ được sử dụng để
                                    cung cấp cho bạn các khuyến nghị cá nhân hóa. Chúng tôi không lưu trữ hoặc
                                    chia sẻ thông tin cá nhân của bạn mà không có sự đồng ý rõ ràng.
                                </p>
                                <div className="info-features">
                                    <div className="feature-item">
                                        <i className="bi bi-lock-fill"></i>
                                        <span>An Toàn & Riêng Tư</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="bi bi-clock-fill"></i>
                                        <span>5-10 Phút</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="bi bi-award-fill"></i>
                                        <span>Được Xác Thực Chuyên Nghiệp</span>
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
