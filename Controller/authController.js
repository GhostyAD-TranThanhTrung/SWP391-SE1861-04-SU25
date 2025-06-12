/**
 * Authentication Controller using TypeORM
 * Handles user login and authentication
 */
const jwt = require("jsonwebtoken");
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");

// Define a secret key for signing the JWT tokens
// NOTE: In production, this should be stored in environment variables for security
const JWT_SECRET = "swp391-super-secret-jwt-key-2025-secure";

class AuthController {
  /**
   * Login endpoint
   */
  static async login(req, res) {
    try {
      // This endpoint handles authentication requests from the React login form
      const { email, password } = req.body;
      console.log(`Login attempt for user: ${email}`); // Log login attempts

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Find user by email and password
      const user = await userRepository.findOne({
        where: {
          email: email,
          password: password,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Generate a JWT token with user information as the payload
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
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user.user_id,
          email: user.email,
          role: user.role || "Member",
          img_link: user.img_link || null, // Add img_link to response
        },
        token: token, // Include the JWT token in the response
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        success: false,
        error: "Server error during authentication",
        message: error.message,
      });
    }
  }

  /**
   * Register new user endpoint
   */
  static async register(req, res) {
    try {
      const { email, password, role = 'Member' } = req.body;

      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if email already exists
      const existingUser = await userRepository.findOne({
        where: { email: email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Email already exists",
        });
      }

      // Create new user with TypeORM
      const newUser = userRepository.create({
        email: email,
        password: password, // Note: In production, hash the password first
        role: role,
        status: 'active',
        img_link: null // Initialize img_link as null for new users
      });

      const savedUser = await userRepository.save(newUser);

      // Generate JWT token for immediate login
      const token = jwt.sign(
        {
          userId: savedUser.user_id,
          email: savedUser.email,
          role: savedUser.role || "Member",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Log registration success
      console.log("=".repeat(50));
      console.log(`✅ REGISTRATION SUCCESSFUL`);
      console.log(`📧 Email: ${savedUser.email}`);
      console.log(`🆔 User ID: ${savedUser.user_id}`);
      console.log(`👥 Role: ${savedUser.role}`);
      console.log(`⏰ Registration time: ${new Date().toLocaleString()}`);
      console.log("=".repeat(50));

      // Return success response with user data and token
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: savedUser.user_id,
          email: savedUser.email,
          role: savedUser.role,
          status: savedUser.status,
          img_link: savedUser.img_link // Add img_link to response
        },
        token: token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "Registration failed",
        message: error.message,
      });
    }
  }

  /**
   * Get all users endpoint
   */
  static async getAllUsers(req, res) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();

      res.status(200).json({
        success: true,
        data: users,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve users",
        error: error.message,
      });
    }
  }

  /**
   * Test API endpoint
   */
  static testApi(req, res) {
    res.json({
      success: true,
      message: "Hello from the API!",
    });
  }

  /**
   * Middleware to verify JWT token for protected routes
   */
  static verifyToken(req, res, next) {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if the auth header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    // Extract the token by removing the "Bearer " prefix
    const token = authHeader.split(" ")[1];

    try {
      // Verify the token signature using our secret key
      const decoded = jwt.verify(token, JWT_SECRET);

      // Add the decoded user information to the request object
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Token verification failed
      console.error("Token verification failed:", error.message);
      return res.status(401).json({
        success: false,
        error: "Invalid token.",
      });
    }
  }

  /**
   * Get authenticated user profile
   */
  static async getUserProfile(req, res) {
    try {
      // The user ID comes from the verified token
      const userId = req.user.userId;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Return user profile without sensitive information
      res.status(200).json({
        success: true,
        data: {
          id: user.user_id,
          email: user.email,
          role: user.role,
          status: user.status,
          img_link: user.img_link || null // Add img_link to response
        },
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user profile",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
