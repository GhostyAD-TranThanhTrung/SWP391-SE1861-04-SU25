/**
 * BookingSession Controller using TypeORM
 * CRUD operations for Booking_Session table
 */
require('dotenv').config();
const { parse } = require('dotenv');
const AppDataSource = require('../src/data-source');
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
     * Get booking sessions by authenticated member
     */
    static async getBookingSessionsByMember(req, res) {
        try {
            // Get member ID from the authenticated user token
            const memberId = req.user.userId;

            const bookingQuery = `
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
                ORDER BY booking_date ASC, start_time ASC
            `;

            console.log('Member bookings query:', bookingQuery);
            console.log('Member bookings parameters:', [memberId]);

            const bookings = await AppDataSource.query(
                bookingQuery,
                [parseInt(memberId)]
            );

            // Check if no booking sessions exist
            if (!bookings || bookings.length === 0) {
                console.log('Member bookings response:', {
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Không có lịch hẹn nào cho thành viên này'
                });
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Không có lịch hẹn nào cho thành viên này'
                });
            }

            console.log('Member bookings response:', {
                success: true,
                data: bookings,
                count: bookings.length,
                message: 'Lấy danh sách lịch hẹn thành công'
            });
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
            
            if (getSlot.length === 0) {
                console.log('Slot not found:', slot_id);
                return res.status(404).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Khung giờ không tồn tại'
                });
            }

            // Get consultant's google meet link
            const getConsultant = await AppDataSource.query('SELECT google_meet_link FROM Consultant WHERE id_consultant = @0', [consultant_id]);
            let google_meet_link = null;
            
            if (getConsultant.length === 0) {
                console.log('Consultant not found:', consultant_id);
                return res.status(404).json({
                    success: false,
                    data: [],
                    count: 0,
                    message: 'Chuyên gia không tồn tại'
                });
            }
            
            google_meet_link = getConsultant[0].google_meet_link;


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
                    CONVERT(nvarchar(10), b.booking_date, 120) as booking_date,
                    b.status,
                    b.notes,
                    b.google_meet_link,
                    cs.day_of_week,
                    CONVERT(nvarchar(8), s.start_time, 108) as start_time,
                    CONVERT(nvarchar(8), s.end_time, 108) as end_time,
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
     * Delete booking session
     */
    static async deleteBookingSession(req, res) {
        try {
            const { id } = req.params;
            console.log('ID: ' + id)
            // Check if booking exists
            const booking = await AppDataSource.query('select * from Booking_Session where booking_id= @0 ', [id]);

            if (booking.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy lịch hẹn'
                });
            }


            await AppDataSource.query('delete Booking_Session where booking_id= @0 ', [id]);

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
                AND b.status IN (@1, @2)
                ORDER BY booking_date ASC, start_time ASC
            `;

            console.log('Scheduled bookings query:', scheduledBookingQuery);
            console.log('Scheduled bookings parameters:', [memberId, 'Đang chờ xác nhận', 'Xác nhận thành công']);

            const bookings = await AppDataSource.query(
                scheduledBookingQuery,
                [parseInt(memberId), 'Đang chờ xác nhận', 'Xác nhận thành công']
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

    /**
     * Update booking session
     * Allows updating consultant_id, slot_id, booking_date, status, notes, and google_meet_link
     */
    static async updateBookingSession(req, res) {
        try {
            const { bookingId } = req.params;
            const { consultant_id, slot_id, booking_date, status, notes, google_meet_link } = req.body;

            console.log('Update booking request:', {
                bookingId,
                consultant_id,
                slot_id,
                booking_date,
                status,
                notes,
                google_meet_link
            });

            // Validate booking exists
            const existingBookingQuery = `
                SELECT booking_id, consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link
                FROM Booking_Session
                WHERE booking_id = @0
            `;

            const existingBookings = await AppDataSource.query(existingBookingQuery, [parseInt(bookingId)]);

            if (!existingBookings || existingBookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking session not found'
                });
            }

            const existingBooking = existingBookings[0];

            // Validate consultant exists if provided
            if (consultant_id) {
                const consultantQuery = `SELECT id_consultant FROM Consultant WHERE id_consultant = @0`;
                const consultantResult = await AppDataSource.query(consultantQuery, [parseInt(consultant_id)]);

                if (!consultantResult || consultantResult.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Consultant not found'
                    });
                }
            }

            // Validate slot exists if provided
            if (slot_id) {
                const slotQuery = `SELECT slot_id FROM Slot WHERE slot_id = @0`;
                const slotResult = await AppDataSource.query(slotQuery, [parseInt(slot_id)]);

                if (!slotResult || slotResult.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Slot not found'
                    });
                }
            }

            // Validate date format if provided
            if (booking_date) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(booking_date)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid date format. Use YYYY-MM-DD'
                    });
                }
            }

            // Validate status if provided
            const validStatuses = ['Hoàn thành', 'Lên lịch', 'Đã hủy', 'Đang chờ xác nhận', 'Xác nhận thành công'];
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            // Build dynamic update query
            const updateFields = [];
            const updateParams = [];
            let paramIndex = 0;

            if (consultant_id !== undefined) {
                updateFields.push(`consultant_id = @${paramIndex}`);
                updateParams.push(parseInt(consultant_id));
                paramIndex++;
            }

            if (slot_id !== undefined) {
                updateFields.push(`slot_id = @${paramIndex}`);
                updateParams.push(parseInt(slot_id));
                paramIndex++;
            }

            if (booking_date !== undefined) {
                updateFields.push(`booking_date = CAST(@${paramIndex} AS DATE)`);
                updateParams.push(booking_date);
                paramIndex++;
            }

            if (status !== undefined) {
                updateFields.push(`status = @${paramIndex}`);
                updateParams.push(status);
                paramIndex++;
            }

            if (notes !== undefined) {
                updateFields.push(`notes = @${paramIndex}`);
                updateParams.push(notes);
                paramIndex++;
            }

            if (google_meet_link !== undefined) {
                updateFields.push(`google_meet_link = @${paramIndex}`);
                updateParams.push(google_meet_link);
                paramIndex++;
            }

            // If no fields to update, return error
            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields provided for update'
                });
            }

            // Add booking_id as the last parameter for WHERE clause
            updateParams.push(parseInt(bookingId));

            // Execute update query
            const updateQuery = `
                UPDATE Booking_Session 
                SET ${updateFields.join(', ')}
                WHERE booking_id = @${paramIndex}
            `;

            console.log('Update query:', updateQuery);
            console.log('Update parameters:', updateParams);

            await AppDataSource.query(updateQuery, updateParams);

            // Fetch the updated booking with detailed information
            const updatedBookingQuery = `
                SELECT 
                    b.booking_id,
                    b.consultant_id,
                    b.member_id,
                    b.slot_id,
                    CONVERT(nvarchar(10), b.booking_date, 120) as booking_date,
                    b.status,
                    b.notes,
                    b.google_meet_link,
                    -- Consultant information
                    p.name as consultant_name,
                    -- Slot information
                    CONVERT(nvarchar(8), s.start_time, 108) as start_time,
                    CONVERT(nvarchar(8), s.end_time, 108) as end_time
                FROM Booking_Session b
                LEFT JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN [Users] u ON c.user_id = u.user_id
                LEFT JOIN Profile p ON u.user_id = p.user_id
                LEFT JOIN Slot s ON b.slot_id = s.slot_id
                WHERE b.booking_id = @0
            `;

            const [updatedBooking] = await AppDataSource.query(updatedBookingQuery, [parseInt(bookingId)]);

            console.log('Updated booking data:', updatedBooking);

            res.status(200).json({
                success: true,
                data: {
                    booking_id: updatedBooking.booking_id,
                    consultant_id: updatedBooking.consultant_id,
                    member_id: updatedBooking.member_id,
                    slot_id: updatedBooking.slot_id,
                    booking_date: updatedBooking.booking_date,
                    status: updatedBooking.status,
                    notes: updatedBooking.notes,
                    google_meet_link: updatedBooking.google_meet_link,
                    consultant_name: updatedBooking.consultant_name || 'Unknown',
                    slot_time: updatedBooking.start_time && updatedBooking.end_time ? {
                        start_time: updatedBooking.start_time,
                        end_time: updatedBooking.end_time
                    } : null
                },
                message: 'Booking session updated successfully'
            });

        } catch (error) {
            console.error('Error updating booking session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update booking session',
                error: error.message,
            });
        }
    }


    /**
     * Get detailed booking sessions by consultant ID with User and Slot information
     */
    static async getDetailedBookingSessionsByConsultant(req, res) {
        try {
            const { consultantId } = req.params;

            const detailedBookingQuery = `
                SELECT 
                    b.booking_id,
                    b.consultant_id,
                    b.member_id,
                    b.slot_id,
                    CONVERT(nvarchar(10), b.booking_date, 120) as booking_date,
                    b.status,
                    b.notes,
                    b.google_meet_link,
                    -- User/Member information
                    u.email as member_email,
                    u.img_link as member_img_link,
                    u.date_create as member_date_create,
                    u.status as member_status,
                    p.name as member_name,
                    p.date_of_birth as member_date_of_birth,
                    -- Slot information
                    CONVERT(nvarchar(8), s.start_time, 108) as start_time,
                    CONVERT(nvarchar(8), s.end_time, 108) as end_time,
                    -- Consultant Slot information
                    cs.day_of_week
                FROM Booking_Session b
                INNER JOIN [Users] u ON b.member_id = u.user_id
                INNER JOIN Profile p ON u.user_id = p.user_id
                INNER JOIN Slot s ON b.slot_id = s.slot_id
                INNER JOIN Consultant c ON b.consultant_id = c.id_consultant
                LEFT JOIN Consultant_Slot cs ON (b.consultant_id = cs.consultant_id AND b.slot_id = cs.slot_id)
                WHERE b.consultant_id = @0
                ORDER BY b.booking_date DESC, s.start_time ASC
            `;

            console.log('Detailed booking sessions query:', detailedBookingQuery);
            console.log('Detailed booking sessions parameters (consultant user_id):', [parseInt(consultantId)]);

            const bookings = await AppDataSource.query(
                detailedBookingQuery,
                [parseInt(consultantId)]
            );

            if (!bookings || bookings.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Không có lịch hẹn nào cho chuyên gia này'
                });
            }

            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length,
                message: 'Lấy thông tin chi tiết lịch hẹn thành công'
            });
        } catch (error) {
            console.error('Error getting detailed booking sessions by consultant:', error);
            res.status(500).json({
                success: false,
                data: [],
                count: 0,
                message: error.message || 'Không thể lấy thông tin chi tiết lịch hẹn'
            });
        }
    }
}

module.exports = BookingSessionController;
