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
            name: "Dr. Sarah Johnson",
            role: "Chief Medical Officer",
            specialization: "Addiction Medicine",
            image: groupSessImg,
            description: "Over 15 years of experience in addiction treatment and prevention programs."
        },
        {
            name: "Michael Chen",
            role: "Program Director",
            specialization: "Community Outreach",
            image: OutImg,
            description: "Leading community-based prevention initiatives and educational programs."
        },
        {
            name: "Lisa Rodriguez",
            role: "Clinical Supervisor",
            specialization: "Counseling & Therapy",
            image: SupportHugImg,
            description: "Licensed clinical social worker specializing in substance abuse counseling."
        }
    ];

    const values = [
        {
            icon: "bi-shield-check",
            title: "Prevention First",
            description: "We believe in the power of education and early intervention to prevent substance abuse before it starts."
        },
        {
            icon: "bi-people-fill",
            title: "Community Focus",
            description: "Building strong, supportive communities that work together to address substance abuse challenges."
        },
        {
            icon: "bi-lightbulb",
            title: "Evidence-Based",
            description: "Our programs are grounded in scientific research and proven methodologies for maximum effectiveness."
        },
        {
            icon: "bi-heart-pulse",
            title: "Holistic Wellness",
            description: "Addressing not just substance use, but overall mental, physical, and social well-being."
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
                                <img src={RecoveryImg} alt="Community Support" className="img-fluid rounded-3" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h1 className="hero-title">
                                Building Healthier Communities Together
                            </h1>
                            <p className="hero-subtitle">
                                Through innovative prevention strategies, comprehensive education, and unwavering 
                                community support, we're creating lasting change that protects families and 
                                strengthens neighborhoods across our region.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/courses" className="btn btn-primary btn-lg me-3">
                                    <i className="bi bi-graduation-cap me-2"></i>
                                    Start Learning
                                </Link>
                                <Link to="/booking" className="btn btn-outline-light btn-lg">
                                    <i className="bi bi-heart me-2"></i>
                                    Find Support
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
                                <h2 className="section-title">Our Mission</h2>
                                <p className="section-description">
                                    At Substance, we are committed to building drug-free communities through comprehensive 
                                    prevention education, early intervention programs, and ongoing support services. Our 
                                    evidence-based approach combines cutting-edge research with compassionate care to 
                                    address the root causes of substance abuse.
                                </p>
                                <p className="section-description">
                                    We believe that prevention is the most powerful tool in the fight against substance 
                                    abuse. By educating individuals, families, and communities about the risks and 
                                    providing them with the tools they need to make informed decisions, we can create 
                                    lasting change that saves lives and strengthens communities.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="mission-image">
                                <img src={CommunityImg} alt="Our Mission" className="img-fluid rounded-3" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="services-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">What We Offer</h2>
                        <p className="section-subtitle">Comprehensive solutions for prevention, education, and support</p>
                    </div>
                    
                    <div className="row">
                        {/* Service 1 */}
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="service-card">
                                <div className="service-image">
                                    <img src={PreventionImg} alt="Prevention Courses" className="img-fluid" />
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">Prevention Education Courses</h4>
                                    <p className="service-description">
                                        Comprehensive educational programs designed to increase awareness and provide 
                                        essential knowledge about substance abuse prevention. Our courses offer 
                                        convenient, fast, and reliable learning experiences.
                                    </p>
                                    <Link to="/courses" className="btn btn-outline-primary">
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Service 2 */}
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="service-card">
                                <div className="service-image">
                                    <img src={OutImg} alt="Risk Assessment" className="img-fluid" />
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">Risk Assessment Tools</h4>
                                    <p className="service-description">
                                        Advanced assessment tools that help identify risk factors and provide personalized 
                                        prevention strategies. Through self-assessment, users can better understand their 
                                        behaviors and seek appropriate support.
                                    </p>
                                    <Link to="/test" className="btn btn-outline-primary">
                                        Take Assessment
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Service 3 */}
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="service-card">
                                <div className="service-image">
                                    <img src={SupportHugImg} alt="Counseling Services" className="img-fluid" />
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">Professional Counseling</h4>
                                    <p className="service-description">
                                        Easy-to-use scheduling system for booking appointments with specialized prevention 
                                        counselors. Our user-friendly interface and automatic reminders help you access 
                                        quality counseling and support services.
                                    </p>
                                    <Link to="/booking" className="btn btn-outline-primary">
                                        Book Appointment
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="values-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Our Core Values</h2>
                        <p className="section-subtitle">The principles that guide everything we do</p>
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
                        <h2 className="section-title">Meet Our Team</h2>
                        <p className="section-subtitle">Dedicated professionals committed to your success</p>
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
                            <h3 className="cta-title">Ready to Make a Difference?</h3>
                            <p className="cta-description">
                                Join our community of individuals, families, and organizations working together 
                                to create substance-free communities. Start your journey with us today.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/signup" className="btn btn-cta btn-lg">
                                <i className="bi bi-arrow-right me-2"></i>
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUsPage;
