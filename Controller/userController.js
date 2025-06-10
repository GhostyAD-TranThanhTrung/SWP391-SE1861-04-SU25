/**
 * User Controller using TypeORM
 * CRUD operations for Users table
 */
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");

class UserController {
  /**
   * Get all users
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
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: parseInt(id) },
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
      const { role, password, status, email } = req.body;

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
      });

      const savedUser = await userRepository.save(newUser);

      res.status(201).json({
        success: true,
        data: savedUser,
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
      const { role, password, status, email } = req.body;

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

      const updatedUser = await userRepository.save(user);

      res.status(200).json({
        success: true,
        data: updatedUser,
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
   * DELETE USER FUNCTION - Delete user by ID
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

      // Check if user exists before deleting
      const user = await userRepository.findOne({
        where: { user_id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Delete the user
      await userRepository.remove(user);

      res.status(200).json({
        success: true,
        message: `User with ID ${id} deleted successfully`,
        deletedUser: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }

  /**
   * Alternative delete function using delete query
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

      // Use delete query directly
      const deleteResult = await userRepository.delete({
        user_id: parseInt(id),
      });

      if (deleteResult.affected === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: `User with ID ${id} deleted successfully`,
        affectedRows: deleteResult.affected,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
}

module.exports = UserController;
