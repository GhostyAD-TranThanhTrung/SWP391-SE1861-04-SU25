/**
 * Assessment Controller using TypeORM
 * CRUD operations for Assessments table
 */
const AppDataSource = require("../src/data-source");
const Assessment = require("../src/entities/Assessment");
const Action = require("../src/entities/Action");
const User = require("../src/entities/User");
const AssessmentQuestion = require("../src/entities/AssessmentQuestion");
const Answer = require("../src/entities/Answer");
const { In } = require("typeorm");

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
   * For CRAFFT type: implements CRAFFT 2.1 scoring logic using questionIds from result_json
   */
  static async takeTestFromUser(req, res) {
    // Start database transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { score, type, results } = req.body;
      const user_id = req.user.userId;

      // Validate required fields
      if (!results || !Array.isArray(results) || results.length === 0) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          success: false,
          message: "Results array is required and cannot be empty",
        });
      }

      if (!user_id || score === undefined || score === null || !type) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          success: false,
          message: "User ID, score, and type are required",
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
      }

      let finalScore = numericScore;
      let actionRange = numericScore;
      const actionRepository = queryRunner.manager.getRepository("Action");
      // Special handling for CRAFFT assessment
      if (type.toLowerCase() === 'crafft') {
        console.log('🎯 Processing CRAFFT assessment with special logic');
        
        // Extract question texts from results to query questions
        const questionTexts = results.map(result => result.question).filter(q => q && q.trim());
        
        console.log('🔍 Extracted question texts:', questionTexts.map(q => q.substring(0, 80) + '...'));
        console.log('🔍 Raw results structure:', results.map(r => ({ 
          question: r.question?.substring(0, 50) + '...', 
          selectedOption: r.selectedOption,
          score: r.score 
        })));
        
        if (questionTexts.length === 0) {
          await queryRunner.rollbackTransaction();
          return res.status(400).json({
            success: false,
            message: "Question texts are required for CRAFFT assessment. Check that results contain valid question values.",
          });
        }

        // Query assessment questions using question text
        const questionRepository = queryRunner.manager.getRepository("AssessmentQuestion");

        const questions = await questionRepository.find({
          where: {
            question: In(questionTexts),
            assessment_type: 'CRAFFT'
          }
        });

        console.log('📊 Found CRAFFT questions in database:', questions.length);

        if (questions.length === 0) {
          await queryRunner.rollbackTransaction();
          return res.status(404).json({
            success: false,
            message: "No CRAFFT questions found with provided question texts",
          });
        }

        // Identify Part A questions from database (substance use screening)
        const partAQuestions = questions.filter(q => q.category === 'partA');
        const partAQuestionTexts = partAQuestions.map(q => q.question);
        
        console.log('📊 Part A questions found:', partAQuestions.length);
        console.log('📊 Part A question texts:', partAQuestionTexts.map(q => q.substring(0, 50) + '...'));

        let hasSubstanceUse = false;

        let partBScore = score;

        for (const result of results) {
          if (!result.question || result.score === undefined) continue;

          const resultScore = parseInt(result.score) || 0;
          console.log(`📝 Processing: "${result.question.substring(0, 50)}..." with score=${resultScore}`);

          // Check if this question is a Part A question (substance use screening)
          const isPartAQuestion = partAQuestionTexts.some(partAText => 
            partAText === result.question
          );

          if (isPartAQuestion) {
            if (resultScore > 0) {
              hasSubstanceUse = true;
              break;
            }
          } 
        }
        // Get CRAFFT actions from database to determine dynamic ranges
        
        const crafftActions = await actionRepository.find({
          where: { type: 'CRAFFT' },
          order: { range: 'ASC' }
        });
        // Extract ranges dynamically (sorted ascending: low, medium, high)
        const lowRiskRange = crafftActions[0].range;
        const mediumRiskRange = crafftActions[1].range;
        const highRiskRange = crafftActions[2].range;


        // Apply CRAFFT 2.1 logic to determine risk level range using dynamic values
        if (!hasSubstanceUse && partBScore === 0) {
          // Low risk
          actionRange = crafftActions[0].action_id;
        } else if ((hasSubstanceUse && partBScore < highRiskRange) || (!hasSubstanceUse && partBScore > highRiskRange)) {
          // Medium risk
          actionRange = crafftActions[1].action_id;
        } else if (hasSubstanceUse && partBScore >= highRiskRange) {
          // High risk
          actionRange = crafftActions[2].action_id;
        } else {
          // Default to medium risk for edge cases
          actionRange = crafftActions[1].action_id;
        }
        
      }
      else{
        const action = await queryRunner.manager.getRepository("Action")
          .createQueryBuilder("action")
          .where("action.type = :type", { type })
          .andWhere("action.range <= :range", { range: score })
          .getOne();

        if (!action) {
          await queryRunner.rollbackTransaction();
          return res.status(404).json({
            success: false,
            message: `No action found for ${type} assessment with range/score ${actionRange}`,
          });
        }

        actionRange = action.action_id;
      }

      const action = await actionRepository.findOne({
        where: { action_id: actionRange }
      });

      if (!action) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({
          success: false,
          message: `Action with ID ${actionRange} not found`,
        });
      }

      // Create assessment with the score and action
      const assessmentRepository = queryRunner.manager.getRepository("Assessment");
      const newAssessment = assessmentRepository.create({
        user_id: parseInt(user_id),
        type: type || "test",
        result_json: JSON.stringify({ result: results, score: score }),
        create_at: new Date(),
        action_id: actionRange,
      });

      const savedAssessment = await assessmentRepository.save(newAssessment);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return complete information
      const response = {
        user: {
          user_id: user.user_id
        },
        test_result: {
          score: finalScore,
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
