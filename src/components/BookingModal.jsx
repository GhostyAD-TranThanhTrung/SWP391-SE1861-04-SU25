import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/BookingModal.scss';

const BookingModal = ({ isOpen, onClose, consultantId }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get day of week in English for database comparison
    const getEnglishDayOfWeek = (date) => {
        if (!date) return '';
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    // Get day of week in Vietnamese for display
    const getVietnameseDayOfWeek = (date) => {
        if (!date) return '';
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return days[date.getDay()];
    };

    // Get session token
    const getSessionToken = () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            // You might want to redirect to login page here
            return null;
        }
        return token;
    };

    // Fetch available slots for consultant
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!isOpen || !consultantId) return;

            const token = getSessionToken();
            if (!token) return;

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/consultant-slots/${consultantId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.status === 401) {
                    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    // You might want to redirect to login page here
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch available slots');
                }

                const data = await response.json();
                setAvailableSlots(data.data || []);
            } catch (error) {
                console.error('Error fetching slots:', error);
                alert('Không thể tải khung giờ. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [isOpen, consultantId]);

    // Filter slots for the selected day of week (using English day names for comparison)
    const filteredSlots = selectedDate ? availableSlots.filter(slot =>
        slot.day_of_week === getEnglishDayOfWeek(selectedDate)
    ) : [];

    // Remove duplicate time slots
    const uniqueSlots = filteredSlots.filter(
        (slot, index, self) =>
            index === self.findIndex(
                (s) => s.start_time === slot.start_time && s.end_time === slot.end_time
            )
    );

    // Handle booking
    const handleBooking = async () => {
        if (!selectedSlot || !selectedDate) {
            alert('Vui lòng chọn ngày và khung giờ tư vấn');
            return;
        }

        const token = getSessionToken();
        if (!token) return;

        try {
            setLoading(true);
            console.log('Sending booking request with data:', {
                consultant_id: consultantId,
                slot_id: selectedSlot.slot_id,
                booking_date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
            });

            const response = await fetch('http://localhost:3000/api/booking-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    consultant_id: consultantId,
                    slot_id: selectedSlot.slot_id,
                    booking_date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                }),
            });

            console.log('Booking API Response Status:', response.status);
            console.log('Booking API Response Status Text:', response.statusText);

            const result = await response.json();
            console.log('Booking API Response Data:', result);

            if (response.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                return;
            }

            if (response.status === 409) {
                alert('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.');
                return;
            }

            if (!response.ok) {
                throw new Error(result.message || 'Không thể đặt lịch');
            }

            if (result.success) {
                alert('Đặt lịch thành công!');
                onClose(true);
            } else {
                throw new Error(result.message || 'Không thể đặt lịch');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert(error.message || 'Không thể đặt lịch. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="booking-modal-overlay">
            <div className="booking-modal">
                <div className="modal-header">
                    <h2>Đặt Lịch Tư Vấn</h2>
                    <button className="close-button" onClick={() => onClose(false)}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="date-picker-section">
                        <label>Chọn Ngày:</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                            }}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày tư vấn"
                            className="form-control"
                        />
                        {selectedDate && (
                            <p className="selected-day">
                                Ngày đã chọn: {getVietnameseDayOfWeek(selectedDate)}
                            </p>
                        )}
                    </div>

                    {selectedDate && (
                        <div className="slots-section">
                            <label>Khung Giờ Khả Dụng:</label>
                            {loading ? (
                                <div className="loading-slots">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </div>
                            ) : uniqueSlots.length > 0 ? (
                                <div className="slots-grid">
                                    {uniqueSlots.map((slot) => (
                                        <button
                                            key={slot.slot_id}
                                            className={`slot-button ${selectedSlot?.slot_id === slot.slot_id ? 'selected' : ''}`}
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-slots">Không có khung giờ khả dụng cho {getVietnameseDayOfWeek(selectedDate)}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={() => onClose(false)}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleBooking}
                        disabled={!selectedSlot || loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            'Xác Nhận Đặt Lịch'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal; 