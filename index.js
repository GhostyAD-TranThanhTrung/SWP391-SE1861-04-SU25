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
const ConsultantSlotController = require("./Controller/consultantSlotController");
const BookingSessionController = require("./Controller/bookingSessionController");
const ProgramController = require("./Controller/programController");
const ContentController = require("./Controller/contentController");
const BlogController = require("./Controller/blogController");
const EnrollController = require("./Controller/enrollController");
const CategoryController = require("./Controller/categoryController");
const SurveyController = require("./Controller/surveyController");
const SurveyResponseController = require("./Controller/surveyResponseController");

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

// Dashboard Routes
app.get("/api/dashboard", DashboardController.getDashboardStats);
app.get("/api/dashboard/detailed", DashboardController.getDetailedDashboard);

// Profile Routes
app.post("/api/profile", authController.verifyToken, ProfileController.createProfile);
app.get("/api/profile", authController.verifyToken, ProfileController.getUserProfile);
app.get("/api/profile/status", authController.verifyToken, ProfileController.checkProfileStatus);

// Staff Routes (Admin)
app.get("/api/staff", authController.verifyToken, StaffController.getAllStaff);
app.get("/api/staff/:staffName", authController.verifyToken, StaffController.searchStaffByName);
app.post("/api/staff", authController.verifyToken, StaffController.createStaff);
app.put("/api/staff/:staffId", authController.verifyToken, StaffController.updateStaff);
app.delete("/api/staff/:staffId", authController.verifyToken, StaffController.deleteStaff);

// Member Routes (Admin)
app.get("/api/members", authController.verifyToken, MemberController.getAllMembers);
app.get("/api/members/search/:memberName", authController.verifyToken, MemberController.searchMembersByName);
app.get("/api/members/:memberId", authController.verifyToken, MemberController.getMemberById);
app.delete("/api/members/:memberId", authController.verifyToken, MemberController.deleteMember);

// Consultant Routes
app.get("/api/consultants", ConsultantController.getAllConsultants);
app.get("/api/consultants/search/:consultantName", authController.verifyToken, ConsultantController.searchConsultantsByName);
app.get("/api/consultants/:consultantId", ConsultantController.getConsultantById);
app.post("/api/consultants", authController.verifyToken, ConsultantController.createConsultant);
app.put("/api/consultants/:consultantId", ConsultantController.updateConsultant);
app.delete("/api/consultants/:consultantId", authController.verifyToken, ConsultantController.deleteConsultant);

// Consultant Slot Routes
app.get("/api/consultant-slots/:consultantId", ConsultantSlotController.getSlotsByConsultantId);

// Booking Session Routes
app.get("/api/booking-sessions/scheduled", authController.verifyToken, BookingSessionController.getScheduledBookingSessions);
app.post("/api/booking-sessions", authController.verifyToken, BookingSessionController.createBookingSession);

// Assessment Routes
app.get('/api/assessments', authController.verifyToken, AssessmentController.getAllAssessments);
app.get('/api/assessments/me', authController.verifyToken, AssessmentController.getAssessmentsByUserToken);
app.get('/api/assessments/details/:userId', authController.verifyToken, AssessmentController.getAssessmentDetails);
app.get('/api/assessments/type/:type', authController.verifyToken, AssessmentController.getAssessmentsByType);
app.post('/api/assessments/take-test', authController.verifyToken, AssessmentController.takeTestFromUser);
app.delete('/api/assessments/:id', authController.verifyToken, AssessmentController.deleteAssessment);

// Program Routes
app.get("/api/programs", ProgramController.getAllPrograms);
app.get("/api/programs/my-enrollment-status", authController.verifyToken, ProgramController.getUserProgramsWithEnrollmentStatus);
app.get("/api/programs/search", ProgramController.searchPrograms);
app.get("/api/programs/:id", ProgramController.getProgramById);
app.get("/api/programs/category/:categoryId", ProgramController.getProgramsByCategory);
app.post("/api/programs", authController.verifyToken, ProgramController.createProgram);
app.put("/api/programs/:id", authController.verifyToken, ProgramController.updateProgram);
app.delete("/api/programs/:id", authController.verifyToken, ProgramController.deleteProgram);
app.get("/api/programs/community-events", ProgramController.getCommunityEventPrograms); // Get Community Event programs only
// Content Routes
app.get("/api/content/:id", ContentController.getContentById);
app.get("/api/content/file/:id", ContentController.getContentFile);
app.get("/api/content/preview/:program_id", ContentController.getPreviewContent);

// Category Routes
app.get("/api/categories", CategoryController.getAllCategories);

// Blog Routes
app.get("/api/blogs", BlogController.getAllBlogs);
app.get("/api/blogs/my", authController.verifyToken, BlogController.getMyBlogs);
app.get("/api/blogs/:id", BlogController.getBlogById);
app.post("/api/blogs/with-image", authController.verifyToken, ...BlogController.createBlogWithImage);
app.put("/api/blogs/:id", authController.verifyToken, BlogController.updateBlog);
app.delete("/api/blogs/:id", authController.verifyToken, BlogController.deleteBlog);
app.patch("/api/blogs/:id/status", authController.verifyToken, BlogController.updateBlogStatus);

// ==================== ENROLLMENT ROUTES ====================
// Core enrollment routes
app.get("/api/enrollments/user/:userId", authController.verifyToken, EnrollController.getEnrollmentsByUser);
app.get("/api/enrollments/check/:programId", authController.verifyToken, EnrollController.getCheckMyEnrollment);
app.get("/api/enrollments/:userId/:programId", authController.verifyToken, EnrollController.getEnrollmentById);
app.post("/api/enrollments", authController.verifyToken, EnrollController.createEnrollment);

// Content progress routes
app.patch("/api/enrollments/:enrollId/content/:contentId/toggle", authController.verifyToken, EnrollController.toggleContentCompletion);
app.put("/api/enrollments/:enrollId/complete", authController.verifyToken, EnrollController.updateEnrollmentCompletionById);

// ==================== COMMUNITY EVENT ROUTES ====================
app.get("/api/programs/community-events", ProgramController.getCommunityEventPrograms);

// ==================== SURVEY ROUTES ====================
app.get("/api/surveys", authController.verifyToken, SurveyController.getAllSurveys);
app.get("/api/surveys/:id", authController.verifyToken, SurveyController.getSurveyById);
app.post("/api/surveys", authController.verifyToken, SurveyController.createSurvey);
app.get("/api/surveys/program/:programId", authController.verifyToken, SurveyController.getSurveysByProgramId);

// ==================== SURVEY RESPONSE ROUTES ====================
app.get("/api/survey-responses/me", authController.verifyToken, SurveyResponseController.getMySurveyResponsesKeyValue);
app.post("/api/survey-responses", authController.verifyToken, SurveyResponseController.submitSurveyResponseKeyValue);
app.get("/api/survey-responses/statistics", authController.verifyToken, SurveyResponseController.getSurveyResponseStatistics);

// ==================== SERVER STARTUP ====================
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
