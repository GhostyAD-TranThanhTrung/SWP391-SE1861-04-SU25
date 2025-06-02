import React from 'react';
import '../styles/Footer.scss';
import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaTwitter,
    FaYoutube,
} from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content py-4">
                <div className="row text-center text-md-start">
                    <div className="col-12 col-md-4 mb-4 mb-md-0">
                        <h6 className="footer-title">Courses</h6>
                        <p className="footer-link">Free Courses</p>
                        <h6 className="footer-title mt-3">Test</h6>
                        <p className="footer-link">Take the Test</p>
                    </div>
                    <div className="col-12 col-md-4 mb-4 mb-md-0">
                        <h6 className="footer-title">Booking</h6>
                        <p className="footer-link">Online consultation with experts</p>
                        <h6 className="footer-title mt-3">News</h6>
                        <p className="footer-link">Events & News</p>
                    </div>
                    <div className="col-12 col-md-4">
                        <h6 className="footer-title">About</h6>
                        <p className="footer-link">Our Mission</p>
                        <p className="footer-link">Contact Us</p>
                        <p className="footer-link">FAQ</p>
                    </div>
                </div>

                <hr className="footer-divider my-4" />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <p className="mb-2 mb-md-0 text-dark copyright">
                        © Summer 2025 – SWP391 | All Rights Reserved
                    </p>
                    <div className="footer-social-icons">
                        <FaFacebookF className="icon facebook" />
                        <FaInstagram className="icon instagram" />
                        <FaLinkedinIn className="icon linkedin" />
                        <FaTwitter className="icon twitter" />
                        <FaYoutube className="icon youtube" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
