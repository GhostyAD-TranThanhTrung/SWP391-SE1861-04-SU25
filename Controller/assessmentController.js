/**
 * Assessment Controller using TypeORM
 * CRUD operations for Assessments table
 */
const AppDataSource = require("../src/data-source");
const Assessment = require("../src/entities/Assessment");

class AssessmentController {
  /**
   * Get all assessments
   */
  static async getAllAssessments(req, res) {
    try {
      const assessmentRepository = AppDataSource.getRepository(Assessment);
      const assessments = await assessmentRepository.find();

      res.status(200).json({
        success: true,
        data: assessments,
        message: "Assessments retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting assessments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessments",
        error: error.message,
      });
    }
  }

  /**
   * Get assessment by ID
   */
  static async getAssessmentById(req, res) {
    try {
      const { id } = req.params;
      const assessmentRepository = AppDataSource.getRepository(Assessment);
      const assessment = await assessmentRepository.findOne({
        where: { assessment_id: parseInt(id) },
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }

      res.status(200).json({
        success: true,
        data: assessment,
        message: "Assessment retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting assessment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessment",
        error: error.message,
      });
    }
  }

  /**
   * Get assessments by user ID
   */
  static async getAssessmentsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const assessmentRepository = AppDataSource.getRepository(Assessment);
      const assessments = await assessmentRepository.find({
        where: { user_id: parseInt(userId) },
      });

      res.status(200).json({
        success: true,
        data: assessments,
        count: assessments.length,
        message: `Assessments for user ${userId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting assessments by user ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessments by user ID",
        error: error.message,
      });
    }
  }

  /**
   * Get assessments with related user and action data
   */
  static async getAssessmentsWithRelations(req, res) {
    try {
      const assessmentRepository = AppDataSource.getRepository(Assessment);
      const assessments = await assessmentRepository.find({
        relations: {
          user: true,
          action: true,
        },
      });

      res.status(200).json({
        success: true,
        data: assessments,
        message: "Assessments with relations retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting assessments with relations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessments with relations",
        error: error.message,
      });
    }
  }

  /**
   * Create new assessment
   */
  static async createAssessment(req, res) {
    try {
      const { user_id, type, result_json, action_id } = req.body;

      // Create new assessment with current date
      const assessmentRepository = AppDataSource.getRepository(Assessment);

      const newAssessment = assessmentRepository.create({
        user_id: user_id ? parseInt(user_id) : null,
        type,
        result_json,
        create_at: new Date(),
        action_id: action_id ? parseInt(action_id) : null,
      });

      const savedAssessment = await assessmentRepository.save(newAssessment);

      res.status(201).json({
        success: true,
        data: savedAssessment,
        message: "Assessment created successfully",
      });
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create assessment",
        error: error.message,
      });
    }
  }

  /**
   * Update assessment
   */
  static async updateAssessment(req, res) {
    try {
      const { id } = req.params;
      const { user_id, type, result_json, action_id } = req.body;

      const assessmentRepository = AppDataSource.getRepository(Assessment);

      // Check if assessment exists
      const assessment = await assessmentRepository.findOne({
        where: { assessment_id: parseInt(id) },
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }

      // Update assessment fields
      if (user_id !== undefined)
        assessment.user_id = user_id ? parseInt(user_id) : null;
      if (type !== undefined) assessment.type = type;
      if (result_json !== undefined) assessment.result_json = result_json;
      if (action_id !== undefined)
        assessment.action_id = action_id ? parseInt(action_id) : null;

      const updatedAssessment = await assessmentRepository.save(assessment);

      res.status(200).json({
        success: true,
        data: updatedAssessment,
        message: "Assessment updated successfully",
      });
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update assessment",
        error: error.message,
      });
    }
  }

  /**
   * Delete assessment by ID
   */
  static async deleteAssessment(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid assessment ID provided",
        });
      }

      const assessmentRepository = AppDataSource.getRepository(Assessment);

      // Check if assessment exists before deleting
      const assessment = await assessmentRepository.findOne({
        where: { assessment_id: parseInt(id) },
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }

      // Delete the assessment
      await assessmentRepository.remove(assessment);

      res.status(200).json({
        success: true,
        message: `Assessment with ID ${id} deleted successfully`,
        deletedAssessment: {
          assessment_id: assessment.assessment_id,
          type: assessment.type,
          create_at: assessment.create_at,
        },
      });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete assessment",
        error: error.message,
      });
    }
  }

  /**
   * Get assessments by type
   */
  static async getAssessmentsByType(req, res) {
    try {
      const { type } = req.params;
      const assessmentRepository = AppDataSource.getRepository(Assessment);

      const assessments = await assessmentRepository.find({
        where: { type },
      });

      res.status(200).json({
        success: true,
        data: assessments,
        count: assessments.length,
        message: `Assessments with type '${type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting assessments by type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessments by type",
        error: error.message,
      });
    }
  }

  /**
   * Get assessments by date range
   */
  static async getAssessmentsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      const assessmentRepository = AppDataSource.getRepository(Assessment);

      const assessments = await assessmentRepository
        .createQueryBuilder("assessment")
        .where("assessment.create_at >= :startDate", { startDate })
        .andWhere("assessment.create_at <= :endDate", { endDate })
        .getMany();

      res.status(200).json({
        success: true,
        data: assessments,
        count: assessments.length,
        message: "Assessments within date range retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting assessments by date range:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessments by date range",
        error: error.message,
      });
    }
  }
}

module.exports = AssessmentController;
