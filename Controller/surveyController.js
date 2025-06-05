/**
 * Survey Controller using TypeORM
 * Handles operations related to surveys and survey responses
 */
const AppDataSource = require("../src/data-source");
const Survey = require("../src/entities/Survey");
const SurveyResponse = require("../src/entities/SurveyResponse");
const Program = require("../src/entities/Program");
const User = require("../src/entities/User");

// Get all surveys
exports.getAllSurveys = async (req, res) => {
  try {
    // Admin/Consultant access check
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can view all surveys",
      });
    }

    const surveyRepository = AppDataSource.getRepository(Survey);
    const surveys = await surveyRepository.find();

    // Format the response with additional data
    const formattedSurveys = await Promise.all(
      surveys.map(async (survey) => {
        // Get program information since relations are commented out
        const programRepository = AppDataSource.getRepository(Program);

        const program = await programRepository.findOne({
          where: { program_id: survey.program_id },
        });

        // Count responses for this survey
        const responseRepository = AppDataSource.getRepository(SurveyResponse);
        const responseCount = await responseRepository.count({
          where: { survey_id: survey.survey_id },
        });

        return {
          surveyId: survey.survey_id,
          programId: survey.program_id,
          programTitle: program ? program.title : "Program not found",
          type: survey.type,
          questionCount: survey.questions_json
            ? JSON.parse(survey.questions_json).length
            : 0,
          responseCount: responseCount,
        };
      })
    );

    res.json(formattedSurveys);
  } catch (error) {
    console.error("Get all surveys error:", error);
    res.status(500).json({ error: "Error retrieving surveys" });
  }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const surveyRepository = AppDataSource.getRepository(Survey);
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Get program information
    const programRepository = AppDataSource.getRepository(Program);
    const program = await programRepository.findOne({
      where: { program_id: survey.program_id },
    });

    // Parse questions JSON
    const questions = survey.questions_json
      ? JSON.parse(survey.questions_json)
      : [];

    // Format response
    const formattedSurvey = {
      surveyId: survey.survey_id,
      programId: survey.program_id,
      programTitle: program ? program.title : "Program not found",
      type: survey.type,
      questions: questions,
    };

    res.json(formattedSurvey);
  } catch (error) {
    console.error("Get survey by ID error:", error);
    res.status(500).json({ error: "Error retrieving survey" });
  }
};

// Create a new survey
exports.createSurvey = async (req, res) => {
  try {
    const { programId, type, questions } = req.body;

    // Validate required fields
    if (!programId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Program ID and questions array are required",
      });
    }

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can create surveys",
      });
    }

    // Verify program exists
    const programRepository = AppDataSource.getRepository(Program);
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Validate questions format
    for (const question of questions) {
      if (!question.text) {
        return res.status(400).json({
          error: "Each question must have a text property",
        });
      }

      // If it's multiple choice, validate options
      if (
        question.type === "multiple_choice" &&
        (!question.options ||
          !Array.isArray(question.options) ||
          question.options.length === 0)
      ) {
        return res.status(400).json({
          error: "Multiple choice questions must have options array",
        });
      }
    }

    const surveyRepository = AppDataSource.getRepository(Survey);

    // Create new survey
    const newSurvey = surveyRepository.create({
      program_id: parseInt(programId),
      type: type || "assessment", // Default to assessment if not provided
      questions_json: JSON.stringify(questions),
    });

    const savedSurvey = await surveyRepository.save(newSurvey);

    // Return success response
    res.status(201).json({
      message: "Survey created successfully",
      survey: {
        surveyId: savedSurvey.survey_id,
        programId: savedSurvey.program_id,
        type: savedSurvey.type,
        questionCount: questions.length,
      },
    });
  } catch (error) {
    console.error("Create survey error:", error);
    res.status(500).json({
      error: "Failed to create survey. Please try again later.",
      details: error.message,
    });
  }
};

// Update an existing survey
exports.updateSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { type, questions } = req.body;

    // Validate input
    if (!questions && !type) {
      return res.status(400).json({
        error: "At least one field to update is required",
      });
    }

    if (questions && !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Questions must be an array",
      });
    }

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can update surveys",
      });
    }

    const surveyRepository = AppDataSource.getRepository(Survey);

    // Find survey by ID
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Check if survey has responses before allowing updates
    if (questions) {
      const responseRepository = AppDataSource.getRepository(SurveyResponse);
      const responseCount = await responseRepository.count({
        where: { survey_id: parseInt(surveyId) },
      });

      if (responseCount > 0) {
        return res.status(400).json({
          error:
            "Cannot update questions for a survey that already has responses",
        });
      }

      // Validate questions format if updating
      for (const question of questions) {
        if (!question.text) {
          return res.status(400).json({
            error: "Each question must have a text property",
          });
        }

        // If it's multiple choice, validate options
        if (
          question.type === "multiple_choice" &&
          (!question.options ||
            !Array.isArray(question.options) ||
            question.options.length === 0)
        ) {
          return res.status(400).json({
            error: "Multiple choice questions must have options array",
          });
        }
      }

      survey.questions_json = JSON.stringify(questions);
    }

    // Update type if provided
    if (type) {
      survey.type = type;
    }

    const updatedSurvey = await surveyRepository.save(survey);

    // Format response
    const parsedQuestions = JSON.parse(updatedSurvey.questions_json);

    res.json({
      message: "Survey updated successfully",
      survey: {
        surveyId: updatedSurvey.survey_id,
        programId: updatedSurvey.program_id,
        type: updatedSurvey.type,
        questionCount: parsedQuestions.length,
      },
    });
  } catch (error) {
    console.error("Update survey error:", error);
    res.status(500).json({
      error: "Failed to update survey. Please try again later.",
      details: error.message,
    });
  }
};

// Delete a survey
exports.deleteSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can delete surveys",
      });
    }

    const surveyRepository = AppDataSource.getRepository(Survey);

    // Find survey by ID
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Check if survey has responses
    const responseRepository = AppDataSource.getRepository(SurveyResponse);
    const responseCount = await responseRepository.count({
      where: { survey_id: parseInt(surveyId) },
    });

    if (responseCount > 0) {
      // Delete all responses first
      await responseRepository.delete({ survey_id: parseInt(surveyId) });
    }

    // Delete the survey
    await surveyRepository.remove(survey);

    // Return success response
    res.json({
      message: "Survey and all related responses deleted successfully",
    });
  } catch (error) {
    console.error("Delete survey error:", error);
    res.status(500).json({
      error: "Failed to delete survey. Please try again later.",
      details: error.message,
    });
  }
};

// Get surveys for a program
exports.getSurveysByProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const surveyRepository = AppDataSource.getRepository(Survey);
    const surveys = await surveyRepository.find({
      where: { program_id: parseInt(programId) },
    });

    // Format the response
    const formattedSurveys = surveys.map((survey) => {
      const questions = survey.questions_json
        ? JSON.parse(survey.questions_json)
        : [];

      return {
        surveyId: survey.survey_id,
        type: survey.type,
        questionCount: questions.length,
      };
    });

    res.json(formattedSurveys);
  } catch (error) {
    console.error("Get surveys by program error:", error);
    res.status(500).json({ error: "Error retrieving program surveys" });
  }
};

// Submit a survey response
exports.submitSurveyResponse = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "Answers array is required",
      });
    }

    const surveyRepository = AppDataSource.getRepository(Survey);
    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Verify survey exists
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Check if user already responded
    const existingResponse = await responseRepository.findOne({
      where: {
        survey_id: parseInt(surveyId),
        user_id: userId,
      },
    });

    if (existingResponse) {
      return res
        .status(409)
        .json({
          error: "You have already submitted a response to this survey",
        });
    }

    // Validate answer format against questions
    const questions = JSON.parse(survey.questions_json);

    if (answers.length !== questions.length) {
      return res.status(400).json({
        error: "Number of answers must match the number of questions",
      });
    }

    // Create new response
    const newResponse = responseRepository.create({
      survey_id: parseInt(surveyId),
      user_id: userId,
      answer_json: JSON.stringify(answers),
      submitted_at: new Date(),
    });

    const savedResponse = await responseRepository.save(newResponse);

    // Return success response
    res.status(201).json({
      message: "Survey response submitted successfully",
      response: {
        responseId: savedResponse.response_id,
        surveyId: savedResponse.survey_id,
        submittedAt: savedResponse.submitted_at,
      },
    });
  } catch (error) {
    console.error("Submit survey response error:", error);
    res.status(500).json({
      error: "Failed to submit survey response. Please try again later.",
      details: error.message,
    });
  }
};

// Get responses for a survey (admin/consultant only)
exports.getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can view survey responses",
      });
    }

    const responseRepository = AppDataSource.getRepository(SurveyResponse);
    const responses = await responseRepository.find({
      where: { survey_id: parseInt(surveyId) },
    });

    // Format the response with user information
    const formattedResponses = await Promise.all(
      responses.map(async (response) => {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { user_id: response.user_id },
        });

        return {
          responseId: response.response_id,
          userId: response.user_id,
          userEmail: user ? user.email : "User not found",
          answers: JSON.parse(response.answer_json),
          submittedAt: response.submitted_at,
        };
      })
    );

    res.json(formattedResponses);
  } catch (error) {
    console.error("Get survey responses error:", error);
    res.status(500).json({ error: "Error retrieving survey responses" });
  }
};

// Get a user's own survey response
exports.getUserSurveyResponse = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.userId; // From JWT token

    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Find user's response
    const response = await responseRepository.findOne({
      where: {
        survey_id: parseInt(surveyId),
        user_id: userId,
      },
    });

    if (!response) {
      return res
        .status(404)
        .json({ error: "You have not submitted a response to this survey" });
    }

    // Get survey questions
    const surveyRepository = AppDataSource.getRepository(Survey);
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    // Format response with questions and answers
    const questions = survey ? JSON.parse(survey.questions_json) : [];
    const answers = JSON.parse(response.answer_json);

    // Combine questions with answers
    const questionAnswers = questions.map((question, index) => ({
      question: question.text,
      questionType: question.type,
      answer: answers[index],
      options: question.options,
    }));

    res.json({
      responseId: response.response_id,
      surveyId: parseInt(surveyId),
      questionAnswers: questionAnswers,
      submittedAt: response.submitted_at,
    });
  } catch (error) {
    console.error("Get user survey response error:", error);
    res.status(500).json({ error: "Error retrieving your survey response" });
  }
};

// Get survey response analytics
exports.getSurveyAnalytics = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can view survey analytics",
      });
    }

    const surveyRepository = AppDataSource.getRepository(Survey);
    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Get survey
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Get responses
    const responses = await responseRepository.find({
      where: { survey_id: parseInt(surveyId) },
    });

    // Parse questions and get total respondents
    const questions = JSON.parse(survey.questions_json);
    const totalRespondents = responses.length;

    // Analyze each question
    const analytics = questions.map((question, questionIndex) => {
      // For each question, collect all answers
      const allAnswers = responses.map((response) => {
        const answers = JSON.parse(response.answer_json);
        return answers[questionIndex];
      });

      // Different analysis based on question type
      let analysis = {
        questionText: question.text,
        questionType: question.type,
        totalResponses: allAnswers.length,
      };

      // For multiple choice, count occurrences of each option
      if (question.type === "multiple_choice" && question.options) {
        const optionCounts = {};
        question.options.forEach((option) => {
          optionCounts[option] = 0;
        });

        allAnswers.forEach((answer) => {
          if (answer && optionCounts[answer] !== undefined) {
            optionCounts[answer]++;
          }
        });

        analysis.optionCounts = optionCounts;

        // Calculate percentages
        analysis.optionPercentages = {};
        Object.keys(optionCounts).forEach((option) => {
          analysis.optionPercentages[option] =
            totalRespondents > 0
              ? (optionCounts[option] / totalRespondents) * 100
              : 0;
        });
      }
      // For text responses, just include the array of responses
      else if (question.type === "text" || question.type === "long_text") {
        analysis.textResponses = allAnswers.filter(
          (answer) => answer !== null && answer !== undefined
        );
      }
      // For rating questions, calculate average and distribution
      else if (question.type === "rating") {
        const numericAnswers = allAnswers
          .filter((answer) => !isNaN(Number(answer)))
          .map((answer) => Number(answer));

        analysis.average =
          numericAnswers.length > 0
            ? numericAnswers.reduce((sum, val) => sum + val, 0) /
              numericAnswers.length
            : 0;

        // Create distribution of ratings
        analysis.distribution = {};
        numericAnswers.forEach((rating) => {
          if (!analysis.distribution[rating]) {
            analysis.distribution[rating] = 0;
          }
          analysis.distribution[rating]++;
        });
      }

      return analysis;
    });

    res.json({
      surveyId: parseInt(surveyId),
      programId: survey.program_id,
      surveyType: survey.type,
      totalRespondents,
      questionAnalytics: analytics,
    });
  } catch (error) {
    console.error("Get survey analytics error:", error);
    res.status(500).json({ error: "Error retrieving survey analytics" });
  }
};
