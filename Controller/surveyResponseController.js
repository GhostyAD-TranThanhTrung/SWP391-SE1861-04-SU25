/**
 * Survey Response Controller using TypeORM
 * CRUD operations for Survey_Responses table
 */
const AppDataSource = require('../src/data-source');
const SurveyResponse = require('../src/entities/SurveyResponse');
const Survey = require('../src/entities/Survey');
const User = require('../src/entities/User');

class SurveyResponseController {
    /**
     * Get all survey responses
     */
    static async getAllSurveyResponses(req, res) {
        try {
            const responseRepository = AppDataSource.getRepository(SurveyResponse);
            const responses = await responseRepository.find({
                order: {
                    submitted_at: 'DESC'
                }
            });

            res.status(200).json({
                success: true,
                data: responses,
                message: 'Survey responses retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting survey responses:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve survey responses',
                error: error.message
            });
        }
    }

    /**
     * Get survey response by ID
     */
    static async getSurveyResponseById(req, res) {
        try {
            const { id } = req.params;
            const responseRepository = AppDataSource.getRepository(SurveyResponse);
            const response = await responseRepository.findOne({
                where: { response_id: parseInt(id) }
            });

            if (!response) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey response not found'
                });
            }

            res.status(200).json({
                success: true,
                data: response,
                message: 'Survey response retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve survey response',
                error: error.message
            });
        }
    }

    /**
     * Get parsed survey response by ID
     */
    static async getParsedSurveyResponseById(req, res) {
        try {
            const { id } = req.params;
            const responseRepository = AppDataSource.getRepository(SurveyResponse);
            const response = await responseRepository.findOne({
                where: { response_id: parseInt(id) }
            });

            if (!response) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey response not found'
                });
            }

            let parsedAnswer;
            try {
                parsedAnswer = response.answer_json ? JSON.parse(response.answer_json) : null;
            } catch (jsonError) {
                return res.status(422).json({
                    success: false,
                    message: 'Invalid JSON format in response answers',
                    error: jsonError.message
                });
            }

            const parsedResponse = {
                response_id: response.response_id,
                survey_id: response.survey_id,
                user_id: response.user_id,
                answers: parsedAnswer,
                submitted_at: response.submitted_at
            };

            res.status(200).json({
                success: true,
                data: parsedResponse,
                message: 'Survey response retrieved and parsed successfully'
            });
        } catch (error) {
            console.error('Error getting parsed survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve and parse survey response',
                error: error.message
            });
        }
    }

    /**
     * Get survey responses by survey ID
     */
    static async getResponsesBySurveyId(req, res) {
        try {
            const { surveyId } = req.params;
            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            const responses = await responseRepository.find({
                where: { survey_id: parseInt(surveyId) },
                order: {
                    submitted_at: 'DESC'
                }
            });

            res.status(200).json({
                success: true,
                data: responses,
                count: responses.length,
                message: `Responses for survey ID ${surveyId} retrieved successfully`
            });
        } catch (error) {
            console.error('Error getting responses by survey ID:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve responses by survey ID',
                error: error.message
            });
        }
    }

    /**
     * Get responses by user ID
     */
    static async getResponsesByUserId(req, res) {
        try {
            const { userId } = req.params;
            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            const responses = await responseRepository.find({
                where: { user_id: parseInt(userId) },
                order: {
                    submitted_at: 'DESC'
                }
            });

            res.status(200).json({
                success: true,
                data: responses,
                count: responses.length,
                message: `Responses by user ID ${userId} retrieved successfully`
            });
        } catch (error) {
            console.error('Error getting responses by user ID:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve responses by user ID',
                error: error.message
            });
        }
    }

    /**
     * Get responses with user and survey information
     */
    static async getResponseWithRelations(req, res) {
        try {
            const { id } = req.params;
            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            const response = await responseRepository.findOne({
                where: { response_id: parseInt(id) },
                relations: {
                    survey: true,
                    user: true
                }
            });

            if (!response) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey response not found'
                });
            }

            res.status(200).json({
                success: true,
                data: response,
                message: 'Survey response with relations retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting response with relations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve response with relations',
                error: error.message
            });
        }
    }

    /**
     * Create new survey response
     */
    static async createSurveyResponse(req, res) {
        try {
            const { survey_id, user_id, answers } = req.body;

            // Validate required fields
            if (!survey_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Survey ID is required'
                });
            }

            // Check if survey exists
            const surveyRepository = AppDataSource.getRepository(Survey);
            const survey = await surveyRepository.findOne({
                where: { survey_id: parseInt(survey_id) }
            });

            if (!survey) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey not found'
                });
            }

            // Check if user exists if user_id is provided
            if (user_id) {
                const userRepository = AppDataSource.getRepository(User);
                const user = await userRepository.findOne({
                    where: { user_id: parseInt(user_id) }
                });

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            }

            // Validate answers format if provided
            let answer_json = null;
            if (answers) {
                try {
                    answer_json = typeof answers === 'string'
                        ? answers
                        : JSON.stringify(answers);

                    // Validate JSON format
                    JSON.parse(answer_json);
                } catch (jsonError) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid JSON format for answers',
                        error: jsonError.message
                    });
                }
            }

            // Check if user has already responded to this survey
            if (user_id) {
                const responseRepository = AppDataSource.getRepository(SurveyResponse);
                const existingResponse = await responseRepository.findOne({
                    where: {
                        survey_id: parseInt(survey_id),
                        user_id: parseInt(user_id)
                    }
                });

                if (existingResponse) {
                    return res.status(409).json({
                        success: false,
                        message: 'User has already submitted a response for this survey',
                        existingResponseId: existingResponse.response_id
                    });
                }
            }

            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            // Create new survey response
            const newResponse = responseRepository.create({
                survey_id: parseInt(survey_id),
                user_id: user_id ? parseInt(user_id) : null,
                answer_json,
                submitted_at: new Date()
            });

            const savedResponse = await responseRepository.save(newResponse);

            res.status(201).json({
                success: true,
                data: savedResponse,
                message: 'Survey response submitted successfully'
            });
        } catch (error) {
            console.error('Error creating survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit survey response',
                error: error.message
            });
        }
    }

    /**
     * Update survey response
     */
    static async updateSurveyResponse(req, res) {
        try {
            const { id } = req.params;
            const { answers } = req.body;

            if (!answers) {
                return res.status(400).json({
                    success: false,
                    message: 'Answers are required'
                });
            }

            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            // Check if response exists
            const response = await responseRepository.findOne({
                where: { response_id: parseInt(id) }
            });

            if (!response) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey response not found'
                });
            }

            // Validate answers format
            try {
                response.answer_json = typeof answers === 'string'
                    ? answers
                    : JSON.stringify(answers);

                // Validate JSON format
                JSON.parse(response.answer_json);
            } catch (jsonError) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON format for answers',
                    error: jsonError.message
                });
            }

            // Update submission time
            response.submitted_at = new Date();

            const updatedResponse = await responseRepository.save(response);

            res.status(200).json({
                success: true,
                data: updatedResponse,
                message: 'Survey response updated successfully'
            });
        } catch (error) {
            console.error('Error updating survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update survey response',
                error: error.message
            });
        }
    }

    /**
     * Delete survey response by ID
     */
    static async deleteSurveyResponse(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid response ID provided'
                });
            }

            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            // Check if response exists before deleting
            const response = await responseRepository.findOne({
                where: { response_id: parseInt(id) }
            });

            if (!response) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey response not found'
                });
            }

            // Delete the response
            await responseRepository.remove(response);

            res.status(200).json({
                success: true,
                message: `Survey response with ID ${id} deleted successfully`
            });
        } catch (error) {
            console.error('Error deleting survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete survey response',
                error: error.message
            });
        }
    }

    /**
     * Get responses by date range
     */
    static async getResponsesByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            const responses = await responseRepository.createQueryBuilder("response")
                .where("response.submitted_at >= :startDate", { startDate })
                .andWhere("response.submitted_at <= :endDate", { endDate })
                .orderBy("response.submitted_at", "DESC")
                .getMany();

            res.status(200).json({
                success: true,
                data: responses,
                count: responses.length,
                message: 'Survey responses within date range retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting responses by date range:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve responses by date range',
                error: error.message
            });
        }
    }

    /**
     * Check if user has responded to a survey
     */
    static async checkUserResponse(req, res) {
        try {
            const { surveyId, userId } = req.params;

            if (!surveyId || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Survey ID and User ID are required'
                });
            }

            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            const response = await responseRepository.findOne({
                where: {
                    survey_id: parseInt(surveyId),
                    user_id: parseInt(userId)
                }
            });

            res.status(200).json({
                success: true,
                hasResponded: !!response,
                responseId: response ? response.response_id : null,
                message: response
                    ? 'User has already responded to this survey'
                    : 'User has not responded to this survey'
            });
        } catch (error) {
            console.error('Error checking user response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check user response',
                error: error.message
            });
        }
    }

    /**
     * Generate survey response analytics
     */
    static async getSurveyAnalytics(req, res) {
        try {
            const { surveyId } = req.params;

            // Check if survey exists
            const surveyRepository = AppDataSource.getRepository(Survey);
            const survey = await surveyRepository.findOne({
                where: { survey_id: parseInt(surveyId) }
            });

            if (!survey) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey not found'
                });
            }

            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            // Get all responses for this survey
            const responses = await responseRepository.find({
                where: { survey_id: parseInt(surveyId) }
            });

            // Parse survey questions
            let questions = [];
            try {
                if (survey.questions_json) {
                    const questionsData = JSON.parse(survey.questions_json);
                    // Filter out deleted questions, similar to surveyController.js
                    if (questionsData.questions && Array.isArray(questionsData.questions)) {
                        questions = questionsData.questions.filter(question => 
                            question.deleted === false || question.deleted === undefined
                        );
                    }
                }
            } catch (error) {
                return res.status(422).json({
                    success: false,
                    message: 'Invalid JSON format in survey questions',
                    error: error.message
                });
            }

            // Process responses
            const analytics = {
                surveyId: parseInt(surveyId),
                totalResponses: responses.length,
                questionAnalytics: {}
            };

            // Process each response
            responses.forEach(response => {
                try {
                    if (!response.answer_json) return;

                    const answers = JSON.parse(response.answer_json);

                    // Process each answer
                    Object.keys(answers).forEach(questionId => {
                        const answer = answers[questionId];

                        // Initialize question analytics if not exist
                        if (!analytics.questionAnalytics[questionId]) {
                            analytics.questionAnalytics[questionId] = {
                                responses: 0,
                                values: {}
                            };
                        }

                        analytics.questionAnalytics[questionId].responses++;

                        // Handle different answer types
                        if (Array.isArray(answer)) {
                            // Multiple choice
                            answer.forEach(value => {
                                if (!analytics.questionAnalytics[questionId].values[value]) {
                                    analytics.questionAnalytics[questionId].values[value] = 0;
                                }
                                analytics.questionAnalytics[questionId].values[value]++;
                            });
                        } else if (typeof answer === 'string' || typeof answer === 'number') {
                            // Single choice or text
                            if (!analytics.questionAnalytics[questionId].values[answer]) {
                                analytics.questionAnalytics[questionId].values[answer] = 0;
                            }
                            analytics.questionAnalytics[questionId].values[answer]++;
                        }
                    });
                } catch (error) {
                    console.error('Error processing response:', error);
                }
            });

            res.status(200).json({
                success: true,
                data: analytics,
                message: 'Survey analytics generated successfully'
            });
        } catch (error) {
            console.error('Error generating survey analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate survey analytics',
                error: error.message
            });
        }
    }

    /**
     * Submit survey response in key-value format (id, question, answer)
     * Expected request body format:
     * {
     *   "survey_id": 1,
     *   "responses": [
     *     {"id": 1, "question": "How confident are you?", "answer": "Very confident"},
     *     {"id": 2, "question": "What is your age?", "answer": "25"}
     *   ]
     * }
     */
    static async submitSurveyResponseKeyValue(req, res) {
        try {
            const userId = req.user.userId; // Get user_id from token middleware
            const { survey_id, responses } = req.body;

            // Validate required fields
            if (!survey_id || !responses || !Array.isArray(responses)) {
                return res.status(400).json({
                    success: false,
                    message: 'Survey ID and responses array are required'
                });
            }

            // Validate responses format
            for (const response of responses) {
                if (!response.hasOwnProperty('id') || !response.hasOwnProperty('question') || !response.hasOwnProperty('answer')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each response must have id, question, and answer fields'
                    });
                }
            }

            // Check if survey exists
            const surveyRepository = AppDataSource.getRepository(Survey);
            const survey = await surveyRepository.findOne({
                where: { survey_id: parseInt(survey_id) }
            });

            if (!survey) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey not found'
                });
            }

            // Check if user already has a response for this survey
            const responseRepository = AppDataSource.getRepository(SurveyResponse);
            const existingResponse = await responseRepository.findOne({
                where: {
                    survey_id: parseInt(survey_id),
                    user_id: parseInt(userId)
                }
            });

            if (existingResponse) {
                return res.status(409).json({
                    success: false,
                    message: 'User has already responded to this survey. Use update endpoint to modify existing response.'
                });
            }

            // Create response object in key-value format
            const responseData = {
                responses: responses.map(item => ({
                    id: item.id,
                    question: item.question,
                    answer: item.answer
                })),
                submitted_at: new Date().toISOString(),
                total_questions: responses.length
            };

            // Create new survey response
            const newResponse = responseRepository.create({
                survey_id: parseInt(survey_id),
                user_id: parseInt(userId),
                answer_json: JSON.stringify(responseData),
                submitted_at: new Date()
            });

            const savedResponse = await responseRepository.save(newResponse);

            res.status(201).json({
                success: true,
                data: {
                    response_id: savedResponse.response_id,
                    survey_id: savedResponse.survey_id,
                    user_id: savedResponse.user_id,
                    responses: responseData.responses,
                    submitted_at: savedResponse.submitted_at,
                    total_questions: responseData.total_questions
                },
                message: 'Survey response submitted successfully'
            });

        } catch (error) {
            console.error('Error submitting survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit survey response',
                error: error.message
            });
        }
    }

    /**
     * Update existing survey response in key-value format
     * Expected request body format same as submitSurveyResponseKeyValue
     */
    static async updateSurveyResponseKeyValue(req, res) {
        try {
            const userId = req.user.userId;
            const { survey_id, responses } = req.body;

            // Validate required fields
            if (!survey_id || !responses || !Array.isArray(responses)) {
                return res.status(400).json({
                    success: false,
                    message: 'Survey ID and responses array are required'
                });
            }

            // Validate responses format
            for (const response of responses) {
                if (!response.hasOwnProperty('id') || !response.hasOwnProperty('question') || !response.hasOwnProperty('answer')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each response must have id, question, and answer fields'
                    });
                }
            }

            // Find existing response
            const responseRepository = AppDataSource.getRepository(SurveyResponse);
            const existingResponse = await responseRepository.findOne({
                where: {
                    survey_id: parseInt(survey_id),
                    user_id: parseInt(userId)
                }
            });

            if (!existingResponse) {
                return res.status(404).json({
                    success: false,
                    message: 'No existing response found for this user and survey. Use submit endpoint to create new response.'
                });
            }

            // Create updated response object
            const responseData = {
                responses: responses.map(item => ({
                    id: item.id,
                    question: item.question,
                    answer: item.answer
                })),
                submitted_at: existingResponse.submitted_at, // Keep original submission time
                updated_at: new Date().toISOString(),
                total_questions: responses.length
            };

            // Update existing response
            existingResponse.answer_json = JSON.stringify(responseData);
            const updatedResponse = await responseRepository.save(existingResponse);

            res.status(200).json({
                success: true,
                data: {
                    response_id: updatedResponse.response_id,
                    survey_id: updatedResponse.survey_id,
                    user_id: updatedResponse.user_id,
                    responses: responseData.responses,
                    submitted_at: updatedResponse.submitted_at,
                    updated_at: responseData.updated_at,
                    total_questions: responseData.total_questions
                },
                message: 'Survey response updated successfully'
            });

        } catch (error) {
            console.error('Error updating survey response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update survey response',
                error: error.message
            });
        }
    }

    /**
     * Check if current user has responded to a specific survey
     * Uses survey_id from params and user_id from token
     */
    static async checkMyResponse(req, res) {
        try {
            const userId = req.user.userId; // Get user_id from token middleware
            const { surveyId } = req.params;

            if (!surveyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Survey ID is required'
                });
            }

            // Check if survey exists first
            const surveyRepository = AppDataSource.getRepository(Survey);
            const survey = await surveyRepository.findOne({
                where: { survey_id: parseInt(surveyId) }
            });

            if (!survey) {
                return res.status(404).json({
                    success: false,
                    message: 'Survey not found'
                });
            }

            // Check if user has responded to this survey
            const responseRepository = AppDataSource.getRepository(SurveyResponse);
            const response = await responseRepository.findOne({
                where: {
                    survey_id: parseInt(surveyId),
                    user_id: parseInt(userId)
                }
            });

            res.status(200).json({
                success: true,
                hasResponded: !!response,
                responseId: response ? response.response_id : null,
                surveyId: parseInt(surveyId),
                userId: parseInt(userId),
                submittedAt: response ? response.submitted_at : null,
                message: response
                    ? 'You have already responded to this survey'
                    : 'You have not responded to this survey yet'
            });

        } catch (error) {
            console.error('Error checking user response:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check user response',
                error: error.message
            });
        }
    }

    /**
     * Get user's survey responses in key-value format
     */
    static async getMySurveyResponsesKeyValue(req, res) {
        try {
            const userId = req.user.userId;
            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            const responses = await responseRepository.find({
                where: { user_id: parseInt(userId) },
                relations: ['survey'],
                order: { submitted_at: 'DESC' }
            });

            const formattedResponses = responses.map(response => {
                let parsedAnswer;
                try {
                    parsedAnswer = response.answer_json ? JSON.parse(response.answer_json) : null;
                } catch (jsonError) {
                    parsedAnswer = { error: 'Invalid JSON format', raw: response.answer_json };
                }

                return {
                    response_id: response.response_id,
                    survey_id: response.survey_id,
                    survey_type: response.survey ? response.survey.type : null,
                    survey_program_id: response.survey ? response.survey.program_id : null,
                    responses: parsedAnswer ? parsedAnswer.responses : null,
                    submitted_at: response.submitted_at,
                    updated_at: parsedAnswer ? parsedAnswer.updated_at : null,
                    total_questions: parsedAnswer ? parsedAnswer.total_questions : 0
                };
            });

            res.status(200).json({
                success: true,
                data: formattedResponses,
                count: formattedResponses.length,
                message: 'User survey responses retrieved successfully'
            });

        } catch (error) {
            console.error('Error getting user survey responses:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user survey responses',
                error: error.message
            });
        }
    }

    /**
     * Get comprehensive survey response statistics
     * Can filter by survey ID or program ID
     * Returns detailed statistics showing how many people gave each answer for each question
     * Supports both old format (answers array) and new format (responses array)
     * 
     * Query parameters:
     * - surveyId: Get statistics for specific survey
     * - programId: Get statistics for all surveys in a program
     * - type: Filter by survey type (pre-assessment, post-assessment, etc.)
     */
    static async getSurveyResponseStatistics(req, res) {
        try {
            const { programId, type } = req.query;

            if (!programId) {
                return res.status(400).json({
                    success: false,
                    message: 'programId parameter is required'
                });
            }

            const surveyRepository = AppDataSource.getRepository(Survey);
            const responseRepository = AppDataSource.getRepository(SurveyResponse);

            // Get surveys based on program_id and optional type
            const whereClause = { program_id: parseInt(programId) };
            if (type) {
                whereClause.type = type;
            }

            const surveys = await surveyRepository.find({
                where: whereClause
            });

            if (surveys.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No surveys found for the specified program'
                });
            }

            const statistics = {
                overview: {
                    totalSurveys: surveys.length,
                    totalResponses: 0,
                    programId: programId ? parseInt(programId) : null,
                    surveyIds: surveys.map(s => s.survey_id),
                    surveyTypes: [...new Set(surveys.map(s => s.type))]
                },
                surveyStatistics: []
            };

            // Process each survey
            for (const survey of surveys) {
                // Get all responses for this survey
                const responses = await responseRepository.find({
                    where: { survey_id: survey.survey_id }
                });

                statistics.overview.totalResponses += responses.length;

                // Parse survey questions
                let surveyQuestions = [];
                try {
                    if (survey.questions_json) {
                        const questionsData = JSON.parse(survey.questions_json);
                        // Filter out deleted questions, similar to surveyController.js
                        if (questionsData.questions && Array.isArray(questionsData.questions)) {
                            surveyQuestions = questionsData.questions.filter(question => 
                                question.deleted === false || question.deleted === undefined
                            );
                        }
                    }
                } catch (error) {
                    console.warn(`Invalid JSON in survey ${survey.survey_id} questions:`, error);
                }

                const surveyStats = {
                    surveyId: survey.survey_id,
                    surveyType: survey.type,
                    programId: survey.program_id,
                    totalResponses: responses.length,
                    questionStatistics: {}
                };

                // Create question statistics structure
                surveyQuestions.forEach(question => {
                    surveyStats.questionStatistics[question.id] = {
                        questionId: question.id,
                        questionText: question.question,
                        questionOptions: question.options || [],
                        totalResponses: 0,
                        answerCounts: {},
                        percentages: {}
                    };
                });

                // Process each response
                responses.forEach(response => {
                    try {
                        if (!response.answer_json) return;

                        const answerData = JSON.parse(response.answer_json);

                        // Handle new format (responses array)
                        if (answerData.responses && Array.isArray(answerData.responses)) {
                            answerData.responses.forEach(responseItem => {
                                const questionId = responseItem.id;
                                const answer = responseItem.answer;

                                if (surveyStats.questionStatistics[questionId]) {
                                    surveyStats.questionStatistics[questionId].totalResponses++;

                                    // Count answers
                                    if (Array.isArray(answer)) {
                                        // Multiple choice answers
                                        answer.forEach(singleAnswer => {
                                            if (!surveyStats.questionStatistics[questionId].answerCounts[singleAnswer]) {
                                                surveyStats.questionStatistics[questionId].answerCounts[singleAnswer] = 0;
                                            }
                                            surveyStats.questionStatistics[questionId].answerCounts[singleAnswer]++;
                                        });
                                    } else {
                                        // Single answer
                                        if (!surveyStats.questionStatistics[questionId].answerCounts[answer]) {
                                            surveyStats.questionStatistics[questionId].answerCounts[answer] = 0;
                                        }
                                        surveyStats.questionStatistics[questionId].answerCounts[answer]++;
                                    }
                                }
                            });
                        }
                        // Handle old format (answers array)
                        else if (answerData.answers && Array.isArray(answerData.answers)) {
                            answerData.answers.forEach(answerItem => {
                                const questionId = answerItem.question_id;
                                const answer = answerItem.answer;

                                if (surveyStats.questionStatistics[questionId]) {
                                    surveyStats.questionStatistics[questionId].totalResponses++;

                                    // Count answers
                                    if (Array.isArray(answer)) {
                                        // Multiple choice answers
                                        answer.forEach(singleAnswer => {
                                            if (!surveyStats.questionStatistics[questionId].answerCounts[singleAnswer]) {
                                                surveyStats.questionStatistics[questionId].answerCounts[singleAnswer] = 0;
                                            }
                                            surveyStats.questionStatistics[questionId].answerCounts[singleAnswer]++;
                                        });
                                    } else {
                                        // Single answer
                                        if (!surveyStats.questionStatistics[questionId].answerCounts[answer]) {
                                            surveyStats.questionStatistics[questionId].answerCounts[answer] = 0;
                                        }
                                        surveyStats.questionStatistics[questionId].answerCounts[answer]++;
                                    }
                                }
                            });
                        }
                        // Handle direct question-answer format
                        else {
                            Object.keys(answerData).forEach(questionId => {
                                const answer = answerData[questionId];
                                const numericQuestionId = parseInt(questionId);

                                if (surveyStats.questionStatistics[numericQuestionId]) {
                                    surveyStats.questionStatistics[numericQuestionId].totalResponses++;

                                    // Count answers
                                    if (Array.isArray(answer)) {
                                        // Multiple choice answers
                                        answer.forEach(singleAnswer => {
                                            if (!surveyStats.questionStatistics[numericQuestionId].answerCounts[singleAnswer]) {
                                                surveyStats.questionStatistics[numericQuestionId].answerCounts[singleAnswer] = 0;
                                            }
                                            surveyStats.questionStatistics[numericQuestionId].answerCounts[singleAnswer]++;
                                        });
                                    } else {
                                        // Single answer
                                        if (!surveyStats.questionStatistics[numericQuestionId].answerCounts[answer]) {
                                            surveyStats.questionStatistics[numericQuestionId].answerCounts[answer] = 0;
                                        }
                                        surveyStats.questionStatistics[numericQuestionId].answerCounts[answer]++;
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        console.warn('Error processing response:', error);
                    }
                });

                // Calculate percentages for each question
                Object.keys(surveyStats.questionStatistics).forEach(questionId => {
                    const questionStats = surveyStats.questionStatistics[questionId];
                    const totalAnswers = Object.values(questionStats.answerCounts).reduce((sum, count) => sum + count, 0);

                    Object.keys(questionStats.answerCounts).forEach(answer => {
                        const count = questionStats.answerCounts[answer];
                        questionStats.percentages[answer] = totalAnswers > 0 ?
                            parseFloat(((count / totalAnswers) * 100).toFixed(2)) : 0;
                    });

                    // Add summary statistics
                    questionStats.totalAnswers = totalAnswers;
                    questionStats.uniqueAnswers = Object.keys(questionStats.answerCounts).length;
                    questionStats.mostCommonAnswer = totalAnswers > 0 ?
                        Object.keys(questionStats.answerCounts).reduce((a, b) =>
                            questionStats.answerCounts[a] > questionStats.answerCounts[b] ? a : b
                        ) : null;
                });

                statistics.surveyStatistics.push(surveyStats);
            }

            // Add aggregated statistics for program-level queries
            if (programId && surveys.length > 1) {
                statistics.aggregatedStatistics = {
                    totalUniqueQuestions: 0,
                    averageResponseRate: 0,
                    surveyTypeBreakdown: {}
                };

                // Calculate survey type breakdown
                surveys.forEach(survey => {
                    if (!statistics.aggregatedStatistics.surveyTypeBreakdown[survey.type]) {
                        statistics.aggregatedStatistics.surveyTypeBreakdown[survey.type] = {
                            count: 0,
                            totalResponses: 0
                        };
                    }
                    statistics.aggregatedStatistics.surveyTypeBreakdown[survey.type].count++;

                    const surveyStats = statistics.surveyStatistics.find(s => s.surveyId === survey.survey_id);
                    if (surveyStats) {
                        statistics.aggregatedStatistics.surveyTypeBreakdown[survey.type].totalResponses += surveyStats.totalResponses;
                    }
                });
            }

            res.status(200).json({
                success: true,
                data: statistics.surveyStatistics,
                message: 'Survey response statistics generated successfully'
            });

        } catch (error) {
            console.error('Error generating survey response statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate survey response statistics',
                error: error.message
            });
        }
    }
}

module.exports = SurveyResponseController;