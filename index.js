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

// Controller imports
const authController = require("./Controller/authController");
const googleController = require("./Controller/googleController");
const UserController = require("./Controller/userController");
const ProfileController = require("./Controller/profileController");
const AppDataSource = require("./src/data-source");
const DashboardController = require("./Controller/dashboardController");
const StaffController = require("./Controller/staffController");
const MemberController = require("./Controller/MemberController");
const ConsultantController = require("./Controller/consultantController");
const AssessmentController = require("./Controller/assessmentController");
const ActionController = require("./Controller/actionController");
const ConsultantSlotController = require("./Controller/consultantSlotController");
const BookingSessionController = require("./Controller/bookingSessionController");

// ==================== APP SETUP ====================
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
);

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

// ==================== ROUTES ====================
// Authentication Routes
app.post("/api/login", authController.login);
app.post("/api/register", authController.register);
app.post("/api/google-login", googleController.googleLogin);
app.post("/api/google-register", googleController.googleRegister);

// User Routes
app.get("/", authController.getAllUsers);
app.get("/orm", UserController.getAllUsers);
app.get("/api/data", authController.testApi);

// Dashboard Routes
app.get("/api/dashboard", DashboardController.getDashboardStats);
app.get("/api/dashboard/detailed", DashboardController.getDetailedDashboard);
app.get(
    "/api/dashboard/consultants",
    authController.verifyToken,
    DashboardController.getConsultantDashboard
);

// Profile Routes
app.post("/api/profile", authController.verifyToken, ProfileController.createProfile);
app.get("/api/profile", authController.verifyToken, ProfileController.getUserProfile);
app.get("/api/profile/me", authController.verifyToken, ProfileController.getUserProfile);
app.get("/api/profile/status", authController.verifyToken, ProfileController.checkProfileStatus);
app.put("/api/profile", authController.verifyToken, ProfileController.updateProfile);
app.delete("/api/profile", authController.verifyToken, ProfileController.deleteProfile);

// Admin Profile Routes
app.get("/api/profiles", authController.verifyToken, ProfileController.getAllProfiles);
app.get("/api/profile/:userId", authController.verifyToken, ProfileController.getProfileByUserId);

// Staff Routes
app.get("/api/staff", authController.verifyToken, StaffController.getAllStaff);
app.get("/api/staff/:staffName", authController.verifyToken, StaffController.searchStaffByName);
app.post("/api/staff", authController.verifyToken, StaffController.createStaff);
app.put("/api/staff/:staffId", authController.verifyToken, StaffController.updateStaff);
app.delete("/api/staff/:staffId", authController.verifyToken, StaffController.deleteStaff);
app.get("/api/staff/statistics", authController.verifyToken, StaffController.getStaffStatistics);

// Member Routes
app.get("/api/members", authController.verifyToken, MemberController.getAllMembers);
app.get("/api/members/search/:memberName", authController.verifyToken, MemberController.searchMembersByName);
app.get("/api/members/statistics", authController.verifyToken, MemberController.getMemberStatistics);
app.get("/api/members/:memberId", authController.verifyToken, MemberController.getMemberById);
app.post("/api/members", authController.verifyToken, MemberController.createMember);
app.put("/api/members/:memberId", authController.verifyToken, MemberController.updateMember);
app.delete("/api/members/:memberId", authController.verifyToken, MemberController.deleteMember);

// Consultant Routes
app.get("/api/consultants", ConsultantController.getAllConsultants);
app.get("/api/consultants/search/:consultantName", authController.verifyToken, ConsultantController.searchConsultantsByName);
app.get("/api/consultants/statistics", authController.verifyToken, ConsultantController.getAllConsultants);
app.get("/api/consultants/:consultantId",  ConsultantController.getConsultantById);
app.post("/api/consultants", authController.verifyToken, ConsultantController.createConsultant);
app.put("/api/consultants/:consultantId", ConsultantController.updateConsultant);
app.delete("/api/consultants/:consultantId", authController.verifyToken, ConsultantController.deleteConsultant);

// Consultant Slot Routes
app.get("/api/consultant-slots/:consultantId", ConsultantSlotController.getSlotsByConsultantId);

// Booking Session Routes
app.get("/api/booking-sessions/me", authController.verifyToken, BookingSessionController.getBookingSessionsByMember); // toàn bộ booking session
app.get("/api/booking-sessions/scheduled", authController.verifyToken, BookingSessionController.getScheduledBookingSessions);// chỉ lấy đang có lịch lịch hạn trong tương lailai

// Assessment Routes
app.get('/api/assessments', authController.verifyToken, AssessmentController.getAllAssessments);
app.get('/api/assessments/:id', authController.verifyToken, AssessmentController.getAssessmentById);
app.get('/api/assessments/user/:userId', authController.verifyToken, AssessmentController.getAssessmentsByUserId);
app.get('/api/assessments/details/:userId', authController.verifyToken, AssessmentController.getAssessmentDetails);
app.get('/api/assessments/with-relations', authController.verifyToken, AssessmentController.getAssessmentsWithRelations);
app.get('/api/assessments/type/:type', authController.verifyToken, AssessmentController.getAssessmentsByType);
app.get('/api/assessments/date-range', authController.verifyToken, AssessmentController.getAssessmentsByDateRange);
app.post('/api/assessments', authController.verifyToken, AssessmentController.createAssessment);
app.post('/api/assessments/take-test', authController.verifyToken, AssessmentController.takeTestFromUser);
app.put('/api/assessments/:id', authController.verifyToken, AssessmentController.updateAssessment);
app.delete('/api/assessments/:id', authController.verifyToken, AssessmentController.deleteAssessment);

// Action Routes
app.get('/api/actions', authController.verifyToken, ActionController.getAllActions);
app.get('/api/actions/:id', authController.verifyToken, ActionController.getActionById);
app.get('/api/actions/type/:type', authController.verifyToken, ActionController.getActionsByType);
app.get('/api/actions/with-assessments', authController.verifyToken, ActionController.getActionsWithAssessments);
app.post('/api/actions', authController.verifyToken, ActionController.createAction);
app.put('/api/actions/:id', authController.verifyToken, ActionController.updateAction);
app.delete('/api/actions/:id', authController.verifyToken, ActionController.deleteAction);

// Test Route
app.get("/api/test-profile", authController.verifyToken, (req, res) => {
    res.json({
        message: "Protected route accessed successfully",
        user: req.user,
    });
});

// ==================== SERVER STARTUP ====================
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
