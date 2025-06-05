/**
 * Profile Controller using TypeORM
 * Handles profile operations with TypeORM
 */
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");

// Get profile by user ID
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profileRepository = AppDataSource.getRepository(Profile);

    const profile = await profileRepository.findOne({
      where: { user_id: parseInt(userId) },
      relations: ["user"],
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      profile: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve profile. Please try again later." });
  }
};

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profileRepository = AppDataSource.getRepository(Profile);

    const profiles = await profileRepository.find({
      relations: ["user"],
      select: {
        user: {
          user_id: true,
          email: true,
          role: true,
          status: true,
        },
      },
    });

    res.json({
      message: "Profiles retrieved successfully",
      profiles: profiles,
    });
  } catch (error) {
    console.error("Get all profiles error:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve profiles. Please try again later." });
  }
};

// Create a new profile
exports.createProfile = async (req, res) => {
  try {
    const { name, certification, workHoursJson, bioJson, dateOfBirth, job } =
      req.body;

    // Get user ID from the verified JWT token (set by verifyToken middleware)
    const userId = req.user.userId;

    // Basic validation
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const profileRepository = AppDataSource.getRepository(Profile);

    // Check if user exists
    const user = await userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if profile already exists for this user
    const existingProfile = await profileRepository.findOne({
      where: { user_id: userId },
    });

    if (existingProfile) {
      return res
        .status(409)
        .json({ error: "Profile already exists for this user" });
    }

    // Validate JSON strings if provided
    if (workHoursJson) {
      try {
        JSON.parse(workHoursJson);
      } catch (e) {
        return res
          .status(400)
          .json({ error: "Invalid work hours JSON format" });
      }
    }

    if (bioJson) {
      try {
        JSON.parse(bioJson);
      } catch (e) {
        return res.status(400).json({ error: "Invalid bio JSON format" });
      }
    }

    // Create new profile
    const newProfile = profileRepository.create({
      user_id: userId,
      name: name || null,
      certification: certification || null,
      works_hours_json: workHoursJson || null,
      bio_json: bioJson || null,
      date_of_birth: dateOfBirth || null,
      job: job || null,
    });

    const savedProfile = await profileRepository.save(newProfile);

    res.status(201).json({
      message: "Profile created successfully",
      profile: savedProfile,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res
      .status(500)
      .json({ error: "Profile creation failed. Please try again later." });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, certification, workHoursJson, bioJson, dateOfBirth, jobs } =
      req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profileRepository = AppDataSource.getRepository(Profile);

    // Check if profile exists
    const profile = await profileRepository.findOne({
      where: { user_id: parseInt(userId) },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Validate JSON strings if provided
    if (workHoursJson) {
      try {
        JSON.parse(workHoursJson);
      } catch (e) {
        return res
          .status(400)
          .json({ error: "Invalid work hours JSON format" });
      }
    }

    if (bioJson) {
      try {
        JSON.parse(bioJson);
      } catch (e) {
        return res.status(400).json({ error: "Invalid bio JSON format" });
      }
    }

    // Update fields if provided
    if (name !== undefined) profile.name = name;
    if (certification !== undefined) profile.certification = certification;
    if (workHoursJson !== undefined) profile.works_hours_json = workHoursJson;
    if (bioJson !== undefined) profile.bio_json = bioJson;
    if (dateOfBirth !== undefined) profile.date_of_birth = dateOfBirth;
    if (jobs !== undefined) profile.jobs = jobs;

    const updatedProfile = await profileRepository.save(profile);

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ error: "Profile update failed. Please try again later." });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profileRepository = AppDataSource.getRepository(Profile);

    const result = await profileRepository.delete({
      user_id: parseInt(userId),
    });

    if (result.affected === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res
      .status(500)
      .json({ error: "Profile deletion failed. Please try again later." });
  }
};
