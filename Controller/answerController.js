/**
 * Answer Controller using TypeORM
 * CRUD operations for Answers table
 * Handles individual answer management with relationship to assessment questions
 */
const AppDataSource = require("../src/data-source");
const Answer = require("../src/entities/Answer");
const AssessmentQuestion = require("../src/entities/AssessmentQuestion");

class AnswerController {
  /**
   * Get all answers with their related questions
   */
  static async getAllAnswers(req, res) {
    try {
      const answerRepository = AppDataSource.getRepository(Answer);
      const answers = await answerRepository.find({
        relations: ["assessmentQuestion"],
        order: {
          answer_id: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: answers,
        count: answers.length,
        message: "All answers retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting all answers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve answers",
        error: error.message,
      });
    }
  }

  /**
   * Get single answer by ID
   */
  static async getAnswerById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer ID provided",
        });
      }

      const answerRepository = AppDataSource.getRepository(Answer);
      const answer = await answerRepository.findOne({
        where: { answer_id: parseInt(id) },
        relations: ["assessmentQuestion"],
      });

      if (!answer) {
        return res.status(404).json({
          success: false,
          message: "Answer not found",
        });
      }

      res.status(200).json({
        success: true,
        data: answer,
        message: "Answer retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting answer by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve answer",
        error: error.message,
      });
    }
  }

  /**
   * Get answers by assessment question ID
   */
  static async getAnswersByQuestionId(req, res) {
    try {
      const { questionId } = req.params;

      if (!questionId || isNaN(parseInt(questionId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid assessment question ID provided",
        });
      }

      const answerRepository = AppDataSource.getRepository(Answer);
      const answers = await answerRepository.find({
        where: { assessment_question_id: parseInt(questionId) },
        order: {
          answer_order: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: answers,
        count: answers.length,
        assessment_question_id: parseInt(questionId),
        message: `Answers for assessment question ${questionId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting answers by question ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve answers by question ID",
        error: error.message,
      });
    }
  }

  /**
   * Create new answer
   */
  static async createAnswer(req, res) {
    try {
      const { assessment_question_id, option_id, text, score, answer_order } =
        req.body;

      // Validate required fields
      if (!assessment_question_id || !option_id || !text) {
        return res.status(400).json({
          success: false,
          message:
            "assessment_question_id, option_id, and text are required fields",
        });
      }

      const answerRepository = AppDataSource.getRepository(Answer);
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Check if assessment question exists
      const questionExists = await assessmentQuestionRepository.findOne({
        where: { assessment_question_id: parseInt(assessment_question_id) },
      });

      if (!questionExists) {
        return res.status(404).json({
          success: false,
          message: "Assessment question not found",
        });
      }

      // Create new answer
      const newAnswer = answerRepository.create({
        assessment_question_id: parseInt(assessment_question_id),
        option_id: parseInt(option_id),
        text,
        score: score || 0,
        answer_order: answer_order || 1,
      });

      const savedAnswer = await answerRepository.save(newAnswer);

      // Fetch the complete answer with question details
      const completeAnswer = await answerRepository.findOne({
        where: { answer_id: savedAnswer.answer_id },
        relations: ["assessmentQuestion"],
      });

      res.status(201).json({
        success: true,
        data: completeAnswer,
        message: "Answer created successfully",
      });
    } catch (error) {
      console.error("Error creating answer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create answer",
        error: error.message,
      });
    }
  }

  /**
   * Update answer by ID
   */
  static async updateAnswer(req, res) {
    try {
      const { id } = req.params;
      const { assessment_question_id, option_id, text, score, answer_order } =
        req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer ID provided",
        });
      }

      const answerRepository = AppDataSource.getRepository(Answer);
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Check if answer exists
      const existingAnswer = await answerRepository.findOne({
        where: { answer_id: parseInt(id) },
      });

      if (!existingAnswer) {
        return res.status(404).json({
          success: false,
          message: "Answer not found",
        });
      }

      // If assessment_question_id is being updated, verify it exists
      if (
        assessment_question_id &&
        assessment_question_id !== existingAnswer.assessment_question_id
      ) {
        const questionExists = await assessmentQuestionRepository.findOne({
          where: { assessment_question_id: parseInt(assessment_question_id) },
        });

        if (!questionExists) {
          return res.status(404).json({
            success: false,
            message: "Assessment question not found",
          });
        }
      }

      // Update answer fields
      if (assessment_question_id !== undefined)
        existingAnswer.assessment_question_id = parseInt(
          assessment_question_id
        );
      if (option_id !== undefined)
        existingAnswer.option_id = parseInt(option_id);
      if (text !== undefined) existingAnswer.text = text;
      if (score !== undefined) existingAnswer.score = score;
      if (answer_order !== undefined)
        existingAnswer.answer_order = answer_order;

      const updatedAnswer = await answerRepository.save(existingAnswer);

      // Fetch the complete updated answer with question details
      const completeAnswer = await answerRepository.findOne({
        where: { answer_id: parseInt(id) },
        relations: ["assessmentQuestion"],
      });

      res.status(200).json({
        success: true,
        data: completeAnswer,
        message: "Answer updated successfully",
      });
    } catch (error) {
      console.error("Error updating answer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update answer",
        error: error.message,
      });
    }
  }

  /**
   * Delete answer by ID
   */
  static async deleteAnswer(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer ID provided",
        });
      }

      const answerRepository = AppDataSource.getRepository(Answer);

      // Check if answer exists
      const existingAnswer = await answerRepository.findOne({
        where: { answer_id: parseInt(id) },
        relations: ["assessmentQuestion"],
      });

      if (!existingAnswer) {
        return res.status(404).json({
          success: false,
          message: "Answer not found",
        });
      }

      // Delete the answer
      await answerRepository.delete({ answer_id: parseInt(id) });

      res.status(200).json({
        success: true,
        message: "Answer deleted successfully",
        data: {
          deleted_answer_id: parseInt(id),
          deleted_from_question: existingAnswer.assessment_question_id,
        },
      });
    } catch (error) {
      console.error("Error deleting answer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete answer",
        error: error.message,
      });
    }
  }

  /**
   * Bulk create answers for a question
   */
  static async bulkCreateAnswers(req, res) {
    try {
      const { assessment_question_id, answers } = req.body;

      // Validate required fields
      if (
        !assessment_question_id ||
        !answers ||
        !Array.isArray(answers) ||
        answers.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "assessment_question_id and answers array are required",
        });
      }

      const answerRepository = AppDataSource.getRepository(Answer);
      const assessmentQuestionRepository =
        AppDataSource.getRepository(AssessmentQuestion);

      // Check if assessment question exists
      const questionExists = await assessmentQuestionRepository.findOne({
        where: { assessment_question_id: parseInt(assessment_question_id) },
      });

      if (!questionExists) {
        return res.status(404).json({
          success: false,
          message: "Assessment question not found",
        });
      }

      // Create answer entities
      const answerEntities = answers.map((answer, index) => {
        return answerRepository.create({
          assessment_question_id: parseInt(assessment_question_id),
          option_id: answer.option_id || index + 1,
          text: answer.text,
          score: answer.score || 0,
          answer_order: answer.answer_order || index + 1,
        });
      });

      const savedAnswers = await answerRepository.save(answerEntities);

      res.status(201).json({
        success: true,
        data: savedAnswers,
        count: savedAnswers.length,
        assessment_question_id: parseInt(assessment_question_id),
        message: "Answers created successfully",
      });
    } catch (error) {
      console.error("Error bulk creating answers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create answers",
        error: error.message,
      });
    }
  }
}

module.exports = AnswerController;
