/**
 * BookingSession Controller using TypeORM
 * CRUD operations for Booking_Session table
 */
const AppDataSource = require('../src/data-source');
const BookingSession = require('../src/entities/BookingSession');

class BookingSessionController {
    /**
     * Get all booking sessions
     */
    static async getAllBookingSessions(req, res) {
        try {
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository.find();

            res.status(200).json({
                success: true,
                data: bookings,
                message: 'Booking sessions retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting booking sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking sessions',
                error: error.message
            });
        }
    }

    /**
     * Get booking session by ID
     */
    static async getBookingSessionById(req, res) {
        try {
            const { id } = req.params;
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const booking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking session not found'
                });
            }

            res.status(200).json({
                success: true,
                data: booking,
                message: 'Booking session retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking session',
                error: error.message
            });
        }
    }

    /**
     * Get booking sessions by consultant ID
     */
    static async getBookingSessionsByConsultant(req, res) {
        try {
            const { consultantId } = req.params;
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository.find({
                where: { consultant_id: parseInt(consultantId) },
            });

            res.status(200).json({
                success: true,
                data: bookings,
                message: 'Booking sessions retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting booking sessions by consultant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking sessions',
                error: error.message
            });
        }
    }

    /**
     * Get booking sessions by member ID
     */
    static async getBookingSessionsByMember(req, res) {
        try {
            const { memberId } = req.params;
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository.find({
                where: { member_id: parseInt(memberId) },
            });

            res.status(200).json({
                success: true,
                data: bookings,
                message: 'Booking sessions retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting booking sessions by member:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking sessions',
                error: error.message
            });
        }
    }

    /**
     * Create new booking session
     */
    static async createBookingSession(req, res) {
        try {
            const { consultant_id, member_id, slot_id, booking_date, status, notes } = req.body;

            // Validate required fields
            if (!booking_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required field: booking_date'
                });
            }

            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Create new booking session
            const newBooking = bookingRepository.create({
                consultant_id: consultant_id ? parseInt(consultant_id) : null,
                member_id: member_id ? parseInt(member_id) : null,
                slot_id: slot_id ? parseInt(slot_id) : null,
                booking_date,
                status: status || 'pending',
                notes
            });

            const savedBooking = await bookingRepository.save(newBooking);

            // Fetch the complete booking with relations
            const completeBooking = await bookingRepository.findOne({
                where: { booking_id: savedBooking.booking_id },
            });

            res.status(201).json({
                success: true,
                data: completeBooking,
                message: 'Booking session created successfully'
            });
        } catch (error) {
            console.error('Error creating booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create booking session',
                error: error.message
            });
        }
    }

    /**
     * Update booking session
     */
    static async updateBookingSession(req, res) {
        try {
            const { id } = req.params;
            const { consultant_id, member_id, slot_id, booking_date, status, notes } = req.body;

            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Check if booking exists
            const booking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking session not found'
                });
            }

            // Update booking session
            await bookingRepository.update(parseInt(id), {
                consultant_id: consultant_id !== undefined ? parseInt(consultant_id) : booking.consultant_id,
                member_id: member_id !== undefined ? parseInt(member_id) : booking.member_id,
                slot_id: slot_id !== undefined ? parseInt(slot_id) : booking.slot_id,
                booking_date: booking_date || booking.booking_date,
                status: status || booking.status,
                notes: notes !== undefined ? notes : booking.notes
            });

            // Fetch updated booking with relations
            const updatedBooking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            res.status(200).json({
                success: true,
                data: updatedBooking,
                message: 'Booking session updated successfully'
            });
        } catch (error) {
            console.error('Error updating booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update booking session',
                error: error.message
            });
        }
    }

    /**
     * Delete booking session
     */
    static async deleteBookingSession(req, res) {
        try {
            const { id } = req.params;
            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Check if booking exists
            const booking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking session not found'
                });
            }

            await bookingRepository.delete(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Booking session deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete booking session',
                error: error.message
            });
        }
    }

    /**
     * Get booking sessions by status
     */
    static async getBookingSessionsByStatus(req, res) {
        try {
            const { status } = req.params;
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository.find({
                where: { status }
            });

            res.status(200).json({
                success: true,
                data: bookings,
                message: 'Booking sessions retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting booking sessions by status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking sessions',
                error: error.message
            });
        }
    }

    /**
     * Get booking sessions by date range
     */
    static async getBookingSessionsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Both startDate and endDate are required'
                });
            }

            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository.createQueryBuilder('booking')
                .leftJoinAndSelect('booking.consultant', 'consultant')
                .leftJoinAndSelect('booking.member', 'member')
                .leftJoinAndSelect('booking.slot', 'slot')
                .where('booking.booking_date >= :startDate', { startDate })
                .andWhere('booking.booking_date <= :endDate', { endDate })
                .orderBy('booking.booking_date', 'ASC')
                .getMany();

            res.status(200).json({
                success: true,
                data: bookings,
                message: 'Booking sessions retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting booking sessions by date range:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking sessions',
                error: error.message
            });
        }
    }
}

module.exports = BookingSessionController;
