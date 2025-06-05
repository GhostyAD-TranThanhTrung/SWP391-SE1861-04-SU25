import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.scss';
import Image from '../images/Images.jpg';
import Image1 from '../images/Image1.jpg';
import Image2 from '../images/Image2.jpg';
import Image3 from '../images/Image3.jpg';

const HomePage = () => {
    const cardData = (titles) =>
        titles.map((title, index) => ({
            title,
            date: 'May 31, 2025',
            image: Image,
            id: index + 1
        }));

    const renderCards = (data, basePath) => (
        data.map((item) => (
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
        ))
    );

    return (
        <div className="homepage container py-5">

            {/* Carousel Section */}
            <div className="carousel-wrapper mb-5">
                <div id="homepageCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img src={Image1} className="d-block w-100" alt="Slide 1" />
                        </div>
                        <div className="carousel-item">
                            <img src={Image2} className="d-block w-100" alt="Slide 2" />
                        </div>
                        <div className="carousel-item">
                            <img src={Image3} className="d-block w-100" alt="Slide 3" />
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#homepageCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#homepageCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    </button>
                </div>
            </div>

            {/* Most Popular Blog Section */}
            <div className="section mb-5">
                <h2 className="section-header">Most Popular Blogs</h2>
                <div className="row gx-4 gy-4">
                    {renderCards(cardData([
                        "Substance Abuse: Awareness & Prevention",
                        "12 ways to prevent drug abuse",
                        "Drug Abuse Awareness",
                        "Effects of Long-Term Drug Use"
                    ]), "/blog")}
                </div>
                <div className="text-start mt-3 ps-2">
                    <button className="show-more-btn">Show more</button>
                </div>
            </div>

            {/* Free Courses Section */}
            <div className="section mb-5">
                <h2 className="section-header">Free Courses</h2>
                <div className="row gx-4 gy-4">
                    {renderCards(cardData([
                        "The Truth About Drugs",
                        "The Truth About Prescription Drug Abuse",
                        "Recovery Pathways - Online Course",
                        "Youth Drug Prevention Toolkit"
                    ]), "/course")}
                </div>
                <div className="text-start mt-3 ps-2">
                    <button className="show-more-btn">Show more</button>
                </div>
            </div>

            {/* News Section */}
            <div className="section mb-5">
                <h2 className="section-header">New Blogs</h2>
                <div className="row gx-4 gy-4">
                    {renderCards(cardData([
                        "Health care insider talks Trump’s executive order aimed at lowering US drug prices",
                        "Texas legislation would make flawed drug discount program worse for patients",
                        "How the US turned the tide on drug overdose deaths",
                        "New Study Reveals Teen Drug Trends in 2025"
                    ]), "/news")}
                </div>
                <div className="text-start mt-3 ps-2">
                    <button className="show-more-btn">Show more</button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
