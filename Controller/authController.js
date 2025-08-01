/**
 * Authentication Controller using TypeORM
 * Handles user login and authentication
 */
const jwt = require("jsonwebtoken");
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");

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
          error: "Email và mật khẩu là bắt buộc",
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
          error: "Thông tin đăng nhập không chính xác",
        });
      }

      // Check if user status is active
      if (user.status !== 'active') {
        console.log(`❌ LOGIN DENIED - User ${user.email} has status: ${user.status}`);
        let errorMessage = 'Tài khoản không hoạt động. Vui lòng liên hệ hỗ trợ.';
        if (user.status === 'banned') {
          errorMessage = 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ.';
        } else if (user.status === 'inactive') {
          errorMessage = 'Tài khoản của bạn không hoạt động. Vui lòng liên hệ hỗ trợ.';
        }
        return res.status(403).json({
          success: false,
          error: errorMessage,
          status: user.status
        });
      }
      // Generate a JWT token with user information as the payload
      const token = jwt.sign(
        {
          userId: user.user_id, // Include user ID in the token payload
          email: user.email, // Include email in the token payload
          role: user.role || "member", // Include user role with a default value
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

      if (user.role === 'member') {
        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            id: user.user_id,
            email: user.email,
            role: user.role || "member",
            img_link: user.img_link || null, // Add img_link to response
          },
          token: token, // Include the JWT token in the response
        });
      }
      const profileRepo = AppDataSource.getRepository(Profile);

      // Find user by email and password
      const profile = await profileRepo.findOne({
        where: {
          user_id: user.user_id
        },
      });
      const bio_json = JSON.parse(profile.bio_json)
      const first_time = bio_json.first_time



      // Return success response with user data and the token
      if (first_time) {
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            id: user.user_id,
            email: user.email,
            role: user.role || "member",
            img_link: user.img_link || null, // Add img_link to response
            first_time: first_time
          },
          token: token, // Include the JWT token in the response
        });
      }
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user.user_id,
          email: user.email,
          role: user.role || "member",
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
  static async resetPassword(req, res) {

    try {
      const { password } = req.body
      const u_id = req.user.userId
      if (!u_id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required from token",
        });
      }
      const user = await AppDataSource.getRepository(User).findOne({
        where: {
          user_id: u_id
        }
      })
      const profile = await AppDataSource.getRepository(Profile).findOne({
        where: {
          user_id: u_id
        }
      })
      user.password = password
      const bio_json = JSON.parse(profile.bio_json)
      bio_json.first_time = false
      profile.bio_json = JSON.stringify(bio_json)
      await AppDataSource.getRepository(User).save(user)
      await AppDataSource.getRepository(Profile).save(profile)
      console.log("Successfully resetting password:");
      return res.status(200).json({
        success: true,
        message: "Successfully resetting password"
      });
    } catch (err) {
      console.error("Error resetting password image:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to serve image",
        error: err.message,
      });

    }
  }
  /**
   * Register new user endpoint
   */
  static async register(req, res) {
    try {
      const { email, password, role = 'member' } = req.body;

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
          role: savedUser.role || "member",
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
   * Middleware to verify JWT token for protected routes
   */
  static async verifyToken(req, res, next) {
    // Swagger bypass for development/testing
    const swaggerBypass = req.headers['x-swagger-bypass'];
    if (swaggerBypass === 'true') {
      console.log('🔓 SWAGGER BYPASS ACTIVATED');
      console.log(`📊 Endpoint: ${req.method} ${req.path}`);
      console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);

      // Use mock admin user for testing, but still check if real user exists and is active
      const mockUserId = 1; // Assuming admin user has ID 1

      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { user_id: mockUserId },
        });

        if (user && user.status !== 'active') {
          console.log(`❌ SWAGGER BYPASS DENIED - Mock user ${user.email} has status: ${user.status}`);
          return res.status(403).json({
            success: false,
            error: 'Người dùng quản trị giả lập không hoạt động',
            status: user.status
          });
        }

        req.user = {
          userId: mockUserId,
          email: user ? user.email : 'admin@test.com',
          role: user ? user.role : 'admin'
        };
        console.log('✅ Swagger bypass successful with mock user');
        return next();
      } catch (error) {
        console.error('Error during swagger bypass user check:', error);
        // Continue with default mock user if database check fails
        req.user = {
          userId: mockUserId,
          email: 'admin@test.com',
          role: 'admin'
        };
        return next();
      }
    }

    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if the auth header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Truy cập bị từ chối. Không có token được cung cấp.",
      });
    }

    // Extract the token by removing the "Bearer " prefix
    const token = authHeader.split(" ")[1];

    try {
      // Verify the token signature using our secret key
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check user status in database to ensure they're still active
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Người dùng không tồn tại. Vui lòng đăng nhập lại.",
        });
      }

      if (user.status !== 'active') {
        console.log(`❌ ACCESS DENIED - User ${user.email} has status: ${user.status}`);
        let errorMessage = 'Tài khoản không hoạt động. Vui lòng liên hệ hỗ trợ.';
        if (user.status === 'banned') {
          errorMessage = 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ.';
        } else if (user.status === 'inactive') {
          errorMessage = 'Tài khoản của bạn không hoạt động. Vui lòng liên hệ hỗ trợ.';
        }
        return res.status(403).json({
          success: false,
          error: errorMessage,
          status: user.status
        });
      }

      // Add the decoded user information to the request object
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Token verification failed
      console.error("Token verification failed:", error.message);
      return res.status(401).json({
        success: false,
        error: "Token không hợp lệ.",
      });
    }
  }

  /**
   * Middleware to verify if user is staff, manager, or admin
   */
  static verifyStaffOrAdmin(req, res, next) {
    // First verify the token
    AuthController.verifyToken(req, res, () => {
      // Check if user role is staff, manager, or admin
      const role = req.user.role ? req.user.role.toLowerCase() : '';

      if (role === 'staff' || role === 'manager' || role === 'admin') {
        // User is authorized, proceed to the next middleware
        next();
      } else {
        // User is not authorized
        return res.status(403).json({
          success: false,
          error: "Access denied. You do not have permission to perform this action.",
          requiredRole: "staff, manager, or admin",
          yourRole: req.user.role
        });
      }
    });
  }

}

module.exports = AuthController;
