/*
 * EXPRESS SERVER SETUP
 * This file sets up the Express backend that the React frontend connects to.
 * The connection between React and Express is handled through HTTP requests.
 */

// Required packages for the server
const express = require("express");
const cors = require("cors"); // Enables Cross-Origin Resource Sharing so React can connect

const sql = require("mssql"); // For database connections

const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use(cors()); // This allows the React app to make requests to this server
app.use(express.json()); // This parses JSON request bodies from React fetch calls

const config = {
    user: "SA",
    password: "12345",
    server: "localhost",
    port: 1433,
    database: "SWP391-demo",
    options: {
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
};

// Import controllers
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

sql.connect(config, (err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to the database");
});
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
app.get("/", authController.getAllUsers);
app.get("/orm", UserController.getAllUsers);
app.get("/api/data", authController.testApi);
app.post("/api/login", authController.login);
app.post("/api/register", authController.register); // Updated to use TypeORM registration
app.post("/api/google-login", googleController.googleLogin); // Google login endpoint
app.post("/api/google-register", googleController.googleRegister); // Google registration endpoint
app.get("/api/dashboard", DashboardController.getDashboardStats);
app.get("/api/dashboard/detailed", DashboardController.getDetailedDashboard);

app.get(
    "/api/dashboard/consultants",authController.verifyToken,
    DashboardController.getConsultantDashboard
);

// Protected routes (require authentication)
// Profile routes using TypeORM
app.post(
    "/api/profile",
    authController.verifyToken,
    ProfileController.createProfile
); // Create profile - used by ChooseRolePage
app.get(
    "/api/profile",
    authController.verifyToken,
    ProfileController.getUserProfile
); // Get user's own profile using token
app.get(
    "/api/profile/me",
    authController.verifyToken,
    ProfileController.getUserProfile
); // Alternative endpoint for getting user's own profile
app.get(
    "/api/profile/status",
    authController.verifyToken,
    ProfileController.checkProfileStatus
); // Check if user has a profile (for login verification)
app.put(
    "/api/profile",
    authController.verifyToken,
    ProfileController.updateProfile
); // Update user's own profile
app.delete(
    "/api/profile",
    authController.verifyToken,
    ProfileController.deleteProfile
); // Delete user's own profile

// Admin routes for profiles
app.get("/api/profiles", authController.verifyToken, ProfileController.getAllProfiles); // Get all profiles (admin)
app.get("/api/profile/:userId",authController.verifyToken, ProfileController.getProfileByUserId); // Get profile by user ID (admin)

// Staff routes (Protected - require authentication)//add verfify token later
app.get("/api/staff", authController.verifyToken, StaffController.getAllStaff);
app.get("/api/staff/:staffName", authController.verifyToken, StaffController.searchStaffByName);
app.post("/api/staff", authController.verifyToken, StaffController.createStaff);
app.put("/api/staff/:staffId", authController.verifyToken, StaffController.updateStaff);
app.delete("/api/staff/:staffId", authController.verifyToken, StaffController.deleteStaff);

// Staff statistics (Protected)
app.get(
    "/api/staff/statistics",
    authController.verifyToken,
    StaffController.getStaffStatistics
);

// Member routes (Protected - require authentication) //add verify token later
app.get("/api/members",authController.verifyToken, MemberController.getAllMembers);
app.get(
    "/api/members/search/:memberName",authController.verifyToken,
    MemberController.searchMembersByName
);
app.get(
    "/api/members/statistics",
    authController.verifyToken,
    MemberController.getMemberStatistics
);
app.get("/api/members/:memberId", authController.verifyToken, MemberController.getMemberById);
app.post("/api/members", authController.verifyToken, MemberController.createMember);
app.put("/api/members/:memberId", authController.verifyToken, MemberController.updateMember);
app.delete("/api/members/:memberId", authController.verifyToken, MemberController.deleteMember);

//================================================================================
// Consultant routes (Protected - require authentication) //add verify token later
app.get(
    "/api/consultants/search/:consultantName", authController.verifyToken,
    ConsultantController.searchConsultantsByName
);
app.get(
    "/api/consultants/statistics",
    authController.verifyToken,
    ConsultantController.getAllConsultants
);

// Single consultant route
app.get(
    "/api/consultants/:consultantId", authController.verifyToken,
    ConsultantController.getConsultantById
);

app.get("/api/consultants", authController.verifyToken, ConsultantController.getAllConsultants);
app.post("/api/consultants", authController.verifyToken, ConsultantController.createConsultant);
app.put(
    "/api/consultants/:consultantId", authController.verifyToken,
    ConsultantController.updateConsultant
);
app.delete(
    "/api/consultants/:consultantId", authController.verifyToken,
    ConsultantController.deleteConsultant
);

// Assessment routes (Protected - require authentication)
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

// Special endpoint for taking tests - processes score and saves assessment
app.post('/api/assessments/take-test', authController.verifyToken, AssessmentController.takeTestFromUser);

// Action routes (Protected - require authentication)
app.get('/api/actions', authController.verifyToken, ActionController.getAllActions);
app.get('/api/actions/:id', authController.verifyToken, ActionController.getActionById);
app.get('/api/actions/type/:type', authController.verifyToken, ActionController.getActionsByType);
app.get('/api/actions/with-assessments', authController.verifyToken, ActionController.getActionsWithAssessments);
app.post('/api/actions', authController.verifyToken, ActionController.createAction);
app.put('/api/actions/:id', authController.verifyToken, ActionController.updateAction);
app.delete('/api/actions/:id', authController.verifyToken, ActionController.deleteAction);

//================================================================================
// NOTE: This route demonstrates how to protect an endpoint with the JWT verification middleware
app.get("/api/test-profile", authController.verifyToken, (req, res) => {
    // The verifyToken middleware ensures this route is only accessible with a valid token
    // The decoded user information is available in req.user
    res.json({
        message: "Protected route accessed successfully",
        user: req.user, // Return the user data from the token
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
