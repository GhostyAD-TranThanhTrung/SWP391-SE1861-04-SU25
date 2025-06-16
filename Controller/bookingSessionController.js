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
            const memberId = req.user.userId;

            const bookingQuery = `
                SELECT 
                    b.booking_id,
                    b.consultant_id,
                    b.member_id,
                    b.slot_id,
                    b.booking_date,
                    b.status,
                    b.notes,
                    c.id_consultant,
                    cu.email,
                    s.start_time,
                    s.end_time,
                    cs.day_of_week
                FROM Booking_Session b
                LEFT JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN [Users] cu ON c.user_id = cu.user_id
                LEFT JOIN Slot s ON b.slot_id = s.slot_id
                LEFT JOIN Consultant_Slot cs ON (b.consultant_id = cs.consultant_id AND b.slot_id = cs.slot_id)
                WHERE b.member_id = @0
            `;

            console.log('Member bookings query:', bookingQuery);
            console.log('Member bookings parameters:', [memberId]);

            const bookings = await AppDataSource.query(
                bookingQuery,
                [parseInt(memberId)]
            );

            // Check if no booking sessions exist
            if (!bookings || bookings.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
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
                data: [],
                count: 0,
                message: error.message || 'Failed to retrieve booking sessions'
            });
        }
    }

    /**
     * Create new booking session
     */
    static async createBookingSession(req, res) {
        try {
            console.log('Request body:', req.body);
            const { consultant_id, slot_id, booking_date } = req.body;
            const member_id = req.user.userId;

            console.log('Parsed input data:', {
                consultant_id,
                slot_id,
                booking_date,
                member_id
            });

            // Validate all required fields
            if (!consultant_id || !slot_id || !booking_date) {
                console.log('Missing required fields');
                return res.status(400).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Missing required fields: consultant_id, slot_id, and booking_date are required'
                });
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(booking_date)) {
                console.log('Invalid date format:', booking_date);
                return res.status(400).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Check if booking already exists
            console.log('Checking for existing booking with params:', {
                consultant_id: parseInt(consultant_id),
                slot_id: parseInt(slot_id),
                booking_date
            });

            const existingBookingQuery = `
                SELECT booking_id, consultant_id, member_id, slot_id, booking_date, status, notes
                FROM Booking_Session
                WHERE consultant_id = @0
                AND slot_id = @1
                AND booking_date = @2
                AND status = @3
            `;

            console.log('Existing booking check - SQL Query:', existingBookingQuery);
            console.log('Existing booking check - Parameters:', [
                parseInt(consultant_id),
                parseInt(slot_id),
                booking_date,
                'scheduled'
            ]);

            const [existingBooking] = await AppDataSource.query(
                existingBookingQuery,
                [parseInt(consultant_id), parseInt(slot_id), booking_date, 'scheduled']
            );

            if (existingBooking) {
                console.log('Found existing booking:', existingBooking);
                return res.status(409).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'This time slot is already booked'
                });
            }

            // Create new booking session
            console.log('Creating new booking with data:', {
                consultant_id: parseInt(consultant_id),
                member_id: parseInt(member_id),
                slot_id: parseInt(slot_id),
                booking_date,
                status: 'scheduled'
            });

            const insertBookingQuery = `
                INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes)
                OUTPUT INSERTED.*
                VALUES (@0, @1, @2, CAST(@3 AS DATE), @4, @5)
            `;

            console.log('Insert booking - SQL Query:', insertBookingQuery);
            console.log('Insert booking - Parameters:', [
                parseInt(consultant_id),
                parseInt(member_id),
                parseInt(slot_id),
                booking_date,
                'scheduled',
                null
            ]);

            const [savedBooking] = await AppDataSource.query(
                insertBookingQuery,
                [parseInt(consultant_id), parseInt(member_id), parseInt(slot_id), booking_date, 'scheduled', null]
            );

            console.log('Saved new booking:', savedBooking);

            // Fetch complete booking
            console.log('Fetching complete booking details for ID:', savedBooking.booking_id);
            const completeBookingQuery = `
                SELECT 
                    b.booking_id,
                    b.consultant_id,
                    b.member_id,
                    b.slot_id,
                    b.booking_date,
                    b.status,
                    b.notes,
                    c.id_consultant,
                    cu.email,
                    s.start_time,
                    s.end_time
                FROM Booking_Session b
                LEFT JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN [Users] cu ON c.user_id = cu.user_id
                LEFT JOIN Slot s ON b.slot_id = s.slot_id
                WHERE b.booking_id = @0
            `;

            console.log('Complete booking fetch - SQL Query:', completeBookingQuery);
            console.log('Complete booking fetch - Parameters:', [savedBooking.booking_id]);

            const [completeBooking] = await AppDataSource.query(
                completeBookingQuery,
                [savedBooking.booking_id]
            );

            console.log('Complete booking data:', completeBooking);

            // Get day of week using raw SQL
            console.log('Fetching day of week for consultant_id:', consultant_id, 'slot_id:', slot_id);
            const dayOfWeekQuery = `
                SELECT day_of_week 
                FROM Consultant_Slot 
                WHERE consultant_id = @0 AND slot_id = @1
            `;
            console.log('Day of week - Raw SQL Query:', dayOfWeekQuery);
            console.log('Day of week - Parameters:', [parseInt(consultant_id), parseInt(slot_id)]);

            const [dayOfWeekResult] = await AppDataSource.query(
                dayOfWeekQuery,
                [parseInt(consultant_id), parseInt(slot_id)]
            );
            console.log('Day of week result:', dayOfWeekResult);

            const responseData = {
                ...completeBooking,
                day_of_week: dayOfWeekResult ? dayOfWeekResult.day_of_week : null
            };
            console.log('Final response data:', responseData);

            res.status(201).json({
                success: true,
                data: [responseData],
                count: 1,
                message: 'Booking session created successfully'
            });
        } catch (error) {
            console.error('Detailed error in createBookingSession:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            res.status(500).json({
                success: false,
                data: [],
                count: 0,
                message: error.message || 'Failed to create booking session'
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
