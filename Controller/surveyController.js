/**
 * Survey Controller using TypeORM
 * CRUD operations for Surveys table
 */
const AppDataSource = require("../src/data-source");
const Survey = require("../src/entities/Survey");
const Program = require("../src/entities/Program");

class SurveyController {
  /**
   * Get all surveys
   */
  static async getAllSurveys(req, res) {
    try {
      const surveyRepository = AppDataSource.getRepository(Survey);
      const surveys = await surveyRepository.find();

      res.status(200).json({
        success: true,
        data: surveys,
        message: "Surveys retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting surveys:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve surveys",
        error: error.message,
      });
    }
  }

  /**
   * Get survey by ID
   */
  static async getSurveyById(req, res) {
    try {
      const { id } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);
      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      res.status(200).json({
        success: true,
        data: survey,
        message: "Survey retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve survey",
        error: error.message,
      });
    }
  }

  /**
   * Get parsed survey by ID
   */
  static async getParsedSurveyById(req, res) {
    try {
      const { id } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);
      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      let parsedQuestions;
      try {
        parsedQuestions = survey.questions_json
          ? JSON.parse(survey.questions_json)
          : null;
      } catch (jsonError) {
        return res.status(422).json({
          success: false,
          message: "Invalid JSON format in survey questions",
          error: jsonError.message,
        });
      }

      const parsedSurvey = {
        survey_id: survey.survey_id,
        program_id: survey.program_id,
        type: survey.type,
        questions: parsedQuestions,
      };

      res.status(200).json({
        success: true,
        data: parsedSurvey,
        message: "Survey retrieved and parsed successfully",
      });
    } catch (error) {
      console.error("Error getting parsed survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve and parse survey",
        error: error.message,
      });
    }
  }

  /**
   * Get surveys by program ID
   */
  static async getSurveysByProgramId(req, res) {
    try {
      const { programId } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      const surveys = await surveyRepository.find({
        where: { program_id: parseInt(programId) },
      });

      res.status(200).json({
        success: true,
        data: surveys,
        count: surveys.length,
        message: `Surveys for program ID ${programId} retrieved successfully`,
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
   * Get survey with program information
   */
  static async getSurveyWithProgram(req, res) {
    try {
      const { id } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
        relations: {
          program: true,
        },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      res.status(200).json({
        success: true,
        data: survey,
        message: "Survey with program information retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting survey with program:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve survey with program",
        error: error.message,
      });
    }
  }

  /**
   * Get survey with responses
   */
  static async getSurveyWithResponses(req, res) {
    try {
      const { id } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
        relations: {
          responses: true,
        },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      res.status(200).json({
        success: true,
        data: survey,
        message: "Survey with responses retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting survey with responses:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve survey with responses",
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

      // Check if program exists if program_id is provided
      if (program_id) {
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
      }

      // Validate questions if provided
      let questions_json = null;
      if (questions) {
        try {
          questions_json =
            typeof questions === "string"
              ? questions
              : JSON.stringify(questions);

          // Validate that it's a proper JSON
          JSON.parse(questions_json);
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for questions",
            error: jsonError.message,
          });
        }
      }

      const surveyRepository = AppDataSource.getRepository(Survey);

      // Create new survey
      const newSurvey = surveyRepository.create({
        program_id: program_id ? parseInt(program_id) : null,
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
   * Update survey
   */
  static async updateSurvey(req, res) {
    try {
      const { id } = req.params;
      const { program_id, type, questions } = req.body;

      const surveyRepository = AppDataSource.getRepository(Survey);

      // Check if survey exists
      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      // Check if program exists if program_id is provided
      if (program_id !== undefined) {
        if (program_id !== null) {
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
        }
      }

      // Validate and update questions if provided
      if (questions !== undefined) {
        try {
          survey.questions_json =
            typeof questions === "string"
              ? questions
              : JSON.stringify(questions);

          // Validate that it's a proper JSON
          JSON.parse(survey.questions_json);
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for questions",
            error: jsonError.message,
          });
        }
      }

      // Update other survey fields
      if (program_id !== undefined) {
        survey.program_id = program_id !== null ? parseInt(program_id) : null;
      }

      if (type !== undefined) {
        survey.type = type;
      }

      const updatedSurvey = await surveyRepository.save(survey);

      res.status(200).json({
        success: true,
        data: updatedSurvey,
        message: "Survey updated successfully",
      });
    } catch (error) {
      console.error("Error updating survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update survey",
        error: error.message,
      });
    }
  }

  /**
   * Delete survey by ID
   */
  static async deleteSurvey(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid survey ID provided",
        });
      }

      const surveyRepository = AppDataSource.getRepository(Survey);

      // Check if survey exists and get related responses
      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
        relations: {
          responses: true,
        },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      // Check if survey has responses
      if (survey.responses && survey.responses.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Cannot delete survey with existing responses",
          responseCount: survey.responses.length,
        });
      }

      // Delete the survey
      await surveyRepository.remove(survey);

      res.status(200).json({
        success: true,
        message: `Survey with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete survey",
        error: error.message,
      });
    }
  }

  /**
   * Get surveys by type
   */
  static async getSurveysByType(req, res) {
    try {
      const { type } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      const surveys = await surveyRepository.find({
        where: { type },
      });

      res.status(200).json({
        success: true,
        data: surveys,
        count: surveys.length,
        message: `Surveys of type '${type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting surveys by type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve surveys by type",
        error: error.message,
      });
    }
  }

  /**
   * Get survey response statistics
   */
  static async getSurveyResponseStats(req, res) {
    try {
      const { id } = req.params;

      // Use raw query for aggregating response data
      const stats = await AppDataSource.query(
        `
                SELECT 
                    s.survey_id,
                    s.type,
                    COUNT(sr.response_id) AS total_responses,
                    COUNT(DISTINCT sr.user_id) AS unique_respondents
                FROM Surveys s
                LEFT JOIN SurveyResponses sr ON s.survey_id = sr.survey_id
                WHERE s.survey_id = ?
                GROUP BY s.survey_id, s.type
            `,
        [parseInt(id)]
      );

      if (!stats || stats.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      res.status(200).json({
        success: true,
        data: stats[0],
        message: "Survey response statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting survey response stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve survey response statistics",
        error: error.message,
      });
    }
  }

  /**
   * Clone an existing survey
   */
  static async cloneSurvey(req, res) {
    try {
      const { id } = req.params;
      const { program_id, type } = req.body;

      const surveyRepository = AppDataSource.getRepository(Survey);

      // Find the source survey to clone
      const sourceSurvey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
      });

      if (!sourceSurvey) {
        return res.status(404).json({
          success: false,
          message: "Source survey not found",
        });
      }

      // Check if target program exists if provided
      if (program_id) {
        const programRepository = AppDataSource.getRepository(Program);
        const program = await programRepository.findOne({
          where: { program_id: parseInt(program_id) },
        });

        if (!program) {
          return res.status(404).json({
            success: false,
            message: "Target program not found",
          });
        }
      }

      // Create new survey based on the source
      const newSurvey = surveyRepository.create({
        program_id: program_id ? parseInt(program_id) : sourceSurvey.program_id,
        type: type || sourceSurvey.type,
        questions_json: sourceSurvey.questions_json,
      });

      const clonedSurvey = await surveyRepository.save(newSurvey);

      res.status(201).json({
        success: true,
        data: clonedSurvey,
        message: "Survey cloned successfully",
      });
    } catch (error) {
      console.error("Error cloning survey:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clone survey",
        error: error.message,
      });
    }
  }
}

module.exports = SurveyController;
