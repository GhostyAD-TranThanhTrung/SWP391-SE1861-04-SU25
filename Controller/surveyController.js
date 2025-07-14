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
   * Get single survey by ID
   */
  static async getSurveyById(req, res) {
    try {
      const { id } = req.params;
      const surveyRepository = AppDataSource.getRepository(Survey);

      // Validate survey ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid survey ID provided",
        });
      }

      const survey = await surveyRepository.findOne({
        where: { survey_id: parseInt(id) },
        relations: ['responses']
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      // Filter out deleted questions
      const filteredSurvey = { ...survey };
      if (filteredSurvey.questions_json) {
        try {
          const parsedQuestions = typeof filteredSurvey.questions_json === 'string' 
            ? JSON.parse(filteredSurvey.questions_json) 
            : filteredSurvey.questions_json;
          
          if (parsedQuestions.questions && Array.isArray(parsedQuestions.questions)) {
            const activeQuestions = parsedQuestions.questions.filter(question => 
              question.deleted === false || question.deleted === undefined
            );
            
            filteredSurvey.questions_json = JSON.stringify({
              ...parsedQuestions,
              questions: activeQuestions
            });
          }
        } catch (parseError) {
          console.error('Error parsing questions JSON:', parseError);
        }
      }

      res.status(200).json({
        success: true,
        data: filteredSurvey,
        message: "Survey retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting survey by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve survey",
        error: error.message,
      });
    }
  }

  /**
   * Get all surveys
   */
  static async getAllSurveys(req, res) {
    try {
      const surveyRepository = AppDataSource.getRepository(Survey);

      const surveys = await surveyRepository.find({
        order: { 
          program_id: 'ASC',
          type: 'ASC',
          survey_id: 'ASC' 
        }
      });

      // Filter out deleted questions from all surveys
      const filteredSurveys = surveys.map(survey => {
        const surveyData = { ...survey };
        if (surveyData.questions_json) {
          try {
            const parsedQuestions = typeof surveyData.questions_json === 'string' 
              ? JSON.parse(surveyData.questions_json) 
              : surveyData.questions_json;
            
            if (parsedQuestions.questions && Array.isArray(parsedQuestions.questions)) {
              const activeQuestions = parsedQuestions.questions.filter(question => 
                question.deleted === false || question.deleted === undefined
              );
              
              surveyData.questions_json = JSON.stringify({
                ...parsedQuestions,
                questions: activeQuestions
              });
            }
          } catch (parseError) {
            console.error('Error parsing questions JSON:', parseError);
          }
        }
        return surveyData;
      });

      res.status(200).json({
        success: true,
        data: filteredSurveys,
        count: filteredSurveys.length,
        message: "All surveys retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting all surveys:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve surveys",
        error: error.message,
      });
    }
  }

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

      // Filter out deleted questions from the survey
      const filteredSurveys = surveys.map(survey => {
        const surveyData = { ...survey };
        if (surveyData.questions_json) {
          try {
            const parsedQuestions = typeof surveyData.questions_json === 'string' 
              ? JSON.parse(surveyData.questions_json) 
              : surveyData.questions_json;
            
            if (parsedQuestions.questions && Array.isArray(parsedQuestions.questions)) {
              const activeQuestions = parsedQuestions.questions.filter(question => 
                question.deleted === false || question.deleted === undefined
              );
              
              surveyData.questions_json = JSON.stringify({
                ...parsedQuestions,
                questions: activeQuestions
              });
            }
          } catch (parseError) {
            console.error('Error parsing questions JSON:', parseError);
          }
        }
        return surveyData;
      });

      // Return only the first survey (enforce 1 per type/program)
      return res.status(200).json({
        success: true,
        data: [filteredSurveys[0]],
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

      // Filter out deleted questions from all surveys
      const filteredSurveys = surveys.map(survey => {
        const surveyData = { ...survey };
        if (surveyData.questions_json) {
          try {
            const parsedQuestions = typeof surveyData.questions_json === 'string' 
              ? JSON.parse(surveyData.questions_json) 
              : surveyData.questions_json;
            
            if (parsedQuestions.questions && Array.isArray(parsedQuestions.questions)) {
              const activeQuestions = parsedQuestions.questions.filter(question => 
                question.deleted === false || question.deleted === undefined
              );
              
              surveyData.questions_json = JSON.stringify({
                ...parsedQuestions,
                questions: activeQuestions
              });
            }
          } catch (parseError) {
            console.error('Error parsing questions JSON:', parseError);
          }
        }
        return surveyData;
      });

      // Group filtered surveys by type for better organization
      const surveysByType = filteredSurveys.reduce((acc, survey) => {
        if (!acc[survey.type]) {
          acc[survey.type] = [];
        }
        acc[survey.type].push(survey);
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: filteredSurveys,
        dataByType: surveysByType,
        count: filteredSurveys.length,
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
          const newQuestionsData = typeof questions === "string" ? JSON.parse(questions) : questions;
          
          console.log("🔧 Processing questions update...");
          console.log("🔧 Current questions JSON:", survey.questions_json);
          console.log("🔧 New questions data:", JSON.stringify(newQuestionsData, null, 2));
          
          // Basic validation of questions structure
          if (!newQuestionsData.questions || !Array.isArray(newQuestionsData.questions)) {
            console.log("❌ Invalid questions structure - missing questions array");
            return res.status(400).json({
              success: false,
              message: "Questions must have a 'questions' array property",
            });
          }

          // Validate each question has required fields
          for (let i = 0; i < newQuestionsData.questions.length; i++) {
            const question = newQuestionsData.questions[i];
            if (!question.id || !question.question) {
              console.log("❌ Invalid question at index", i, ":", question);
              return res.status(400).json({
                success: false,
                message: `Question at index ${i} must have 'id' and 'question' properties`,
              });
            }
          }

          // Get current questions
          let currentQuestions = [];
          try {
            if (survey.questions_json) {
              const currentData = JSON.parse(survey.questions_json);
              currentQuestions = Array.isArray(currentData) ? currentData : (currentData.questions || []);
            }
          } catch (parseError) {
            console.log("⚠️ Could not parse current questions, treating as empty array");
            currentQuestions = [];
          }

          // Process question changes using soft deletion approach
          const processedQuestions = [];
          const newQuestions = newQuestionsData.questions;
          let hasChanges = false;
          let nextQuestionId = Math.max(...currentQuestions.map(q => q.id || 0), 0) + 1;

          console.log("🔧 Processing question changes...");
          console.log("🔧 Current questions count:", currentQuestions.length);
          console.log("🔧 New questions count:", newQuestions.length);

          // First, add all existing questions to processed list
          currentQuestions.forEach(existingQuestion => {
            processedQuestions.push({
              ...existingQuestion,
              deleted: existingQuestion.deleted || false
            });
          });

          // Process each new question
          newQuestions.forEach((newQuestion, index) => {
            const existingQuestionIndex = currentQuestions.findIndex(q => q.id === newQuestion.id);
            
            if (existingQuestionIndex !== -1) {
              // Question exists, check if it has changed
              const existingQuestion = currentQuestions[existingQuestionIndex];
              
              const hasQuestionChanged = 
                existingQuestion.question !== newQuestion.question ||
                JSON.stringify(existingQuestion.options || []) !== JSON.stringify(newQuestion.options || []) ||
                existingQuestion.type !== newQuestion.type ||
                existingQuestion.required !== newQuestion.required;

              if (hasQuestionChanged) {
                console.log(`🔧 Question ${newQuestion.id} has changed, creating new version`);
                
                // Mark original question as deleted
                processedQuestions[existingQuestionIndex].deleted = true;
                
                // Add new version with new ID
                processedQuestions.push({
                  ...newQuestion,
                  id: nextQuestionId++,
                  deleted: false,
                  original_id: newQuestion.id, // Reference to original question
                  version: (existingQuestion.version || 1) + 1
                });
                
                hasChanges = true;
              } else {
                // Question unchanged, just ensure it's not marked as deleted
                processedQuestions[existingQuestionIndex].deleted = false;
              }
            } else {
              // Completely new question
              console.log(`🔧 Adding new question with ID ${newQuestion.id}`);
              
              // Check if this ID already exists in processed questions
              const existingInProcessed = processedQuestions.find(q => q.id === newQuestion.id);
              if (existingInProcessed) {
                // ID conflict, assign new ID
                newQuestion.id = nextQuestionId++;
              }
              
              processedQuestions.push({
                ...newQuestion,
                deleted: false,
                version: 1
              });
              hasChanges = true;
            }
          });

          // Mark questions that were removed from the new list as deleted
          currentQuestions.forEach(existingQuestion => {
            const stillExists = newQuestions.some(newQ => newQ.id === existingQuestion.id);
            if (!stillExists && !existingQuestion.deleted) {
              console.log(`🔧 Marking question ${existingQuestion.id} as deleted (removed from new list)`);
              const processedIndex = processedQuestions.findIndex(q => q.id === existingQuestion.id);
              if (processedIndex !== -1) {
                processedQuestions[processedIndex].deleted = true;
                hasChanges = true;
              }
            }
          });

          if (hasChanges) {
            const updatedQuestionsJson = JSON.stringify({ questions: processedQuestions });
            survey.questions_json = updatedQuestionsJson;
            fieldsUpdated.push('questions');
            questionsUpdated = true;

            console.log("✅ Questions updated using soft deletion approach");
            console.log("✅ Total questions after processing:", processedQuestions.length);
            console.log("✅ Active questions:", processedQuestions.filter(q => !q.deleted).length);
            console.log("✅ Deleted questions:", processedQuestions.filter(q => q.deleted).length);
          } else {
            console.log("ℹ️ No question changes detected");
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

      // Get final question counts for response
      let finalQuestionCounts = { active: 0, deleted: 0, total: 0 };
      if (updatedSurvey.questions_json) {
        try {
          const finalData = JSON.parse(updatedSurvey.questions_json);
          const finalQuestions = Array.isArray(finalData) ? finalData : (finalData.questions || []);
          finalQuestionCounts = {
            active: finalQuestions.filter(q => !q.deleted).length,
            deleted: finalQuestions.filter(q => q.deleted).length,
            total: finalQuestions.length
          };
        } catch (e) {
          console.log("⚠️ Could not parse final questions for counts");
        }
      }

      res.status(200).json({
        success: true,
        data: updatedSurvey,
        message: "Survey updated successfully",
        changes: {
          fields_updated: fieldsUpdated,
          questions_updated: questionsUpdated,
          soft_deletion_used: questionsUpdated ? "Modified questions marked as deleted, new versions created" : null,
          responses_preserved: questionsUpdated ? "All previous responses preserved via soft deletion" : null,
          question_counts: finalQuestionCounts
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
