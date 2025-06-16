import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/BookingModal.scss';

const BookingModal = ({ isOpen, onClose, consultantId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách slot có sẵn cho consultant
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!isOpen || !consultantId) return;

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/consultant-slots/${consultantId}?date=${selectedDate.toISOString().split('T')[0]}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch available slots');
                }

                const data = await response.json();
                setAvailableSlots(data.data || []);
            } catch (error) {
                console.error('Error fetching slots:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [isOpen, consultantId, selectedDate]);

    // Lọc slot trùng giờ, chỉ giữ lại mỗi khung giờ một lần
    const uniqueSlots = availableSlots.filter(
        (slot, index, self) =>
            index === self.findIndex(
                (s) => s.start_time === slot.start_time && s.end_time === slot.end_time
            )
    );

    // Xử lý đặt lịch
    const handleBooking = async () => {
        if (!selectedSlot) return;

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    consultant_id: consultantId,
                    slot_id: selectedSlot.slot_id,
                    booking_date: selectedDate.toISOString().split('T')[0],
                    status: 'scheduled'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create booking');
            }

            onClose(true); // Đóng modal và thông báo thành công
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="booking-modal-overlay">
            <div className="booking-modal">
                <div className="modal-header">
                    <h2>Đặt lịch tư vấn</h2>
                    <button className="close-button" onClick={() => onClose(false)}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="date-picker-section">
                        <label>Chọn ngày:</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                            }}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                        />
                    </div>

                    <div className="slots-section">
                        <label>Chọn giờ:</label>
                        {loading ? (
                            <div className="loading-slots">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
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
                                        {slot.start_time} - {slot.end_time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="no-slots">Không có slot nào khả dụng cho ngày này</p>
                        )}
                    </div>
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
                            'Xác nhận đặt lịch'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal; 