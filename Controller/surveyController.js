/**
 * Survey Controller using TypeORM
 * CRUD operations for Surveys table
 */
const AppDataSource = require("../src/data-source");
const Survey = require("../src/entities/Survey");
const Program = require("../src/entities/Program");
const SurveyResponse = require("../src/entities/SurveyResponse");

class SurveyController {



  /**
   * Get surveys by type and program ID
   */
  static async getSurveysByTypeAndProgramId(req, res) {
    try {
      const { type, programId } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      // Validate programId is a number
      if (isNaN(parseInt(programId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid program ID provided",
        });
      }

      const surveys = await surveyRepository.find({
        where: { 
          type: type,
          program_id: parseInt(programId)
        },
        order: { survey_id: 'ASC' }
      });

      console.log(`[getSurveysByTypeAndProgramId] programId: ${programId}, type: ${type}, found: ${surveys.length}`);

      if (!surveys || surveys.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No survey of type '${type}' found for program ID ${programId}`,
          data: []
        });
      }

      // Return only the first survey (enforce 1 per type/program)
      return res.status(200).json({
        success: true,
        data: [surveys[0]],
        count: 1,
        message: `Survey of type '${type}' for program ID ${programId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting surveys by type and program ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve surveys by type and program ID",
        error: error.message,
      });
    }
  }

  /**
   * Get all surveys by program ID
   */
  static async getSurveysByProgramId(req, res) {
    try {
      const { programId } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      // Validate programId is a number
      if (isNaN(parseInt(programId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid program ID provided",
        });
      }

      const surveys = await surveyRepository.find({
        where: { 
          program_id: parseInt(programId)
        },
        order: {
          type: 'ASC',
          survey_id: 'ASC'
        }
      });

      // Group surveys by type for better organization
      const surveysByType = surveys.reduce((acc, survey) => {
        if (!acc[survey.type]) {
          acc[survey.type] = [];
        }
        acc[survey.type].push(survey);
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: surveys,
        dataByType: surveysByType,
        count: surveys.length,
        message: `All surveys for program ID ${programId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting surveys by program ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve surveys by program ID",
        error: error.message,
      });
    }
  }

  /**
   * Create new survey
   */
  static async createSurvey(req, res) {
    try {
      const { program_id, type, questions } = req.body;

      // Validate required fields
      if (!program_id || !type || !questions) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: program_id, type, and questions are required",
        });
      }

      // Check if program exists
      const programRepository = AppDataSource.getRepository(Program);
      const program = await programRepository.findOne({
        where: { program_id: parseInt(program_id) },
      });

      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found",
        });
      }

      // Validate questions format
      let questions_json = null;
      try {
        questions_json = typeof questions === "string" ? questions : JSON.stringify(questions);
        
        // Validate that it's proper JSON
        const parsedQuestions = JSON.parse(questions_json);
        
        // Basic validation of questions structure
        if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
          return res.status(400).json({
            success: false,
            message: "Questions must have a 'questions' array property",
          });
        }

        // Validate each question has required fields
        for (let i = 0; i < parsedQuestions.questions.length; i++) {
          const question = parsedQuestions.questions[i];
          if (!question.id || !question.question) {
            return res.status(400).json({
              success: false,
              message: `Question at index ${i} must have 'id' and 'question' properties`,
            });
          }
        }
      } catch (jsonError) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for questions",
          error: jsonError.message,
        });
      }

      const surveyRepository = AppDataSource.getRepository(Survey);

      // Check if survey with same program_id and type already exists
      const existingSurvey = await surveyRepository.findOne({
        where: { 
          program_id: parseInt(program_id),
          type: type 
        },
      });

      if (existingSurvey) {
        return res.status(409).json({
          success: false,
          message: `Survey of type '${type}' already exists for this program`,
          existing_survey_id: existingSurvey.survey_id,
        });
      }

      // Create new survey
      const newSurvey = surveyRepository.create({
        program_id: parseInt(program_id),
        type,
        questions_json,
      });

      const savedSurvey = await surveyRepository.save(newSurvey);

      res.status(201).json({
        success: true,
        data: savedSurvey,
        message: "Survey created successfully",
      });
    } catch (error) {
      console.error("Error creating survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create survey",
        error: error.message,
      });
    }
  }

  /**
   * Update survey and remove all existing responses
   */
  static async updateSurvey(req, res) {
    try {
      const { id } = req.params;
      const { program_id, type, questions } = req.body;

      console.log("🔧 Survey Update Request - ID:", id);
      console.log("🔧 Survey Update Request - Body:", { program_id, type, questions: questions ? "questions provided" : "no questions" });

      if (!id || isNaN(parseInt(id))) {
        console.log("❌ Invalid survey ID provided:", id);
        return res.status(400).json({
          success: false,
          message: "Invalid survey ID provided",
        });
      }

      const surveyRepository = AppDataSource.getRepository(Survey);
      const surveyResponseRepository = AppDataSource.getRepository(SurveyResponse);

      // Check if survey exists
      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
        relations: { responses: true }
      });

      if (!survey) {
        console.log("❌ Survey not found with ID:", id);
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      console.log("✅ Found existing survey:", {
        survey_id: survey.survey_id,
        type: survey.type,
        program_id: survey.program_id,
        questions_count: survey.questions_json ? JSON.parse(survey.questions_json).questions?.length || 0 : 0,
        responses_count: survey.responses?.length || 0
      });

      let questionsUpdated = false;
      let responsesDeleted = 0;
      let fieldsUpdated = [];

      // Check if program exists if program_id is provided
      if (program_id !== undefined) {
        if (program_id !== null) {
          const programRepository = AppDataSource.getRepository(Program);
          const program = await programRepository.findOne({
            where: { program_id: parseInt(program_id) },
          });

          if (!program) {
            console.log("❌ Program not found with ID:", program_id);
            return res.status(404).json({
              success: false,
              message: "Program not found",
            });
          }
        }
      }

      // Validate and update questions if provided
      if (questions !== undefined) {
        try {
          const newQuestionsJson = typeof questions === "string" ? questions : JSON.stringify(questions);
          
          console.log("🔧 Processing questions update...");
          console.log("🔧 Current questions JSON:", survey.questions_json);
          console.log("🔧 New questions JSON:", newQuestionsJson);
          
          // Validate that it's proper JSON
          const parsedQuestions = JSON.parse(newQuestionsJson);
          
          // Basic validation of questions structure
          if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
            console.log("❌ Invalid questions structure - missing questions array");
            return res.status(400).json({
              success: false,
              message: "Questions must have a 'questions' array property",
            });
          }

          // Validate each question has required fields
          for (let i = 0; i < parsedQuestions.questions.length; i++) {
            const question = parsedQuestions.questions[i];
            if (!question.id || !question.question) {
              console.log("❌ Invalid question at index", i, ":", question);
              return res.status(400).json({
                success: false,
                message: `Question at index ${i} must have 'id' and 'question' properties`,
              });
            }
          }

          // Check if questions have actually changed
          if (survey.questions_json !== newQuestionsJson) {
            questionsUpdated = true;
            survey.questions_json = newQuestionsJson;
            fieldsUpdated.push('questions');

            console.log("✅ Questions updated - deleting existing responses");
            // Delete all existing responses since questions have changed
            if (survey.responses && survey.responses.length > 0) {
              await surveyResponseRepository.remove(survey.responses);
              responsesDeleted = survey.responses.length;
              console.log("🗑️ Deleted", responsesDeleted, "existing responses");
            }
          } else {
            console.log("ℹ️ Questions unchanged - no update needed");
          }
        } catch (jsonError) {
          console.log("❌ JSON parsing error:", jsonError.message);
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for questions",
            error: jsonError.message,
          });
        }
      }

      // Update other survey fields
      if (program_id !== undefined && survey.program_id !== program_id) {
        survey.program_id = program_id !== null ? parseInt(program_id) : null;
        fieldsUpdated.push('program_id');
        console.log("✅ Program ID updated to:", survey.program_id);
      }

      if (type !== undefined && survey.type !== type) {
        survey.type = type;
        fieldsUpdated.push('type');
        console.log("✅ Type updated to:", survey.type);
      }

      const updatedSurvey = await surveyRepository.save(survey);

      console.log("✅ Survey saved successfully");
      console.log("✅ Updated survey data:", {
        survey_id: updatedSurvey.survey_id,
        type: updatedSurvey.type,
        program_id: updatedSurvey.program_id,
        questions_count: updatedSurvey.questions_json ? JSON.parse(updatedSurvey.questions_json).questions?.length || 0 : 0
      });

      res.status(200).json({
        success: true,
        data: updatedSurvey,
        message: "Survey updated successfully",
        changes: {
          fields_updated: fieldsUpdated,
          questions_updated: questionsUpdated,
          responses_deleted: responsesDeleted,
          warning: questionsUpdated ? "All previous responses were deleted due to question changes" : null
        }
      });
    } catch (error) {
      console.error("❌ Error updating survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update survey",
        error: error.message,
      });
    }
  }
}

module.exports = SurveyController;
