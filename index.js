/*
 * EXPRESS SERVER SETUP
 * This file sets up the Express backend that the React frontend connects to.
 * The connection between React and Express is handled through HTTP requests.
 */

// Required packages for the server
const express = require("express");
const cors = require("cors"); // Enables Cross-Origin Resource Sharing so React can connect
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use(cors()); // This allows the React app to make requests to this server
app.use(express.json()); // This parses JSON request bodies from React fetch calls

// Import TypeORM data source
const AppDataSource = require("./src/data-source");

// Import controllers - check that the file paths are correct
const authController = require("./Controller/authController");
const registerController = require("./Controller/registerController");
const googleController = require("./Controller/googleController");
const profileController = require("./Controller/profileController");
const userController = require("./Controller/userController");
const categoryController = require("./Controller/categoryController");
const contentController = require("./Controller/contentController");

// Import newly created controllers
const flagController = require("./Controller/flagController");
const programController = require("./Controller/programController");
const surveyController = require("./Controller/surveyController");
const surveyResponseController = require("./Controller/surveyResponseController");
const assessmentController = require("./Controller/assessmentController");
const bookConsultationSessionController = require("./Controller/bookConsultationSessionController");

// Define setupRoutes function to be called after DB connection
function setupRoutes() {
  // API Documentation
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
  );

  // First, verify that each controller method exists
  console.log("Checking controller methods...");
  console.log(
    "authController.getAllUsers exists:",
    typeof authController.getAllUsers === "function"
  );
  console.log(
    "authController.testApi exists:",
    typeof authController.testApi === "function"
  );
  console.log(
    "authController.login exists:",
    typeof authController.login === "function"
  );
  console.log(
    "registerController.registerUser exists:",
    typeof registerController.registerUser === "function"
  );

  // Auth routes - add fallbacks in case methods don't exist
  app.get(
    "/",
    typeof authController.getAllUsers === "function"
      ? authController.getAllUsers
      : (req, res) => res.send("Welcome to the API")
  );

  app.get(
    "/api/data",
    typeof authController.testApi === "function"
      ? authController.testApi
      : (req, res) => res.json({ message: "Test API" })
  );

  app.post(
    "/api/login",
    typeof authController.login === "function"
      ? authController.login
      : (req, res) => res.status(501).json({ error: "Not implemented" })
  );

  app.post(
    "/api/register",
    typeof registerController.registerUser === "function"
      ? registerController.registerUser
      : (req, res) => res.status(501).json({ error: "Not implemented" })
  );

  // Only add these routes if the methods exist
  if (typeof googleController.googleLogin === "function") {
    app.post("/api/google-login", googleController.googleLogin);
  }

  if (typeof googleController.googleRegister === "function") {
    app.post("/api/google-register", googleController.googleRegister);
  }

  // Only add profile routes if methods exist
  if (
    typeof authController.verifyToken === "function" &&
    typeof profileController.createProfile === "function"
  ) {
    app.post(
      "/api/profile",
      authController.verifyToken,
      profileController.createProfile
    );
  }

  if (
    typeof authController.verifyToken === "function" &&
    typeof profileController.getProfile === "function"
  ) {
    app.get(
      "/api/profile/:userId",
      authController.verifyToken,
      profileController.getProfile
    );
  }

  if (
    typeof authController.verifyToken === "function" &&
    typeof profileController.getAllProfiles === "function"
  ) {
    app.get(
      "/api/profiles",
      authController.verifyToken,
      profileController.getAllProfiles
    );
  }

  if (
    typeof authController.verifyToken === "function" &&
    typeof profileController.updateProfile === "function"
  ) {
    app.put(
      "/api/profile/:userId",
      authController.verifyToken,
      profileController.updateProfile
    );
  }

  if (
    typeof authController.verifyToken === "function" &&
    typeof profileController.deleteProfile === "function"
  ) {
    app.delete(
      "/api/profile/:userId",
      authController.verifyToken,
      profileController.deleteProfile
    );
  }

  // User routes
  app.get(
    "/api/user/me",
    authController.verifyToken,
    userController.getCurrentUserProfile
  );

  // Example protected route
  if (typeof authController.verifyToken === "function") {
    app.get("/api/profile", authController.verifyToken, (req, res) => {
      res.json({
        message: "Protected route accessed successfully",
        user: req.user,
      });
    });
  }

  // ==================== FLAG CONTROLLER ROUTES ====================
  if (typeof authController.verifyToken === "function") {
    // Admin routes
    app.get(
      "/api/flags",
      authController.verifyToken,
      flagController.getAllFlags
    );

    app.get(
      "/api/blogs/:blogId/flags",
      authController.verifyToken,
      flagController.getFlagsForBlog
    );

    app.delete(
      "/api/flags/:flagId",
      authController.verifyToken,
      flagController.removeFlag
    );

    app.get(
      "/api/users/:userId/flags",
      authController.verifyToken,
      flagController.getFlagsByUser
    );

    app.get(
      "/api/flags/statistics",
      authController.verifyToken,
      flagController.getFlagStatistics
    );

    // User route - any authenticated user can flag a blog
    app.post(
      "/api/blogs/:blogId/flag",
      authController.verifyToken,
      flagController.flagBlog
    );
  }

  // ==================== PROGRAM CONTROLLER ROUTES ====================
  // Public routes (no authentication required)
  app.get("/api/programs", programController.getAllPrograms);
  app.get("/api/programs/:programId", programController.getProgramById);
  app.get(
    "/api/categories/:categoryId/programs",
    programController.getProgramsByCategory
  );

  // Routes requiring authentication
  if (typeof authController.verifyToken === "function") {
    // Program management
    app.post(
      "/api/programs",
      authController.verifyToken,
      programController.createProgram
    );

    app.put(
      "/api/programs/:programId",
      authController.verifyToken,
      programController.updateProgram
    );

    app.delete(
      "/api/programs/:programId",
      authController.verifyToken,
      programController.deleteProgram
    );

    // Creator specific route
    app.get(
      "/api/users/:userId/programs",
      authController.verifyToken,
      programController.getProgramsByCreator
    );

    // Enrollment routes
    app.post(
      "/api/programs/:programId/enroll",
      authController.verifyToken,
      programController.enrollInProgram
    );

    app.put(
      "/api/programs/:programId/progress",
      authController.verifyToken,
      programController.updateEnrollmentProgress
    );

    app.get(
      "/api/my-programs",
      authController.verifyToken,
      programController.getEnrolledPrograms
    );

    // Search route
    app.get("/api/programs/search", programController.searchPrograms);
  }

  // ==================== SURVEY CONTROLLER ROUTES ====================
  if (typeof authController.verifyToken === "function") {
    // Admin/Consultant routes
    app.get(
      "/api/surveys",
      authController.verifyToken,
      surveyController.getAllSurveys
    );

    app.post(
      "/api/surveys",
      authController.verifyToken,
      surveyController.createSurvey
    );

    app.put(
      "/api/surveys/:surveyId",
      authController.verifyToken,
      surveyController.updateSurvey
    );

    app.delete(
      "/api/surveys/:surveyId",
      authController.verifyToken,
      surveyController.deleteSurvey
    );

    app.get(
      "/api/surveys/:surveyId/responses",
      authController.verifyToken,
      surveyController.getSurveyResponses
    );

    app.get(
      "/api/surveys/:surveyId/analytics",
      authController.verifyToken,
      surveyController.getSurveyAnalytics
    );

    // User routes - public with auth
    app.get(
      "/api/surveys/:surveyId",
      authController.verifyToken,
      surveyController.getSurveyById
    );

    app.get(
      "/api/programs/:programId/surveys",
      authController.verifyToken,
      surveyController.getSurveysByProgram
    );

    app.post(
      "/api/surveys/:surveyId/responses",
      authController.verifyToken,
      surveyController.submitSurveyResponse
    );

    app.get(
      "/api/surveys/:surveyId/my-response",
      authController.verifyToken,
      surveyController.getUserSurveyResponse
    );
  }

  // ==================== SURVEY RESPONSE CONTROLLER ROUTES ====================
  if (typeof authController.verifyToken === "function") {
    // Submit a new response
    app.post(
      "/api/surveys/:surveyId/responses",
      authController.verifyToken,
      surveyResponseController.submitResponse
    );

    // Get a specific response
    app.get(
      "/api/responses/:responseId",
      authController.verifyToken,
      surveyResponseController.getResponseById
    );

    // Update a response (if allowed)
    app.put(
      "/api/responses/:responseId",
      authController.verifyToken,
      surveyResponseController.updateResponse
    );

    // Delete a response
    app.delete(
      "/api/responses/:responseId",
      authController.verifyToken,
      surveyResponseController.deleteResponse
    );

    // Get all responses by a user
    app.get(
      "/api/users/:userId/responses",
      authController.verifyToken,
      surveyResponseController.getResponsesByUser
    );

    // Admin/Consultant routes
    app.get(
      "/api/surveys/:surveyId/responses",
      authController.verifyToken,
      surveyResponseController.getResponsesBySurvey
    );

    app.get(
      "/api/surveys/:surveyId/responses/export",
      authController.verifyToken,
      surveyResponseController.exportResponsesToCSV
    );

    app.get(
      "/api/surveys/:surveyId/statistics",
      authController.verifyToken,
      surveyResponseController.getResponseStatistics
    );
  }

  // ==================== ASSESSMENT CONTROLLER ROUTES ====================
  if (typeof authController.verifyToken === "function") {
    // Admin/Consultant routes
    app.get(
      "/api/assessments",
      authController.verifyToken,
      assessmentController.getAllAssessments
    );

    app.get(
      "/api/assessments/type/:type",
      authController.verifyToken,
      assessmentController.getAssessmentsByType
    );

    app.get(
      "/api/assessments/statistics",
      authController.verifyToken,
      assessmentController.getAssessmentStatistics
    );

    // User and admin routes
    app.get(
      "/api/assessments/:assessmentId",
      authController.verifyToken,
      assessmentController.getAssessmentById
    );

    app.post(
      "/api/assessments",
      authController.verifyToken,
      assessmentController.createAssessment
    );

    app.put(
      "/api/assessments/:assessmentId/action",
      authController.verifyToken,
      assessmentController.updateAssessmentAction
    );

    app.delete(
      "/api/assessments/:assessmentId",
      authController.verifyToken,
      assessmentController.deleteAssessment
    );

    app.get(
      "/api/users/:userId/assessments",
      authController.verifyToken,
      assessmentController.getAssessmentsByUser
    );

    app.get(
      "/api/my-assessments/history",
      authController.verifyToken,
      assessmentController.getUserAssessmentHistory
    );
  }

  // ==================== BOOK CONSULTATION SESSION CONTROLLER ROUTES ====================
  if (typeof authController.verifyToken === "function") {
    // Admin/Consultant routes
    app.get(
      "/api/consultation-bookings",
      authController.verifyToken,
      bookConsultationSessionController.getAllBookedSessions
    );

    app.put(
      "/api/consultations/:consultationId/sessions/:sessionNumber/reassign",
      authController.verifyToken,
      bookConsultationSessionController.reassignSession
    );

    // Consultant routes
    app.get(
      "/api/consultants/:consultantId/sessions",
      authController.verifyToken,
      bookConsultationSessionController.getSessionsByConsultant
    );

    // Member routes
    app.get(
      "/api/members/:memberId/bookings",
      authController.verifyToken,
      bookConsultationSessionController.getSessionsByMember
    );

    // General routes
    app.get(
      "/api/consultations/:consultationId/sessions",
      authController.verifyToken,
      bookConsultationSessionController.getSessionsByConsultation
    );

    app.post(
      "/api/consultation-bookings",
      authController.verifyToken,
      bookConsultationSessionController.bookSession
    );

    app.delete(
      "/api/consultations/:consultationId/sessions/:sessionNumber",
      authController.verifyToken,
      bookConsultationSessionController.cancelBooking
    );

    app.get(
      "/api/consultations/:consultationId/sessions/:sessionNumber/availability",
      authController.verifyToken,
      bookConsultationSessionController.checkSessionAvailability
    );
  }
}

// Initialize database connection with retry mechanism
AppDataSource.initializeWithRetry()
  .then(() => {
    console.log("Database connection established successfully");

    // Setup routes after database connection is established
    setupRoutes();

    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1); // Exit with error code
  });
