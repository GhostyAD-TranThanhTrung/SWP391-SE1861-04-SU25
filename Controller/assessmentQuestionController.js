/**
 * AssessmentQuestion Controller using TypeORM
 * CRUD operations for Assessment Questions table with Answer relationships
 * Handles filtering by assessment_type and other criteria
 */
const AppDataSource = require("../src/data-source");
const AssessmentQuestion = require("../src/entities/AssessmentQuestion");
const Answer = require("../src/entities/Answer");

class AssessmentQuestionController {
  /**
   * Get all assessment questions with their options
   */
  static async getAllQuestionsWithoptions(req, res) {
    try {
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const questions = await assessmentQuestionRepository.find({
        relations: ["options"],
        order: {
          assessment_question_id: "ASC",
          options: {  // Fixed: changed from options to options
            answer_order: "ASC",
          },
        },
      });

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length,
        message: "Assessment questions with options retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting questions with options:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve questions with options",
        error: error.message,
      });
    }
  }

  /**
   * Get assessment questions with options by assessment_type
   */
  static async getQuestionsByAssessmentType(req, res) {
    try {
      const { assessment_type } = req.params;

      if (!assessment_type) {
        return res.status(400).json({
          success: false,
          message: "Assessment type parameter is required",
        });
      }

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const questions = await assessmentQuestionRepository.find({
        where: { assessment_type },
        relations: ["options"],
        order: {
          assessment_question_id: "ASC",
          options: {  // Fixed: changed from answer to options
            answer_order: "ASC",
          },
        },
      });

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length,
        assessment_type: assessment_type,
        message: `Assessment questions with options for type '${assessment_type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting questions by assessment type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve questions by assessment type",
        error: error.message,
      });
    }
  }

  /**
   * Get assessment questions with options by question type
   */
  static async getQuestionsByType(req, res) {
    try {
      const { type } = req.params;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "Question type parameter is required",
        });
      }

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const questions = await assessmentQuestionRepository.find({
        where: { type },
        relations: ["options"],
        order: {
          assessment_question_id: "ASC",
          options: {  // Fixed: changed from options to options
            answer_order: "ASC",
          },
        },
      });

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length,
        question_type: type,
        message: `Assessment questions with options for question type '${type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting questions by type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve questions by type",
        error: error.message,
      });
    }
  }

  /**
   * Get assessment questions with options by multiple filters
   */
  static async getQuestionsWithFilters(req, res) {
    try {
      const { assessment_type, category, substance, type, letter } = req.query;

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Build where condition dynamically
      let whereCondition = {};

      if (assessment_type) whereCondition.assessment_type = assessment_type;
      if (category) whereCondition.category = category;
      if (substance) whereCondition.substance = substance;
      if (type) whereCondition.type = type;
      if (letter) whereCondition.letter = letter;

      const questions = await assessmentQuestionRepository.find({
        where: whereCondition,
        relations: ["options"],
        order: {
          assessment_question_id: "ASC",
          options: {  // Fixed: changed from options to options
            answer_order: "ASC",
          },
        },
      });

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length,
        filters: whereCondition,
        message:
          "Filtered assessment questions with options retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting questions with filters:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve filtered questions",
        error: error.message,
      });
    }
  }

  /**
   * Get single assessment question with options by ID
   */
  static async getQuestionWithoptionsById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID provided",
        });
      }

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const question = await assessmentQuestionRepository.findOne({
        where: { assessment_question_id: parseInt(id) },
        relations: ["options"],
        order: {
          options: {  // Fixed: changed from options to options
            answer_order: "ASC",
          },
        },
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Assessment question not found",
        });
      }

      res.status(200).json({
        success: true,
        data: question,
        message: "Assessment question with options retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting question with options:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve question with options",
        error: error.message,
      });
    }
  }

  /**
   * Get all unique question types
   */
  static async getQuestionTypes(req, res) {
    try {
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Use raw query to get distinct question types
      const types = await assessmentQuestionRepository
        .createQueryBuilder("question")
        .select("DISTINCT question.type", "type")
        .getRawMany();

      const questionTypes = types.map((type) => type.type);

      res.status(200).json({
        success: true,
        data: questionTypes,
        count: questionTypes.length,
        message: "Question types retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting question types:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve question types",
        error: error.message,
      });
    }
  }

  /**
   * Get all unique assessment types
   */
  static async getAssessmentTypes(req, res) {
    try {
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Use raw query to get distinct assessment types
      const types = await assessmentQuestionRepository
        .createQueryBuilder("question")
        .select("DISTINCT question.assessment_type", "assessment_type")
        .getRawMany();

      const assessmentTypes = types.map((type) => type.assessment_type);

      res.status(200).json({
        success: true,
        data: assessmentTypes,
        count: assessmentTypes.length,
        message: "Assessment types retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting assessment types:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve assessment types",
        error: error.message,
      });
    }
  }

  /**
   * Get questions count by assessment type
   */
  static async getQuestionCountByType(req, res) {
    try {
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Use raw query to get count by assessment type
      const counts = await assessmentQuestionRepository
        .createQueryBuilder("question")
        .select("question.assessment_type", "assessment_type")
        .addSelect("COUNT(*)", "question_count")
        .groupBy("question.assessment_type")
        .getRawMany();

      res.status(200).json({
        success: true,
        data: counts,
        message: "Question counts by assessment type retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting question counts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve question counts",
        error: error.message,
      });
    }
  }

  /**
   * Update assessment question with options by ID
   */
  static async updateQuestionWithoptions(req, res) {
    try {
      const { id } = req.params;
      const {
        question,
        type,
        note,
        assessment_type,
        multiSelect,
        allowMultiple,
        category,
        substance,
        letter,
        options,
      } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID provided",
        });
      }

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const answerRepository = AppDataSource.getRepository(Answer);

      // Start transaction
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Check if question exists
        const existingQuestion = await assessmentQuestionRepository.findOne({
          where: { assessment_question_id: parseInt(id) },
          relations: ["options"],
        });

        if (!existingQuestion) {
          await queryRunner.rollbackTransaction();
          return res.status(404).json({
            success: false,
            message: "Assessment question not found",
          });
        }

        // Update question fields
        if (question !== undefined) existingQuestion.question = question;
        if (type !== undefined) existingQuestion.type = type;
        if (note !== undefined) existingQuestion.note = note;
        if (assessment_type !== undefined)
          existingQuestion.assessment_type = assessment_type;
        if (multiSelect !== undefined)
          existingQuestion.multiSelect = multiSelect;
        if (allowMultiple !== undefined)
          existingQuestion.allowMultiple = allowMultiple;
        if (category !== undefined) existingQuestion.category = category;
        if (substance !== undefined) existingQuestion.substance = substance;
        if (letter !== undefined) existingQuestion.letter = letter;

        const updatedQuestion = await queryRunner.manager.save(
          AssessmentQuestion,
          existingQuestion
        );

        // Update options if provided
        if (options && Array.isArray(options)) {
          // Delete existing options
          await queryRunner.manager.delete(Answer, {
            assessment_question_id: parseInt(id),
          });

          // Create new options
          if (options.length > 0) {
            const answerEntities = options.map((answer, index) => {
              return queryRunner.manager.create(Answer, {
                assessment_question_id: parseInt(id),
                id: answer.id || index + 1,  // Fixed: using id instead of option_id
                text: answer.text,
                score: answer.score || 0,
                answer_order: answer.answer_order || index + 1,
              });
            });

            await queryRunner.manager.save(Answer, answerEntities);
          }
        }

        await queryRunner.commitTransaction();

        // Fetch the complete updated question with options
        const completeQuestion = await assessmentQuestionRepository.findOne({
          where: { assessment_question_id: parseInt(id) },
          relations: ["options"],
          order: {
            options: {  // Fixed: changed from options to options
              answer_order: "ASC",
            },
          },
        });

        res.status(200).json({
          success: true,
          data: completeQuestion,
          message: "Assessment question with options updated successfully",
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error updating question with options:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update question with options",
        error: error.message,
      });
    }
  }

  /**
   * Delete assessment question by ID (cascades to options)
   */
  static async deleteQuestionById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID provided",
        });
      }

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const answerRepository = AppDataSource.getRepository(Answer);

      // Start transaction
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Check if question exists
        const existingQuestion = await assessmentQuestionRepository.findOne({
          where: { assessment_question_id: parseInt(id) },
          relations: ["options"],
        });

        if (!existingQuestion) {
          await queryRunner.rollbackTransaction();
          return res.status(404).json({
            success: false,
            message: "Assessment question not found",
          });
        }

        // Delete options first (due to foreign key constraint)
        await queryRunner.manager.delete(Answer, {
          assessment_question_id: parseInt(id),
        });

        // Delete the question
        await queryRunner.manager.delete(AssessmentQuestion, {
          assessment_question_id: parseInt(id),
        });

        await queryRunner.commitTransaction();

        res.status(200).json({
          success: true,
          message:
            "Assessment question and related options deleted successfully",
          data: {
            deleted_question_id: parseInt(id),
            deleted_options_count: existingQuestion.options.length,
          },
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete question",
        error: error.message,
      });
    }
  }

  /**
   * Create new assessment question with options
   */
  static async createQuestionWithoptions(req, res) {
    try {
      const {
        question,
        type,
        note,
        assessment_type,
        multiSelect,
        allowMultiple,
        category,
        substance,
        letter,
        options,
      } = req.body;

      // Validate required fields
      if (!question || !type || !assessment_type) {
        return res.status(400).json({
          success: false,
          message: "Question, type, and assessment_type are required fields",
        });
      }

      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);
      const answerRepository = AppDataSource.getRepository(Answer);

      // Start transaction
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Create the question
        const newQuestion = queryRunner.manager.create(AssessmentQuestion, {
          question,
          type,
          note,
          assessment_type,
          multiSelect: multiSelect || false,
          allowMultiple: allowMultiple || false,
          category,
          substance,
          letter,
        });

        const savedQuestion = await queryRunner.manager.save(
          AssessmentQuestion,
          newQuestion
        );

        // Create options if provided
        let savedoptions = [];
        if (options && Array.isArray(options) && options.length > 0) {
          const answerEntities = options.map((answer, index) => {
            return queryRunner.manager.create(Answer, {
              assessment_question_id: savedQuestion.assessment_question_id,
              id: answer.id || index + 1,  // Fixed: using id instead of option_id
              text: answer.text,
              score: answer.score || 0,
              answer_order: answer.answer_order || index + 1,
            });
          });

          savedoptions = await queryRunner.manager.save(Answer, answerEntities);
        }

        await queryRunner.commitTransaction();

        // Fetch the complete question with options
        const completeQuestion = await assessmentQuestionRepository.findOne({
          where: {
            assessment_question_id: savedQuestion.assessment_question_id,
          },
          relations: ["options"],
          order: {
            options: {  // Fixed: changed from options to options
              answer_order: "ASC",
            },
          },
        });

        res.status(201).json({
          success: true,
          data: completeQuestion,
          message: "Assessment question with options created successfully",
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error creating question with options:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create question with options",
        error: error.message,
      });
    }
  }
}

module.exports = AssessmentQuestionController;
