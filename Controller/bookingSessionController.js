/**
 * BookingSession Controller using TypeORM
 * CRUD operations for Booking_Session table
 */
require('dotenv').config();
const { parse } = require('dotenv');
const AppDataSource = require('../src/data-source');
const BookingSession = require('../src/entities/BookingSession');
const BookingSession = require('../src/entities/BookingSession');
const google = require('googleapis').google;

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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
                message: 'Lấy danh sách lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting booking sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy danh sách lịch hẹn',
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
                    message: 'Không tìm thấy lịch hẹn'
                });
            }

            res.status(200).json({
                success: true,
                data: booking,
                message: 'Lấy thông tin lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy thông tin lịch hẹn',
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
                message: 'Lấy danh sách lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting booking sessions by consultant:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy danh sách lịch hẹn',
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
                    CONVERT(varchar(10), b.booking_date, 120) as booking_date,
                    b.status,
                    b.notes,
                    cs.day_of_week,
                    CONVERT(varchar(8), s.start_time, 108) as start_time,
                    CONVERT(varchar(8), s.end_time, 108) as end_time,
                    p.name as consultant_name
                FROM Booking_Session b
                LEFT JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN [Users] u ON c.user_id = u.user_id
                LEFT JOIN Profile p ON u.user_id = p.user_id
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
                    message: 'Không có lịch hẹn nào cho thành viên này'
                });
            }

            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length,
                message: 'Lấy danh sách lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting booking sessions by member:', error);
            res.status(500).json({
                success: false,
                data: [],
                count: 0,
                message: error.message || 'Không thể lấy danh sách lịch hẹn'
            });
        }
    }

    static async CreateLink(startDate, endDate) {
        if (!startDate) {
            return { error: 'startDate and endDate are required' };
        }


        try {
            const startDateTime = new Date(startDate).toISOString();
            const endDateTime = new Date(endDate).toISOString(); // 30 minutes later
            const event = {
                summary: null,
                description: null,
                start: {
                    dateTime: startDateTime,
                },
                end: {
                    dateTime: endDateTime,
                },
                conferenceData: {
                    createRequest: {
                        requestId: `meet-${Date.now()}`,
                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                    }
                }
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                conferenceDataVersion: 1
            });

            return response.data.hangoutLink;
        } catch (error) {
            return {
                error: 'Failed to create Google Meet',
                details: error.message
            };
        }
    };


    /**
     * Create new booking session
     */

    static async createBookingSession(req, res) {
        try {
            console.log('Request body:', req.body);
            const { consultant_id, slot_id, booking_date } = req.body;
            const member_id = req.user.userId;

            // Check if user has reached the limit of 3 ongoing booking sessions
            const ongoingBookingsQuery = `
                SELECT COUNT(*) as ongoing_count
                FROM Booking_Session
                WHERE member_id = @0
                AND status IN (@1, @2)
            `;

            console.log('Checking ongoing bookings - SQL Query:', ongoingBookingsQuery);
            console.log('Checking ongoing bookings - Parameters:', [
                parseInt(member_id),
                'Đang chờ xác nhận',
                'Đã xác nhận'
            ]);

            const [ongoingResult] = await AppDataSource.query(
                ongoingBookingsQuery,
                [parseInt(member_id), 'Đang chờ xác nhận', 'Đã xác nhận']
            );

            const ongoingCount = ongoingResult.ongoing_count;
            console.log('Current ongoing bookings count:', ongoingCount);

            if (ongoingCount >= 3) {
                console.log('User has reached the limit of 3 ongoing booking sessions');
                return res.status(400).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Bạn đã đạt giới hạn 3 cuộc hẹn đang diễn ra'
                });
            }

            console.log(process.env.CLIENT_SECRET)
            const getSlot = await AppDataSource.query('select * from slot where slot_id = @0', [slot_id])
            const startTime = getSlot[0].start_time.toTimeString().split(' ')[0]; // Gets "01:00:00"
            const endTime = getSlot[0].end_time.toTimeString().split(' ')[0]; // Gets "02:00:00"


            const startDateWithTime = `${booking_date}T${startTime}`;
            const endDateWithTime = `${booking_date}T${endTime}`;
            const google_meet_link = null;
            if (getSlot.length === 0) {
                console.log('Slot not found:', slot_id);
                return res.status(404).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Khung giờ không tồn tại'
                });
            }


            console.log('Parsed input data:', {
                consultant_id,
                slot_id,
                booking_date,
                member_id,
                google_meet_link
            });

            // Validate all required fields
            if (!consultant_id || !slot_id || !booking_date) {
                console.log('Missing required fields');
                return res.status(400).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Thiếu thông tin bắt buộc: consultant_id, slot_id, và booking_date là bắt buộc'
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
                    message: 'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD'
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
                SELECT booking_id, consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link
                FROM Booking_Session
                WHERE consultant_id = @0
                AND slot_id = @1
                AND booking_date = @2
            `;

            console.log('Existing booking check - SQL Query:', existingBookingQuery);
            console.log('Existing booking check - Parameters:', [
                parseInt(consultant_id),
                parseInt(slot_id),
                booking_date,
            ]);

            const existingBookings = await AppDataSource.query(
                existingBookingQuery,
                [parseInt(consultant_id), parseInt(slot_id), booking_date]
            );

            if (existingBookings && existingBookings.length > 0) {
                console.log('Found existing booking:', existingBookings[0]);
                return res.status(409).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Chuyên gia này đã được đặt cho khung giờ này vào ngày đã chọn'
                });
            }

            // Check if member already has a booking on this date
            const memberBookingQuery = `
                SELECT booking_id, consultant_id, member_id, slot_id, booking_date, status, google_meet_link
                FROM Booking_Session
                WHERE member_id = @0
                AND booking_date = @1
                AND status IN (@2, @3)
            `;

            console.log('Member booking check - SQL Query:', memberBookingQuery);
            console.log('Member booking check - Parameters:', [
                parseInt(member_id),
                booking_date,
                'Đang chờ xác nhận',
                'Đã xác nhận'
            ]);

            const [memberBooking] = await AppDataSource.query(
                memberBookingQuery,
                [parseInt(member_id), booking_date, 'Đang chờ xác nhận', 'Đã xác nhận']
            );

            if (memberBooking) {
                console.log('Found existing member booking:', memberBooking);
                return res.status(409).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Bạn đã có một cuộc hẹn được lên lịch cho ngày này'
                });
            }

            // Create new booking session
            console.log('Creating new booking with data:', {
                consultant_id: parseInt(consultant_id),
                member_id: parseInt(member_id),
                slot_id: parseInt(slot_id),
                booking_date,
                status: 'Đang chờ xác nhận',
                google_meet_link
            });

            const insertBookingQuery = `
                INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link)
                OUTPUT INSERTED.*
                VALUES (@0, @1, @2, CAST(@3 AS DATE), @4, @5, @6)
            `;

            console.log('Insert booking - SQL Query:', insertBookingQuery);
            console.log('Insert booking - Parameters:', [
                parseInt(consultant_id),
                parseInt(member_id),
                parseInt(slot_id),
                booking_date,
                'Đang chờ xác nhận',
                null,
                google_meet_link
            ]);

            const [savedBooking] = await AppDataSource.query(
                insertBookingQuery,
                [parseInt(consultant_id), parseInt(member_id), parseInt(slot_id), booking_date, 'Đang chờ xác nhận', null, google_meet_link]
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
                    CONVERT(varchar(10), b.booking_date, 120) as booking_date,
                    b.status,
                    b.notes,
                    b.google_meet_link,
                    cs.day_of_week,
                    CONVERT(varchar(8), s.start_time, 108) as start_time,
                    CONVERT(varchar(8), s.end_time, 108) as end_time,
                    p.name as consultant_name
                FROM Booking_Session b
                LEFT JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN [Users] u ON c.user_id = u.user_id
                LEFT JOIN Profile p ON u.user_id = p.user_id
                LEFT JOIN Slot s ON b.slot_id = s.slot_id
                LEFT JOIN Consultant_Slot cs ON (b.consultant_id = cs.consultant_id AND b.slot_id = cs.slot_id)
                WHERE b.booking_id = @0
            `;

            console.log('Complete booking fetch - SQL Query:', completeBookingQuery);
            console.log('Complete booking fetch - Parameters:', [savedBooking.booking_id]);

            const [completeBooking] = await AppDataSource.query(
                completeBookingQuery,
                [savedBooking.booking_id]
            );

            console.log('Complete booking data:', completeBooking);

            res.status(201).json({
                success: true,
                data: [completeBooking],
                count: 1,
                message: 'Đặt lịch hẹn thành công'
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
                message: error.message || 'Không thể tạo lịch hẹn'
            });
        }
    }

    /**
     * Update booking session
     */
    static async updateBookingSession(req, res) {
        try {
            const { id } = req.params;
            const { consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link } = req.body;

            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Check if booking exists
            const booking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy lịch hẹn'
                });
            }

            // Update booking session
            await bookingRepository.update(parseInt(id), {
                consultant_id: consultant_id !== undefined ? parseInt(consultant_id) : booking.consultant_id,
                member_id: member_id !== undefined ? parseInt(member_id) : booking.member_id,
                slot_id: slot_id !== undefined ? parseInt(slot_id) : booking.slot_id,
                booking_date: booking_date || booking.booking_date,
                status: status || booking.status,
                notes: notes !== undefined ? notes : booking.notes,
                google_meet_link: google_meet_link !== undefined ? google_meet_link : booking.google_meet_link
            });

            // Fetch updated booking with relations
            const updatedBooking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            res.status(200).json({
                success: true,
                data: updatedBooking,
                message: 'Cập nhật lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error updating booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể cập nhật lịch hẹn',
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
                    message: 'Không tìm thấy lịch hẹn'
                });
            }

            await bookingRepository.delete(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Xóa lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error deleting booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể xóa lịch hẹn',
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
                message: 'Lấy danh sách lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting booking sessions by status:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy danh sách lịch hẹn',
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
                message: 'Lấy danh sách lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting booking sessions by date range:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy danh sách lịch hẹn',
                error: error.message
            });
        }
    }

    /**
     * Get scheduled booking sessions for authenticated member
     */
    static async getScheduledBookingSessions(req, res) {
        try {
            const memberId = req.user.userId;

            const scheduledBookingQuery = `
                SELECT DISTINCT
                    b.booking_id,
                    b.consultant_id,
                    b.member_id,
                    b.slot_id,
                    b.google_meet_link,
                    b.booking_date,
                    b.status,
                    b.notes,
                    cs.day_of_week,
                    s.start_time,
                    s.end_time,
                    p.name as consultant_name
                FROM Booking_Session b
                INNER JOIN Consultant c ON b.consultant_id = c.id_consultant
                INNER JOIN [Users] u ON c.user_id = u.user_id
                INNER JOIN Profile p ON u.user_id = p.user_id
                INNER JOIN Slot s ON b.slot_id = s.slot_id
                INNER JOIN Consultant_Slot cs ON (
                    b.consultant_id = cs.consultant_id 
                    AND b.slot_id = cs.slot_id
                    AND DATENAME(WEEKDAY, b.booking_date) = cs.day_of_week
                )
                WHERE b.member_id = @0
                AND (b.status = @1 OR b.status = @2)
                ORDER BY booking_date ASC, start_time ASC
            `;

            console.log('Scheduled bookings query:', scheduledBookingQuery);
            console.log('Scheduled bookings parameters:', [memberId, 'Đang chờ xác nhận', 'Đã xác nhận']);

            const bookings = await AppDataSource.query(
                scheduledBookingQuery,
                [parseInt(memberId), 'Đang chờ xác nhận', 'Đã xác nhận']
            );

            if (!bookings || bookings.length === 0) {
                console.log('Scheduled bookings response:', {
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Không tìm thấy lịch hẹn đã lên lịch nào'
                });
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Không tìm thấy lịch hẹn đã lên lịch nào'
                });
            }

            console.log('Scheduled bookings response:', {
                success: true,
                data: bookings,
                count: bookings.length,
                message: 'Lấy danh sách lịch hẹn đã lên lịch thành công'
            });
            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length,
                message: 'Lấy danh sách lịch hẹn đã lên lịch thành công'
            });
        } catch (error) {
            console.error('Error getting scheduled booking sessions:', error);
            res.status(500).json({
                success: false,
                data: [],
                count: 0,
                message: error.message || 'Không thể lấy danh sách lịch hẹn đã lên lịch'
            });
        }
    }

    /**
     * Confirm booking session - Update status from "Đang xác nhận" to "Đã xác nhận"
     */
    static async updateBookingNotes(req, res) {
        try {
            const { id, notes } = req.params
            const BookingRepo = AppDataSource.getRepository(BookingSession)
            const booking = await BookingRepo.findOne({
                where: { booking_id: parseInt(id) }
            })
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy lịch hẹn'
                });
            }
            if (!notes) {
                return res.status(404).json({
                    success: false,
                    message: 'Ghi chú không được để trống.'
                });
            }
            BookingRepo.update(parseInt(id), {
                notes: notes
            })
        } catch (error) {
            console.error('Error getting scheduled booking status:', error);
            res.status(500).json({
                success: false,
                data: [],
                count: 0,
                message: error.message || 'Không thể lấy danh sách lịch hẹn đã lên lịch'
            });
        }
    }
    static async confirmBookingSession(req, res) {
        try {
            const { id, meet } = req.params;
            const bookingRepository = AppDataSource.getRepository(BookingSession);

            // Check if booking exists and has the correct status
            const booking = await bookingRepository.findOne({
                where: { booking_id: parseInt(id) }
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy lịch hẹn'
                });
            }
            if (!meet) {
                return res.status(404).json({
                    success: false,
                    message: 'Link Google Meet không được để trống.'
                })
            }
            // Check if the booking status is "Đang xác nhận"
            if (booking.status !== 'Đang xác nhận') {
                return res.status(400).json({
                    success: false,
                    message: 'Chỉ có thể xác nhận lịch hẹn có trạng thái "Đang xác nhận"'
                });
            }

            // Update booking status to "Đã xác nhận"
            await bookingRepository.update(parseInt(id), {
                status: 'Đã xác nhận',
                google_meet_link: meet
            });

            // Fetch updated booking with complete details
            const completeBookingQuery = `
                SELECT 
                    b.booking_id,
                    b.consultant_id,
                    b.member_id,
                    b.slot_id,
                    CONVERT(varchar(10), b.booking_date, 120) as booking_date,
                    b.status,
                    b.notes,
                    b.google_meet_link,
                    cs.day_of_week,
                    CONVERT(varchar(8), s.start_time, 108) as start_time,
                    CONVERT(varchar(8), s.end_time, 108) as end_time,
                    p.name as consultant_name
                FROM Booking_Session b
                LEFT JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN [Users] u ON c.user_id = u.user_id
                LEFT JOIN Profile p ON u.user_id = p.user_id
                LEFT JOIN Slot s ON b.slot_id = s.slot_id
                LEFT JOIN Consultant_Slot cs ON (b.consultant_id = cs.consultant_id AND b.slot_id = cs.slot_id)
                WHERE b.booking_id = @0
            `;

            const [updatedBooking] = await AppDataSource.query(
                completeBookingQuery,
                [parseInt(id)]
            );

            res.status(200).json({
                success: true,
                data: updatedBooking,
                message: 'Xác nhận lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error confirming booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể xác nhận lịch hẹn',
                error: error.message
            });
        }
    }
}

module.exports = BookingSessionController;
