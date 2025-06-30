require("dotenv").config();
/*
 * EXPRESS SERVER SETUP
 * This file sets up the Express backend that the React frontend connects to.
 * The connection between React and Express is handled through HTTP requests.
 */

// ==================== IMPORTS ====================
// Core dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const sql = require("mssql");
require("dotenv").config();

// Database configuration
const config = {
  user: "sa",
  password: "12345",
  server: "localhost",
  port: 1433,
  database: "SWP391demo",
  options: {
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
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
const BlogController = require("./Controller/blogController");
const ContentController = require("./Controller/contentController");

// Missing controller imports
const CategoryController = require("./Controller/categoryController");
const ProgramController = require("./Controller/programController");
const EnrollController = require("./Controller/enrollController");
const SurveyController = require("./Controller/surveyController");
const SurveyResponseController = require("./Controller/surveyResponseController");

// Import routes (Disabled - routes directory not found)
// const googleMeetRoutes = require("./routes/googleMeetRoutes");
const ActionController = require("./Controller/actionController");
const ConsultantSlotController = require("./Controller/consultantSlotController");
const BookingSessionController = require("./Controller/bookingSessionController");

// ==================== APP SETUP ====================
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Performance Middleware
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});
app.use(limiter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Request Validation Middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

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
// User routes
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

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
  DashboardController.getConsultantDashboard
);

// Profile Routes (Protected - require authentication)
app.post(
  "/api/profile",
  authController.verifyToken,
  ProfileController.createProfile
);
app.get(
  "/api/profile",
  authController.verifyToken,
  ProfileController.getUserProfile
);
app.get(
  "/api/profile/me",
  authController.verifyToken,
  ProfileController.getUserProfile
);
app.get(
  "/api/profile/status",
  authController.verifyToken,
  ProfileController.checkProfileStatus
);
app.put(
  "/api/profile",
  authController.verifyToken,
  ProfileController.updateProfile
);
app.delete(
  "/api/profile",
  authController.verifyToken,
  ProfileController.deleteProfile
);

// Register Google Meet routes (Disabled - routes not found)
// app.use("/api/googlemeet", authController.verifyToken, googleMeetRoutes);

// Blog Routes
app.get("/api/blogs", BlogController.getAllBlogs);
app.get("/api/blogs/published", BlogController.getPublishedBlogs);
app.get("/api/blogs/search", BlogController.searchBlogs);
app.get("/api/blogs/author/:authorId", BlogController.getBlogsByAuthorId);
app.get("/api/blogs/:id/relations", BlogController.getBlogWithRelations);
app.get("/api/blogs/:id", BlogController.getBlogById);
app.post("/api/blogs", authController.verifyToken, BlogController.createBlog);
app.put(
  "/api/blogs/:id",
  authController.verifyToken,
  BlogController.updateBlog
);
app.delete(
  "/api/blogs/:id",
  authController.verifyToken,
  BlogController.deleteBlog
);
app.put(
  "/api/blogs/:id/status",
  authController.verifyToken,
  BlogController.updateBlogStatus
);

// Admin Profile Routes
app.get(
  "/api/profiles",
  authController.verifyToken,
  ProfileController.getAllProfiles
);
app.get(
  "/api/profile/:userId",
  authController.verifyToken,
  ProfileController.getProfileByUserId
);

// Staff Routes
app.get("/api/staff", authController.verifyToken, StaffController.getAllStaff);
app.get(
  "/api/staff/:staffName",
  authController.verifyToken,
  StaffController.searchStaffByName
);
app.post("/api/staff", authController.verifyToken, StaffController.createStaff);
app.put(
  "/api/staff/:staffId",
  authController.verifyToken,
  StaffController.updateStaff
);
app.delete(
  "/api/staff/:staffId",
  authController.verifyToken,
  StaffController.deleteStaff
);
app.get(
  "/api/staff/statistics",
  authController.verifyToken,
  StaffController.getStaffStatistics
);

// Member Routes
app.get(
  "/api/member",
  authController.verifyToken,
  MemberController.getAllMembers
); // Admin page - Show list thành viên
app.get(
  "/api/members",
  authController.verifyToken,
  MemberController.getAllMembers
);
app.get(
  "/api/members/search/:memberName",
  authController.verifyToken,
  MemberController.searchMembersByName
);
app.get(
  "/api/members/statistics",
  authController.verifyToken,
  MemberController.getMemberStatistics
);
app.get(
  "/api/members/:memberId",
  authController.verifyToken,
  MemberController.getMemberById
);
app.post(
  "/api/members",
  authController.verifyToken,
  MemberController.createMember
);
app.put(
  "/api/members/:memberId",
  authController.verifyToken,
  MemberController.updateMember
);
app.delete(
  "/api/members/:memberId",
  authController.verifyToken,
  MemberController.deleteMember
);

// Consultant Routes
// More specific routes first
app.get(
  "/api/consultants/search/:consultantName",
  ConsultantController.searchConsultantsByName
);
app.get(
  "/api/consultants/statistics",
  authController.verifyToken,
  ConsultantController.getAllConsultants
);
// Parameter route
app.get(
  "/api/consultants/:consultantId",
  ConsultantController.getConsultantById
);
// General routes
app.get("/api/consultants", ConsultantController.getAllConsultants);
app.post("/api/consultants", ConsultantController.createConsultant);
app.put(
  "/api/consultants/:consultantId",
  ConsultantController.updateConsultant
);
app.delete(
  "/api/consultants/:consultantId",
  ConsultantController.deleteConsultant
);

// Assessment routes (Protected - require authentication)
app.get(
  "/api/assessment",
  authController.verifyToken,
  AssessmentController.getAllAssessments
); // For Admin page
app.get("/api/assessments", AssessmentController.getAllAssessments);
app.get("/api/assessments/:id", AssessmentController.getAssessmentById);
app.get(
  "/api/assessments/user/:userId",
  AssessmentController.getAssessmentsByUserId
);
app.get(
  "/api/assessments/details/:userId",
  AssessmentController.getAssessmentDetails
);
app.get(
  "/api/assessments/with-relations",
  AssessmentController.getAssessmentsWithRelations
);
app.get(
  "/api/assessments/type/:type",
  AssessmentController.getAssessmentsByType
);
app.get(
  "/api/assessments/date-range",
  AssessmentController.getAssessmentsByDateRange
);
app.post("/api/assessments", AssessmentController.createAssessment);
app.post("/api/assessments/take-test", AssessmentController.takeTestFromUser);
app.put("/api/assessments/:id", AssessmentController.updateAssessment);
app.delete("/api/assessments/:id", AssessmentController.deleteAssessment);

// Special endpoint for taking tests - processes score and saves assessment
app.post(
  "/api/assessments/take-test",
  authController.verifyToken,
  AssessmentController.takeTestFromUser
);

// Google Meet routes (Disabled - controller not found)
// app.post("/api/meetings/create", GoogleMeetController.createRestrictedMeeting);
// app.delete(
//   "/api/meetings/:eventId/bookings/:bookingId",
//   GoogleMeetController.cancelMeeting
// );
app.get(
  "/api/consultants/search/:consultantName",
  authController.verifyToken,
  ConsultantController.searchConsultantsByName
);
app.get(
  "/api/consultants/statistics",
  authController.verifyToken,
  ConsultantController.getAllConsultants
);
app.get(
  "/api/consultants/:consultantId",
  ConsultantController.getConsultantById
);
app.post(
  "/api/consultants",
  authController.verifyToken,
  ConsultantController.createConsultant
);
app.put(
  "/api/consultants/:consultantId",
  ConsultantController.updateConsultant
);
app.delete(
  "/api/consultants/:consultantId",
  authController.verifyToken,
  ConsultantController.deleteConsultant
);

// Consultant Slot Routes
app.get(
  "/api/consultant-slots/:consultantId",
  ConsultantSlotController.getSlotsByConsultantId
);

// Booking Session Routes
app.get(
  "/api/booking-sessions/me",
  authController.verifyToken,
  BookingSessionController.getBookingSessionsByMember
); // toàn bộ booking session
app.get(
  "/api/booking-sessions/scheduled",
  authController.verifyToken,
  BookingSessionController.getScheduledBookingSessions
); // chỉ lấy đang có lịch lịch hạn trong tương lailai
app.post(
  "/api/booking-sessions",
  authController.verifyToken,
  BookingSessionController.createBookingSession
);

// Assessment Routes
app.get(
  "/api/assessments",
  authController.verifyToken,
  AssessmentController.getAllAssessments
);
app.get(
  "/api/assessments/:id",
  authController.verifyToken,
  AssessmentController.getAssessmentById
);
app.get(
  "/api/assessments/user/:userId",
  authController.verifyToken,
  AssessmentController.getAssessmentsByUserId
);
app.get(
  "/api/assessments/details/:userId",
  authController.verifyToken,
  AssessmentController.getAssessmentDetails
);
app.get(
  "/api/assessments/with-relations",
  authController.verifyToken,
  AssessmentController.getAssessmentsWithRelations
);
app.get(
  "/api/assessments/type/:type",
  authController.verifyToken,
  AssessmentController.getAssessmentsByType
);
app.get(
  "/api/assessments/date-range",
  authController.verifyToken,
  AssessmentController.getAssessmentsByDateRange
);
app.post(
  "/api/assessments",
  authController.verifyToken,
  AssessmentController.createAssessment
);
app.post(
  "/api/assessments/take-test",
  authController.verifyToken,
  AssessmentController.takeTestFromUser
);
app.put(
  "/api/assessments/:id",
  authController.verifyToken,
  AssessmentController.updateAssessment
);
app.delete(
  "/api/assessments/:id",
  authController.verifyToken,
  AssessmentController.deleteAssessment
);

// Action Routes
app.get(
  "/api/actions",
  authController.verifyToken,
  ActionController.getAllActions
);
app.get(
  "/api/actions/:id",
  authController.verifyToken,
  ActionController.getActionById
);
app.get(
  "/api/actions/type/:type",
  authController.verifyToken,
  ActionController.getActionsByType
);
app.get(
  "/api/actions/with-assessments",
  authController.verifyToken,
  ActionController.getActionsWithAssessments
);
app.post(
  "/api/actions",
  authController.verifyToken,
  ActionController.createAction
);
app.put(
  "/api/actions/:id",
  authController.verifyToken,
  ActionController.updateAction
);
app.delete(
  "/api/actions/:id",
  authController.verifyToken,
  ActionController.deleteAction
);

// ==================== MISSING API ROUTES ====================

// Categories Routes
app.get("/api/categories", CategoryController.getAllCategories);

// Programs Routes
app.get(
  "/api/programs",
  authController.verifyToken,
  ProgramController.getAllPrograms
);
app.get(
  "/api/programs/category/:categoryId",
  ProgramController.getProgramsByCategory
);
app.get("/api/programs/:id", ProgramController.getProgramById);

// Content Routes
app.get("/api/content/preview/:id", ContentController.getPreviewContent);
app.get("/api/content/:contentId", ContentController.getContentById);
app.get("/api/content/file/:contentId", ContentController.getContentFile);

// Enrollment Routes
app.get(
  "/api/enrollments/check/:programId",
  authController.verifyToken,
  EnrollController.getCheckMyEnrollment
);
app.get(
  "/api/enrollments/user/:userId",
  authController.verifyToken,
  EnrollController.getEnrollmentsByUser
);

// ==================== SURVEY ROUTES ====================

// Survey Routes (Public and Protected)
app.get("/api/surveys", SurveyController.getAllSurveys);
app.get("/api/surveys/:id", SurveyController.getSurveyById);
app.get("/api/surveys/parsed/:id", SurveyController.getParsedSurveyById);
app.get(
  "/api/surveys/program/:programId",
  SurveyController.getSurveysByProgramId
);
app.get("/api/surveys/:id/with-program", SurveyController.getSurveyWithProgram);
app.get(
  "/api/surveys/:id/with-responses",
  SurveyController.getSurveyWithResponses
);
app.get(
  "/api/surveys/type/:type/program/:programId",
  SurveyController.getSurveysByTypeAndProgramId
);
app.get(
  "/api/surveys/:id/response-stats",
  SurveyController.getSurveyResponseStats
);

// Admin-only Survey Routes
app.post(
  "/api/surveys",
  authController.verifyToken,
  SurveyController.createSurvey
);
app.put(
  "/api/surveys/:id",
  authController.verifyToken,
  SurveyController.updateSurvey
);
app.delete(
  "/api/surveys/:id",
  authController.verifyToken,
  SurveyController.deleteSurvey
);

// ==================== SURVEY RESPONSE ROUTES ====================

// Survey Response Routes (Public and Protected)
app.get(
  "/api/survey-responses",
  SurveyResponseController.getAllSurveyResponses
);
app.get(
  "/api/survey-responses/:id",
  SurveyResponseController.getSurveyResponseById
);
app.get(
  "/api/survey-responses/parsed/:id",
  SurveyResponseController.getParsedSurveyResponseById
);
app.get(
  "/api/survey-responses/survey/:surveyId",
  SurveyResponseController.getResponsesBySurveyId
);
app.get(
  "/api/survey-responses/user/:userId",
  SurveyResponseController.getResponsesByUserId
);
app.get(
  "/api/survey-responses/:id/with-relations",
  SurveyResponseController.getResponseWithRelations
);
app.get(
  "/api/survey-responses/date-range",
  SurveyResponseController.getResponsesByDateRange
);

// Survey Analytics and Statistics Routes
app.get(
  "/api/survey-responses/analytics/:surveyId",
  SurveyResponseController.getSurveyAnalytics
);
app.get(
  "/api/survey-responses/statistics",
  SurveyResponseController.getSurveyResponseStatistics
); // Query by programId, type

// User-specific Survey Response Routes
app.get(
  "/api/survey-responses/check/user/:userId/survey/:surveyId",
  SurveyResponseController.checkUserResponse
);
app.get(
  "/api/survey-responses/my-responses",
  authController.verifyToken,
  SurveyResponseController.getMySurveyResponsesKeyValue
);
app.get(
  "/api/survey-responses/check-my-response/:surveyId",
  authController.verifyToken,
  SurveyResponseController.checkMyResponse
);

// Protected Survey Response Routes
app.post(
  "/api/survey-responses",
  authController.verifyToken,
  SurveyResponseController.createSurveyResponse
);
app.post(
  "/api/survey-responses/submit-kv",
  authController.verifyToken,
  SurveyResponseController.submitSurveyResponseKeyValue
);
app.put(
  "/api/survey-responses/:id",
  authController.verifyToken,
  SurveyResponseController.updateSurveyResponse
);
app.put(
  "/api/survey-responses/update-kv/:id",
  authController.verifyToken,
  SurveyResponseController.updateSurveyResponseKeyValue
);
app.delete(
  "/api/survey-responses/:id",
  authController.verifyToken,
  SurveyResponseController.deleteSurveyResponse
);

// ==================== ADMIN-SPECIFIC ROUTES ====================

// Admin Dashboard Routes (All protected with authentication)
app.get(
  "/api/admin/dashboard/basic",
  authController.verifyToken,
  DashboardController.getDashboardStats
);
app.get(
  "/api/admin/dashboard/detailed",
  authController.verifyToken,
  DashboardController.getDetailedDashboard
);
app.get(
  "/api/admin/dashboard/members/monthly",
  authController.verifyToken,
  DashboardController.getMonthlyCreatedMembers
);
app.get(
  "/api/admin/dashboard/members/active",
  authController.verifyToken,
  DashboardController.getActiveMembers
);
app.get(
  "/api/admin/dashboard/enrollments/monthly",
  authController.verifyToken,
  DashboardController.getMonthlyCourseEnrollment
);
app.get(
  "/api/admin/dashboard/bookings/monthly",
  authController.verifyToken,
  DashboardController.getMonthlyBookingSessions
);
app.get(
  "/api/admin/dashboard/consultants",
  authController.verifyToken,
  DashboardController.getConsultantDashboard
);

// Admin Management Routes (All protected with authentication)
app.get(
  "/api/admin/members",
  authController.verifyToken,
  MemberController.getAllMembers
);
app.get(
  "/api/admin/staff",
  authController.verifyToken,
  StaffController.getAllStaff
);
app.get(
  "/api/admin/consultants",
  authController.verifyToken,
  ConsultantController.getAllConsultants
);
app.get(
  "/api/admin/assessments",
  authController.verifyToken,
  AssessmentController.getAllAssessments
);
app.get(
  "/api/admin/programs",
  authController.verifyToken,
  ProgramController.getAllPrograms
);
app.get(
  "/api/admin/surveys",
  authController.verifyToken,
  SurveyController.getAllSurveys
);
app.get(
  "/api/admin/survey-responses",
  authController.verifyToken,
  SurveyResponseController.getAllSurveyResponses
);
app.get(
  "/api/admin/blogs",
  authController.verifyToken,
  BlogController.getAllBlogs
);

// Admin Statistics Routes (All protected with authentication)
app.get(
  "/api/admin/stats/members",
  authController.verifyToken,
  MemberController.getMemberStatistics
);
app.get(
  "/api/admin/stats/staff",
  authController.verifyToken,
  StaffController.getStaffStatistics
);
app.get(
  "/api/admin/stats/surveys",
  authController.verifyToken,
  SurveyResponseController.getSurveyResponseStatistics
);

// Test Route
app.get("/api/test-profile", authController.verifyToken, (req, res) => {
  // The verifyToken middleware ensures this route is only accessible with a valid token
  // The decoded user information is available in req.user
  res.json({
    message: "Protected route accessed successfully",
    user: req.user, // Return the user data from the token
  });
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
