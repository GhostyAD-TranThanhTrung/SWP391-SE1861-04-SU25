/**
 * Profile Controller using TypeORM
 * CRUD operations for Profile table
 */
const AppDataSource = require("../src/data-source");
const Profile = require("../src/entities/Profile");
const User = require("../src/entities/User");

class ProfileController {
  /**
   * Create a new profile
   * Used by ChooseRolePage frontend
   */
  static async createProfile(req, res) {
    try {
      const { name, bioJson, dateOfBirth, job } = req.body;

      // Get user ID from the verified JWT token (set by verifyToken middleware)
      const userId = req.user.userId;

      // Basic validation
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const profileRepository = AppDataSource.getRepository(Profile);

      // Check if user exists
      const user = await userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Check if profile already exists for this user
      const existingProfile = await profileRepository.findOne({
        where: { user_id: userId },
      });

      if (existingProfile) {
        return res.status(409).json({
          success: false,
          error: "Profile already exists for this user",
        });
      }

      // Validate JSON strings if provided
      if (bioJson) {
        try {
          JSON.parse(bioJson);
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: "Invalid bio JSON format",
          });
        }
      }

      // Create new profile
      const newProfile = profileRepository.create({
        user_id: userId,
        name: name || null,
        bio_json: bioJson || null,
        date_of_birth: dateOfBirth || null,
        job: job || null,
      });

      const savedProfile = await profileRepository.save(newProfile);

      res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile: savedProfile,
      });
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create profile. Please try again later.",
        details: error.message,
      });
    }
  }

  /**
   * Get user profile by user ID from token
   * Protected endpoint that uses JWT token
   */
  static async getUserProfile(req, res) {
    try {
      // Get user ID from the verified JWT token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const profileRepository = AppDataSource.getRepository(Profile);

      // Find profile with user relation
      const profile = await profileRepository.findOne({
        where: { user_id: userId },
        relations: ["user"],
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        profile: profile,
      });
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve profile. Please try again later.",
        details: error.message,
      });
    }
  }

  /**
   * Get profile by specific user ID (admin function)
   */
  static async getProfileByUserId(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const profileRepository = AppDataSource.getRepository(Profile);

      const profile = await profileRepository.findOne({
        where: { user_id: parseInt(userId) },
        relations: ["user"],
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        profile: profile,
      });
    } catch (error) {
      console.error("Get profile by user ID error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve profile. Please try again later.",
        details: error.message,
      });
    }
  }

  /**
   * Get all profiles
   */
  static async getAllProfiles(req, res) {
    try {
      const profileRepository = AppDataSource.getRepository(Profile);

      const profiles = await profileRepository.find({
        relations: ["user"],
      });

      res.status(200).json({
        success: true,
        message: "Profiles retrieved successfully",
        profiles: profiles,
      });
    } catch (error) {
      console.error("Get all profiles error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve profiles. Please try again later.",
        details: error.message,
      });
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { name, bioJson, dateOfBirth, job } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const profileRepository = AppDataSource.getRepository(Profile);

      const profile = await profileRepository.findOne({
        where: { user_id: userId },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Profile not found",
        });
      }

      // Validate JSON strings if provided
      if (bioJson) {
        try {
          JSON.parse(bioJson);
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: "Invalid bio JSON format",
          });
        }
      }

      // Update profile fields
      if (name !== undefined) profile.name = name;
      if (bioJson !== undefined) profile.bio_json = bioJson;
      if (dateOfBirth !== undefined) profile.date_of_birth = dateOfBirth;
      if (job !== undefined) profile.job = job;

      const updatedProfile = await profileRepository.save(profile);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile. Please try again later.",
        details: error.message,
      });
    }
  }

  /**
   * Delete profile
   */
  static async deleteProfile(req, res) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const profileRepository = AppDataSource.getRepository(Profile);

      const profile = await profileRepository.findOne({
        where: { user_id: userId },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Profile not found",
        });
      }

      await profileRepository.remove(profile);

      res.status(200).json({
        success: true,
        message: "Profile deleted successfully",
      });
    } catch (error) {
      console.error("Delete profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete profile. Please try again later.",
        details: error.message,
      });
    }
  }

  /**
   * Check if user has a profile (lightweight check for login)
   * Returns basic profile existence status
   */
  static async checkProfileStatus(req, res) {
    try {
      // Get user ID from the verified JWT token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const profileRepository = AppDataSource.getRepository(Profile);
      // Check if profile exists (without loading full data)
      const profileExists = await profileRepository.findOne({
        where: { user_id: userId },
        select: ["user_id", "name", "job"], // Only select minimal fields for performance
      });

      res.status(200).json({
        success: true,
        hasProfile: !!profileExists,
        profileData: profileExists
          ? {
              userId: profileExists.user_id,
              name: profileExists.name,
              job: profileExists.job,
            }
          : null,
        message: profileExists ? "Profile exists" : "No profile found",
      });
    } catch (error) {
      console.error("Check profile status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to check profile status. Please try again later.",
        details: error.message,
      });
    }
  }
}

module.exports = ProfileController;
