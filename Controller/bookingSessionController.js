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
     * Get booking sessions by authenticated member
     */
    static async getBookingSessionsByMember(req, res) {
        try {
            // Get member ID from the authenticated user token
            const memberId = req.user.id;
            
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.consultant', 'consultant')
                .leftJoinAndSelect('consultant.user', 'user')
                .leftJoinAndSelect('booking.slot', 'slot')
                .leftJoinAndSelect('booking.consultant_slot', 'consultant_slot')
                .where('booking.member_id = :memberId', { memberId })
                .select([
                    'booking',
                    'consultant.id_consultant',
                    'user.fullname',
                    'slot.start_time',
                    'slot.end_time',
                    'consultant_slot.day_of_week'
                ])
                .getMany();

            // Check if no booking sessions exist
            if (!bookings || bookings.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No booking sessions exist for this member'
                });
            }

            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length,
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
            const { consultant_id, slot_id, booking_date } = req.body;

            // Get member ID from token
            const member_id = req.user.id;

            // Validate required fields
            if (!booking_date) {
                return res.status(400).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Missing required field: booking_date'
                });
            }

            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Create new booking session with default scheduled status
            const newBooking = bookingRepository.create({
                consultant_id: consultant_id ? parseInt(consultant_id) : null,
                member_id: member_id,
                slot_id: slot_id ? parseInt(slot_id) : null,
                booking_date,
                status: 'scheduled', // Set default status
                notes: '' // Empty notes by default
            });

            const savedBooking = await bookingRepository.save(newBooking);

            // Fetch the complete booking with relations
            const completeBooking = await bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.consultant', 'consultant')
                .leftJoinAndSelect('consultant.user', 'user')
                .leftJoinAndSelect('booking.slot', 'slot')
                .leftJoinAndSelect('booking.consultant_slot', 'consultant_slot')
                .where('booking.booking_id = :bookingId', { bookingId: savedBooking.booking_id })
                .select([
                    'booking',
                    'consultant.id_consultant',
                    'user.fullname',
                    'slot.start_time',
                    'slot.end_time',
                    'consultant_slot.day_of_week'
                ])
                .getOne();

            res.status(201).json({
                success: true,
                data: [completeBooking], // Wrap in array to match get response structure
                count: 1,
                message: 'Booking session created successfully'
            });
        } catch (error) {
            console.error('Error creating booking session:', error);
            res.status(500).json({
                success: false,
                data: [],
                count: 0,
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

    /**
     * Get scheduled booking sessions for authenticated member
     */
    static async getScheduledBookingSessions(req, res) {
        try {
            const memberId = req.user.id;
            
            const bookingRepository = AppDataSource.getRepository(BookingSession);
            const bookings = await bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.consultant', 'consultant')
                .leftJoinAndSelect('consultant.user', 'user')
                .leftJoinAndSelect('booking.slot', 'slot')
                .leftJoinAndSelect('booking.consultant_slot', 'consultant_slot')
                .where('booking.member_id = :memberId', { memberId })
                .andWhere('booking.status = :status', { status: 'scheduled' })
                .select([
                    'booking',
                    'consultant.id_consultant',
                    'user.fullname',
                    'slot.start_time',
                    'slot.end_time',
                    'consultant_slot.day_of_week'
                ])
                .getMany();

            if (!bookings || bookings.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Booking sessions retrieved successfully'
                });
            }

            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length,
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
}

module.exports = BookingSessionController;
