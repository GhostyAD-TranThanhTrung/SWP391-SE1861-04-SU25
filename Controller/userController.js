/**
 * User Controller using TypeORM
 * CRUD operations for Users table
 * 
 * NEW COMBINED USER+PROFILE ENDPOINTS:
 * =====================================
 * 
 * 1. GET /api/user/profile-combined (Requires JWT token)
 *    Purpose: Get complete user and profile data for the authenticated user
 *    Response: { 
 *      success: true, 
 *      data: { 
 *        user: { user_id, email, role, status, img_link, date_create },
 *        profile: { user_id, name, bio_json, date_of_birth, job } | null,
 *        hasProfile: boolean 
 *      }
 *    }
 * 
 * 2. PUT /api/user/profile-combined (Requires JWT token)
 *    Purpose: Update both user and profile data in a single transaction
 *    Body: {
 *      // User fields (optional)
 *      email?: string,
 *      role?: string, 
 *      status?: string,
 *      img_link?: string,
 *      // Profile fields (optional)
 *      name?: string,
 *      bio_json?: string, // JSON string
 *      date_of_birth?: string, // YYYY-MM-DD format
 *      job?: string
 *    }
 *    Features: 
 *    - Creates profile if it doesn't exist
 *    - Validates JSON format for bio_json
 *    - Transactional update (all or nothing)
 * 
 * 3. DELETE /api/user/delete-account (Requires JWT token)
 *    Purpose: Delete user account (automatically deletes profile via CASCADE)
 *    Response: { 
 *      success: true, 
 *      message: "User and associated profile deleted successfully",
 *      deletedData: { user: object, profile: object, cascadeDeleted: true }
 *    }
 *    
 * Usage Examples:
 * ===============
 * 
 * // Get combined data
 * fetch('/api/user/profile-combined', {
 *   headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
 * });
 * 
 * // Update user email and profile name
 * fetch('/api/user/profile-combined', {
 *   method: 'PUT',
 *   headers: { 
 *     'Authorization': 'Bearer YOUR_JWT_TOKEN',
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     email: 'newemail@example.com',
 *     name: 'New Display Name',
 *     bio_json: '{"skills": ["JavaScript", "React"]}'
 *   })
 * });
 * 
 * // Delete account
 * fetch('/api/user/delete-account', {
 *   method: 'DELETE',
 *   headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
 * });
 */
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");

class UserController {
  /**
   * Get all users
   */
  static async getAllUsers(req, res) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        select: ["user_id", "email", "password", "role", "status", "img_link"]
      });

      res.status(200).json({
        success: true,
        data: users,
        message: "Users retrieved successfully (DEBUG MODE - includes passwords)",
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
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: parseInt(id) },
        select: ["user_id", "email", "role", "status", "img_link"]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user",
        error: error.message,
      });
    }
  }

  /**
   * Create new user
   */
  static async createUser(req, res) {
    try {
      const { role, password, status, email, img_link } = req.body;

      // Validate required fields
      if (!role || !password || !status || !email) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: role, password, status, email",
        });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if email already exists
      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Create new user
      const newUser = userRepository.create({
        role,
        password, // Note: In production, hash the password first
        status,
        email,
        img_link: img_link || null
      });

      const savedUser = await userRepository.save(newUser);

      // Return user without sensitive information
      const { password: _, ...userWithoutPassword } = savedUser;

      res.status(201).json({
        success: true,
        data: userWithoutPassword,
        message: "User created successfully",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
    }
  }

  /**
   * Update user
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, password, status, email, img_link } = req.body;

      const userRepository = AppDataSource.getRepository(User);

      // Check if user exists
      const user = await userRepository.findOne({
        where: { user_id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update user fields
      if (role) user.role = role;
      if (password) user.password = password; // Note: Hash password in production
      if (status) user.status = status;
      if (email) user.email = email;
      if (img_link !== undefined) user.img_link = img_link;

      const updatedUser = await userRepository.save(user);

      // Return user without sensitive information
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
    }
  }

  /**
   * DELETE USER FUNCTION - Soft delete user by ID (sets status to 'inactive')
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID provided",
        });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if user exists before updating
      const user = await userRepository.findOne({
        where: { user_id: parseInt(id) },
        select: ["user_id", "email", "role", "status", "img_link"]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is already inactive
      if (user.status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: "User is already inactive",
          user: {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status,
            img_link: user.img_link
          },
        });
      }

      // Soft delete: Set status to 'inactive'
      user.status = 'inactive';
      const updatedUser = await userRepository.save(user);

      res.status(200).json({
        success: true,
        message: `User with ID ${id} deactivated successfully`,
        deactivatedUser: {
          user_id: updatedUser.user_id,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          img_link: updatedUser.img_link
        },
      });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate user",
        error: error.message,
      });
    }
  }

  /**
   * Alternative delete function using update query (soft delete - sets status to 'inactive')
   */
  static async deleteUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID provided",
        });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Get user before update to include in response
      const user = await userRepository.findOne({
        where: { user_id: parseInt(id) },
        select: ["user_id", "email", "role", "status", "img_link"]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is already inactive
      if (user.status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: "User is already inactive",
          user: {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status,
            img_link: user.img_link
          },
        });
      }

      // Use update query to set status to inactive
      const updateResult = await userRepository.update(
        { user_id: parseInt(id) },
        { status: 'inactive' }
      );

      if (updateResult.affected === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found or update failed",
        });
      }

      // Get updated user data
      const updatedUser = await userRepository.findOne({
        where: { user_id: parseInt(id) },
        select: ["user_id", "email", "role", "status", "img_link"]
      });

      res.status(200).json({
        success: true,
        message: `User with ID ${id} deactivated successfully`,
        affectedRows: updateResult.affected,
        deactivatedUser: updatedUser
      });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate user",
        error: error.message,
      });
    }
  }

  /**
   * Get combined User + Profile data using user_id from JWT token
   * Protected endpoint that returns complete user information
   */
  static async getUserProfileCombined(req, res) {
    try {
      // Get user ID from the verified JWT token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required from token",
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const profileRepository = AppDataSource.getRepository(Profile);

      // Get user data (excluding password for security)
      const user = await userRepository.findOne({
        where: { user_id: userId },
        select: ["user_id", "email", "role", "status", "img_link", "date_create"]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get profile data
      const profile = await profileRepository.findOne({
        where: { user_id: userId }
      });

      // Combine user and profile data
      const combinedData = {
        user: user,
        profile: profile || null, // null if no profile exists
        hasProfile: !!profile
      };

      res.status(200).json({
        success: true,
        data: combinedData,
        message: "User and profile data retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting combined user profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user and profile data",
        error: error.message,
      });
    }
  }

  /**
   * Update combined User + Profile data using user_id from JWT token
   * Updates both user and profile information in a single transaction
   */
  static async updateUserProfileCombined(req, res) {
    try {
      // Get user ID from the verified JWT token
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required from token",
        });
      }

      const {
        // User fields
        email, role, status, img_link,
        // Profile fields  
        name, bio_json, date_of_birth, job
      } = req.body;

      // Start transaction
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const userRepository = queryRunner.manager.getRepository(User);
        const profileRepository = queryRunner.manager.getRepository(Profile);

        // Check if user exists
        const user = await userRepository.findOne({
          where: { user_id: userId }
        });

        if (!user) {
          await queryRunner.rollbackTransaction();
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Update user fields if provided
        let userUpdated = false;
        if (email !== undefined) { user.email = email; userUpdated = true; }
        if (role !== undefined) { user.role = role; userUpdated = true; }
        if (status !== undefined) { user.status = status; userUpdated = true; }
        if (img_link !== undefined) { user.img_link = img_link; userUpdated = true; }

        let updatedUser = user;
        if (userUpdated) {
          updatedUser = await userRepository.save(user);
        }

        // Handle profile update/creation
        let updatedProfile = null;
        const hasProfileData = name !== undefined || bio_json !== undefined ||
          date_of_birth !== undefined || job !== undefined;

        if (hasProfileData) {
          // Check if profile exists
          let profile = await profileRepository.findOne({
            where: { user_id: userId }
          });

          if (profile) {
            // Update existing profile
            if (name !== undefined) profile.name = name;
            if (bio_json !== undefined) {
              // Validate JSON if provided
              if (bio_json && typeof bio_json === 'string') {
                try {
                  JSON.parse(bio_json);
                  profile.bio_json = bio_json;
                } catch (e) {
                  await queryRunner.rollbackTransaction();
                  return res.status(400).json({
                    success: false,
                    message: "Invalid bio_json format",
                  });
                }
              } else {
                profile.bio_json = bio_json;
              }
            }
            if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth;
            if (job !== undefined) profile.job = job;

            updatedProfile = await profileRepository.save(profile);
          } else {
            // Create new profile
            const newProfile = profileRepository.create({
              user_id: userId,
              name: name || null,
              bio_json: bio_json || null,
              date_of_birth: date_of_birth || null,
              job: job || null
            });

            updatedProfile = await profileRepository.save(newProfile);
          }
        } else {
          // Get existing profile if no profile data to update
          updatedProfile = await profileRepository.findOne({
            where: { user_id: userId }
          });
        }

        await queryRunner.commitTransaction();

        // Return combined data (excluding password)
        const { password: _, ...userWithoutPassword } = updatedUser;
        const combinedData = {
          user: userWithoutPassword,
          profile: updatedProfile,
          hasProfile: !!updatedProfile
        };

        res.status(200).json({
          success: true,
          data: combinedData,
          message: "User and profile updated successfully",
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

    } catch (error) {
      console.error("Error updating combined user profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user and profile data",
        error: error.message,
      });
    }
  }

  /**
   * Delete user using user_id from JWT token (soft delete - sets status to 'inactive')
   * This preserves both user and profile data while marking the user as inactive
   */
  static async deleteUserCascade(req, res) {
    try {
      // Get user ID from the verified JWT token
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required from token",
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const profileRepository = AppDataSource.getRepository(Profile);

      // Check if user exists and get their data before update
      const user = await userRepository.findOne({
        where: { user_id: userId },
        select: ["user_id", "email", "role", "status", "img_link", "date_create"]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is already inactive
      if (user.status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: "User account is already deactivated",
          user: {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status,
            img_link: user.img_link
          },
        });
      }

      // Get profile data (for response purposes)
      const profile = await profileRepository.findOne({
        where: { user_id: userId }
      });

      // Soft delete: Set user status to 'inactive'
      const updateResult = await userRepository.update(
        { user_id: userId },
        { status: 'inactive' }
      );

      if (updateResult.affected === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found or update failed",
        });
      }

      // Get updated user data
      const updatedUser = await userRepository.findOne({
        where: { user_id: userId },
        select: ["user_id", "email", "role", "status", "img_link", "date_create"]
      });

      res.status(200).json({
        success: true,
        message: "User account deactivated successfully",
        deactivatedData: {
          user: updatedUser,
          profile: profile,
          softDeleted: true
        }
      });

    } catch (error) {
      console.error("Error deactivating user account:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate user account",
        error: error.message,
      });
    }
  }
  static async getUserRoleById(req, res) {
    try {
      const role = req.user.role
      if (!role) {
        res.status(404).json({
          success: false,
          message: "Invalid role"
        })
      }
      res.status(200).json({
        success: true,
        message: "Successfully get the Role from user",
        role: role
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error in the server",
        error: err.message,
      })
    }
  }
}

module.exports = UserController;
