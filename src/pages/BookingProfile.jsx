import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BookingProfile.scss';
import Image from '../images/Images.jpg';

const BookingProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [consultant, setConsultant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API call function to get consultant by ID
    const fetchConsultant = async (consultantId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/consultants/${consultantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch consultant');
            }

            return data.data;
        } catch (error) {
            throw error;
        }
    };

    // Transform API data to component format based on actual database structure
    const transformConsultantData = (apiConsultant) => {
        if (!apiConsultant) return null;

        return {
            id_consultant: apiConsultant.id || 'N/A',
            user_id: apiConsultant.userId || 'N/A',
            cost: apiConsultant.cost || 'N/A',
            certification: apiConsultant.certification || 'N/A',
            bios: apiConsultant.bios || 'N/A',
            user: {
                user_id: apiConsultant.userId || 'N/A',
                role: apiConsultant.role || 'N/A',
                email: apiConsultant.email || 'N/A',
                status: apiConsultant.status || 'N/A'
            },
            profile: {
                name: 'N/A', // Will be fetched separately if needed
                job: 'N/A',  // Will be fetched separately if needed
                date_of_birth: 'N/A', // Will be fetched separately if needed
                bio_json: 'N/A' // Will be fetched separately if needed
            }
        };
    };

    // Get specialization from bios text based on actual data
    const getSpecializationFromBios = (bios) => {
        if (!bios || bios === 'N/A') return 'N/A';

        const lowerBios = bios.toLowerCase();
        if (lowerBios.includes('prevention')) return 'Prevention Specialist';
        if (lowerBios.includes('counselor') || lowerBios.includes('therapy')) return 'Counseling & Therapy';
        if (lowerBios.includes('community')) return 'Community Outreach';
        if (lowerBios.includes('clinical') || lowerBios.includes('psychologist')) return 'Clinical Psychology';
        if (lowerBios.includes('rehab') || lowerBios.includes('recovery')) return 'Rehabilitation';
        return 'General Consultation';
    };

    // Load consultant data on component mount
    useEffect(() => {
        const loadConsultant = async () => {
            try {
                setLoading(true);
                const apiConsultant = await fetchConsultant(id);
                const transformedConsultant = transformConsultantData(apiConsultant);
                setConsultant(transformedConsultant);
                setError(null);
            } catch (err) {
                setError(err.message);
                setConsultant(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadConsultant();
        }
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="profile-error">
                <div className="container">
                    <div className="error-content">
                        <div className="error-icon">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <h2>Loading Consultant Profile</h2>
                        <p>Please wait while we fetch the consultant information...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error or consultant not found
    if (error || !consultant) {
        return (
            <div className="profile-error">
                <div className="container">
                    <div className="error-content">
                        <div className="error-icon">
                            <i className="bi bi-person-x"></i>
                        </div>
                        <h2>Consultant Not Found</h2>
                        <p>{error || 'The consultant you\'re looking for doesn\'t exist or may have been removed.'}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/booking')}>
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to Booking
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const specialization = getSpecializationFromBios(consultant.bios);
    const qualifications = [
        consultant.certification !== 'N/A' ? consultant.certification : null,
        'Licensed Professional',
        'Drug Prevention Specialist'
    ].filter(Boolean);

    return (
        <div className="booking-profile-v2">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="consultant-intro">
                            <div className="consultant-image-wrapper">
                                <img
                                    src={Image}
                                    alt={consultant.profile?.name !== 'N/A' ? consultant.profile?.name : 'Consultant'}
                                    className="consultant-avatar"
                                />
                                <div className="status-indicator online"></div>
                            </div>
                            <div className="consultant-info">
                                <h1 className="consultant-name">{consultant.profile?.name !== 'N/A' ? consultant.profile?.name : 'N/A'}</h1>
                                <p className="consultant-title">{consultant.profile?.job !== 'N/A' ? consultant.profile?.job : 'N/A'}</p>
                                <div className="consultant-meta">
                                    <div className="specialization-tag">
                                        <i className="bi bi-shield-check"></i>
                                        {specialization}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hero-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                disabled
                                title="Consultation link not available"
                            >
                                <i className="bi bi-camera-video me-2"></i>
                                Start Consultation
                            </button>
                            <button
                                className="btn btn-outline-light btn-lg"
                                onClick={() => navigate('/booking')}
                            >
                                <i className="bi bi-calendar-check me-2"></i>
                                Book Session
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="profile-navigation">
                <div className="container">
                    <div className="nav-tabs-wrapper">
                        <button
                            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <i className="bi bi-person-badge"></i>
                            Overview
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'experience' ? 'active' : ''}`}
                            onClick={() => setActiveTab('experience')}
                        >
                            <i className="bi bi-award"></i>
                            Experience
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            <i className="bi bi-heart-pulse"></i>
                            Services
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <i className="bi bi-telephone"></i>
                            Contact
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="profile-content">
                <div className="container">
                    {activeTab === 'overview' && (
                        <div className="tab-content overview-content">
                            <div className="row g-4">
                                <div className="col-lg-8">
                                    <div className="content-card about-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-person-heart"></i> About {consultant.profile?.name !== 'N/A' ? consultant.profile?.name : 'Consultant'}</h3>
                                        </div>
                                        <div className="card-body">
                                            <p className="bio-text">{consultant.bios !== 'N/A' ? consultant.bios : 'No biography available'}</p>
                                            <div className="key-stats">
                                                <div className="stat-item">
                                                    <div className="stat-value">{consultant.cost !== 'N/A' ? `$${consultant.cost}` : 'N/A'}</div>
                                                    <div className="stat-label">Per Session</div>
                                                </div>
                                                <div className="stat-item">
                                                    <div className="stat-value">{consultant.user?.status !== 'N/A' ? consultant.user?.status : 'N/A'}</div>
                                                    <div className="stat-label">Status</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="content-card quick-info">
                                        <div className="card-header">
                                            <h3><i className="bi bi-info-circle"></i> Quick Info</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="info-list">
                                                <div className="info-item">
                                                    <span className="info-label">Specialization</span>
                                                    <span className="info-value">{specialization}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Role</span>
                                                    <span className="info-value">{consultant.user?.role !== 'N/A' ? consultant.user?.role : 'N/A'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Session Cost</span>
                                                    <span className="info-value">{consultant.cost !== 'N/A' ? `$${consultant.cost}` : 'N/A'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Email</span>
                                                    <span className="info-value">{consultant.user?.email !== 'N/A' ? consultant.user?.email : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="tab-content experience-content">
                            <div className="row g-4">
                                <div className="col-12">
                                    <div className="content-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-trophy"></i> Certifications</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="certification-list">
                                                <div className="cert-item">
                                                    <div className="cert-icon">
                                                        <i className="bi bi-award-fill"></i>
                                                    </div>
                                                    <div className="cert-details">
                                                        <h4>{consultant.certification !== 'N/A' ? consultant.certification : 'No Certification Listed'}</h4>
                                                        <p>Primary certification in drug prevention and counseling</p>
                                                    </div>
                                                </div>
                                                <div className="cert-item">
                                                    <div className="cert-icon">
                                                        <i className="bi bi-shield-check"></i>
                                                    </div>
                                                    <div className="cert-details">
                                                        <h4>Licensed Professional</h4>
                                                        <p>State licensed to practice counseling and prevention services</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="tab-content services-content">
                            <div className="content-card">
                                <div className="card-header">
                                    <h3><i className="bi bi-heart-pulse"></i> Available Services</h3>
                                </div>
                                <div className="card-body">
                                    <div className="services-grid">
                                        <div className="service-item">
                                            <div className="service-icon">
                                                <i className="bi bi-camera-video"></i>
                                            </div>
                                            <h4>Video Consultations</h4>
                                            <p>One-on-one video sessions for personalized guidance and support</p>
                                            <div className="service-price">{consultant.cost !== 'N/A' ? `$${consultant.cost}/session` : 'Price N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="tab-content contact-content">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="content-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-envelope"></i> Get in Touch</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="contact-methods">
                                                <div className="contact-method">
                                                    <i className="bi bi-envelope-fill"></i>
                                                    <div>
                                                        <strong>Email</strong>
                                                        <p>{consultant.user?.email !== 'N/A' ? consultant.user?.email : 'Email not available'}</p>
                                                    </div>
                                                </div>
                                                <div className="contact-method">
                                                    <i className="bi bi-camera-video-fill"></i>
                                                    <div>
                                                        <strong>Video Call</strong>
                                                        <p>Available for scheduled consultations</p>
                                                    </div>
                                                </div>
                                                <div className="contact-method">
                                                    <i className="bi bi-clock-fill"></i>
                                                    <div>
                                                        <strong>Response Time</strong>
                                                        <p>Usually within 24 hours</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="content-card">
                                        <div className="card-header">
                                            <h3><i className="bi bi-calendar-check"></i> Availability</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="availability-info">
                                                <div className="availability-item">
                                                    <span className="day">Monday - Friday</span>
                                                    <span className="time">9:00 AM - 5:00 PM</span>
                                                </div>
                                                <div className="availability-item">
                                                    <span className="day">Saturday</span>
                                                    <span className="time">10:00 AM - 2:00 PM</span>
                                                </div>
                                                <div className="availability-item">
                                                    <span className="day">Sunday</span>
                                                    <span className="time">Emergency Only</span>
                                                </div>
                                            </div>
                                            <div className="emergency-contact">
                                                <p><strong>Emergency Support:</strong> Available 24/7 for urgent situations</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BookingProfile;