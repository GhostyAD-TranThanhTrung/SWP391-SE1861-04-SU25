import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CoursePage.scss';
import Image from '../images/Images.jpg';

const CoursePage = () => {
    const cardData = (titles) =>
        titles.map((title, index) => ({
            title,
            date: 'May 31, 2025',
            image: Image,
            id: index + 1
        }));

    const [blogIndex, setBlogIndex] = useState(0);
    const [courseIndex, setCourseIndex] = useState(0);
    const [newsIndex, setNewsIndex] = useState(0);

    const blogTitles = [
        "Substance Abuse: Awareness & Prevention",
        "12 ways to prevent drug abuse",
        "Drug Abuse Awareness",
        "Effects of Long-Term Drug Use"
    ];
    const courseTitles = [
        "The Truth About Drugs",
        "The Truth About Prescription Drug Abuse",
        "Recovery Pathways - Online Course",
        "Youth Drug Prevention Toolkit"
    ];
    const newsTitles = [
        "Health care insider talks Trump’s executive order aimed at lowering US drug prices",
        "Texas legislation would make flawed drug discount program worse for patients",
        "How the US turned the tide on drug overdose deaths",
        "New Study Reveals Teen Drug Trends in 2025"
    ];

    const itemsPerPage = 4;

    const renderCards = (data, basePath, startIndex, currentIndex, setIndex, maxItems) => {
        const visibleData = data.slice(startIndex, startIndex + itemsPerPage);
        return (
            <div className="position-relative">
                <div className="row gx-4 gy-4">
                    {visibleData.map((item) => (
                        <div className="col-md-3" key={item.id}>
                            <Link to={`${basePath}/${item.id}`} className="custom-card-link">
                                <div className="custom-card">
                                    <img src={item.image} alt="card-img" className="card-image" />
                                    <hr className="card-divider" />
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-date">{item.date}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
                <button
                    className="arrow-btn round-arrow-btn position-absolute start-0 top-50 translate-middle-y"
                    onClick={() => handlePrev(currentIndex, setIndex, maxItems)}
                    disabled={currentIndex === 0}
                    style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    ←
                </button>
                <button
                    className="arrow-btn round-arrow-btn position-absolute end-0 top-50 translate-middle-y"
                    onClick={() => handleNext(currentIndex, setIndex, maxItems)}
                    disabled={currentIndex + itemsPerPage >= maxItems}
                    style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        cursor: currentIndex + itemsPerPage >= maxItems ? 'not-allowed' : 'pointer'
                    }}
                >
                    →
                </button>
            </div>
        );
    };

    const handlePrev = (currentIndex, setIndex, maxItems) => {
        setIndex(Math.max(0, currentIndex - itemsPerPage));
    };

    const handleNext = (currentIndex, setIndex, maxItems) => {
        setIndex(Math.min(maxItems - itemsPerPage, currentIndex + itemsPerPage));
    };

    const blogData = cardData(blogTitles);
    const courseData = cardData(courseTitles);
    const newsData = cardData(newsTitles);

    return (
        <div className="course-page">
            {/* Hero Section */}
            <section className="course-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h1 className="hero-title">
                                Discover Learning Pathways
                            </h1>
                            <p className="hero-subtitle">
                                Explore our comprehensive collection of educational resources, courses, and latest updates 
                                designed to support your journey towards awareness and recovery.
                            </p>
                        </div>
                        <div className="col-lg-4">
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">Resources</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">1000+</span>
                                    <span className="stat-label">Students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{paddingTop: '5rem', paddingBottom: '5rem'}}>
                {/* Most Popular Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">Most Popular Resources</h2>
                        <p className="section-subtitle">Start with our most engaging and educational content</p>
                    </div>
                    
                    <div className="category-tabs d-flex justify-content-center mb-4">
                        <button className="category-btn active">
                            <i className="bi bi-book me-2"></i>
                            <span>Articles</span>
                        </button>
                        <button className="category-btn">
                            <i className="bi bi-postcard me-2"></i>
                            <span>Postcards</span>
                        </button>
                        <button className="category-btn">
                            <i className="bi bi-play-circle me-2"></i>
                            <span>Videos</span>
                        </button>
                    </div>
                    
                    {renderCards(blogData, "/blog", blogIndex, blogIndex, setBlogIndex, blogTitles.length)}
                    
                    <div className="text-center mt-4">
                        <Link to="/blog" className="btn btn-outline-primary btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            View All Articles
                        </Link>
                    </div>
                </section>

                {/* Free Courses Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">Free Learning Courses</h2>
                        <p className="section-subtitle">Access high-quality educational courses at no cost</p>
                    </div>
                    
                    {renderCards(courseData, "/course", courseIndex, courseIndex, setCourseIndex, courseTitles.length)}
                    
                    <div className="text-center mt-4">
                        <Link to="/courses" className="btn btn-outline-primary btn-lg">
                            <i className="bi bi-collection me-2"></i>
                            Explore All Courses
                        </Link>
                    </div>
                </section>

                {/* Latest News Section */}
                <section className="section mb-5">
                    <div className="section-header-wrapper text-center mb-5">
                        <h2 className="section-header">Latest News & Updates</h2>
                        <p className="section-subtitle">Stay informed with the latest developments and research</p>
                    </div>
                    
                    {renderCards(newsData, "/news", newsIndex, newsIndex, setNewsIndex, newsTitles.length)}
                    
                    <div className="text-center mt-4">
                        <Link to="/news" className="btn btn-outline-primary btn-lg">
                            <i className="bi bi-newspaper me-2"></i>
                            Read More News
                        </Link>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="cta-section py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h3 className="cta-title">Ready to Start Your Learning Journey?</h3>
                            <p className="cta-description">
                                Join thousands of learners who have transformed their lives through education and awareness.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/signup" className="btn btn-cta btn-lg">
                                <i className="bi bi-person-plus me-2"></i>
                                Get Started Today
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CoursePage;