import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/BookingPage.scss';
import Image from '../images/Images.jpg';

const BookingPage = () => {
    const [selectedSpecialization, setSelectedSpecialization] = useState('all');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');

    const consultants = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            title: 'Chief Medical Officer',
            specialization: 'Addiction Medicine',
            image: Image,
            rating: 4.9,
            experience: '15+ years',
            nextAvailable: 'Today 3:00 PM',
            price: 'Free Consultation',
            meetingLink: 'https://meet.google.com/abc-defg-hij',
            description: 'Specialized in addiction treatment and prevention with extensive experience in community-based programs.',
            qualifications: ['MD, Addiction Medicine', 'Board Certified', '500+ Consultations']
        },
        {
            id: 2,
            name: 'Michael Chen',
            title: 'Program Director',
            specialization: 'Community Outreach',
            image: Image,
            rating: 4.8,
            experience: '12+ years',
            nextAvailable: 'Tomorrow 10:00 AM',
            price: 'Free Consultation',
            meetingLink: 'https://meet.google.com/xyz-uvw-rst',
            description: 'Expert in community-based prevention initiatives and educational program development.',
            qualifications: ['PhD Psychology', 'Community Specialist', '300+ Sessions']
        },
        {
            id: 3,
            name: 'Lisa Rodriguez',
            title: 'Clinical Supervisor',
            specialization: 'Counseling & Therapy',
            image: Image,
            rating: 4.9,
            experience: '10+ years',
            nextAvailable: 'Today 5:00 PM',
            price: 'Free Consultation',
            meetingLink: 'https://meet.google.com/lmn-opq-tuv',
            description: 'Licensed clinical social worker specializing in substance abuse counseling and family therapy.',
            qualifications: ['LCSW Licensed', 'Family Therapy', '400+ Consultations']
        },
        {
            id: 4,
            name: 'Dr. James Wilson',
            title: 'Prevention Specialist',
            specialization: 'Youth Prevention',
            image: Image,
            rating: 4.7,
            experience: '8+ years',
            nextAvailable: 'Tomorrow 2:00 PM',
            price: 'Free Consultation',
            meetingLink: 'https://meet.google.com/ghi-jkl-mno',
            description: 'Focuses on youth prevention programs and early intervention strategies for adolescents.',
            qualifications: ['MS Public Health', 'Youth Specialist', '250+ Sessions']
        }
    ];

    const specializations = [
        { value: 'all', label: 'All Specializations' },
        { value: 'Addiction Medicine', label: 'Addiction Medicine' },
        { value: 'Community Outreach', label: 'Community Outreach' },
        { value: 'Counseling & Therapy', label: 'Counseling & Therapy' },
        { value: 'Youth Prevention', label: 'Youth Prevention' }
    ];

    const timeSlots = [
        { value: 'all', label: 'Any Time' },
        { value: 'today', label: 'Available Today' },
        { value: 'tomorrow', label: 'Available Tomorrow' },
        { value: 'week', label: 'This Week' }
    ];

    const filteredConsultants = consultants.filter(consultant => {
        const specializationMatch = selectedSpecialization === 'all' || consultant.specialization === selectedSpecialization;
        const timeMatch = selectedTimeSlot === 'all' || 
            (selectedTimeSlot === 'today' && consultant.nextAvailable.includes('Today')) ||
            (selectedTimeSlot === 'tomorrow' && consultant.nextAvailable.includes('Tomorrow'));
        return specializationMatch && timeMatch;
    });

    return (
        <div className="booking-page">
            {/* Hero Section */}
            <section className="booking-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12 text-center">
                            <h1 className="hero-title">
                                Book a Consultation
                            </h1>
                            <p className="hero-subtitle">
                                Connect with our experienced specialists for personalized guidance and support. 
                                All consultations are free and completely confidential.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{paddingTop: '5rem', paddingBottom: '5rem'}}>
                {/* Filter Section */}
                <section className="filter-section mb-5">
                    <div className="section-header text-center mb-4">
                        <h2 className="section-title">Find Your Specialist</h2>
                        <p className="section-subtitle">Filter by specialization and availability to find the right consultant for you</p>
                    </div>
                    
                    <div className="filter-controls">
                        <div className="row justify-content-center">
                            <div className="col-lg-4 col-md-6 mb-3">
                                <label className="filter-label">Specialization</label>
                                <select 
                                    className="form-select filter-select"
                                    value={selectedSpecialization}
                                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                                >
                                    {specializations.map(spec => (
                                        <option key={spec.value} value={spec.value}>{spec.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-3">
                                <label className="filter-label">Availability</label>
                                <select 
                                    className="form-select filter-select"
                                    value={selectedTimeSlot}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                >
                                    {timeSlots.map(slot => (
                                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Consultants Grid */}
                <section className="consultants-section mb-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Our Specialists</h2>
                        <p className="section-subtitle">
                            {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    
                    <div className="row">
                        {filteredConsultants.map((consultant) => (
                            <div key={consultant.id} className="col-lg-6 col-md-6 mb-4">
                                <div className="consultant-card">
                                    <div className="consultant-header">
                                        <div className="consultant-image">
                                            <img src={consultant.image} alt={consultant.name} className="img-fluid" />
                                            <div className="rating-badge">
                                                <i className="bi bi-star-fill"></i>
                                                {consultant.rating}
                                            </div>
                                        </div>
                                        <div className="consultant-info">
                                            <h4 className="consultant-name">{consultant.name}</h4>
                                            <p className="consultant-title">{consultant.title}</p>
                                            <p className="consultant-specialization">
                                                <i className="bi bi-award me-2"></i>
                                                {consultant.specialization}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="consultant-body">
                                        <p className="consultant-description">{consultant.description}</p>
                                        
                                        <div className="consultant-qualifications">
                                            {consultant.qualifications.map((qual, index) => (
                                                <span key={index} className="qualification-badge">
                                                    {qual}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className="consultant-details">
                                            <div className="detail-item">
                                                <i className="bi bi-clock me-2"></i>
                                                <span>Experience: {consultant.experience}</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="bi bi-calendar-check me-2"></i>
                                                <span>Next Available: {consultant.nextAvailable}</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="bi bi-currency-dollar me-2"></i>
                                                <span>{consultant.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="consultant-footer">
                                        <a 
                                            href={consultant.meetingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-primary btn-book"
                                        >
                                            <i className="bi bi-camera-video me-2"></i>
                                            Book Consultation
                                        </a>
                                        <Link 
                                            to={`/consultant/${consultant.id}`} 
                                            className="btn btn-outline-primary"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredConsultants.length === 0 && (
                        <div className="no-results">
                            <div className="text-center">
                                <i className="bi bi-search display-4 text-muted mb-3"></i>
                                <h4>No consultants found</h4>
                                <p className="text-muted">Try adjusting your filters to see more options.</p>
                                <button 
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                        setSelectedSpecialization('all');
                                        setSelectedTimeSlot('all');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Information Section */}
                <section className="info-section">
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="info-card">
                                <h3 className="info-title">
                                    <i className="bi bi-shield-heart me-2"></i>
                                    How It Works
                                </h3>
                                <div className="row">
                                    <div className="col-md-4 text-center mb-3">
                                        <div className="step-icon">
                                            <i className="bi bi-1-circle-fill"></i>
                                        </div>
                                        <h5>Choose Specialist</h5>
                                        <p>Select a consultant based on their specialization and availability.</p>
                                    </div>
                                    <div className="col-md-4 text-center mb-3">
                                        <div className="step-icon">
                                            <i className="bi bi-2-circle-fill"></i>
                                        </div>
                                        <h5>Book Session</h5>
                                        <p>Click the meeting link to join your consultation at the scheduled time.</p>
                                    </div>
                                    <div className="col-md-4 text-center mb-3">
                                        <div className="step-icon">
                                            <i className="bi bi-3-circle-fill"></i>
                                        </div>
                                        <h5>Get Support</h5>
                                        <p>Receive personalized guidance and support from our experienced professionals.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BookingPage;