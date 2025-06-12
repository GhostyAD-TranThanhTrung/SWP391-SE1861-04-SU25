import React from 'react';
import '../styles/Footer.scss';
import Logo from '../images/Logo.png';
import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaTwitter,
    FaYoutube,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top py-5">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-lg-4 col-md-12">
                            <div className="footer-about">
                                <div className="footer-logo">
                                    <img src={Logo} alt="Subtance Logo" className="img-fluid" style={{ height: '50px' }} />
                                </div>
                                <p className="mt-3">
                                    Chúng tôi cung cấp các khóa học chất lượng cao và dịch vụ tư vấn
                                    chuyên nghiệp để giúp bạn đạt được mục tiêu của mình.
                                </p>
                                <div className="footer-contact mt-4">
                                    <p><FaPhoneAlt className="me-2" /> +84 123 456 789</p>
                                    <p><FaEnvelope className="me-2" /> contact@subtance.edu.vn</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4">
                            <h5 className="footer-title">Khóa học</h5>
                            <ul className="footer-links">
                                <li><Link to="/courses">Tất cả khóa học</Link></li>
                                <li><Link to="/booking">Đặt lich tư vấn uy tín</Link></li>
                                <li><Link to="/test">Bài kiểm tra khảo sát</Link></li>
                                <li><Link to="/blog">Blog chuyên sâu</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-2 col-md-4">
                            <h5 className="footer-title">Hỗ trợ</h5>
                            <ul className="footer-links">
                                <li><Link to="/about">Về chúng tôi</Link></li>
                                <li><Link to="/about">Liên hệ</Link></li>
                                <li><Link to="/about">FAQ</Link></li>
                                <li><Link to="/about">Chính sách</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-4 col-md-4">
                            <h5 className="footer-title">Đăng ký nhận tin</h5>
                            <p className="mt-3">
                                Đăng ký để nhận thông tin mới nhất về khóa học và sự kiện
                            </p>
                            <div className="footer-newsletter mt-3">
                                <input type="email" placeholder="Email của bạn" className="form-control" />
                                <button className="btn btn-primary mt-2">Đăng ký</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom py-3">
                <div className="container">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                        <p className="mb-2 mb-md-0">
                            © 2025 Subtance. Đã đăng ký bản quyền.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link"><FaFacebookF /></a>
                            <a href="#" className="social-link"><FaInstagram /></a>
                            <a href="#" className="social-link"><FaLinkedinIn /></a>
                            <a href="#" className="social-link"><FaTwitter /></a>
                            <a href="#" className="social-link"><FaYoutube /></a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
