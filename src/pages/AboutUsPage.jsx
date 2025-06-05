import React from 'react';
import '../styles/AboutUsPage.scss';

import groupSessImg from '../images/groupsession.jpg';
import OutImg from '../images/outdoors.jpg';
import SupportHugImg from '../images/supporthug.jpg';

const AboutUsPage = () => {
    return (
        <div className="about-us-section py-5">
            <h2 className="section-heading text-center mb-5">
                Mang Đến Phương Pháp Phòng Ngừa Ma Túy Cho Cộng Đồng
            </h2>

            {/* Feature 1 */}
            <div className="row align-items-center mb-5 feature-item">
                <div className="col-md-6 mb-3 mb-md-0">
                    <div className="image-wrapper">
                        <img src={groupSessImg} alt="GroupSession" className="img-fluid rounded shadow" />
                    </div>
                </div>
                <div className="col-md-6">
                    <h4 className="feature-title">Các khóa học phòng ngừa sủ dụng ma túy</h4>
                    <p className="feature-text">
                        Tại Subtance, chúng tôi cung cấp nhiều khóa học phòng ngừa sử dụng ma túy,
                        giúp nâng cao nhận thức và trang bị kiến thức cần thiết. Chúng tôi không chỉ
                        mang đến chương trình đào tạo chất lượng mà còn tạo ra trải nghiệm học tập tiện
                        lợi, nhanh chóng và đáng tin cậy.
                    </p>
                    <button className="btn-learn-more">Tìm hiểu thêm</button>
                </div>
            </div>

            {/* Feature 2 */}
            <div className="row align-items-center flex-md-row-reverse mb-5 feature-item">
                <div className="col-md-6 mb-3 mb-md-0">
                    <div className="image-wrapper">
                        <img src={OutImg} alt="Outdoor" className="img-fluid rounded shadow" />
                    </div>
                </div>
                <div className="col-md-6">
                    <h4 className="feature-title">Các bài kiểm tra nguy cơ sử dụng ma túy</h4>
                    <p className="feature-text">
                        Hệ thống này cung cấp các công cụ đánh giá và phân tích mức độ rủi ro liên quan đến
                        việc sử dụng ma túy, giúp người dùng nhận diện các yếu tố nguy cơ cũng như đưa ra các
                        giải pháp phòng ngừa hiệu quả. Thông qua các bài kiểm tra tự đánh giá, người dùng có thể
                        hiểu rõ hơn về hành vi của mình và tìm kiếm sự hỗ trợ cần thiết để duy trì sức khỏe tâm thần và thể chất.
                    </p>
                    <button className="btn-learn-more">Tìm hiểu thêm</button>
                </div>
            </div>

            {/* Feature 3 */}
            <div className="row align-items-center mb-5 feature-item">
                <div className="col-md-6 mb-3 mb-md-0">
                    <div className="image-wrapper">
                        <img src={SupportHugImg} alt="SupportHug" className="img-fluid rounded shadow" />
                    </div>
                </div>
                <div className="col-md-6">
                    <h4 className="feature-title">Hệ thống đặt lịch chuyên viên tư vấn</h4>
                    <p className="feature-text">
                        Chúng tôi cam kết cung cấp một hệ thống đặt lịch dễ dàng và tiện lợi, cho phép khách hàng
                        book lịch hẹn với các chuyên viên tư vấn chuyên về phòng ngừa ma túy. Với giao diện thân thiện
                        và tính năng nhắc nhở tự động, chúng tôi giúp bạn dễ dàng tiếp cận các dịch vụ tư vấn, giáo dục
                        và hỗ trợ nhằm nâng cao nhận thức về nguy cơ liên quan đến ma túy, từ đó xây dựng những thói quen
                        lành mạnh và bảo vệ sức khỏe của bản thân.
                    </p>
                    <button className="btn-learn-more">Tìm hiểu thêm</button>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
