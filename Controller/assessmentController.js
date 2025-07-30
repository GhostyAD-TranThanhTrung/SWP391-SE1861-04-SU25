/**
 * Assessment Controller using TypeORM
 * CRUD operations for Assessments table
 */
const AppDataSource = require("../src/data-source");
const Assessment = require("../src/entities/Assessment");
const Action = require("../src/entities/Action");
const User = require("../src/entities/User");

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



  static async getAssessmentsByUserToken(req, res) {
    try {
      const userId = req.user.userId;
      const assessmentRepository = AppDataSource.getRepository(Assessment);

      // Get assessments with Action relations
      const assessments = await assessmentRepository.find({
        where: { user_id: parseInt(userId) },
        relations: {
          action: true,
        },
        order: {
          create_at: 'DESC'
        }
      });

      // Format the response to include combined data
      const formattedAssessments = assessments.map(assessment => ({
        assessment_id: assessment.assessment_id,
        user_id: assessment.user_id,
        type: assessment.type,
        result_json: assessment.result_json,
        create_at: assessment.create_at,
        action: assessment.action ? {
          action_id: assessment.action.action_id,
          description: assessment.action.description,
          range: assessment.action.range,
          type: assessment.action.type,
        } : null
      }));

      res.status(200).json({
        success: true,
        data: formattedAssessments,
        count: formattedAssessments.length,
        message: `Assessments with actions for user ${userId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting assessments by user token:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessments by user token",
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
   * Take test from user - Process test score and save assessment
   * POST /api/assessments/take-test
   * Takes score from user, finds matching action based on score range, and saves assessment
   */
  static async takeTestFromUser(req, res) {
    // Start database transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { score, type, results } = req.body;

      const user_id = req.user.userId;

      if (!results || !Array.isArray(results) || results.length === 0 || results === undefined || results === null) {
        return res.status(400).json({
          success: false,
          message: "Results array is required and cannot be empty",
        });
      }
      // Validate required fields
      if (!user_id || score === undefined || score === null) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          success: false,
          message: "User ID and score are required",
        });
      }

      // Validate score is a number
      const numericScore = parseInt(score);
      if (isNaN(numericScore)) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          success: false,
          message: "Score must be a valid number",
        });
      }

      // Verify user exists and has member role
      const userRepository = queryRunner.manager.getRepository("User");
      const user = await userRepository.findOne({
        where: { user_id: parseInt(user_id) },
      });

      if (!user) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role.toLowerCase() !== "member") {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          success: false,
          message: "Only members can take tests",
        });
      }      // Find action based on score (highest range <= score)
      const actionRepository = queryRunner.manager.getRepository("Action");

      const action = await actionRepository
        .createQueryBuilder("action")
        .where("action.type = :type", { type })
        .andWhere("action.range <= :score", { score: numericScore })
        .orderBy("action.range", "DESC")
        .getOne();

      if (!action) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({
          success: false,
          message: `No action found for score ${numericScore}`,
        });
      }

      // Create assessment with the score and action
      const assessmentRepository = queryRunner.manager.getRepository("Assessment");
      const newAssessment = assessmentRepository.create({
        user_id: parseInt(user_id),
        type: type || "test", // Default type if not provided
        result_json: JSON.stringify({ result: results, score: score }),
        create_at: new Date(),
        action_id: action.action_id,
      });

      const savedAssessment = await assessmentRepository.save(newAssessment);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return complete information (excluding action_id and assessment_id as requested)
      const response = {
        user: {
          user_id: user.user_id
        },
        test_result: {
          score: numericScore,
          type: savedAssessment.type,
          create_at: savedAssessment.create_at,
        },
        recommended_action: {
          description: action.description,
          range: action.range,
          type: action.type,
        },
      };

      res.status(201).json({
        success: true,
        data: response,
        message: "Test completed and assessment saved successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error("Error processing test from user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process test",
        error: error.message,
      });
    } finally {
      // Release query runner resources
      await queryRunner.release();
    }
  }

  /**
   * Get assessment details for a member user
   * GET /api/assessments/details/:userId
   * Joins assessment and action data for a specific member user
   */
  static async getAssessmentDetails(req, res) {
    try {
      const { userId } = req.params;

      // Validate user ID
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID provided",
        });
      }

      // Verify user exists and has member role
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: parseInt(userId) }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role.toLowerCase() !== 'member') {
        return res.status(400).json({
          success: false,
          message: "Only member users can access assessment details",
        });
      }

      // Get assessments with joined action data using query builder
      const assessmentRepository = AppDataSource.getRepository(Assessment);

      const assessmentDetails = await assessmentRepository
        .createQueryBuilder("assessment")
        .leftJoinAndSelect("assessment.action", "action", "assessment.action_id = action.action_id")
        .leftJoinAndSelect("assessment.user", "user", "assessment.user_id = user.user_id")
        .where("assessment.user_id = :userId", { userId: parseInt(userId) })
        .select([
          "assessment.assessment_id",
          "assessment.user_id",
          "assessment.type",
          "assessment.result_json",
          "assessment.create_at",
          "action.description",
          "user.email",
          "user.role",
          "user.status"
        ])
        .getMany();

      if (!assessmentDetails || assessmentDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No assessments found for user ${userId}`,
        });
      }

      // Format the response to match ERD structure
      const formattedDetails = assessmentDetails.map(assessment => ({
        assessment: {
          assessment_id: assessment.assessment_id,
          user_id: assessment.user_id,
          result_json: assessment.result_json,
          create_at: assessment.create_at
        },
        action: assessment.action ? {
          description: assessment.action.description,
        } : null,
        user: {
          user_id: assessment.user_id
        }
      }));

      res.status(200).json({
        success: true,
        data: formattedDetails,
        count: formattedDetails.length,
        message: `Assessment details for member user ${userId} retrieved successfully`,
      });

    } catch (error) {
      console.error("Error getting assessment details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessment details",
        error: error.message,
      });
    }
  }
}

module.exports = AssessmentController;
