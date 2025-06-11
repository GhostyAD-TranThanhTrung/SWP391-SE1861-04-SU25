import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BlogPage.scss';
import Image from '../images/Images.jpg';

const BlogPage = () => {
    const posts = [
        { 
            title: 'Substance Abuse: Awareness & Prevention', 
            date: 'May 31, 2025', 
            author: 'Dr. Sarah Johnson', 
            image: Image,
            excerpt: 'Learn about the latest strategies and approaches for preventing substance abuse in communities.',
            id: 1
        },
        { 
            title: '12 Ways to Prevent Drug Abuse', 
            date: 'May 28, 2025', 
            author: 'Michael Chen', 
            image: Image,
            excerpt: 'Practical tips and evidence-based methods to help prevent drug abuse among youth and adults.',
            id: 2
        },
        { 
            title: 'Drug Abuse Awareness', 
            date: 'May 25, 2025', 
            author: 'Lisa Rodriguez', 
            image: Image,
            excerpt: 'Understanding the signs, symptoms, and impact of drug abuse on individuals and families.',
            id: 3
        },
        { 
            title: 'Effects of Long-Term Drug Use', 
            date: 'May 22, 2025', 
            author: 'Dr. Sarah Johnson', 
            image: Image,
            excerpt: 'Comprehensive analysis of the physical, mental, and social effects of prolonged substance use.',
            id: 4
        },
        { 
            title: 'Building Resilience Against Addiction', 
            date: 'May 19, 2025', 
            author: 'Michael Chen', 
            image: Image,
            excerpt: 'Strategies for developing personal and community resilience to prevent addiction.',
            id: 5
        },
        { 
            title: 'Supporting Recovery Journeys', 
            date: 'May 16, 2025', 
            author: 'Lisa Rodriguez', 
            image: Image,
            excerpt: 'How families and communities can provide effective support during recovery processes.',
            id: 6
        },
    ];

    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <section className="blog-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12 text-center">
                            <h1 className="hero-title">
                                Knowledge & Insights
                            </h1>
                            <p className="hero-subtitle">
                                Explore our latest articles, research findings, and expert insights on 
                                substance abuse prevention, awareness, and community support.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{paddingTop: '5rem', paddingBottom: '5rem'}}>
                {/* Featured Article Section */}
                <section className="featured-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Featured Article</h2>
                        <p className="section-subtitle">Our most recent and impactful content</p>
                    </div>
                    
                    <div className="featured-post">
                        <div className="row align-items-center">
                            <div className="col-lg-4">
                                <div className="featured-image">
                                    <img src={featuredPost.image} alt={featuredPost.title} className="img-fluid rounded-3" />
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <div className="featured-content">
                                    <h3 className="featured-title">{featuredPost.title}</h3>
                                    <p className="featured-meta">
                                        <i className="bi bi-calendar me-2"></i>
                                        {featuredPost.date}
                                        <span className="mx-2">|</span>
                                        <i className="bi bi-person me-2"></i>
                                        {featuredPost.author}
                                    </p>
                                    <p className="featured-excerpt">{featuredPost.excerpt}</p>
                                    <Link to={`/blog/${featuredPost.id}`} className="btn btn-primary">
                                        <i className="bi bi-arrow-right me-2"></i>
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Latest Articles Section */}
                <section className="articles-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Latest Articles</h2>
                        <p className="section-subtitle">Stay updated with our newest insights and research</p>
                    </div>
                    
                    <div className="row">
                        {regularPosts.map((post) => (
                            <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                                <div className="article-card">
                                    <div className="article-image">
                                        <img src={post.image} alt={post.title} className="img-fluid" />
                                    </div>
                                    <div className="article-content">
                                        <h4 className="article-title">{post.title}</h4>
                                        <p className="article-meta">
                                            <i className="bi bi-calendar me-2"></i>
                                            {post.date}
                                            <span className="mx-2">|</span>
                                            <i className="bi bi-person me-2"></i>
                                            {post.author}
                                        </p>
                                        <p className="article-excerpt">{post.excerpt}</p>
                                        <Link to={`/blog/${post.id}`} className="btn btn-outline-primary">
                                            Read Article
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pagination */}
                <section className="pagination-section">
                    <nav aria-label="Blog pagination" className="d-flex justify-content-center">
                        <ul className="pagination">
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Previous">
                                    <i className="bi bi-chevron-left"></i>
                                </a>
                            </li>
                            <li className="page-item active">
                                <a className="page-link" href="#">1</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#">2</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#">3</a>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#">10</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Next">
                                    <i className="bi bi-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </section>

                {/* Newsletter Subscription */}
                <section className="newsletter-section py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h3 className="newsletter-title">Stay Informed</h3>
                            <p className="newsletter-description">
                                Subscribe to our newsletter to receive the latest articles and updates 
                                directly in your inbox.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/newsletter" className="btn btn-cta btn-lg">
                                <i className="bi bi-envelope me-2"></i>
                                Subscribe Now
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BlogPage;