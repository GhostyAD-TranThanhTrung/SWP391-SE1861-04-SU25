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
        <div className="coursepage container py-5">
            {/* Most Popular Blog Section */}
            <div className="section mb-5" style={{ marginTop: '60px' }}>
                <div className="category-tabs d-flex justify-content-center">
                    <button className="category-btn">Bài đọc</button>
                    <button className="category-btn">Postcard</button>
                    <button className="category-btn">Video</button>
                </div>
                <h2 className="section-header">Most Popular Courses</h2>
                {renderCards(blogData, "/blog", blogIndex, blogIndex, setBlogIndex, blogTitles.length)}
            </div>

            {/* Free Courses Section */}
            <div className="section mb-5">
                <h2 className="section-header">Free Courses</h2>
                {renderCards(courseData, "/course", courseIndex, courseIndex, setCourseIndex, courseTitles.length)}
            </div>

            {/* News Section */}
            <div className="section mb-5">
                <h2 className="section-header">New C</h2>
                {renderCards(newsData, "/news", newsIndex, newsIndex, setNewsIndex, newsTitles.length)}
            </div>
        </div>
    );
};

export default CoursePage;