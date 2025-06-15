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
                    questions = JSON.parse(survey.questions_json);
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
}

module.exports = SurveyResponseController;