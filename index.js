/*
 * EXPRESS SERVER SETUP
 * This file sets up the Express backend that the React frontend connects to.
 * The connection between React and Express is handled through HTTP requests.
 */

// ==================== IMPORTS ====================
// Core dependencies
const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Database configuration
const config = {
    user: "SA",
    password: "12345",
    server: "localhost",
    port: 1433,
    database: "SWP391-demo",
    options: {
        trustServerCertificate: true,
    },
};

// Controller imports (Only used controllers)
const authController = require("./Controller/authController");
const googleController = require("./Controller/googleController");
const ProfileController = require("./Controller/profileController");
const AppDataSource = require("./src/data-source");
const DashboardController = require("./Controller/dashboardController");
const StaffController = require("./Controller/staffController");
const MemberController = require("./Controller/MemberController");
const ConsultantController = require("./Controller/consultantController");
const AssessmentController = require("./Controller/assessmentController");
const ActionController = require("./Controller/actionController");
const ConsultantSlotController = require("./Controller/consultantSlotController");
const SlotController = require("./Controller/slotController");
const BookingSessionController = require("./Controller/bookingSessionController");
const ProgramController = require("./Controller/programController");
const ContentController = require("./Controller/contentController");
const BlogController = require("./Controller/blogController");
const EnrollController = require("./Controller/enrollController");
const CategoryController = require("./Controller/categoryController");
const SurveyController = require("./Controller/surveyController");
const SurveyResponseController = require("./Controller/surveyResponseController");
const UserController = require("./Controller/userController");
const ConsultantCompleteController = require("./Controller/consultantCompleteController");
const FlagController = require("./Controller/flagController");

// ==================== APP SETUP ====================
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving
app.use('/content', express.static('SWP391-SE1861-04-SU25/content'));
app.use('/uploads', express.static('SWP391-SE1861-04-SU25/public/uploads'));

// Swagger Documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
);

// ==================== DEVELOPMENT BYPASS INFO ====================
console.log("🔓 SWAGGER BYPASS ENABLED FOR DEVELOPMENT");
console.log("To test protected endpoints in Swagger without authentication:");
console.log("1. Open Swagger UI at http://localhost:3000/api-docs");
console.log("2. For any protected endpoint, add header: x-swagger-bypass: true");
console.log("3. This will use a mock admin user for testing");
console.log("=".repeat(60));

// ==================== DATABASE CONNECTIONS ====================
// SQL Server Connection
sql.connect(config, (err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to the database");
});

// TypeORM Connection
AppDataSource.initialize()
    .then(() => {
        console.log("TypeORM Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

// ==================== API ROUTES ====================

// ==================== DEBUG & TEST ROUTES ====================
/**
 * DEBUG: Get all users
 * Purpose: Development debugging endpoint to list all users
 * Method: GET /
 * Input: None
 * Output: Array of all users with their details
 * Authentication: None (Debug only)
 */
app.get("/", UserController.getAllUsers);

/**
 * TEST: Swagger bypass functionality
 * Purpose: Test endpoint to verify Swagger bypass for development
 * Method: GET /api/test-bypass
 * Input: Headers: { "x-swagger-bypass": "true" }
 * Output: { success: boolean, message: string, user: object, timestamp: string }
 * Authentication: Required (with bypass support)
 */
app.get("/api/test-bypass", authController.verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "🔓 Swagger bypass is working!",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// ==================== AUTHENTICATION ROUTES ====================
/**
 * LOGIN: User authentication
 * Purpose: Authenticate user with email/password and return JWT token
 * Method: POST /api/login
 * Input: { email: string, password: string }
 * Output: { success: boolean, token: string, user: object, message: string }
 * Authentication: None
 */
app.post("/api/login", authController.login);

/**
 * REGISTER: User registration
 * Purpose: Create new user account with email/password
 * Method: POST /api/register
 * Input: { email: string, password: string, role?: string }
 * Output: { success: boolean, user: object, message: string }
 * Authentication: None
 */
app.post("/api/register", authController.register);

/**
 * GOOGLE LOGIN: Google OAuth authentication
 * Purpose: Authenticate user with Google OAuth token
 * Method: POST /api/google-login
 * Input: { googleToken: string }
 * Output: { success: boolean, token: string, user: object, message: string }
 * Authentication: None
 */
app.post("/api/google-login", googleController.googleLogin);

/**
 * GOOGLE REGISTER: Google OAuth registration
 * Purpose: Register new user with Google OAuth
 * Method: POST /api/google-register
 * Input: { googleToken: string, role?: string }
 * Output: { success: boolean, user: object, message: string }
 * Authentication: None
 */
app.post("/api/google-register", googleController.googleRegister);

// ==================== DASHBOARD ROUTES ====================
/**
 * DASHBOARD: Get basic dashboard statistics
 * Purpose: Retrieve overview statistics for admin dashboard
 * Method: GET /api/dashboard
 * Input: None
 * Output: { success: boolean, data: { totalUsers: number, totalPrograms: number, totalEnrollments: number }, message: string }
 * Authentication: None (but should be admin-only in production)
 */
app.get("/api/dashboard", DashboardController.getDashboardStats);

/**
 * DASHBOARD DETAILED: Get comprehensive dashboard data
 * Purpose: Retrieve detailed analytics and statistics for admin dashboard
 * Method: GET /api/dashboard/detailed
 * Input: None
 * Output: { success: boolean, data: { users: object, programs: object, enrollments: object, charts: object }, message: string }
 * Authentication: None (but should be admin-only in production)
 */
app.get("/api/dashboard/detailed", DashboardController.getDetailedDashboard);

// ==================== PROFILE ROUTES ====================
/**
 * PROFILE CREATE: Create user profile
 * Purpose: Create or update user profile information
 * Method: POST /api/profile
 * Input: { name: string, bio_json?: object, date_of_birth?: string, job?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required
 */
app.post("/api/profile", authController.verifyToken, ProfileController.createProfile);

/**
 * PROFILE GET: Get current user profile
 * Purpose: Retrieve profile information for authenticated user
 * Method: GET /api/profile
 * Input: None (user ID from token)
 * Output: { success: boolean, data: { user: object, profile: object }, message: string }
 * Authentication: Required
 */
app.get("/api/profile", authController.verifyToken, ProfileController.getUserProfile);

/**
 * PROFILE STATUS: Check profile completion status
 * Purpose: Check if user has completed their profile setup
 * Method: GET /api/profile/status
 * Input: None (user ID from token)
 * Output: { success: boolean, hasProfile: boolean, profileComplete: boolean, message: string }
 * Authentication: Required
 */
app.get("/api/profile/status", authController.verifyToken, ProfileController.checkProfileStatus);

// ==================== COMBINED USER+PROFILE ROUTES ====================
/**
 * USER PROFILE COMBINED GET: Get complete user and profile data
 * Purpose: Retrieve combined user and profile information using JWT token user_id
 * Method: GET /api/user/profile-combined
 * Input: None (user ID from JWT token)
 * Output: { success: boolean, data: { user: object, profile: object|null, hasProfile: boolean }, message: string }
 * Authentication: Required
 * Features: Returns user data (excluding password) combined with profile data
 */
app.get("/api/user/profile-combined", authController.verifyToken, UserController.getUserProfileCombined);

/**
 * USER PROFILE COMBINED UPDATE: Update user and profile data together
 * Purpose: Update both user and profile information in a single transaction using JWT token user_id
 * Method: PUT /api/user/profile-combined
 * Input: { email?: string, role?: string, status?: string, img_link?: string, name?: string, bio_json?: string, date_of_birth?: string, job?: string }
 * Output: { success: boolean, data: { user: object, profile: object|null, hasProfile: boolean }, message: string }
 * Authentication: Required
 * Features: Transactional update, creates profile if doesn't exist, validates JSON
 */
app.put("/api/user/profile-combined", authController.verifyToken, UserController.updateUserProfileCombined);

/**
 * USER ACCOUNT DEACTIVATION: Deactivate user account (soft delete - sets status to 'inactive')
 * Purpose: Deactivate user account using JWT token user_id (preserves data but marks as inactive)
 * Method: DELETE /api/user/delete-account
 * Input: None (user ID from JWT token)
 * Output: { success: boolean, message: string, deactivatedData: { user: object, profile: object|null, softDeleted: boolean } }
 * Authentication: Required
 * Features: Soft delete preserves all data while preventing login, returns deactivated data for logging
 */
app.delete("/api/user/delete-account", authController.verifyToken, UserController.deleteUserCascade);

// ==================== STAFF MANAGEMENT ROUTES (Admin Only) ====================
/**
 * STAFF LIST: Get all staff members
 * Purpose: Retrieve list of all staff members for admin management
 * Method: GET /api/staff
 * Input: None
 * Output: { success: boolean, data: Array<StaffObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/staff", authController.verifyToken, StaffController.getAllStaff);

/**
 * STAFF SEARCH: Search staff by name
 * Purpose: Find staff members by name for admin management
 * Method: GET /api/staff/:staffName
 * Input: Path params: { staffName: string }
 * Output: { success: boolean, data: Array<StaffObject>, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/staff/:staffName", authController.verifyToken, StaffController.searchStaffByName);

/**
 * STAFF CREATE: Create new staff member
 * Purpose: Add new staff member to the system
 * Method: POST /api/staff
 * Input: { email: string, password: string, name: string, role: string, specialization?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin)
 */
app.post("/api/staff", authController.verifyToken, StaffController.createStaff);

/**
 * STAFF UPDATE: Update staff member information
 * Purpose: Modify existing staff member details
 * Method: PUT /api/staff/:staffId
 * Input: Path params: { staffId: number }, Body: { name?: string, email?: string, role?: string, status?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin)
 */
app.put("/api/staff/:staffId", authController.verifyToken, (req, res, next) => {
    console.log('PUT /api/staff/:staffId route hit with params:', req.params);
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    next();
}, StaffController.updateStaff);

/**
 * STAFF DELETE: Remove staff member
 * Purpose: Delete staff member from the system
 * Method: DELETE /api/staff/:staffId
 * Input: Path params: { staffId: number }
 * Output: { success: boolean, message: string }
 * Authentication: Required (Admin)
 */
app.delete("/api/staff/:staffId", authController.verifyToken, StaffController.deleteStaff);

// ==================== MEMBER MANAGEMENT ROUTES (Admin Only) ====================
/**
 * MEMBERS LIST: Get all members
 * Purpose: Retrieve list of all registered members for admin management
 * Method: GET /api/members
 * Input: None
 * Output: { success: boolean, data: Array<MemberObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/members", authController.verifyToken, MemberController.getAllMembers);

/**
 * MEMBERS SEARCH: Search members by name
 * Purpose: Find members by name for admin management
 * Method: GET /api/members/search/:memberName
 * Input: Path params: { memberName: string }
 * Output: { success: boolean, data: Array<MemberObject>, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/members/search/:memberName", authController.verifyToken, MemberController.searchMembersByName);

/**
 * MEMBER DETAILS: Get specific member details
 * Purpose: Retrieve detailed information about a specific member
 * Method: GET /api/members/:memberId
 * Input: Path params: { memberId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/members/:memberId", authController.verifyToken, MemberController.getMemberById);

/**
 * MEMBER DETAILS: Get specific member details
 * Purpose: Retrieve detailed information about a specific member (include assessment)
 * Method: GET /api/members/detailed/:memberId
 * Input: Path params: { memberId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff/Consultant)
 */
app.get("/api/members/detailed/:memberId", MemberController.getFullMemberById);

/**
 * MEMBER UPDATE: Update member
 * Purpose: Update member account from the system
 * Method: PUT /api/members/:memberId
 * Input: Path params: { memberId: number }, Body: { name?: string, email?: string, role?: string, status?: string, date_of_birth?: string, bio_json?: object, password?: string}
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.put("/api/members/:memberId", authController.verifyToken, MemberController.updateMember);

/**
 * MEMBER DELETE: Remove member
 * Purpose: Delete member account from the system
 * Method: DELETE /api/members/:memberId
 * Input: Path params: { memberId: number }
 * Output: { success: boolean, message: string }
 * Authentication: Required (Admin)
 */
app.delete("/api/members/:memberId", authController.verifyToken, (req, res, next) => {
    console.log('DELETE /api/members/:memberId route hit with params:', req.params);
    console.log('User from token:', req.user);
    next();
}, MemberController.deleteMember);

// ==================== CONSULTANT MANAGEMENT ROUTES ====================
/**
 * CONSULTANTS LIST: Get all consultants
 * Purpose: Retrieve list of all consultants with their details and availability
 * Method: GET /api/consultants
 * Input: None
 * Output: { success: boolean, data: Array<ConsultantObject>, count: number, message: string }
 * Authentication: None (Public directory)
 */
app.get("/api/consultants", ConsultantController.getAllConsultants);

/**
 * CONSULTANTS SEARCH: Search consultants by name
 * Purpose: Find consultants by name for booking purposes
 * Method: GET /api/consultants/search/:consultantName
 * Input: Path params: { consultantName: string }
 * Output: { success: boolean, data: Array<ConsultantObject>, message: string }
 * Authentication: Required
 */
app.get("/api/consultants/search/:consultantName", authController.verifyToken, ConsultantController.searchConsultantsByName);

/**
 * CONSULTANT DETAILS: Get specific consultant information
 * Purpose: Retrieve detailed information about a consultant including rates and specialties
 * Method: GET /api/consultants/:consultantId
 * Input: Path params: { consultantId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: None (Public directory)
 */
app.get("/api/consultants/:consultantId", ConsultantController.getConsultantById);

/**
 * CONSULTANT CREATE: Add new consultant
 * Purpose: Create new consultant profile in the system
 * Method: POST /api/consultants
 * Input: { user_id: number, google_meet_link: string, certification: string, speciality: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin)
 */
app.post("/api/consultants", authController.verifyToken, ConsultantController.createConsultant);

/**
 * CONSULTANT UPDATE: Update consultant information
 * Purpose: Modify consultant profile details, rates, and specialties
 * Method: PUT /api/consultants/:consultantId
 * Input: Path params: { consultantId: number }, Body: { google_meet_link?: string, certification?: string, speciality?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Consultant)
 */
app.put("/api/consultants/:consultantId", ConsultantController.updateConsultant);

/**
 * CONSULTANT DELETE: Remove consultant
 * Purpose: Remove consultant from the system
 * Method: DELETE /api/consultants/:consultantId
 * Input: Path params: { consultantId: number }
 * Output: { success: boolean, message: string }
 * Authentication: Required (Admin)
 */
app.delete("/api/consultants/:consultantId", authController.verifyToken, ConsultantController.deleteConsultant);

/**
 * CONSULTANT ID BY USER: Get consultant ID for authenticated user
 * Purpose: Retrieve consultant ID for the currently authenticated user (from token)
 * Method: GET /api/consultants/my-id
 * Input: None (user ID from token)
 * Output: { success: boolean, data: { consultant_id: number, user_id: number }, message: string }
 * Authentication: Required (Consultant)
 */
app.get("/api/consultants/my-id", authController.verifyToken, ConsultantController.getConsultantIdByUserId);

/**
 * CONSULTANT ID BY USER EMAIL: Get consultant ID from user email
 * Purpose: Get consultant ID from user email address
 * Method: GET /api/consultants/email/:email
 * Input: email (string) - User's email address
 * Output: { success: boolean, data: { consultant_id: number, user_id: number }, message: string }
 * Authentication: None
 */
app.get("/api/consultants/email/:email", authController.verifyToken, ConsultantController.getConsultantIdByUserEmail);

// ==================== CONSULTANT COMPLETE MANAGEMENT ROUTES ====================
/**
 * CONSULTANTS COMPLETE LIST: Get all consultants with complete data
 * Purpose: Retrieve all consultants with their complete profile, availability slots, and related data
 * Method: GET /api/consultants-complete
 * Input: None
 * Output: { success: boolean, data: { totalConsultants: number, consultants: Array<CompleteConsultantObject> }, message: string }
 * Authentication: None (Public directory with complete info)
 */
app.get("/api/consultants-complete", authController.verifyToken, ConsultantCompleteController.getAllConsultantsComplete);

/**
 * CONSULTANT COMPLETE DETAILS: Get specific consultant with complete data
 * Purpose: Retrieve detailed information about a consultant including profile, availability, and all related data
 * Method: GET /api/consultants-complete/:consultantId
 * Input: Path params: { consultantId: number }
 * Output: { success: boolean, data: CompleteConsultantObject, message: string }
 * Authentication: None (Public directory with complete info)
 */
app.get("/api/consultants-complete/:consultantId", ConsultantCompleteController.getConsultantCompleteById);

/**
 * CONSULTANT COMPLETE CREATE: Create new consultant with complete profile
 * Purpose: Create new consultant with all related data (user, profile, consultant, availability slots)
 * Method: POST /api/consultants-complete
 * Input: { role: string, password: string, email: string, google_meet_link?: string, certification?: string, speciality?: string, name?: string, bio_json?: object, date_of_birth?: string, job?: string, availability_slots?: Array<{day_of_week: string, start_time: string, end_time: string}> }
 * Output: { success: boolean, data: CompleteConsultantObject, message: string }
 * Authentication: Required (Admin)
 */
app.post("/api/consultants-complete", authController.verifyToken, ConsultantCompleteController.createConsultantComplete);

/**
 * CONSULTANT COMPLETE UPDATE: Update consultant with complete data
 * Purpose: Update consultant with all related data (user, profile, consultant, availability slots)
 * Method: PUT /api/consultants-complete/:id
 * Input: Path params: { id: number }, Body: { role?: string, email?: string, google_meet_link?: string, certification?: string, speciality?: string, name?: string, bio_json?: object, date_of_birth?: string, job?: string, availability_slots?: Array<{day_of_week: string, start_time: string, end_time: string}> }
 * Output: { success: boolean, data: CompleteConsultantObject, message: string }
 * Authentication: Required (Admin/Consultant)
 */
app.put("/api/consultants-complete/:id", authController.verifyToken, ConsultantCompleteController.updateConsultantComplete);

/**
 * CONSULTANT COMPLETE DELETE: Delete consultant and all related data
 * Purpose: Remove consultant and all associated data (user, profile, consultant, slots)
 * Method: DELETE /api/consultants-complete/:consultantId
 * Input: Path params: { consultantId: number }
 * Output: { success: boolean, message: string }
 * Authentication: Required (Admin)
 */
app.delete("/api/consultants-complete/:consultantId", authController.verifyToken, (req, res, next) => {
    console.log('🗑️ DELETE /api/consultants-complete/:consultantId route hit with params:', req.params);
    console.log('👤 User from token:', req.user);
    next();
}, ConsultantCompleteController.deleteConsultantComplete);

/**
 * CONSULTANT AVAILABILITY BY DAY: Get consultant availability for specific day
 * Purpose: Retrieve availability slots for a consultant on a specific day of the week
 * Method: GET /api/consultants-complete/:consultantId/availability/:dayOfWeek
 * Input: Path params: { consultantId: number, dayOfWeek: string }
 * Output: { success: boolean, data: { consultant_id: number, day_of_week: string, availability_slots: Array<SlotObject> }, message: string }
 * Authentication: None (Public for booking purposes)
 */
app.get("/api/consultants-complete/:consultantId/availability/:dayOfWeek", ConsultantCompleteController.getConsultantAvailabilityByDay);

/**
 * BOOKING SESSION UPDATE: Update booking session status and Google Meet link
 * Purpose: Update booking session status and add/update Google Meet link for consultations
 * Method: PUT /api/booking-sessions/:bookingId/status-link
 * Input: Path params: { bookingId: number }, Body: { status?: string, google_meet_link?: string }
 * Output: { success: boolean, data: BookingSessionObject, message: string }
 * Authentication: Required (Consultant/Admin)
 */
app.put("/api/booking-sessions/:bookingId/status-link", authController.verifyToken, ConsultantCompleteController.updateBookingSessionStatusAndLink);
app.delete('/api/booking-sessions/:id', authController.verifyToken, BookingSessionController.deleteBookingSession)
// ==================== CONSULTANT SCHEDULING ROUTES ====================
/**
 * CONSULTANT SLOTS: Get consultant availability
 * Purpose: Retrieve available time slots for a specific consultant
 * Method: GET /api/consultant-slots/:consultantId
 * Input: Path params: { consultantId: number }
 * Output: { success: boolean, data: Array<SlotObject>, message: string }
 * Authentication: None (Public for booking)
 */
app.get("/api/consultant-slots/:consultantId", ConsultantSlotController.getSlotsByConsultantId);
app.delete("/api/consultant-slots/consultant/:consultantId", ConsultantSlotController.deleteConsultantSlots);
app.post("/api/consultant-slots/consultant/:consultantId", ConsultantSlotController.createConsultantSlots);
/**
 * CONSULTANT SLOTS: Update consultant availability
 * Purpose: Update consultant slots for specific days by deleting existing slots and creating new ones
 * Method: PUT /api/consultant-slots
 * Input: { consultant_id: number, daysofweek: string|Array<string>, slot: Array<number> }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Consultant/Admin)
 */
app.put("/api/consultant-slots", authController.verifyToken, ConsultantSlotController.updateConsultantSlots);
app.get("/api/user/role/", authController.verifyToken, UserController.getUserRoleById)
/**
 * SLOTS: Get all time slots
 * Purpose: Retrieve all available time slots in the system
 * Method: GET /api/slots
 * Input: None
 * Output: { success: boolean, data: Array<SlotObject>, message: string }
 * Authentication: None (Public for viewing scheduling options)
 * Features: Ordered by start time for easy scheduling interface display
 */
app.get("/api/slots", SlotController.getAllSlots);



// ==================== BOOKING SESSION ROUTES ====================
/**
 * BOOKING SESSIONS: Get scheduled sessions
 * Purpose: Retrieve all scheduled booking sessions for the authenticated user
 * Method: GET /api/booking-sessions/scheduled
 * Input: None (user ID from token)
 * Output: { success: boolean, data: Array<BookingObject>, count: number, message: string }
 * Authentication: Required
 */
app.get("/api/booking-sessions/scheduled", authController.verifyToken, BookingSessionController.getScheduledBookingSessions);

/**
 * BOOKING SESSIONS BY MEMBER: Get all booking sessions for authenticated member
 * Purpose: Retrieve all booking sessions (all statuses) for the authenticated member
 * Method: GET /api/booking-sessions/member
 * Input: None (member ID from token)
 * Output: { success: boolean, data: Array<BookingObject>, count: number, message: string }
 * Authentication: Required (Member)
 */
app.get("/api/booking-sessions/member", authController.verifyToken, BookingSessionController.getBookingSessionsByMember);

/**
 * BOOKING CREATE: Create new booking session
 * Purpose: Book a consultation session with a consultant
 * Method: POST /api/booking-sessions
 * Input: { consultant_id: number, slot_id: number, booking_date: string, notes?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Member)
 */
app.post("/api/booking-sessions", authController.verifyToken, BookingSessionController.createBookingSession);

/**
 * BOOKING SESSIONS BY CONSULTANT: Get consultant's bookings with detailed information
 * Purpose: Retrieve all booking sessions for a specific consultant with member and slot details
 * Method: GET /api/booking-sessions/consultant/:consultantId
 * Input: Path params: { consultantId: number }
 * Output: { success: boolean, data: Array<DetailedBookingObject>, count: number, message: string }
 * Authentication: Required (Consultant/Admin)
 * Features: Includes member profile, slot timing, and booking status information
 */
app.get("/api/booking-sessions/consultant/:consultantId", authController.verifyToken, BookingSessionController.getDetailedBookingSessionsByConsultant);

/**
 * BOOKING UPDATE: Update booking session
 * Purpose: Update booking session details including consultant, slot, date, status, notes, and Google Meet link
 * Method: PUT /api/booking-sessions/:bookingId
 * Input: Path params: { bookingId: number }, Body: { consultant_id?: number, slot_id?: number, booking_date?: string, status?: string, notes?: string, google_meet_link?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Member/Consultant/Admin)
 * Features: Validates all inputs, supports partial updates, includes transaction safety
 */
app.put("/api/booking-sessions/:bookingId", authController.verifyToken, BookingSessionController.updateBookingSession);

// ==================== ASSESSMENT ROUTES ====================
/**
 * ASSESSMENTS LIST: Get all assessments
 * Purpose: Retrieve all assessments in the system for admin review
 * Method: GET /api/assessments
 * Input: None
 * Output: { success: boolean, data: Array<AssessmentObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get('/api/assessments', authController.verifyToken, AssessmentController.getAllAssessments);

/**
 * MY ASSESSMENTS: Get current user's assessments
 * Purpose: Retrieve all assessments taken by the authenticated user
 * Method: GET /api/assessments/me
 * Input: None (user ID from token)
 * Output: { success: boolean, data: Array<AssessmentObject>, count: number, message: string }
 * Authentication: Required
 */
app.get('/api/assessments/me', authController.verifyToken, AssessmentController.getAssessmentsByUserToken);

/**
 * ASSESSMENT DETAILS: Get detailed assessment results
 * Purpose: Retrieve detailed assessment results for a specific user
 * Method: GET /api/assessments/details/:userId
 * Input: Path params: { userId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff/Own Results)
 */
app.get('/api/assessments/details/:userId', authController.verifyToken, AssessmentController.getAssessmentDetails);

/**
 * ASSESSMENTS BY TYPE: Get assessments by type
 * Purpose: Filter assessments by type (ASSIST, CRAFFT, etc.)
 * Method: GET /api/assessments/type/:type
 * Input: Path params: { type: string }
 * Output: { success: boolean, data: Array<AssessmentObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get('/api/assessments/type/:type', authController.verifyToken, AssessmentController.getAssessmentsByType);

// ==================== ACTION MANAGEMENT ROUTES ====================

/**
 * GET ALL ACTIONS: Retrieve all actions
 * Purpose: Get all actions for administrative purposes and chart display
 * Method: GET /api/actions
 * Input: None
 * Output: { success: boolean, data: Array<ActionObject>, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get('/api/actions', authController.verifyToken, ActionController.getAllActions);

/**
 * GET ACTION BY ID: Retrieve specific action
 * Purpose: Get detailed information about a specific action
 * Method: GET /api/actions/:id
 * Input: Path params: { id: number }
 * Output: { success: boolean, data: ActionObject, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get('/api/actions/:id', authController.verifyToken, ActionController.getActionById);

/**
 * GET ACTIONS BY TYPE: Filter actions by type
 * Purpose: Get actions filtered by type
 * Method: GET /api/actions/type/:type
 * Input: Path params: { type: string }
 * Output: { success: boolean, data: Array<ActionObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get('/api/actions/type/:type', authController.verifyToken, ActionController.getActionsByType);

/**
 * GET ACTIONS WITH ASSESSMENTS: Get actions with related assessments
 * Purpose: Get actions including their related assessment data
 * Method: GET /api/actions/with-assessments
 * Input: None
 * Output: { success: boolean, data: Array<ActionObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get('/api/actions/with-assessments', authController.verifyToken, ActionController.getActionsWithAssessments);

/**
 * TAKE ASSESSMENT: Submit assessment test
 * Purpose: Submit assessment test responses and get results with recommendations
 * Method: POST /api/assessments/take-test
 * Input: { type: string, responses: Array<{question: string, answer: any}> }
 * Output: { success: boolean, data: { results: object, action: object }, message: string }
 * Authentication: Required
 */
app.post('/api/assessments/take-test', authController.verifyToken, AssessmentController.takeTestFromUser);

/**
 * ASSESSMENT DELETE: Remove assessment
 * Purpose: Delete assessment record from the system
 * Method: DELETE /api/assessments/:id
 * Input: Path params: { id: number }
 * Output: { success: boolean, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.delete('/api/assessments/:id', authController.verifyToken, AssessmentController.deleteAssessment);

// ==================== PROGRAM ROUTES ====================
/**
 * PROGRAM API STRUCTURE:
 * 
 * GET    /api/programs                           - Get all programs
 * GET    /api/programs/my-enrollment-status      - Get programs with user enrollment status (requires auth)
 * GET    /api/programs/user/:userId/enrollment-status - Get programs with specific user enrollment status (admin only)
 * GET    /api/programs/community-events          - Get Community Event programs only
 * GET    /api/programs/:id                       - Get program by ID
 * GET    /api/programs/category/:categoryId      - Get programs by category
 */

// Program retrieval routes
// Program retrieval routes
app.get("/api/programs", ProgramController.getAllPrograms);
app.get("/api/programs/category-details", ProgramController.getAllProgramsWithCategoryDetails);
app.get("/api/programs/community-events", ProgramController.getCommunityEventPrograms); // MUST be before :id route
app.get("/api/programs/my-enrollment-status", authController.verifyToken, ProgramController.getUserProgramsWithEnrollmentStatus);
app.get("/api/programs/user/:userId/enrollment-status", authController.verifyToken, ProgramController.getUserProgramsWithEnrollmentStatusByAdmin);
app.get("/api/programs/recommendations", authController.verifyToken, ProgramController.getProgramRecommendationsByAge);
app.get("/api/programs/category/:categoryId", ProgramController.getProgramsByCategory);
app.get("/api/programs/:programId/survey-analytics", ProgramController.getProgramSurveyAnalytics);
app.get("/api/programs/:id", ProgramController.getProgramById);

// Program CRUD routes (Admin/Staff only)
app.post("/api/programs", authController.verifyToken, (req, res, next) => {
    console.log("POST /api/programs request received:", {
        headers: req.headers,
        body: req.body,
        user: req.user
    });
    next();
}, ProgramController.createProgram);
app.put("/api/programs/:id", authController.verifyToken, ProgramController.updateProgram);
app.delete("/api/programs/:id", authController.verifyToken, ProgramController.deleteProgram);
// ==================== CONTENT ROUTES ====================
/**
 * CONTENT API STRUCTURE:
 * 
 * GET    /api/content                           - Get all content
 * GET    /api/content/:id                       - Get content by ID
 * GET    /api/content/:id/with-program          - Get content with program information
 * GET    /api/content/:id/parsed-metadata       - Get content with parsed metadata
 * GET    /api/content/program/:programId        - Get content by program ID
 * GET    /api/content/type/:type                - Get content by type (article, video, podcast)
 * GET    /api/content/content-type/:contentType - Get content by content type (markdown, video, audio)
 * GET    /api/content/file/:id                  - Get content file/serve content
 * GET    /api/content/preview/:program_id       - Get preview content for program
 * POST   /api/content                           - Create new content (generic)
 * POST   /api/content/youtube                   - Create YouTube video content
 * POST   /api/content/markdown                  - Create markdown content with image
 * POST   /api/content/podcast                   - Create podcast/audio content
 * PUT    /api/content/:id                       - Update content
 * PATCH  /api/content/:id/order                 - Update content order
 * DELETE /api/content/:id                       - Delete content
 */

// Content retrieval routes
app.get("/api/content", ContentController.getAllContent);
app.get("/api/content/type/:type", ContentController.getContentByType);
app.get("/api/content/content-type/:contentType", ContentController.getContentByContentType);
app.get("/api/content/program/:programId", ContentController.getContentByProgramId);
app.get("/api/content/preview/:program_id", ContentController.getPreviewContent);
app.get("/api/content/:id", ContentController.getContentById);
app.get("/api/content/:id/with-program", ContentController.getContentWithProgram);
app.get("/api/content/:id/parsed-metadata", ContentController.getParsedMetadataContentById);
app.get("/api/content/file/:id", ContentController.getContentFile);

// Content creation routes
app.post("/api/content", authController.verifyToken, ContentController.createContent);
app.post("/api/content/youtube", authController.verifyToken, ContentController.createYouTubeContent);
app.post("/api/content/markdown", authController.verifyToken, ContentController.createMarkdownContent);
app.post("/api/content/podcast", authController.verifyToken, ContentController.createPodcastContent);

// Content management routes
app.put("/api/content/:id", authController.verifyToken, ContentController.updateContent);
app.patch("/api/content/:id/order", authController.verifyToken, ContentController.updateContentOrder);
app.delete("/api/content/:id", authController.verifyToken, ContentController.deleteContent);

// Image upload routes
app.post("/api/images/upload", authController.verifyToken, ContentController.uploadImage);
app.get("/api/images/:filename", ContentController.getImage);

// ==================== CATEGORY ROUTES ====================
/**
 * CATEGORIES: Get all categories
 * Purpose: Retrieve all available program categories for filtering and organization
 * Method: GET /api/categories
 * Input: None
 * Output: { success: boolean, data: Array<CategoryObject>, count: number, message: string }
 * Authentication: None (Public)
 */
app.get("/api/categories", CategoryController.getAllCategories);

/**
 * CATEGORY CREATE: Create new category
 * Purpose: Create a new program category for organizing programs
 * Method: POST /api/categories
 * Input: { name?: string, description?: string }
 * Output: { success: boolean, data: CategoryObject, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.post("/api/categories", authController.verifyToken, CategoryController.createCategory);

/**
 * CATEGORY UPDATE: Update existing category
 * Purpose: Modify an existing program category
 * Method: PUT /api/categories/:id
 * Input: Path params: { id: number }, Body: { name?: string, description?: string }
 * Output: { success: boolean, data: CategoryObject, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.put("/api/categories/:id", authController.verifyToken, CategoryController.updateCategory);

/**
 * CATEGORY DELETE: Remove category
 * Purpose: Delete a program category from the system
 * Method: DELETE /api/categories/:id
 * Input: Path params: { id: number }
 * Output: { success: boolean, message: string, deletedCategory: object }
 * Authentication: Required (Admin/Staff)
 */
app.delete("/api/categories/:id", authController.verifyToken, CategoryController.deleteCategory);

// ==================== BLOG ROUTES ====================
/**
 * BLOGS LIST: Get all published blogs
 * Purpose: Retrieve all published blog posts for public viewing
 * Method: GET /api/blogs
 * Input: Query params: { page?: number, limit?: number, category?: string }
 * Output: { success: boolean, data: Array<BlogObject>, count: number, message: string }
 * Authentication: None (Public)
 */
app.get("/api/blogs", BlogController.getAllBlogs);
app.get("/api/admin/blogs", BlogController.getAllBlogsForAdmin)
/**
 * MY BLOGS: Get current user's blogs
 * Purpose: Retrieve all blog posts created by the authenticated user
 * Method: GET /api/blogs/my
 * Input: None (user ID from token)
 * Output: { success: boolean, data: Array<BlogObject>, count: number, message: string }
 * Authentication: Required
 */
app.get("/api/blogs/my", authController.verifyToken, BlogController.getMyBlogs);

/**
 * PENDING BLOGS: Get blogs awaiting moderation
 * Purpose: Retrieve blog posts that need admin/staff approval
 * Method: GET /api/blogs/pending
 * Input: None
 * Output: { success: boolean, data: Array<BlogObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/blogs/pending", authController.verifyStaffOrAdmin, BlogController.getPendingBlogs);

/**
 * MODERATION STATS: Get blog moderation statistics
 * Purpose: Retrieve statistics about blog moderation status and activity
 * Method: GET /api/blogs/moderation/stats
 * Input: None
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/blogs/moderation/stats", authController.verifyStaffOrAdmin, BlogController.getModerationStats);

/**
 * BLOG DETAILS: Get specific blog post
 * Purpose: Retrieve detailed information about a specific blog post
 * Method: GET /api/blogs/:id
 * Input: Path params: { id: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: None (Public for published blogs)
 */
app.get("/api/blogs/:id", BlogController.getBlogWithRelations);

/**
 * BLOG CREATE: Create new blog post
 * Purpose: Create new blog post with text content
 * Method: POST /api/blogs
 * Input: { title: string, body: string, status?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required
 */
app.post("/api/blogs", authController.verifyToken, BlogController.createBlog);

/**
 * BLOG CREATE WITH IMAGE: Create blog post with image upload
 * Purpose: Create new blog post with image attachment
 * Method: POST /api/blogs/with-image
 * Input: FormData: { title: string, body: string, image: File, status?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required
 */
app.post("/api/blogs/with-image", authController.verifyToken, ...BlogController.createBlogWithImage);

/**
 * BLOG UPDATE: Update blog post
 * Purpose: Modify existing blog post content
 * Method: PUT /api/blogs/:id
 * Input: Path params: { id: number }, Body: { title?: string, body?: string, status?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Author/Admin/Staff)
 */
app.put("/api/blogs/:id", authController.verifyToken, BlogController.updateBlog);

/**
 * BLOG DELETE: Remove blog post
 * Purpose: Delete blog post from the system
 * Method: DELETE /api/blogs/:id
 * Input: Path params: { id: number }
 * Output: { success: boolean, message: string }
 * Authentication: Required (Author/Admin/Staff)
 */
app.delete("/api/blogs/:id", authController.verifyToken, BlogController.deleteBlog);

/**
 * BLOG STATUS UPDATE: Change blog status
 * Purpose: Update blog post status (draft, published, etc.)
 * Method: PATCH /api/blogs/:id/status
 * Input: Path params: { id: number }, Body: { status: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Author/Admin/Staff)
 */
app.patch("/api/blogs/:id/status", authController.verifyToken, BlogController.updateBlogStatus);

/**
 * BLOG APPROVE: Approve blog for publication
 * Purpose: Approve pending blog post for public publication
 * Method: PATCH /api/blogs/:id/approve
 * Input: Path params: { id: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.patch("/api/blogs/:id/approve", authController.verifyStaffOrAdmin, BlogController.approveBlog);

/**
 * BLOG REJECT: Reject blog post
 * Purpose: Reject pending blog post with optional reason
 * Method: PATCH /api/blogs/:id/reject
 * Input: Path params: { id: number }, Body: { reason?: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.patch("/api/blogs/:id/reject", authController.verifyStaffOrAdmin, BlogController.rejectBlog);

// ==================== FLAG ROUTES ====================
/**
 * FLAG CREATE: Report blog post
 * Purpose: Create a new flag report for inappropriate content
 * Method: POST /api/flags
 * Input: { blog_id: number, reason: string }
 * Output: { success: boolean, data: object, message: string, blogHidden?: boolean, authorBanned?: boolean }
 * Authentication: Required
 */
app.post("/api/flags", authController.verifyToken, FlagController.createFlag);

/**
 * FLAGS BY BLOG: Get flags for specific blog
 * Purpose: Retrieve all flag reports for a specific blog
 * Method: GET /api/flags/blog/:blogId
 * Input: Path params: { blogId: number }
 * Output: { success: boolean, data: Array<FlagObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/flags/blog/:blogId", authController.verifyStaffOrAdmin, FlagController.getFlagsByBlogId);

/**
 * FLAGS BY USER: Get flags created by user
 * Purpose: Retrieve all flag reports created by a specific user
 * Method: GET /api/flags/user/:userId
 * Input: Path params: { userId: number }
 * Output: { success: boolean, data: Array<FlagObject>, count: number, message: string }
 * Authentication: Required (User/Admin/Staff)
 */
app.get("/api/flags/user/:userId", authController.verifyToken, FlagController.getFlagsByUser);

/**
 * FLAG REMOVE: Remove flag report
 * Purpose: Delete a flag report from the system and unhide blog if needed
 * Method: DELETE /api/flags/:id
 * Input: Path params: { id: number }
 * Output: { success: boolean, message: string, blogUnhidden: boolean, remainingFlags: number, blogId: number }
 * Authentication: Required (Admin/Staff)
 */
app.delete("/api/flags/:id", authController.verifyStaffOrAdmin, FlagController.removeFlag);

/**
 * FLAGS LIST: Get all flags
 * Purpose: Retrieve all flag reports for admin review
 * Method: GET /api/flags
 * Input: None
 * Output: { success: boolean, data: Array<FlagObject>, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/flags", authController.verifyStaffOrAdmin, FlagController.getAllFlags);

/**
 * MOST FLAGGED BLOGS: Get blogs with most flags
 * Purpose: Retrieve blogs sorted by number of flags for moderation priority
 * Method: GET /api/flags/most-flagged-blogs
 * Input: None
 * Output: { success: boolean, data: Array<BlogFlagCount>, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/flags/most-flagged-blogs", authController.verifyStaffOrAdmin, FlagController.getMostFlaggedBlogs);

/**
 * CLEAR BLOG FLAGS: Remove all flags from a blog
 * Purpose: Clear all flag reports for a specific blog
 * Method: DELETE /api/flags/blog/:blogId/clear
 * Input: Path params: { blogId: number }
 * Output: { success: boolean, deletedCount: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.delete("/api/flags/blog/:blogId/clear", authController.verifyStaffOrAdmin, FlagController.clearBlogFlags);

/**
 * BANNED USERS: Get users banned due to flags
 * Purpose: Retrieve users who were banned due to flagged content
 * Method: GET /api/flags/banned-users
 * Input: None
 * Output: { success: boolean, data: Array<BannedUserObject>, count: number, message: string }
 * Authentication: Required (Admin/Staff)
 */
app.get("/api/flags/banned-users", authController.verifyStaffOrAdmin, FlagController.getBannedUsers);

/**
 * UNBAN USER: Remove ban from user
 * Purpose: Unban a user who was banned due to flagged content
 * Method: PATCH /api/flags/unban-user/:userId
 * Input: Path params: { userId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Admin)
 */
app.patch("/api/flags/unban-user/:userId", authController.verifyToken, FlagController.unbanUser);

// ==================== ENROLLMENT ROUTES ====================
/**
 * USER ENROLLMENTS: Get enrollments by user
 * Purpose: Retrieve all program enrollments for a specific user
 * Method: GET /api/enrollments/user/:userId
 * Input: Path params: { userId: number }
 * Output: { success: boolean, data: Array<EnrollmentObject>, count: number, message: string }
 * Authentication: Required (User/Admin/Staff)
 */
app.get("/api/enrollments/user/:userId", authController.verifyToken, EnrollController.getEnrollmentsByUser);

/**
 * CHECK MY ENROLLMENT: Check enrollment status for program
 * Purpose: Check if current user is enrolled in a specific program
 * Method: GET /api/enrollments/check/:programId
 * Input: Path params: { programId: number }, user ID from token
 * Output: { success: boolean, isEnrolled: boolean, enrollment?: object, message: string }
 * Authentication: Required
 */
app.get("/api/enrollments/check/:programId", authController.verifyToken, EnrollController.getCheckMyEnrollment);

/**
 * ENROLLMENT DETAILS: Get specific enrollment
 * Purpose: Retrieve detailed enrollment information with progress
 * Method: GET /api/enrollments/:userId/:programId
 * Input: Path params: { userId: number, programId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (User/Admin/Staff)
 */
app.get("/api/enrollments/:userId/:programId", authController.verifyToken, EnrollController.getEnrollmentById);

/**
 * ENROLLMENT CREATE: Enroll in program
 * Purpose: Create new enrollment for user in a program
 * Method: POST /api/enrollments
 * Input: { program_id: number, user_id?: number } (user_id from token if not provided)
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required
 */
app.post("/api/enrollments", authController.verifyToken, EnrollController.createEnrollment);

/**
 * CONTENT PROGRESS TOGGLE: Mark content as complete/incomplete
 * Purpose: Toggle completion status of specific content in enrollment
 * Method: PATCH /api/enrollments/:enrollId/content/:contentId/toggle
 * Input: Path params: { enrollId: string, contentId: number }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Enrolled User)
 */
app.patch("/api/enrollments/:enrollId/content/:contentId/toggle", authController.verifyToken, EnrollController.toggleContentCompletion);

/**
 * ENROLLMENT COMPLETE: Mark enrollment as completed
 * Purpose: Mark entire program enrollment as completed
 * Method: PUT /api/enrollments/:enrollId/complete
 * Input: Path params: { enrollId: string }
 * Output: { success: boolean, data: object, message: string }
 * Authentication: Required (Enrolled User)
 */
app.put("/api/enrollments/:enrollId/complete", authController.verifyToken, EnrollController.updateEnrollmentCompletionById);

/**
 * DELETE MY ENROLLMENT: Delete enrollment for current user
 * Purpose: Allow user to delete their own enrollment in a program (more secure than using userId in path)
 * Method: DELETE /api/enrollments/my/:programId
 * Input: Path params: { programId: number }, user ID from token
 * Output: { success: boolean, message: string }
 * Authentication: Required (Enrolled User)
 */
app.delete("/api/enrollments/my/:programId", authController.verifyToken, EnrollController.deleteMyEnrollment);

// ==================== COMMUNITY EVENT ROUTES ====================
// Community events route is already defined in the Program Routes section above

// ==================== SURVEY ROUTES ====================
/**
 * SURVEY API STRUCTURE:
 * 
 * GET    /api/surveys/program/:programId/type/:type - Get surveys by program ID and type
 * POST   /api/surveys                               - Create new survey (Admin/Staff)
 * PUT    /api/surveys/:id                           - Update survey and delete all responses (Admin/Staff)
 */

// Core survey routes
app.get("/api/surveys/program/:programId/type/:type", authController.verifyToken, SurveyController.getSurveysByTypeAndProgramId);
app.get("/api/surveys/program/:programId", authController.verifyToken, SurveyController.getSurveysByProgramId);
app.post("/api/surveys", authController.verifyToken, SurveyController.createSurvey);
app.put("/api/surveys/:id", authController.verifyToken, SurveyController.updateSurvey);

// Test endpoint for survey updates (temporary for debugging)
app.put("/api/surveys-test/:id", (req, res) => {
    console.log("🧪 Test survey update endpoint called");
    console.log("🧪 Request params:", req.params);
    console.log("🧪 Request body:", req.body);
    console.log("🧪 Request headers:", req.headers);

    res.status(200).json({
        success: true,
        message: "Test endpoint working",
        received_data: {
            id: req.params.id,
            body: req.body,
            headers: req.headers
        }
    });
});

// ==================== SURVEY RESPONSE ROUTES ====================
/**
 * SURVEY RESPONSE API STRUCTURE:
 * 
 * GET    /api/survey-responses                        - Get all survey responses (admin)
 * GET    /api/survey-responses/me                     - Get current user's responses (key-value format)
 * GET    /api/survey-responses/check/:surveyId        - Check if current user responded to a survey
 * GET    /api/survey-responses/statistics             - Get survey response statistics by program/type
 * GET    /api/survey-responses/date-range             - Get responses by date range
 * GET    /api/survey-responses/:id                    - Get survey response by ID
 * GET    /api/survey-responses/:id/parsed             - Get parsed survey response by ID
 * GET    /api/survey-responses/:id/with-relations     - Get response with user and survey info
 * GET    /api/survey-responses/survey/:surveyId       - Get responses by survey ID
 * GET    /api/survey-responses/user/:userId           - Get responses by user ID
 * GET    /api/survey-responses/survey/:surveyId/analytics - Get survey analytics
 * GET    /api/survey-responses/check/:surveyId/:userId - Check if user responded to survey
 * POST   /api/survey-responses                        - Submit new survey response (key-value format)
 * POST   /api/survey-responses/legacy                 - Submit survey response (legacy format)
 * PUT    /api/survey-responses                        - Update existing survey response (key-value format)
 * PUT    /api/survey-responses/:id                    - Update survey response by ID (legacy format)
 * DELETE /api/survey-responses/:id                    - Delete survey response
 */

// User-facing survey response routes (key-value format)
app.get("/api/survey-responses/me", authController.verifyToken, SurveyResponseController.getMySurveyResponsesKeyValue);
app.get("/api/survey-responses/check/:surveyId", authController.verifyToken, SurveyResponseController.checkMyResponse);
app.post("/api/survey-responses", authController.verifyToken, SurveyResponseController.submitSurveyResponseKeyValue);
app.put("/api/survey-responses", authController.verifyToken, SurveyResponseController.updateSurveyResponseKeyValue);

// Admin/Staff survey response routes
app.get("/api/survey-responses", authController.verifyToken, SurveyResponseController.getAllSurveyResponses);
app.get("/api/survey-responses/statistics", authController.verifyToken, SurveyResponseController.getSurveyResponseStatistics);
app.get("/api/survey-responses/date-range", authController.verifyToken, SurveyResponseController.getResponsesByDateRange);
app.get("/api/survey-responses/:id", authController.verifyToken, SurveyResponseController.getSurveyResponseById);
app.get("/api/survey-responses/:id/parsed", authController.verifyToken, SurveyResponseController.getParsedSurveyResponseById);
app.get("/api/survey-responses/:id/with-relations", authController.verifyToken, SurveyResponseController.getResponseWithRelations);
app.get("/api/survey-responses/survey/:surveyId", authController.verifyToken, SurveyResponseController.getResponsesBySurveyId);
app.get("/api/survey-responses/user/:userId", authController.verifyToken, SurveyResponseController.getResponsesByUserId);
app.get("/api/survey-responses/survey/:surveyId/analytics", authController.verifyToken, SurveyResponseController.getSurveyAnalytics);
app.get("/api/survey-responses/check/:surveyId/:userId", authController.verifyToken, SurveyResponseController.checkUserResponse);

// Legacy survey response routes (for backward compatibility)
app.post("/api/survey-responses/legacy", authController.verifyToken, SurveyResponseController.createSurveyResponse);
app.put("/api/survey-responses/:id", authController.verifyToken, SurveyResponseController.updateSurveyResponse);
app.delete("/api/survey-responses/:id", authController.verifyToken, SurveyResponseController.deleteSurveyResponse);

// ==================== SERVER STARTUP ====================
app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log("🚀 API Documentation available at: http://localhost:3000/api-docs");
    console.log("📋 API Routes Summary:");
    console.log("   Authentication: /api/login, /api/register, /api/google-*");
    console.log("   Dashboard: /api/dashboard, /api/dashboard/detailed");
    console.log("   Profile: /api/profile, /api/profile/status");
    console.log("   User+Profile Combined: /api/user/profile-combined, /api/user/delete-account");
    console.log("   Staff: /api/staff/*");
    console.log("   Members: /api/members/*");
    console.log("   Consultants: /api/consultants/*");
    console.log("   Booking: /api/booking-sessions/*");
    console.log("   Assessments: /api/assessments/*");
    console.log("   Programs: /api/programs/*");
    console.log("   Content: /api/content/*");
    console.log("   Categories: /api/categories/*");
    console.log("   Blogs: /api/blogs/*");
    console.log("   Flags: /api/flags/*");
    console.log("   Enrollments: /api/enrollments/*");
    console.log("   Surveys: /api/surveys/*");
    console.log("   Survey Responses: /api/survey-responses/*");
    console.log("   Images: /api/images/:filename");
});

/*
=====================================================================
                         API DOCUMENTATION SUMMARY
=====================================================================

🔐 AUTHENTICATION ROUTES:
- POST /api/login - User login with email/password
- POST /api/register - User registration
- POST /api/google-login - Google OAuth login
- POST /api/google-register - Google OAuth registration

📊 DASHBOARD ROUTES:
- GET /api/dashboard - Basic dashboard statistics
- GET /api/dashboard/detailed - Comprehensive dashboard data

👤 PROFILE ROUTES:
- POST /api/profile - Create/update user profile
- GET /api/profile - Get current user profile
- GET /api/profile/status - Check profile completion

🔗 COMBINED USER+PROFILE ROUTES:
- GET /api/user/profile-combined - Get complete user and profile data (JWT token)
- PUT /api/user/profile-combined - Update user and profile data together (JWT token)
- DELETE /api/user/delete-account - Deactivate user account (soft delete - sets status to 'inactive') (JWT token)

👥 USER MANAGEMENT ROUTES:
Staff (Admin only):
- GET /api/staff - List all staff
- POST /api/staff - Create staff member
- PUT /api/staff/:id - Update staff member
- DELETE /api/staff/:id - Delete staff member

Members (Admin/Staff):
- GET /api/members - List all members
- GET /api/members/:id - Get member details
- DELETE /api/members/:id - Delete member

💬 CONSULTANT & BOOKING ROUTES:
- GET /api/consultants - List consultants (public)
- POST /api/consultants - Create consultant (admin)
- GET /api/consultant-slots/:id - Get consultant availability
- POST /api/booking-sessions - Book consultation session
- GET /api/booking-sessions/scheduled - Get scheduled booking sessions (auth)
- GET /api/booking-sessions/member - Get all booking sessions for member (auth)

📝 ASSESSMENT ROUTES:
- GET /api/assessments/me - Get my assessments
- POST /api/assessments/take-test - Submit assessment test
- GET /api/assessments/type/:type - Filter by assessment type

🎓 PROGRAM ROUTES:
- GET /api/programs - List all programs
- GET /api/programs/category-details - Programs organized by category with statistics
- GET /api/programs/community-events - Community event programs
- GET /api/programs/:id - Get program details
- GET /api/programs/category/:categoryId - Get programs by category
- GET /api/programs/:programId/survey-analytics - Comprehensive survey analytics
- GET /api/programs/my-enrollment-status - User's enrollment status
- POST /api/programs - Create new program (auth)
- PUT /api/programs/:id - Update program (auth)
- DELETE /api/programs/:id - Delete program (auth)

📚 CONTENT ROUTES:
- GET /api/content/program/:programId - Get program content
- POST /api/content/youtube - Create YouTube content (auth)
- POST /api/content/markdown - Create markdown content (auth)
- POST /api/content/podcast - Create podcast content (auth)

🏷️ CATEGORY ROUTES:
- GET /api/categories - List all categories (public)
- POST /api/categories - Create new category (auth)
- PUT /api/categories/:id - Update category (auth)
- DELETE /api/categories/:id - Delete category (auth)

📰 BLOG ROUTES:
- GET /api/blogs - List published blogs (public)
- POST /api/blogs - Create blog post (auth)
- GET /api/blogs/pending - Pending blogs (admin/staff)
- PATCH /api/blogs/:id/approve - Approve blog (admin/staff)

📊 SURVEY ROUTES:
- GET /api/surveys/program/:programId/type/:type - Get surveys by program and type
- POST /api/surveys - Create survey (auth)
- PUT /api/surveys/:id - Update survey and delete all responses (auth)

📋 SURVEY RESPONSE ROUTES:
- GET /api/survey-responses/me - My survey responses
- GET /api/survey-responses/check/:surveyId - Check if I responded to survey
- POST /api/survey-responses - Submit survey response (auth)
- GET /api/survey-responses/statistics - Response statistics

🎯 ENROLLMENT ROUTES:
- POST /api/enrollments - Enroll in program (auth)
- GET /api/enrollments/check/:programId - Check enrollment status
- PATCH /api/enrollments/:id/content/:contentId/toggle - Toggle content completion

🖼️ FILE SERVING ROUTES:
- GET /api/images/:filename - Serve images with caching

🔒 AUTHENTICATION LEVELS:
- None: Public endpoints (programs, blogs, consultants)
- Required: User must be logged in
- Admin/Staff: Administrative functions only
- Author/Owner: User can only access their own resources

📱 RESPONSE FORMAT:
All API responses follow this structure:
{
  "success": boolean,
  "data": any,
  "message": string,
  "error"?: string (only on failures)
}

🚀 DEVELOPMENT FEATURES:
- Swagger UI: http://localhost:3000/api-docs
- Swagger Bypass: Add header "x-swagger-bypass: true" for testing
- Debug endpoint: GET / (lists all users)

=====================================================================
*/

// Debug: Check if controllers are properly imported before setting up routes.
console.log("🔍 Debug: Checking controller imports...");
console.log("ProgramController:", typeof ProgramController);
console.log("ProgramController.getAllPrograms:", typeof ProgramController.getAllPrograms);
console.log("ProgramController.getProgramSurveyAnalytics:", typeof ProgramController.getProgramSurveyAnalytics);