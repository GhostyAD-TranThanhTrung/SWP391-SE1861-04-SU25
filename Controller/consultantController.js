/**
 * Consultant Controller using TypeORM
 * CRUD operations for Consultant table
 */
const AppDataSource = require("../src/data-source");
const Consultant = require("../src/entities/Consultant");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");
const BookingSession = require("../src/entities/BookingSession");

class ConsultantController {
  /**
   * Get all consultants
   */
  static async getAllConsultants(req, res) {
    try {
      // Get detailed consultant information with user data
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultants = await consultantRepository.find({
        relations: {
          user: true,
        },
      });

      // Get profile data for all consultants
      const profileRepository = AppDataSource.getRepository(Profile);
      const profiles = await profileRepository.find();

      // Create a map for quick profile lookup
      const profileMap = new Map();
      profiles.forEach((profile) => profileMap.set(profile.user_id, profile));

      // Transform the data to include user information and all consultant fields
      const consultantDetails = consultants.map((consultant) => {
        const profile = profileMap.get(consultant.user_id);

        return {
          id: consultant.id_consultant,
          userId: consultant.user_id,
          email: consultant.user?.email || "Not specified",
          status: consultant.user?.status || "Not specified",
          role: consultant.user?.role || "Not specified",
          name: profile?.name || "Not specified",
          dateOfBirth: profile?.date_of_birth || null,
          job: profile?.job || "Not specified",
          cost: consultant.cost || null,
          certification: consultant.certification || "Not specified",
          bios: consultant.bios || "Not specified",
          dateCreated: consultant.user?.date_create,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          totalConsultants: consultants.length,
          consultants: consultantDetails,
        },
        message: "Consultants retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultants:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultants",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant by ID
   */
  static async getConsultantById(req, res) {
    try {
      const { consultantId } = req.params;
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
        relations: {
          user: true,
        },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Format response to match entity structure
      const consultantData = {
        id: consultant.id_consultant,
        userId: consultant.user_id,
        email: consultant.user?.email,
        role: consultant.user?.role,
        status: consultant.user?.status,
        cost: consultant.cost,
        certification: consultant.certification,
        bios: consultant.bios,
      };

      res.status(200).json({
        success: true,
        data: consultantData,
        message: "Consultant retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant with user information and profile
   */
  static async getConsultantWithUserInfo(req, res) {
    try {
      const { id } = req.params;
      const consultantRepository = AppDataSource.getRepository(Consultant);

      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(id) },
        relations: {
          user: true,
        },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Get profile information if available
      const profileRepository = AppDataSource.getRepository(Profile);
      const profile = await profileRepository.findOne({
        where: { user_id: consultant.user_id },
      });

      // Format response with combined data
      const consultantData = {
        consultantInfo: {
          id: consultant.id_consultant,
          cost: consultant.cost,
          certification: consultant.certification,
          bios: consultant.bios,
        },
        userInfo: {
          id: consultant.user?.user_id,
          email: consultant.user?.email,
          role: consultant.user?.role,
          status: consultant.user?.status,
          dateCreated: consultant.user?.date_create,
        },
        profileInfo: profile
          ? {
              name: profile.name,
              bioJson: profile.bio_json,
              dateOfBirth: profile.date_of_birth,
              job: profile.job,
            }
          : null,
      };

      res.status(200).json({
        success: true,
        data: consultantData,
        message: "Consultant with user info retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant with user info:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant with user info",
        error: error.message,
      });
    }
  }

  /**
   * Create new consultant
   */
  static async createConsultant(req, res) {
    try {
      const { user_id, cost, certification, bios } = req.body;

      // Validate required fields
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const userRepository = AppDataSource.getRepository(User);

      // Check if user exists
      const user = await userRepository.findOne({
        where: { user_id: parseInt(user_id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if consultant already exists for this user
      const existingConsultant = await consultantRepository.findOne({
        where: { user_id: parseInt(user_id) },
      });

      if (existingConsultant) {
        return res.status(409).json({
          success: false,
          message: "A consultant profile already exists for this user",
        });
      }

      // Create new consultant with updated fields
      const newConsultant = consultantRepository.create({
        user_id: parseInt(user_id),
        cost: cost || null,
        certification: certification || null,
        bios: bios || null,
      });

      const savedConsultant = await consultantRepository.save(newConsultant);

      res.status(201).json({
        success: true,
        data: savedConsultant,
        message: "Consultant created successfully",
      });
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create consultant",
        error: error.message,
      });
    }
  }

  /**
   * Update consultant
   */
  static async updateConsultant(req, res) {
    try {
      const { id } = req.params;
      const { cost, certification, bios } = req.body;

      const consultantRepository = AppDataSource.getRepository(Consultant);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(id) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Update consultant fields
      if (cost !== undefined) consultant.cost = cost;
      if (certification !== undefined) consultant.certification = certification;
      if (bios !== undefined) consultant.bios = bios;

      const updatedConsultant = await consultantRepository.save(consultant);

      res.status(200).json({
        success: true,
        data: updatedConsultant,
        message: "Consultant updated successfully",
      });
    } catch (error) {
      console.error("Error updating consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update consultant",
        error: error.message,
      });
    }
  }

  /**
   * Search consultants by name (using Profile table)
   */
  static async searchConsultantsByName(req, res) {
    try {
      const { consultantName } = req.params;

      if (!consultantName) {
        return res.status(400).json({
          success: false,
          message: "Search name is required",
        });
      }

      const consultantRepository = AppDataSource.getRepository(Consultant);

      // Search consultants using profile name
      const consultants = await consultantRepository
        .createQueryBuilder("consultant")
        .innerJoinAndSelect("consultant.user", "user")
        .leftJoin(Profile, "profile", "profile.user_id = consultant.user_id")
        .where("LOWER(profile.name) LIKE LOWER(:name)", {
          name: `%${consultantName}%`,
        })
        .getMany();

      // Get profile data for all matched consultants
      const userIds = consultants.map((c) => c.user_id);
      const profileRepository = AppDataSource.getRepository(Profile);
      const profiles = await profileRepository.find({
        where: { user_id: userIds },
      });

      const profileMap = new Map();
      profiles.forEach((profile) => profileMap.set(profile.user_id, profile));

      // Format response
      const formattedConsultants = consultants.map((consultant) => {
        const profile = profileMap.get(consultant.user_id);

        return {
          id: consultant.id_consultant,
          userId: consultant.user_id,
          name: profile?.name || "Not specified",
          email: consultant.user?.email,
          status: consultant.user?.status,
          cost: consultant.cost,
          certification: consultant.certification,
          bios: consultant.bios,
        };
      });

      res.status(200).json({
        success: true,
        data: formattedConsultants,
        count: formattedConsultants.length,
        message: `Found ${formattedConsultants.length} consultants matching "${consultantName}"`,
      });
    } catch (error) {
      console.error("Error searching consultants by name:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search consultants by name",
        error: error.message,
      });
    }
  }

  /**
   * Delete consultant
   */
  static async deleteConsultant(req, res) {
    try {
      const { consultantId } = req.params;

      const consultantRepository = AppDataSource.getRepository(Consultant);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Delete the consultant
      await consultantRepository.delete({
        id_consultant: parseInt(consultantId),
      });

      res.status(200).json({
        success: true,
        message: "Consultant deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete consultant",
        error: error.message,
      });
    }
  }
}

module.exports = ConsultantController;
