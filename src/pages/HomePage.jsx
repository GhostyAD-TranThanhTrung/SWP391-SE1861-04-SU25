import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.scss';
import Image from '../images/Images.jpg';
import Image1 from '../images/Image1.jpg';
import Image2 from '../images/Image2.jpg';
import Image3 from '../images/Image3.jpg';
import PreventionImg from '../images/Prevention.jpg';
import SupportImg from '../images/supporthug.jpg';
import GroupSessionImg from '../images/groupsession.jpg';
import OutdoorsImg from '../images/outdoors.jpg';

const HomePage = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [stats, setStats] = useState({ users: 0, courses: 0, consultations: 0, success: 0 });

    // Animated counter effect
    useEffect(() => {
        const targets = { users: 5000, courses: 150, consultations: 2500, success: 95 };
        const duration = 2000; // 2 seconds
        const increment = 50; // Update every 50ms
        const steps = duration / increment;

        const counters = Object.keys(targets).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {});

        const timer = setInterval(() => {
            let allComplete = true;
            Object.keys(targets).forEach(key => {
                if (counters[key] < targets[key]) {
                    counters[key] = Math.min(counters[key] + targets[key] / steps, targets[key]);
                    allComplete = false;
                }
            });

            setStats({ ...counters });

            if (allComplete) {
                clearInterval(timer);
            }
        }, increment);

        return () => clearInterval(timer);
    }, []);

    // Testimonials rotation
    useEffect(() => {
        const testimonialTimer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(testimonialTimer);
    }, []);

    const cardData = (titles, images = []) =>
        titles.map((title, index) => ({
            title,
            date: 'May 31, 2025',
            image: images[index] || Image,
            id: index + 1,
            excerpt: getExcerpt(title)
        }));

    const getExcerpt = (title) => {
        const excerpts = {
            "Substance Abuse: Awareness & Prevention": "Learn about the latest prevention strategies and how to recognize early warning signs.",
            "12 ways to prevent drug abuse": "Practical tips and evidence-based methods to prevent substance abuse in your community.",
            "Drug Abuse Awareness": "Comprehensive guide to understanding and addressing drug abuse in today's society.",
            "Effects of Long-Term Drug Use": "Detailed analysis of the physical and mental health impacts of prolonged substance use.",
            "The Truth About Drugs": "Evidence-based information about various substances and their effects on the body and mind.",
            "The Truth About Prescription Drug Abuse": "Understanding the risks and prevention of prescription medication misuse.",
            "Recovery Pathways - Online Course": "Interactive course guiding you through the journey of recovery and healing.",
            "Youth Drug Prevention Toolkit": "Resources and strategies specifically designed for preventing youth substance abuse."
        };
        return excerpts[title] || "Discover valuable insights and practical guidance in this comprehensive resource.";
    };

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Recovery Coach",
            content: "SUBSTANCE has transformed how we approach addiction recovery. The resources are comprehensive and truly life-changing.",
            avatar: "👩‍⚕️"
        },
        {
            name: "Michael Chen",
            role: "Parent",
            content: "The prevention courses helped me understand how to protect my children and support our family through difficult times.",
            avatar: "👨‍👦"
        },
        {
            name: "Dr. Emily Rodriguez",
            role: "Addiction Specialist",
            content: "I recommend SUBSTANCE to all my patients. The evidence-based approach and accessible format make recovery more achievable.",
            avatar: "👩‍⚕️"
        }
    ];

    const renderCards = (data, basePath, showExcerpt = true) => (
        data.map((item) => (
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4" key={item.id}>
                <Link to={`${basePath}/${item.id}`} className="custom-card-link">
                    <div className="custom-card">
                        <div className="card-image-wrapper">
                            <img src={item.image} alt={item.title} className="card-image" />
                            <div className="card-overlay">
                                <i className="bi bi-arrow-right-circle"></i>
                            </div>
                        </div>
                        <div className="card-content">
                            <h5 className="card-title">{item.title}</h5>
                            {showExcerpt && <p className="card-excerpt">{item.excerpt}</p>}
                            <div className="card-meta">
                                <span className="card-date">
                                    <i className="bi bi-calendar3"></i> {item.date}
                                </span>
                                <span className="read-more">Read More →</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        ))
    );

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="container">
                        <div className="row align-items-center min-vh-100">
                            <div className="col-lg-6">
                                <div className="hero-text">
                                    <h1 className="hero-title">
                                        Your Journey to
                                        <span className="highlight"> Recovery</span>
                                        <br />Starts Here
                                    </h1>
                                    <p className="hero-description">
                                        Discover comprehensive resources, expert guidance, and a supportive community
                                        dedicated to substance abuse prevention, recovery, and healing.
                                    </p>
                                    <div className="hero-buttons">
                                        <Link to="/courses" className="btn btn-primary-custom btn-lg">
                                            <i className="bi bi-play-circle me-2"></i>
                                            Start Learning
                                        </Link>
                                        <Link to="/booking" className="btn btn-outline-custom btn-lg">
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Book Consultation
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="hero-carousel">
                                    <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
                                        <div className="carousel-inner">
                                            <div className="carousel-item active">
                                                <img src={GroupSessionImg} className="d-block w-100" alt="Group Support Session" />
                                                <div className="carousel-caption">
                                                    <h5>Community Support</h5>
                                                    <p>Join our supportive community on your recovery journey</p>
                                                </div>
                                            </div>
                                            <div className="carousel-item">
                                                <img src={OutdoorsImg} className="d-block w-100" alt="Outdoor Recovery Activities" />
                                                <div className="carousel-caption">
                                                    <h5>Holistic Healing</h5>
                                                    <p>Discover nature-based recovery and wellness programs</p>
                                                </div>
                                            </div>
                                            <div className="carousel-item">
                                                <img src={SupportImg} className="d-block w-100" alt="Professional Support" />
                                                <div className="carousel-caption">
                                                    <h5>Expert Guidance</h5>
                                                    <p>Access professional counseling and personalized care</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                                            <span className="carousel-control-prev-icon"></span>
                                        </button>
                                        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                                            <span className="carousel-control-next-icon"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.users).toLocaleString()}+</h3>
                                <p className="stat-label">Lives Transformed</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-book-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.courses)}+</h3>
                                <p className="stat-label">Educational Resources</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-heart-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.consultations)}+</h3>
                                <p className="stat-label">Support Sessions</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="bi bi-trophy-fill"></i>
                                </div>
                                <h3 className="stat-number">{Math.floor(stats.success)}%</h3>
                                <p className="stat-label">Success Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container py-5">
                {/* Featured Courses Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">Featured Learning Paths</h2>
                        <p className="section-subtitle">Start your journey with our most popular and effective courses</p>
                    </div>
                    <div className="row gx-3">
                        {renderCards(cardData([
                            "The Truth About Drugs",
                            "The Truth About Prescription Drug Abuse",
                            "Recovery Pathways - Online Course",
                            "Youth Drug Prevention Toolkit"
                        ], [PreventionImg, Image2, SupportImg, Image3]), "/course")}
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/courses" className="btn btn-outline-primary btn-lg">
                            <i className="bi bi-collection me-2"></i>
                            View All Courses
                        </Link>
                    </div>
                </section>

                {/* Popular Blogs Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">Knowledge Hub</h2>
                        <p className="section-subtitle">Stay informed with the latest insights and research</p>
                    </div>
                    <div className="row gx-3">
                        {renderCards(cardData([
                            "Substance Abuse: Awareness & Prevention",
                            "12 ways to prevent drug abuse",
                            "Drug Abuse Awareness",
                            "Effects of Long-Term Drug Use"
                        ], [PreventionImg, Image1, Image2, Image3]), "/blog")}
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/blog" className="btn btn-outline-primary btn-lg">
                            <i className="bi bi-journal-text me-2"></i>
                            Read More Articles
                        </Link>
                    </div>
                </section>
            </div>

            {/* Testimonials Section */}
            <section className="testimonials-section py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-header">What Our Community Says</h2>
                        <p className="section-subtitle">Real stories from real people on their recovery journey</p>
                    </div>
                    <div className="testimonial-container">
                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                <div className="quote-icon">
                                    <i className="bi bi-quote"></i>
                                </div>
                                <p className="testimonial-text">"{testimonials[currentTestimonial].content}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{testimonials[currentTestimonial].avatar}</div>
                                    <div className="author-info">
                                        <h5 className="author-name">{testimonials[currentTestimonial].name}</h5>
                                        <p className="author-role">{testimonials[currentTestimonial].role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-indicators">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
                                    onClick={() => setCurrentTestimonial(index)}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h2 className="cta-title">Ready to Begin Your Recovery Journey?</h2>
                            <p className="cta-description">
                                Take the first step towards healing and transformation. Our expert team is here to support you every step of the way.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/booking" className="btn btn-cta btn-lg">
                                <i className="bi bi-calendar-heart me-2"></i>
                                Schedule Free Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;