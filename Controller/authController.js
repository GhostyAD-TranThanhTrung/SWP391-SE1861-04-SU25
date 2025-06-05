/**
 * Auth Controller using TypeORM
 * Handles authentication operations with TypeORM
 */
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");
// Import the jsonwebtoken library for JWT token generation
const jwt = require("jsonwebtoken");

// Define a secret key for signing the JWT tokens
// NOTE: In production, this should be stored in environment variables for security
const JWT_SECRET = "swp391-super-secret-jwt-key-2025-secure";

// Login endpoint
exports.login = async (req, res) => {
  try {
    // This endpoint handles authentication requests from the React login form
    const { email, password } = req.body;
    console.log(`Login attempt for user: ${email}`); // Log login attempts

    const userRepository = AppDataSource.getRepository(User);

    // Query the database to check credentials using TypeORM
    const user = await userRepository.findOne({
      where: { email, password },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token with user information as the payload
    // NOTE: The token contains user data that will be available in protected routes
    const token = jwt.sign(
      {
        userId: user.user_id, // Include user ID in the token payload
        email: user.email, // Include email in the token payload
        role: user.role || "Member", // Include user role with a default value
      },
      JWT_SECRET, // Sign the token with our secret key
      { expiresIn: "24h" } // Token will expire in 24 hours
    );

    // Login successful - log information
    console.log("=".repeat(50));
    console.log(`✅ LOGIN SUCCESSFUL`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 User ID: ${user.user_id}`);
    console.log(`🔑 JWT Token generated successfully`);
    console.log(`⏰ Login time: ${new Date().toLocaleString()}`);
    console.log("=".repeat(50));

    // Return success response with user data and the token
    // NOTE: The client will store this token and use it for authenticated requests
    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role || "Member",
      },
      token: token, // Include the JWT token in the response
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

// Get all users endpoint
exports.getAllUsers = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();

    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Error querying database" });
  }
};

// Test API endpoint
exports.testApi = (req, res) => {
  res.json({ message: "Hello from the API!" });
};

// Middleware to verify JWT token for protected routes
// NOTE: This middleware can be added to any route that requires authentication
exports.verifyToken = (req, res, next) => {
  // Get the authorization header from the request
  // NOTE: The client must send the token in the Authorization header
  const authHeader = req.headers.authorization;

  // Check if the auth header exists and starts with "Bearer "
  // NOTE: Bearer tokens should be formatted as "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Extract the token by removing the "Bearer " prefix
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token signature using our secret key
    // NOTE: This will throw an error if the token is invalid or expired
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add the decoded user information to the request object
    // NOTE: This makes the user data available to route handlers
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Token verification failed
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid token." });
  }
};
