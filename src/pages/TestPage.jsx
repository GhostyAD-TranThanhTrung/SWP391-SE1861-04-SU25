import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TestPage.scss';
import { FaClipboardCheck, FaChartLine, FaArrowRight } from 'react-icons/fa';

const TestPage = () => {
    const navigate = useNavigate();

    const handleStartExam = () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để tiếp tục!');
            navigate('/login');
            return;
        }
        navigate('/choosetype');
    };

    return (
        <div className="test-page">
            <div className="test-content">
                <div className="test-card">
                    <div className="test-header">
                        <h2>Khảo sát Đánh giá Rủi ro Nghiện Chất</h2>
                        <p className="subtitle">
                            Dựa trên các khảo sát quốc tế như ASSIST, CRAFFT và các công cụ đánh giá được xác thực khác.
                            Đánh giá toàn diện này giúp xác định các rủi ro sử dụng chất tiềm ẩn và cung cấp phản hồi cá nhân hóa.
                        </p>
                    </div>

                    <button className="start-button" onClick={handleStartExam}>
                        Bắt đầu Đánh giá
                        <FaArrowRight className="arrow-icon" />
                    </button>

                    <div className="exam-result">
                        <div className="result-header">
                            <FaChartLine className="result-icon" />
                            <h4>Kết quả Trước đây</h4>
                        </div>
                        <p className="no-results">Không tìm thấy đánh giá nào trước đây. Hãy thực hiện đánh giá đầu tiên của bạn ngay bây giờ!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
