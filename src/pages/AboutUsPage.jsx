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
            description: "Hơn 15 năm kinh nghiệm trong điều trị nghiện và các chương trình phòng ngừa."
        },
        {
            name: "Michael Chen",
            role: "Giám đốc Chương trình",
            specialization: "Tiếp cận Cộng đồng",
            image: OutImg,
            description: "Lãnh đạo các sáng kiến phòng ngừa dựa trên cộng đồng và chương trình giáo dục."
        },
        {
            name: "Lisa Rodriguez",
            role: "Giám sát Lâm sàng",
            specialization: "Tư vấn & Trị liệu",
            image: SupportHugImg,
            description: "Nhân viên xã hội lâm sàng được cấp phép chuyên về tư vấn lạm dụng chất."
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
            description: "Các chương trình của chúng tôi được xây dựng trên nghiên cứu khoa học và phương pháp đã được chứng minh để đạt hiệu quả tối đa."
        },
        {
            icon: "bi-heart-pulse",
            title: "Sức khỏe Toàn diện",
            description: "Không chỉ giải quyết việc sử dụng chất mà còn quan tâm đến sức khỏe tinh thần, thể chất và xã hội tổng thể."
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
                                <img src={RecoveryImg} alt="Hỗ trợ Cộng đồng" className="img-fluid rounded-3" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h1 className="hero-title">
                                Xây dựng Cộng đồng Khỏe mạnh Cùng nhau
                            </h1>
                            <p className="hero-subtitle">
                                Thông qua các chiến lược phòng ngừa sáng tạo, giáo dục toàn diện và
                                hỗ trợ cộng đồng không ngừng, chúng tôi đang tạo ra sự thay đổi lâu dài
                                để bảo vệ gia đình và củng cố các khu phố trên toàn khu vực.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/courses" className="btn btn-primary btn-lg me-3">
                                    <i className="bi bi-graduation-cap me-2"></i>
                                    Bắt đầu Học tập
                                </Link>
                                <Link to="/booking" className="btn btn-outline-light btn-lg">
                                    <i className="bi bi-heart me-2"></i>
                                    Tìm Hỗ trợ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container py-5">
                {/* Mission Section */}
                <section className="mission-section mb-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="mission-content">
                                <h2 className="section-title">Sứ mệnh của Chúng tôi</h2>
                                <p className="section-description">
                                    Tại Substance, chúng tôi cam kết xây dựng cộng đồng không ma túy thông qua
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
                                <img src={CommunityImg} alt="Sứ mệnh của Chúng tôi" className="img-fluid rounded-3" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="services-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Những gì Chúng tôi Cung cấp</h2>
                        <p className="section-subtitle">Giải pháp toàn diện cho phòng ngừa, giáo dục và hỗ trợ</p>
                    </div>

                    <div className="row">
                        {/* Service 1 */}
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="service-card">
                                <div className="service-image">
                                    <img src={PreventionImg} alt="Khóa học Phòng ngừa" className="img-fluid" />
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">Khóa học Giáo dục Phòng ngừa</h4>
                                    <p className="service-description">
                                        Chương trình giáo dục toàn diện được thiết kế để tăng cường nhận thức và
                                        cung cấp kiến thức cần thiết về phòng ngừa lạm dụng chất. Các khóa học của
                                        chúng tôi mang đến trải nghiệm học tập thuận tiện, nhanh chóng và đáng tin cậy.
                                    </p>
                                    <Link to="/courses" className="btn btn-outline-primary">
                                        Tìm hiểu Thêm
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Service 2 */}
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="service-card">
                                <div className="service-image">
                                    <img src={OutImg} alt="Đánh giá Rủi ro" className="img-fluid" />
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">Công cụ Đánh giá Rủi ro</h4>
                                    <p className="service-description">
                                        Công cụ đánh giá tiên tiến giúp xác định các yếu tố rủi ro và cung cấp
                                        chiến lược phòng ngừa cá nhân hóa. Thông qua tự đánh giá, người dùng có
                                        thể hiểu rõ hơn về hành vi của mình và tìm kiếm hỗ trợ phù hợp.
                                    </p>
                                    <Link to="/test" className="btn btn-outline-primary">
                                        Làm Đánh giá
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Service 3 */}
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="service-card">
                                <div className="service-image">
                                    <img src={SupportHugImg} alt="Dịch vụ Tư vấn" className="img-fluid" />
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">Tư vấn Chuyên nghiệp</h4>
                                    <p className="service-description">
                                        Hệ thống đặt lịch dễ sử dụng để đặt lịch hẹn với các chuyên gia tư vấn
                                        phòng ngừa chuyên biệt. Giao diện thân thiện và nhắc nhở tự động giúp
                                        bạn tiếp cận dịch vụ tư vấn và hỗ trợ chất lượng.
                                    </p>
                                    <Link to="/booking" className="btn btn-outline-primary">
                                        Đặt Lịch hẹn
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="values-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Giá trị Cốt lõi của Chúng tôi</h2>
                        <p className="section-subtitle">Những nguyên tắc hướng dẫn mọi việc chúng tôi làm</p>
                    </div>

                    <div className="row">
                        {values.map((value, index) => (
                            <div className="col-lg-3 col-md-6 mb-4" key={index}>
                                <div className="value-card text-center">
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
                <section className="team-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Gặp gỡ Đội ngũ của Chúng tôi</h2>
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
                                        <p className="team-description">{member.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="cta-section py-5">
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
                            <Link to="/signup" className="btn btn-cta btn-lg">
                                <i className="bi bi-arrow-right me-2"></i>
                                Bắt đầu Ngay
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUsPage;
