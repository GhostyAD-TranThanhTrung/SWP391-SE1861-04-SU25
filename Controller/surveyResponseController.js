/**
 * Survey Response Controller using TypeORM
 * Handles operations related to survey responses
 */
const AppDataSource = require("../src/data-source");
const SurveyResponse = require("../src/entities/SurveyResponse");
const Survey = require("../src/entities/Survey");
const User = require("../src/entities/User");
const Program = require("../src/entities/Program");

// Submit a new survey response
exports.submitResponse = async (req, res) => {
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

    // Check if user already responded to this survey
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
        error: `Number of answers must match the number of questions (${questions.length} questions)`,
      });
    }

    // Additional validation for answer types
    const validationErrors = [];
    questions.forEach((question, index) => {
      const answer = answers[index];

      // Validate multiple choice answers
      if (question.type === "multiple_choice" && question.options) {
        if (!question.options.includes(answer)) {
          validationErrors.push(
            `Answer for question ${index + 1} is not a valid option`
          );
        }
      }
      // Validate rating answers
      else if (question.type === "rating") {
        const numValue = Number(answer);
        if (isNaN(numValue) || numValue < 1 || numValue > 5) {
          validationErrors.push(
            `Answer for question ${index + 1} must be a rating between 1 and 5`
          );
        }
      }
      // Ensure required answers are provided
      else if (question.required && (!answer || answer.trim() === "")) {
        validationErrors.push(`Answer for question ${index + 1} is required`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Invalid answers",
        details: validationErrors,
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

// Get all responses for a specific survey (admin/consultant only)
exports.getResponsesBySurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error:
          "Only administrators and consultants can view all survey responses",
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

    // Get all responses for this survey
    const responses = await responseRepository.find({
      where: { survey_id: parseInt(surveyId) },
      order: { submitted_at: "DESC" },
    });

    // Get survey questions
    const questions = JSON.parse(survey.questions_json);

    // Format the response with user information
    const formattedResponses = await Promise.all(
      responses.map(async (response) => {
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
          where: { user_id: response.user_id },
        });

        const answers = JSON.parse(response.answer_json);

        // Match answers with their questions
        const questionAnswers = questions.map((question, index) => ({
          questionId: index,
          questionText: question.text,
          questionType: question.type,
          answer: answers[index] || null,
        }));

        return {
          responseId: response.response_id,
          user: user
            ? {
                userId: user.user_id,
                email: user.email,
                role: user.role,
              }
            : { userId: response.user_id, email: "Unknown user" },
          questionAnswers: questionAnswers,
          submittedAt: response.submitted_at,
        };
      })
    );

    res.json({
      surveyId: parseInt(surveyId),
      totalResponses: responses.length,
      responses: formattedResponses,
    });
  } catch (error) {
    console.error("Get responses by survey error:", error);
    res.status(500).json({ error: "Error retrieving survey responses" });
  }
};

// Get a specific response by ID
exports.getResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Find response by ID
    const response = await responseRepository.findOne({
      where: { response_id: parseInt(responseId) },
    });

    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }

    // Authorization check - user can only see their own responses unless admin/consultant
    if (
      response.user_id !== userId &&
      userRole !== "Admin" &&
      userRole !== "Consultant"
    ) {
      return res.status(403).json({
        error: "You do not have permission to view this response",
      });
    }

    // Get survey questions
    const surveyRepository = AppDataSource.getRepository(Survey);
    const survey = await surveyRepository.findOne({
      where: { survey_id: response.survey_id },
    });

    if (!survey) {
      return res.status(404).json({ error: "Associated survey not found" });
    }

    const questions = JSON.parse(survey.questions_json);
    const answers = JSON.parse(response.answer_json);

    // Match questions with answers
    const questionAnswers = questions.map((question, index) => ({
      questionText: question.text,
      questionType: question.type,
      options: question.options,
      answer: answers[index] || null,
    }));

    // Get user information
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { user_id: response.user_id },
    });

    // Format the response
    const formattedResponse = {
      responseId: response.response_id,
      surveyId: response.survey_id,
      surveyType: survey.type,
      user: user
        ? {
            userId: user.user_id,
            email: user.email,
            role: user.role,
          }
        : { userId: response.user_id, email: "Unknown user" },
      questionAnswers: questionAnswers,
      submittedAt: response.submitted_at,
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("Get response by ID error:", error);
    res.status(500).json({ error: "Error retrieving survey response" });
  }
};

// Update a survey response (if allowed)
exports.updateResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "Answers array is required",
      });
    }

    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Find response by ID
    const response = await responseRepository.findOne({
      where: { response_id: parseInt(responseId) },
    });

    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }

    // Authorization check - user can only update their own responses
    if (response.user_id !== userId) {
      return res.status(403).json({
        error: "You do not have permission to update this response",
      });
    }

    // Get survey details to verify if updates are allowed
    const surveyRepository = AppDataSource.getRepository(Survey);
    const survey = await surveyRepository.findOne({
      where: { survey_id: response.survey_id },
    });

    if (!survey) {
      return res.status(404).json({ error: "Associated survey not found" });
    }

    // Check if survey allows updates to responses
    // This could be a property added to the survey schema later
    const allowUpdates =
      survey.type === "feedback" || survey.type === "editable";

    if (!allowUpdates) {
      return res.status(400).json({
        error: "This survey does not allow updates to responses",
      });
    }

    // Validate answer format against questions
    const questions = JSON.parse(survey.questions_json);

    if (answers.length !== questions.length) {
      return res.status(400).json({
        error: `Number of answers must match the number of questions (${questions.length} questions)`,
      });
    }

    // Update the response
    response.answer_json = JSON.stringify(answers);
    response.submitted_at = new Date(); // Update submission time

    const updatedResponse = await responseRepository.save(response);

    // Return success response
    res.json({
      message: "Survey response updated successfully",
      response: {
        responseId: updatedResponse.response_id,
        surveyId: updatedResponse.survey_id,
        submittedAt: updatedResponse.submitted_at,
      },
    });
  } catch (error) {
    console.error("Update survey response error:", error);
    res.status(500).json({
      error: "Failed to update survey response. Please try again later.",
      details: error.message,
    });
  }
};

// Delete a survey response
exports.deleteResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Find response by ID
    const response = await responseRepository.findOne({
      where: { response_id: parseInt(responseId) },
    });

    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }

    // Authorization check - user can only delete their own responses unless admin
    if (response.user_id !== userId && userRole !== "Admin") {
      return res.status(403).json({
        error: "You do not have permission to delete this response",
      });
    }

    // Delete the response
    await responseRepository.remove(response);

    // Return success response
    res.json({
      message: "Survey response deleted successfully",
    });
  } catch (error) {
    console.error("Delete survey response error:", error);
    res.status(500).json({
      error: "Failed to delete survey response. Please try again later.",
      details: error.message,
    });
  }
};

// Get all responses by a user
exports.getResponsesByUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    // Authorization check - user can only view their own responses unless admin/consultant
    if (
      parseInt(targetUserId) !== userId &&
      userRole !== "Admin" &&
      userRole !== "Consultant"
    ) {
      return res.status(403).json({
        error: "You do not have permission to view these responses",
      });
    }

    const responseRepository = AppDataSource.getRepository(SurveyResponse);

    // Find all responses by user
    const responses = await responseRepository.find({
      where: { user_id: parseInt(targetUserId) },
      order: { submitted_at: "DESC" },
    });

    // Format the response with survey information
    const formattedResponses = await Promise.all(
      responses.map(async (response) => {
        const surveyRepository = AppDataSource.getRepository(Survey);
        const survey = await surveyRepository.findOne({
          where: { survey_id: response.survey_id },
        });

        // Get program information
        let programTitle = "Unknown Program";
        if (survey) {
          const programRepository = AppDataSource.getRepository(Program);
          const program = await programRepository.findOne({
            where: { program_id: survey.program_id },
          });

          if (program) {
            programTitle = program.title;
          }
        }

        return {
          responseId: response.response_id,
          surveyId: response.survey_id,
          surveyType: survey ? survey.type : "Unknown",
          programTitle: programTitle,
          submittedAt: response.submitted_at,
        };
      })
    );

    res.json({
      userId: parseInt(targetUserId),
      totalResponses: responses.length,
      responses: formattedResponses,
    });
  } catch (error) {
    console.error("Get responses by user error:", error);
    res.status(500).json({ error: "Error retrieving user responses" });
  }
};

// Export survey responses to CSV format (admin/consultant only)
exports.exportResponsesToCSV = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can export responses",
      });
    }

    const surveyRepository = AppDataSource.getRepository(Survey);
    const responseRepository = AppDataSource.getRepository(SurveyResponse);
    const userRepository = AppDataSource.getRepository(User);

    // Verify survey exists
    const survey = await surveyRepository.findOne({
      where: { survey_id: parseInt(surveyId) },
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Get all responses for this survey
    const responses = await responseRepository.find({
      where: { survey_id: parseInt(surveyId) },
    });

    if (responses.length === 0) {
      return res
        .status(404)
        .json({ error: "No responses found for this survey" });
    }

    // Parse questions
    const questions = JSON.parse(survey.questions_json);

    // Create CSV header
    let csvContent = "Response ID,User ID,User Email,Submission Date";

    // Add question headers
    questions.forEach((question, index) => {
      csvContent += `,Question ${index + 1}: ${question.text.replace(
        /,/g,
        " "
      )}`;
    });
    csvContent += "\n";

    // Add response rows
    for (const response of responses) {
      const user = await userRepository.findOne({
        where: { user_id: response.user_id },
      });

      const userEmail = user ? user.email : "Unknown";
      const answers = JSON.parse(response.answer_json);

      // Format date
      const submissionDate = new Date(response.submitted_at)
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      // Start row with metadata
      let row = `${response.response_id},${response.user_id},${userEmail},${submissionDate}`;

      // Add answer data
      questions.forEach((_, index) => {
        const answer = answers[index] || "";
        // Escape commas in answers
        row += `,${String(answer).replace(/,/g, ";")}`;
      });

      csvContent += row + "\n";
    }

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=survey_${surveyId}_responses.csv`
    );

    res.send(csvContent);
  } catch (error) {
    console.error("Export responses to CSV error:", error);
    res.status(500).json({ error: "Error exporting survey responses" });
  }
};

// Get response statistics for a survey
exports.getResponseStatistics = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error:
          "Only administrators and consultants can view response statistics",
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

    // Get all responses for this survey
    const responses = await responseRepository.find({
      where: { survey_id: parseInt(surveyId) },
    });

    // Parse questions
    const questions = JSON.parse(survey.questions_json);

    // Calculate response rate if this is a program survey
    let responseRate = null;
    if (survey.program_id) {
      const programRepository = AppDataSource.getRepository(Program);
      const enrollRepository = AppDataSource.getRepository(Enroll);

      // Count program enrollments
      const enrollmentCount = await enrollRepository.count({
        where: { program_id: survey.program_id },
      });

      if (enrollmentCount > 0) {
        responseRate = (responses.length / enrollmentCount) * 100;
      }
    }

    // Calculate statistics for each question
    const questionStats = questions.map((question, questionIndex) => {
      // Extract all answers for this question
      const questionAnswers = responses.map((response) => {
        const answers = JSON.parse(response.answer_json);
        return answers[questionIndex];
      });

      // Base stats object
      const stats = {
        questionText: question.text,
        questionType: question.type,
        answerCount: questionAnswers.filter(
          (a) => a !== null && a !== undefined && a !== ""
        ).length,
      };

      // Add type-specific statistics
      if (question.type === "multiple_choice" && question.options) {
        // Count options frequency
        const optionCounts = {};
        question.options.forEach((option) => {
          optionCounts[option] = 0;
        });

        questionAnswers.forEach((answer) => {
          if (answer && optionCounts[answer] !== undefined) {
            optionCounts[answer]++;
          }
        });

        stats.optionCounts = optionCounts;

        // Calculate percentages
        stats.optionPercentages = {};
        const totalAnswered = questionAnswers.filter(
          (a) => a !== null && a !== undefined && a !== ""
        ).length;

        Object.keys(optionCounts).forEach((option) => {
          stats.optionPercentages[option] =
            totalAnswered > 0
              ? ((optionCounts[option] / totalAnswered) * 100).toFixed(1)
              : "0.0";
        });
      } else if (question.type === "rating") {
        // Calculate min, max, average for ratings
        const numericAnswers = questionAnswers
          .filter((a) => !isNaN(Number(a)))
          .map((a) => Number(a));

        if (numericAnswers.length > 0) {
          stats.min = Math.min(...numericAnswers);
          stats.max = Math.max(...numericAnswers);
          stats.average = (
            numericAnswers.reduce((sum, val) => sum + val, 0) /
            numericAnswers.length
          ).toFixed(2);

          // Create distribution histogram
          stats.distribution = {};
          numericAnswers.forEach((rating) => {
            if (!stats.distribution[rating]) {
              stats.distribution[rating] = 0;
            }
            stats.distribution[rating]++;
          });
        } else {
          stats.min = null;
          stats.max = null;
          stats.average = null;
          stats.distribution = {};
        }
      }

      return stats;
    });

    // Get response timing information
    const submissionDates = responses.map((r) =>
      new Date(r.submitted_at).getTime()
    );
    const firstResponseDate =
      submissionDates.length > 0
        ? new Date(Math.min(...submissionDates))
        : null;
    const lastResponseDate =
      submissionDates.length > 0
        ? new Date(Math.max(...submissionDates))
        : null;

    // Calculate average time between responses if we have multiple responses
    let avgTimeBetweenResponses = null;
    if (submissionDates.length > 1) {
      // Sort dates chronologically
      submissionDates.sort((a, b) => a - b);

      // Calculate differences between consecutive submissions
      let totalDiff = 0;
      for (let i = 1; i < submissionDates.length; i++) {
        totalDiff += submissionDates[i] - submissionDates[i - 1];
      }

      // Average difference in milliseconds, convert to hours
      avgTimeBetweenResponses =
        totalDiff / (submissionDates.length - 1) / (1000 * 60 * 60);
    }

    // Format response statistics
    const statistics = {
      surveyId: parseInt(surveyId),
      totalResponses: responses.length,
      responseRate:
        responseRate !== null ? `${responseRate.toFixed(1)}%` : "Unknown",
      firstResponseDate,
      lastResponseDate,
      avgTimeBetweenResponses:
        avgTimeBetweenResponses !== null
          ? `${avgTimeBetweenResponses.toFixed(2)} hours`
          : null,
      questionStatistics: questionStats,
    };

    res.json(statistics);
  } catch (error) {
    console.error("Get response statistics error:", error);
    res.status(500).json({ error: "Error retrieving response statistics" });
  }
};
