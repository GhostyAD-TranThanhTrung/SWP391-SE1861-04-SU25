import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUsPage.scss';

import groupSessImg from '../images/groupsession.jpg';
import OutImg from '../images/outdoors.jpg';
import SupportHugImg from '../images/supporthug.jpg';
import RecoveryImg from '../images/Image1.jpg';
import PreventionImg from '../images/Prevention.jpg';
import CommunityImg from '../images/Image2.jpg';

const AboutUsPage = () => {
    const teamMembers = [
        {
            name: "Bác sĩ Sarah Johnson",
            role: "Giám đốc Y tế",
            specialization: "Y học Nghiện chất",
            image: groupSessImg,
            description: "Hơn 15 năm kinh nghiệm trong điều trị nghiện và các chương trình phòng ngừa. Chuyên gia về can thiệp sớm và phòng ngừa tái nghiện.",
            experience: "15+ năm kinh nghiệm"
        },
        {
            name: "Michael Chen",
            role: "Giám đốc Chương trình",
            specialization: "Tiếp cận Cộng đồng",
            image: OutImg,
            description: "Lãnh đạo các sáng kiến phòng ngừa dựa trên cộng đồng và chương trình giáo dục. Chuyên về xây dựng mạng lưới hỗ trợ.",
            experience: "12+ năm kinh nghiệm"
        },
        {
            name: "Lisa Rodriguez",
            role: "Giám sát Lâm sàng",
            specialization: "Tư vấn & Trị liệu",
            image: SupportHugImg,
            description: "Nhân viên xã hội lâm sàng được cấp phép chuyên về tư vấn lạm dụng chất và hỗ trợ gia đình.",
            experience: "10+ năm kinh nghiệm"
        }
    ];

    const values = [
        {
            icon: "bi-shield-check",
            title: "Phòng ngừa Trước tiên",
            description: "Chúng tôi tin vào sức mạnh của giáo dục và can thiệp sớm để ngăn chặn lạm dụng chất trước khi nó bắt đầu."
        },
        {
            icon: "bi-people-fill",
            title: "Tập trung Cộng đồng",
            description: "Xây dựng cộng đồng mạnh mẽ, hỗ trợ lẫn nhau để giải quyết các thách thức lạm dụng chất."
        },
        {
            icon: "bi-lightbulb",
            title: "Dựa trên Bằng chứng",
            description: "Các chương trình của chúng tôi được xây dựng trên nghiên cứu khoa học và phương pháp đã được chứng minh."
        },
        {
            icon: "bi-heart-pulse",
            title: "Sức khỏe Toàn diện",
            description: "Không chỉ giải quyết việc sử dụng chất mà còn quan tâm đến sức khỏe tinh thần, thể chất và xã hội."
        }
    ];

    const services = [
        {
            title: "Khóa học Giáo dục Phòng ngừa",
            description: "Chương trình giáo dục toàn diện được thiết kế để tăng cường nhận thức và cung cấp kiến thức cần thiết về phòng ngừa lạm dụng chất.",
            image: PreventionImg,
            link: "/courses",
            buttonText: "Tìm hiểu Thêm",
            features: ["Học trực tuyến", "Chứng chỉ hoàn thành", "Nội dung cập nhật"]
        },
        {
            title: "Công cụ Đánh giá Rủi ro",
            description: "Công cụ đánh giá tiên tiến giúp xác định các yếu tố rủi ro và cung cấp chiến lược phòng ngừa cá nhân hóa.",
            image: OutImg,
            link: "/test",
            buttonText: "Làm Đánh giá",
            features: ["Đánh giá miễn phí", "Kết quả tức thì", "Khuyến nghị cá nhân"]
        },
        {
            title: "Tư vấn Chuyên nghiệp",
            description: "Hệ thống đặt lịch dễ sử dụng để đặt lịch hẹn với các chuyên gia tư vấn phòng ngừa chuyên biệt.",
            image: SupportHugImg,
            link: "/booking",
            buttonText: "Đặt Lịch hẹn",
            features: ["Tư vấn 1-1", "Linh hoạt thời gian", "Bảo mật thông tin"]
        }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <div className="hero-image">
                                <img src={RecoveryImg} alt="Hỗ trợ Cộng đồng" className="img-fluid" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h1 className="hero-title">
                                Xây dựng cộng đồng khỏe mạnh cùng nhau
                            </h1>
                            <p className="hero-subtitle">
                                Thông qua các chiến lược phòng ngừa sáng tạo, giáo dục toàn diện và
                                hỗ trợ cộng đồng không ngừng, chúng tôi đang tạo ra sự thay đổi lâu dài
                                để bảo vệ gia đình và củng cố các khu phố trên toàn khu vực.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/courses" className="btn btn-primary">
                                    <i className="bi bi-graduation-cap"></i>
                                    Bắt đầu Học tập
                                </Link>
                                <Link to="/booking" className="btn btn-outline-light">
                                    <i className="bi bi-heart"></i>
                                    Tìm Hỗ trợ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Mission Section */}
                <section className="mission-section">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="mission-content">
                                <h2 className="section-title">Sứ mệnh của chúng tôi</h2>
                                <p className="section-description">
                                    Tại BellaVita, chúng tôi cam kết xây dựng cộng đồng không ma túy thông qua
                                    giáo dục phòng ngừa toàn diện, chương trình can thiệp sớm và dịch vụ hỗ trợ
                                    liên tục. Cách tiếp cận dựa trên bằng chứng của chúng tôi kết hợp nghiên cứu
                                    tiên tiến với sự chăm sóc nhân ái để giải quyết nguyên nhân gốc rễ của lạm dụng chất.
                                </p>
                                <p className="section-description">
                                    Chúng tôi tin rằng phòng ngừa là công cụ mạnh mẽ nhất trong cuộc chiến chống
                                    lạm dụng chất. Bằng cách giáo dục cá nhân, gia đình và cộng đồng về các rủi ro
                                    và cung cấp cho họ những công cụ cần thiết để đưa ra quyết định sáng suốt,
                                    chúng tôi có thể tạo ra sự thay đổi lâu dài cứu sống và củng cố cộng đồng.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="mission-image">
                                <img src={CommunityImg} alt="Sứ mệnh của chúng tôi" className="img-fluid" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="services-section">
                    <div className="section-header">
                        <h2 className="section-title">Những gì chúng tôi cung cấp</h2>
                        <p className="section-subtitle">Giải pháp toàn diện cho phòng ngừa, giáo dục và hỗ trợ</p>
                    </div>

                    <div className="row">
                        {services.map((service, index) => (
                            <div className="col-lg-4 col-md-6 mb-4" key={index}>
                                <div className="service-card">
                                    <div className="service-image">
                                        <img src={service.image} alt={service.title} className="img-fluid" />
                                    </div>
                                    <div className="service-content">
                                        <h4 className="service-title">{service.title}</h4>
                                        <p className="service-description">
                                            {service.description}
                                        </p>
                                        <div className="service-features mb-3">
                                            {service.features.map((feature, idx) => (
                                                <div key={idx} className="feature-item">
                                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Link to={service.link} className="btn btn-outline-primary">
                                            {service.buttonText}
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Values Section */}
                <section className="values-section">
                    <div className="section-header">
                        <h2 className="section-title">Giá trị cốt lõi của chúng tôi</h2>
                        <p className="section-subtitle">Những nguyên tắc hướng dẫn mọi việc chúng tôi làm</p>
                    </div>

                    <div className="row">
                        {values.map((value, index) => (
                            <div className="col-lg-3 col-md-6 mb-4" key={index}>
                                <div className="value-card">
                                    <div className="value-icon">
                                        <i className={value.icon}></i>
                                    </div>
                                    <h4 className="value-title">{value.title}</h4>
                                    <p className="value-description">{value.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section className="team-section">
                    <div className="section-header">
                        <h2 className="section-title">Gặp gỡ đội ngũ của chúng tôi</h2>
                        <p className="section-subtitle">Các chuyên gia tận tâm cam kết với thành công của bạn</p>
                    </div>

                    <div className="row">
                        {teamMembers.map((member, index) => (
                            <div className="col-lg-4 col-md-6 mb-4" key={index}>
                                <div className="team-card">
                                    <div className="team-image">
                                        <img src={member.image} alt={member.name} className="img-fluid" />
                                    </div>
                                    <div className="team-content">
                                        <h4 className="team-name">{member.name}</h4>
                                        <p className="team-role">{member.role}</p>
                                        <p className="team-specialization">{member.specialization}</p>
                                        <div className="team-experience mb-2">
                                            <i className="bi bi-clock-history me-2 text-primary"></i>
                                            <span className="text-muted">{member.experience}</span>
                                        </div>
                                        <p className="team-description">{member.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="cta-section">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h3 className="cta-title">Sẵn sàng Tạo ra Sự khác biệt?</h3>
                            <p className="cta-description">
                                Tham gia cộng đồng của chúng tôi gồm các cá nhân, gia đình và tổ chức
                                làm việc cùng nhau để tạo ra cộng đồng không chất. Bắt đầu hành trình
                                của bạn với chúng tôi ngay hôm nay.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/register" className="btn btn-cta">
                                Bắt đầu Ngay
                                <i className="bi bi-arrow-right ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUsPage;
