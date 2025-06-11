import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/BookingPage.scss';
import Image from '../images/Images.jpg';

const BookingPage = () => {
    const [selectedSpecialization, setSelectedSpecialization] = useState('all');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [consultants, setConsultants] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState(null);

    // Database slots based on sample.sql (9 AM - 5 PM hourly)
    const databaseSlots = [
        { slot_id: 1, start_time: '09:00:00', end_time: '10:00:00' },
        { slot_id: 2, start_time: '10:00:00', end_time: '11:00:00' },
        { slot_id: 3, start_time: '11:00:00', end_time: '12:00:00' },
        { slot_id: 4, start_time: '12:00:00', end_time: '13:00:00' },
        { slot_id: 5, start_time: '13:00:00', end_time: '14:00:00' },
        { slot_id: 6, start_time: '14:00:00', end_time: '15:00:00' },
        { slot_id: 7, start_time: '15:00:00', end_time: '16:00:00' },
        { slot_id: 8, start_time: '16:00:00', end_time: '17:00:00' }
    ];

    // API call function to get all consultants
    const fetchAllConsultants = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/consultants', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch consultants');
            }

            return data.data.consultants;
        } catch (error) {
            throw error;
        }
    };

    // Transform API data to component format based on actual database structure
    const transformConsultantsArray = (apiConsultants) => {
        if (!apiConsultants || !Array.isArray(apiConsultants)) return [];
        
        return apiConsultants.map(apiConsultant => {
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
                    name: apiConsultant.name || 'N/A',
                    job: apiConsultant.job || 'N/A',
                    date_of_birth: apiConsultant.dateOfBirth || 'N/A',
                    bio_json: 'N/A' // Will be fetched separately if needed
                }
            };
        });
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

    // Format time from API time format
    const formatTime = (timeString) => {
        if (!timeString) return '12:00 PM';
        
        try {
            const time = new Date(`2000-01-01T${timeString}`);
            return time.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        } catch (error) {
            return timeString; // Return original if parsing fails
        }
    };

    // Create booking data structure based on database schema
    const createBookingData = (consultantId, slotId, selectedDate) => {
        return {
            consultant_id: consultantId,
            member_id: null, // Will be set when user authentication is implemented
            slot_id: slotId,
            booking_date: selectedDate,
            status: 'pending',
            notes: 'Consultation booking via web app'
        };
    };

    // Load consultants data from API
    useEffect(() => {
        const loadConsultants = async () => {
            try {
                setLoading(true);
                const apiConsultants = await fetchAllConsultants();
                const transformedConsultants = transformConsultantsArray(apiConsultants);
                setConsultants(transformedConsultants);
                setSlots(databaseSlots); // Use database-based slots from sample.sql
            } catch (error) {
                console.error('Error loading consultants:', error);
                setConsultants([]); // Fallback to empty array
                setSlots(databaseSlots);
            } finally {
                setLoading(false);
            }
        };

        loadConsultants();
    }, []);

    const bookConsultation = (consultantId, slotId) => {
        // Check authentication status (placeholder until auth system is implemented)
        const isLoggedIn = localStorage.getItem('authToken') || false;
        
        if (!isLoggedIn) {
            alert('Please login to book a consultation');
            return;
        }

        if (!selectedDate) {
            alert('Please select a date for your consultation');
            return;
        }

        // Find consultant and slot data
        const consultant = consultants.find(c => c.id_consultant === consultantId);
        const slot = slots.find(s => s.slot_id === slotId);
        
        if (consultant && slot) {
            const consultantName = consultant.profile?.name !== 'N/A' ? consultant.profile?.name : 'Consultant';
            setBookingStatus({ 
                type: 'success', 
                message: `Consultation request submitted for ${consultantName} on ${selectedDate} at ${formatTime(slot.start_time)}. Status: Pending approval.` 
            });
            
            // Create booking data structure for future API implementation
            const bookingData = createBookingData(consultantId, slotId, selectedDate);
            console.log('Booking data prepared:', bookingData);
        } else {
            setBookingStatus({ 
                type: 'error', 
                message: 'Failed to submit consultation request. Please try again.' 
            });
        }
    };

    const specializations = [
        { value: 'all', label: 'All Specializations' },
        { value: 'Prevention Specialist', label: 'Prevention Specialist' },
        { value: 'Counseling & Therapy', label: 'Counseling & Therapy' },
        { value: 'Community Outreach', label: 'Community Outreach' },
        { value: 'Clinical Psychology', label: 'Clinical Psychology' },
        { value: 'Rehabilitation', label: 'Rehabilitation' }
    ];

    const timeSlots = [
        { value: 'all', label: 'Any Time' },
        { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
        { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' }
    ];

    const filteredConsultants = consultants.filter(consultant => {
        const specialization = getSpecializationFromBios(consultant.bios);
        const specializationMatch = selectedSpecialization === 'all' || specialization === selectedSpecialization;
        
        // Time slot filtering based on database slots (9 AM - 5 PM)
        let timeMatch = true;
        if (selectedTimeSlot === 'morning') {
            timeMatch = slots.some(slot => {
                const hour = parseInt(slot.start_time.split(':')[0]);
                return hour >= 9 && hour < 12;
            });
        } else if (selectedTimeSlot === 'afternoon') {
            timeMatch = slots.some(slot => {
                const hour = parseInt(slot.start_time.split(':')[0]);
                return hour >= 12 && hour < 17;
            });
        }
        
        return specializationMatch && timeMatch;
    });

    if (loading) {
        return (
            <div className="booking-page">
                <div className="container text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading consultants...</p>
                </div>
            </div>
        );
    }

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
                {/* Booking Status Alert */}
                {bookingStatus && (
                    <div className={`alert alert-${bookingStatus.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                        {bookingStatus.message}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setBookingStatus(null)}
                        ></button>
                    </div>
                )}

                {/* Filter Section */}
                <section className="filter-section mb-5">
                    <div className="section-header text-center mb-4">
                        <h2 className="section-title">Find Your Specialist</h2>
                        <p className="section-subtitle">Filter by specialization and availability to find the right consultant for you</p>
                    </div>
                    
                    <div className="filter-controls">
                        <div className="row justify-content-center">
                            <div className="col-lg-3 col-md-6 mb-3">
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
                            <div className="col-lg-3 col-md-6 mb-3">
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
                            <div className="col-lg-3 col-md-6 mb-3">
                                <label className="filter-label">Select Date</label>
                                <input 
                                    type="date" 
                                    className="form-control filter-select"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
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
                            <div key={consultant.id_consultant} className="col-lg-6 col-md-6 mb-4">
                                <div className="consultant-card">
                                    <div className="consultant-header">
                                        <div className="consultant-image">
                                            <img src={Image} alt={consultant.profile?.name !== 'N/A' ? consultant.profile?.name : 'Consultant'} className="img-fluid" />
                                        </div>
                                        <div className="consultant-info">
                                            <h4 className="consultant-name">{consultant.profile?.name !== 'N/A' ? consultant.profile?.name : 'N/A'}</h4>
                                            <p className="consultant-title">{consultant.profile?.job !== 'N/A' ? consultant.profile?.job : 'N/A'}</p>
                                            <p className="consultant-specialization">
                                                <i className="bi bi-award me-2"></i>
                                                {getSpecializationFromBios(consultant.bios)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="consultant-body">
                                        <p className="consultant-description">
                                            {consultant.bios !== 'N/A' ? consultant.bios : 'No biography available'}
                                        </p>
                                        
                                        <div className="consultant-qualifications">
                                            {consultant.certification !== 'N/A' && (
                                                <span className="qualification-badge">
                                                    {consultant.certification}
                                                </span>
                                            )}
                                            <span className="qualification-badge">
                                                Licensed Professional
                                            </span>
                                        </div>
                                        
                                        <div className="consultant-details">
                                            <div className="detail-item">
                                                <i className="bi bi-currency-dollar me-2"></i>
                                                <span>{consultant.cost !== 'N/A' ? `$${consultant.cost} per session` : 'Price N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Available Time Slots */}
                                        <div className="available-slots mt-3">
                                            <h6><i className="bi bi-clock me-2"></i>Available Time Slots:</h6>
                                            
                                            {/* Morning Slots */}
                                            {slots.filter(slot => {
                                                const hour = parseInt(slot.start_time.split(':')[0]);
                                                return hour >= 9 && hour < 12;
                                            }).length > 0 && (
                                                <div className="slot-group mb-2">
                                                    <small className="slot-group-label">Morning</small>
                                                    <div className="slots-grid">
                                                        {slots
                                                            .filter(slot => {
                                                                const hour = parseInt(slot.start_time.split(':')[0]);
                                                                return hour >= 9 && hour < 12;
                                                            })
                                                            .map((slot) => (
                                                                <button
                                                                    key={slot.slot_id}
                                                                    className="btn btn-outline-primary btn-sm slot-btn me-2 mb-1"
                                                                    onClick={() => bookConsultation(consultant.id_consultant, slot.slot_id)}
                                                                    disabled={!selectedDate}
                                                                    title={!selectedDate ? "Please select a date first" : `Book ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                                                                >
                                                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Afternoon Slots */}
                                            {slots.filter(slot => {
                                                const hour = parseInt(slot.start_time.split(':')[0]);
                                                return hour >= 12 && hour < 17;
                                            }).length > 0 && (
                                                <div className="slot-group mb-2">
                                                    <small className="slot-group-label">Afternoon</small>
                                                    <div className="slots-grid">
                                                        {slots
                                                            .filter(slot => {
                                                                const hour = parseInt(slot.start_time.split(':')[0]);
                                                                return hour >= 12 && hour < 17;
                                                            })
                                                            .map((slot) => (
                                                                <button
                                                                    key={slot.slot_id}
                                                                    className="btn btn-outline-warning btn-sm slot-btn me-2 mb-1"
                                                                    onClick={() => bookConsultation(consultant.id_consultant, slot.slot_id)}
                                                                    disabled={!selectedDate}
                                                                    title={!selectedDate ? "Please select a date first" : `Book ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                                                                >
                                                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}



                                            {!selectedDate && (
                                                <small className="text-muted">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Please select a date above to book a time slot
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="consultant-footer">
                                        <Link 
                                            to={`/consultant/${consultant.id_consultant}`} 
                                            className="btn btn-outline-primary"
                                        >
                                            <i className="bi bi-person me-2"></i>
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
                                        <p>Select a time slot and submit your consultation request for approval.</p>
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