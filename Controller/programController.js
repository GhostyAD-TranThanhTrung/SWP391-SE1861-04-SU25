/**
 * Program Controller using TypeORM
 * CRUD operations for Programs table
 */
const AppDataSource = require('../src/data-source');
const Program = require('../src/entities/Program');
const Enroll = require('../src/entities/Enroll');
const Category = require('../src/entities/Category');
const Survey = require('../src/entities/Survey');
const SurveyResponse = require('../src/entities/SurveyResponse');
const Profile = require('../src/entities/Profile');

class ProgramController {
    /**
     * Get all programs
     */
    static async getAllPrograms(req, res) {
        try {
            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.find({
                relations: ['creator', 'category', 'enrollments', 'contents'],
                order: {
                    create_at: 'DESC'
                }
            });

            res.status(200).json({
                success: true,
                data: programs,
                count: programs.length,
                message: 'Programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting programs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs',
                error: error.message
            });
        }
    }

    /**
     * Get all programs with enhanced category details and organization
     * Returns programs organized by category with detailed statistics
     */
    static async getAllProgramsWithCategoryDetails(req, res) {
        try {
            const programRepository = AppDataSource.getRepository(Program);
            const categoryRepository = AppDataSource.getRepository(Category);

            // Get all categories first
            const categories = await categoryRepository.find({
                order: { name: 'ASC' }
            });

            // Get all programs with full relations
            const programs = await programRepository.find({
                relations: ['creator', 'category', 'enrollments', 'contents', 'surveys'],
                order: {
                    create_at: 'DESC'
                }
            });

            // Organize programs by category
            const programsByCategory = {};
            const categoryStats = {};

            // Initialize category structure
            categories.forEach(category => {
                programsByCategory[category.name] = {
                    category_id: category.category_id,
                    category_name: category.name,
                    category_description: category.description || '',
                    programs: [],
                    statistics: {
                        total_programs: 0,
                        active_programs: 0,
                        total_enrollments: 0,
                        total_contents: 0,
                        total_surveys: 0
                    }
                };
                categoryStats[category.category_id] = {
                    name: category.name,
                    program_count: 0,
                    enrollment_count: 0
                };
            });

            // Add programs to their respective categories
            programs.forEach(program => {
                const categoryName = program.category ? program.category.name : 'Uncategorized';

                // Create uncategorized category if needed
                if (!programsByCategory[categoryName]) {
                    programsByCategory[categoryName] = {
                        category_id: null,
                        category_name: categoryName,
                        category_description: 'Programs without assigned category',
                        programs: [],
                        statistics: {
                            total_programs: 0,
                            active_programs: 0,
                            total_enrollments: 0,
                            total_contents: 0,
                            total_surveys: 0
                        }
                    };
                }

                // Calculate program-level statistics
                const enrollmentCount = program.enrollments ? program.enrollments.length : 0;
                const contentCount = program.contents ? program.contents.length : 0;
                const surveyCount = program.surveys ? program.surveys.length : 0;
                const isActive = program.status === 'active';

                // Enhanced program object with additional metadata
                const enhancedProgram = {
                    ...program,
                    statistics: {
                        total_enrollments: enrollmentCount,
                        total_contents: contentCount,
                        total_surveys: surveyCount,
                        completion_rate: enrollmentCount > 0 ?
                            Math.round((program.enrollments.filter(e => e.complete_at).length / enrollmentCount) * 100) : 0
                    }
                };

                // Add to category
                programsByCategory[categoryName].programs.push(enhancedProgram);

                // Update category statistics
                programsByCategory[categoryName].statistics.total_programs++;
                if (isActive) programsByCategory[categoryName].statistics.active_programs++;
                programsByCategory[categoryName].statistics.total_enrollments += enrollmentCount;
                programsByCategory[categoryName].statistics.total_contents += contentCount;
                programsByCategory[categoryName].statistics.total_surveys += surveyCount;

                // Update global category stats if category exists
                if (program.category && categoryStats[program.category.category_id]) {
                    categoryStats[program.category.category_id].program_count++;
                    categoryStats[program.category.category_id].enrollment_count += enrollmentCount;
                }
            });

            // Remove empty categories (optional - comment out if you want to show all categories)
            Object.keys(programsByCategory).forEach(categoryName => {
                if (programsByCategory[categoryName].statistics.total_programs === 0) {
                    delete programsByCategory[categoryName];
                }
            });

            // Calculate overall statistics
            const totalPrograms = programs.length;
            const totalEnrollments = programs.reduce((sum, p) => sum + (p.enrollments ? p.enrollments.length : 0), 0);
            const totalContents = programs.reduce((sum, p) => sum + (p.contents ? p.contents.length : 0), 0);
            const totalSurveys = programs.reduce((sum, p) => sum + (p.surveys ? p.surveys.length : 0), 0);
            const activePrograms = programs.filter(p => p.status === 'active').length;

            res.status(200).json({
                success: true,
                data: {
                    programs_by_category: programsByCategory,
                    categories: Object.keys(programsByCategory).map(categoryName => ({
                        name: categoryName,
                        ...programsByCategory[categoryName].statistics
                    })),
                    overall_statistics: {
                        total_programs: totalPrograms,
                        active_programs: activePrograms,
                        total_categories: Object.keys(programsByCategory).length,
                        total_enrollments: totalEnrollments,
                        total_contents: totalContents,
                        total_surveys: totalSurveys,
                        average_enrollments_per_program: totalPrograms > 0 ? (totalEnrollments / totalPrograms).toFixed(2) : 0,
                        average_contents_per_program: totalPrograms > 0 ? (totalContents / totalPrograms).toFixed(2) : 0
                    }
                },
                message: 'Programs with category details retrieved successfully',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error getting programs with category details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs with category details',
                error: error.message
            });
        }
    }

    /**
     * Get program by ID
     */
    static async getProgramById(req, res) {
        try {
            const { id } = req.params;
            const programRepository = AppDataSource.getRepository(Program);
            const program = await programRepository.findOne({
                where: { program_id: parseInt(id) },
                relations: ['creator', 'category', 'enrollments', 'contents', 'surveys']
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            res.status(200).json({
                success: true,
                data: program,
                message: 'Program retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting program:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve program',
                error: error.message
            });
        }
    }

    /**
     * Get programs by category
     */
    static async getProgramsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.find({
                where: { category_id: parseInt(categoryId) },
                relations: ['creator', 'category', 'enrollments', 'contents'],
                order: {
                    create_at: 'DESC'
                }
            });

            res.status(200).json({
                success: true,
                data: programs,
                count: programs.length,
                message: `Programs in category ${categoryId} retrieved successfully`
            });
        } catch (error) {
            console.error('Error getting programs by category:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs by category',
                error: error.message
            });
        }
    }

    /**
     * Get all programs with user's enrollment and completion status
     * Uses user_id from token to check enrollment status for each program
     */
    static async getUserProgramsWithEnrollmentStatus(req, res) {
        try {
            const userId = req.user.userId; // Get user_id from token middleware

            const programRepository = AppDataSource.getRepository(Program);
            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Get all programs with basic relations
            const programs = await programRepository.find({
                relations: ['creator', 'category', 'contents'],
                order: {
                    create_at: 'DESC'
                }
            });

            // Get all enrollments for this user
            const userEnrollments = await enrollRepository.find({
                where: { user_id: parseInt(userId) }
            });

            // Create a map of enrollments by program_id for quick lookup
            const enrollmentMap = new Map();
            userEnrollments.forEach(enrollment => {
                enrollmentMap.set(enrollment.program_id, enrollment);
            });

            // Process each program to add enrollment and completion status
            const programsWithStatus = programs.map(program => {
                const enrollment = enrollmentMap.get(program.program_id);

                let enrollmentStatus = {
                    is_enrolled: false,
                    has_complete: false,
                    enrollment_date: null,
                    completion_date: null,
                    progress_percentage: 0,
                    completed_content: 0,
                    total_content: program.contents ? program.contents.length : 0
                };

                if (enrollment) {
                    // Parse progress if it exists
                    let progressArray = [];
                    try {
                        progressArray = enrollment.progress ? JSON.parse(enrollment.progress) : [];
                    } catch (err) {
                        console.error('Error parsing progress JSON:', err);
                        progressArray = [];
                    }

                    const completedCount = progressArray.filter(item => item.complete).length;
                    const totalCount = progressArray.length;
                    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                    enrollmentStatus = {
                        is_enrolled: true,
                        has_complete: !!enrollment.complete_at, // Check if complete_at is filled
                        enrollment_date: enrollment.start_at,
                        completion_date: enrollment.complete_at,
                        progress_percentage: Math.round(progressPercentage),
                        completed_content: completedCount,
                        total_content: totalCount,
                        enroll_id: `${userId}_${program.program_id}` // Composite ID for easy reference
                    };
                }

                return {
                    ...program,
                    enrollment_status: enrollmentStatus
                };
            });

            // Calculate summary statistics
            const totalPrograms = programs.length;
            const enrolledPrograms = programsWithStatus.filter(p => p.enrollment_status.is_enrolled).length;
            const completedPrograms = programsWithStatus.filter(p => p.enrollment_status.has_complete).length;
            const inProgressPrograms = programsWithStatus.filter(p =>
                p.enrollment_status.is_enrolled && !p.enrollment_status.has_complete
            ).length;

            res.status(200).json({
                success: true,
                data: programsWithStatus,
                summary: {
                    total_programs: totalPrograms,
                    enrolled_programs: enrolledPrograms,
                    completed_programs: completedPrograms,
                    in_progress_programs: inProgressPrograms,
                    completion_rate: enrolledPrograms > 0 ? Math.round((completedPrograms / enrolledPrograms) * 100) : 0
                },
                message: 'Programs with enrollment status retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting programs with enrollment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs with enrollment status',
                error: error.message
            });
        }
    }

    /**
     * Get Sự kiện cộng đồng programs only
     * Specifically designed to retrieve programs from the Sự kiện cộng đồng category (category_id: 18)
     */
    static async getCommunityEventPrograms(req, res) {
        try {
            const programRepository = AppDataSource.getRepository(Program);
            const categoryRepository = AppDataSource.getRepository(Category);

            // Find the Sự kiện cộng đồng category by name instead of hardcoded ID
            const communityEventCategory = await categoryRepository.findOne({
                where: { name: 'Sự kiện cộng đồng' }
            });
            if (!communityEventCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Sự kiện cộng đồng category not found',
                    data: []
                });
            }

            const programs = await programRepository.find({
                where: {
                    category_id: communityEventCategory.category_id,
                    status: 'active' // Only return active Sự kiện cộng đồng programs
                },
                relations: ['creator', 'category', 'enrollments', 'contents'],
                order: {
                    create_at: 'DESC'
                }
            });

            // Add additional metadata for community events
            const programsWithMetadata = programs.map(program => {
                const totalEnrollments = program.enrollments ? program.enrollments.length : 0;
                const totalContents = program.contents ? program.contents.length : 0;

                return {
                    ...program,
                    event_metadata: {
                        total_enrollments: totalEnrollments,
                        total_contents: totalContents,
                        is_community_event: true,
                        event_type: program.title.toLowerCase().includes('walk') ? 'outdoor_event' : 'community_fair'
                    }
                };
            });

            res.status(200).json({
                success: true,
                data: programsWithMetadata,
                count: programsWithMetadata.length,
                category: 'Sự kiện cộng đồng',
                message: 'Sự kiện cộng đồng programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting Sự kiện cộng đồng programs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve Sự kiện cộng đồng programs',
                error: error.message
            });
        }
    }

    /**
     * Get comprehensive survey analytics for a program
     * This complex function analyzes all survey responses for a program and returns detailed statistics
     * Also includes program completion tracking based on enrollment progress data
     * Completion logic: A participant is considered complete only if ALL progress items have complete: true
     */
    static async getProgramSurveyAnalytics(req, res) {
        try {
            const { programId } = req.params;
            const { show_deleted_questions = false } = req.query;

            const programRepository = AppDataSource.getRepository(Program);
            const surveyRepository = AppDataSource.getRepository(Survey);
            const surveyResponseRepository = AppDataSource.getRepository(SurveyResponse);
            const enrollRepository = AppDataSource.getRepository(Enroll);

            // 1. Verify program exists
            const program = await programRepository.findOne({
                where: { program_id: parseInt(programId) }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            // 1.5. Get enrollment data for completion tracking
            const enrollments = await enrollRepository.find({
                where: { program_id: parseInt(programId) },
                relations: ['user']
            });

            // Analyze completion status based on progress
            let completedParticipants = 0;
            let incompleteParticipants = 0;
            const participantDetails = [];

            enrollments.forEach(enrollment => {
                let isCompleted = true; // Assume completed unless we find incomplete content
                let progressArray = [];

                try {
                    progressArray = enrollment.progress ? JSON.parse(enrollment.progress) : [];
                } catch (err) {
                    console.error('Error parsing progress JSON:', err);
                    progressArray = [];
                }

                // Check if any content is incomplete (complete: false)
                if (progressArray.length > 0) {
                    isCompleted = progressArray.every(item => item.complete === true);
                } else {
                    // If no progress data, consider as incomplete
                    isCompleted = false;
                }

                if (isCompleted) {
                    completedParticipants++;
                } else {
                    incompleteParticipants++;
                }

                participantDetails.push({
                    user_id: enrollment.user_id,
                    user_name: enrollment.user ? enrollment.user.username : 'Unknown',
                    is_completed: isCompleted,
                    progress_items: progressArray.length,
                    completed_items: progressArray.filter(item => item.complete === true).length,
                });
            });

            // 2. Get all surveys for this program
            const surveys = await surveyRepository.find({
                where: { program_id: parseInt(programId) },
                order: { survey_id: 'ASC' }
            });

            if (surveys.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        program_id: parseInt(programId),
                        program_title: program.title,
                        total_surveys: 0,
                        total_responses: 0,
                        completion_statistics: {
                            total_participants: enrollments.length,
                            completed_participants: completedParticipants,
                            incomplete_participants: incompleteParticipants,
                            completion_rate: enrollments.length > 0 ?
                                Math.round((completedParticipants / enrollments.length) * 100) : 0,
                            participant_details: participantDetails
                        },
                        surveys: []
                    },
                    message: 'No surveys found for this program'
                });
            }

            // 3. Process each survey and get its responses using the existing pattern
            const surveyAnalytics = [];
            let totalResponses = 0;

            for (const survey of surveys) {
                try {
                    // Parse questions JSON (always expect { questions: [...] })
                    let questions = [];
                    let deletedQuestions = [];
                    let allQuestions = [];

                    try {
                        if (survey.questions_json) {
                            const parsed = JSON.parse(survey.questions_json);
                            allQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

                            // Separate active and deleted questions
                            questions = allQuestions.filter(question =>
                                question.deleted === false || question.deleted === undefined
                            );
                            deletedQuestions = allQuestions.filter(question =>
                                question.deleted === true
                            );
                        } else {
                            questions = [];
                            deletedQuestions = [];
                            allQuestions = [];
                        }
                    } catch (parseError) {
                        console.error(`Error parsing questions JSON for survey ${survey.survey_id}:`, parseError);
                        questions = [];
                        deletedQuestions = [];
                        allQuestions = [];
                    }

                    // Get all responses for this survey using the existing method pattern
                    const responses = await surveyResponseRepository.find({
                        where: { survey_id: survey.survey_id },
                        relations: ['user']
                    });

                    totalResponses += responses.length;

                    // Create a 2D matrix of responses [responseIndex][questionIndex]
                    const responseMatrix = [];
                    const validResponses = [];

                    responses.forEach((response, responseIndex) => {
                        try {
                            let answers = [];
                            if (response.answer_json) {
                                const parsed = JSON.parse(response.answer_json);
                                if (Array.isArray(parsed)) {
                                    // Handle flat array format
                                    answers = parsed;
                                } else if (parsed.answers && Array.isArray(parsed.answers)) {
                                    // Handle structured format: { answers: [{question_id, answer}, ...] }
                                    // Create a map from question_id to answer
                                    const answerMap = {};
                                    parsed.answers.forEach(item => {
                                        if (item.question_id && item.answer !== undefined) {
                                            answerMap[item.question_id] = item.answer;
                                        }
                                    });

                                    // Map answers to ALL question indices (not just active ones)
                                    allQuestions.forEach((question, questionIndex) => {
                                        const questionId = question.id || (questionIndex + 1);
                                        answers[questionIndex] = answerMap[questionId];
                                    });
                                } else if (parsed.responses && Array.isArray(parsed.responses)) {
                                    // Handle new key-value format: { responses: [{id, question, answer}, ...] }
                                    const answerMap = {};
                                    parsed.responses.forEach(item => {
                                        if (item.id && item.answer !== undefined) {
                                            answerMap[item.id] = item.answer;
                                        }
                                    });

                                    // Map answers to ALL question indices (not just active ones)
                                    allQuestions.forEach((question, questionIndex) => {
                                        const questionId = question.id || (questionIndex + 1);
                                        answers[questionIndex] = answerMap[questionId];
                                    });
                                } else {
                                    answers = [];
                                }
                            }
                            responseMatrix[responseIndex] = answers;
                            validResponses.push({
                                response_id: response.response_id,
                                user_id: response.user_id,
                                submitted_at: response.submitted_at,
                                answers: answers
                            });
                        } catch (parseError) {
                            console.error(`Error parsing answer JSON for response ${response.response_id}:`, parseError);
                            responseMatrix[responseIndex] = [];
                        }
                    });

                    // 4. Analyze responses and count options for each question
                    const analyzeQuestions = (questionsToAnalyze, questionPrefix = '') => {
                        const questionAnalytics = {};

                        questionsToAnalyze.forEach((question, questionIndex) => {
                            // Find the original index of this question in allQuestions array
                            const originalIndex = allQuestions.findIndex(q =>
                                q.id === question.id ||
                                (q.question === question.question && q.options === question.options)
                            );

                            const questionText = question.question || question.text || `Question ${questionIndex + 1}`;
                            const questionType = question.type || 'multiple-choice';
                            const options = question.options || question.choices || [];

                            // Initialize option counts
                            const optionCounts = {};
                            if (Array.isArray(options)) {
                                options.forEach(option => {
                                    const optionText = typeof option === 'string' ? option : (option.text || option.value || option);
                                    optionCounts[optionText] = 0;
                                });
                            }

                            // Count responses for this question using original index
                            responseMatrix.forEach(responseRow => {
                                if (responseRow && originalIndex >= 0 && responseRow[originalIndex] !== undefined) {
                                    const answer = responseRow[originalIndex];

                                    if (questionType === 'multiple-choice' || questionType === 'single-choice') {
                                        // Handle single answer
                                        const answerText = typeof answer === 'string' ? answer :
                                            (answer.value || answer.text || answer.answer || String(answer));

                                        if (optionCounts.hasOwnProperty(answerText)) {
                                            optionCounts[answerText]++;
                                        } else {
                                            // Handle case where answer doesn't match predefined options
                                            optionCounts[answerText] = (optionCounts[answerText] || 0) + 1;
                                        }
                                    } else if (questionType === 'multiple-select' || questionType === 'checkbox') {
                                        // Handle multiple answers
                                        const answers = Array.isArray(answer) ? answer : [answer];
                                        answers.forEach(ans => {
                                            const answerText = typeof ans === 'string' ? ans :
                                                (ans.value || ans.text || ans.answer || String(ans));

                                            if (optionCounts.hasOwnProperty(answerText)) {
                                                optionCounts[answerText]++;
                                            } else {
                                                optionCounts[answerText] = (optionCounts[answerText] || 0) + 1;
                                            }
                                        });
                                    } else {
                                        // Handle text/open-ended questions
                                        const answerText = typeof answer === 'string' ? answer : String(answer);
                                        optionCounts[answerText] = (optionCounts[answerText] || 0) + 1;
                                    }
                                }
                            });

                            questionAnalytics[questionPrefix + questionText] = optionCounts;
                        });

                        return questionAnalytics;
                    };

                    // Analyze active questions
                    const activeQuestionAnalytics = analyzeQuestions(questions);

                    // Analyze deleted questions if requested
                    const deletedQuestionAnalytics = (show_deleted_questions === 'true' || show_deleted_questions === true) ?
                        analyzeQuestions(deletedQuestions, '[DELETED] ') : {};

                    // 5. Compile survey analytics
                    const surveyData = {
                        id: survey.survey_id,
                        type: survey.type || 'unknown',
                        total_questions: questions.length,
                        total_deleted_questions: deletedQuestions.length,
                        total_all_questions: allQuestions.length,
                        total_responses: validResponses.length,
                        response_rate: validResponses.length > 0 ?
                            ((validResponses.length / Math.max(1, responses.length)) * 100).toFixed(2) + '%' : '0%',
                        questions_metadata: questions.map((q, index) => ({
                            index: index,
                            question: q.question || q.text || `Question ${index + 1}`,
                            type: q.type || 'multiple-choice',
                            required: q.required || false,
                            deleted: false
                        })),
                        responses: activeQuestionAnalytics,
                        raw_responses: validResponses // Include raw data for debugging
                    };

                    // Add deleted questions metadata and analytics if requested
                    if (show_deleted_questions === 'true' || show_deleted_questions === true) {
                        surveyData.deleted_questions_metadata = deletedQuestions.map((q, index) => ({
                            index: index,
                            question: q.question || q.text || `Deleted Question ${index + 1}`,
                            type: q.type || 'multiple-choice',
                            required: q.required || false,
                            deleted: true
                        }));
                        surveyData.deleted_responses = deletedQuestionAnalytics;

                        // Combine active and deleted analytics for complete view
                        surveyData.all_responses = {
                            ...activeQuestionAnalytics,
                            ...deletedQuestionAnalytics
                        };
                    }

                    surveyAnalytics.push(surveyData);

                } catch (surveyError) {
                    console.error(`Error processing survey ${survey.survey_id}:`, surveyError);
                    // Add error entry for this survey
                    surveyAnalytics.push({
                        id: survey.survey_id,
                        type: survey.type || 'unknown',
                        error: 'Failed to process survey data',
                        error_details: surveyError.message,
                        responses: {}
                    });
                }
            }

            // 6. Return the analytics data
            res.status(200).json({
                success: true,
                data: {
                    program_id: parseInt(programId),
                    program_title: program.title,
                    total_surveys: surveys.length,
                    total_responses: totalResponses,
                    show_deleted_questions: show_deleted_questions === 'true' || show_deleted_questions === true,
                    completion_statistics: {
                        total_participants: enrollments.length,
                        completed_participants: completedParticipants,
                        incomplete_participants: incompleteParticipants,
                        completion_rate: enrollments.length > 0 ?
                            Math.round((completedParticipants / enrollments.length) * 100) : 0,
                        participant_details: participantDetails
                    },
                    surveys: surveyAnalytics
                },
                message: 'Survey analytics with completion statistics retrieved successfully'
            });

        } catch (error) {
            console.error('Error getting program survey analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve survey analytics',
                error: error.message
            });
        }
    }

    /**
     * Create new program
     */
    static async createProgram(req, res) {
        try {
            console.log("Received create program request:", {
                body: req.body,
                user: req.user,
                headers: req.headers
            });

            const { title, description, age_group, category_id, status, img_link } = req.body;

            // Validate required fields
            if (!title || !category_id) {
                console.log("Validation failed: Missing required fields");
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: title and category_id are required'
                });
            }

            // Check if category exists
            const categoryRepository = AppDataSource.getRepository(Category);
            const category = await categoryRepository.findOne({
                where: { category_id: parseInt(category_id) }
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const programRepository = AppDataSource.getRepository(Program);

            // Check if program with same title already exists
            const existingProgram = await programRepository.findOne({
                where: { title: title }
            });

            if (existingProgram) {
                return res.status(409).json({
                    success: false,
                    message: 'Program with this title already exists'
                });
            }

            // Get user ID from token for create_by field
            const createBy = req.user ? req.user.userId : null;

            // Create new program
            const newProgram = programRepository.create({
                title,
                description: description || null,
                age_group: age_group || null,
                category_id: parseInt(category_id),
                status: status || 'active',
                img_link: img_link || null,
                create_by: createBy,
                create_at: new Date()
            });

            const savedProgram = await programRepository.save(newProgram);

            // Fetch the saved program with relations
            const programWithRelations = await programRepository.findOne({
                where: { program_id: savedProgram.program_id },
                relations: ['creator', 'category', 'enrollments', 'contents', 'surveys']
            });

            res.status(201).json({
                success: true,
                data: programWithRelations,
                message: 'Program created successfully'
            });
        } catch (error) {
            console.error('Error creating program:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create program',
                error: error.message
            });
        }
    }

    /**
     * Update program
     */
    static async updateProgram(req, res) {
        try {
            const { id } = req.params;
            const { title, description, age_group, category_id, status, img_link } = req.body;

            console.log('Update program request:', {
                id,
                body: req.body,
                user: req.user
            });

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid program ID provided'
                });
            }

            const programRepository = AppDataSource.getRepository(Program);
            const categoryRepository = AppDataSource.getRepository(Category);

            // Check if program exists
            const program = await programRepository.findOne({
                where: { program_id: parseInt(id) },
                relations: ['category', 'creator']
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            // Check if category exists if category_id is provided
            if (category_id !== undefined && category_id !== null) {
                // Convert to number and validate
                const categoryIdNum = parseInt(category_id);

                if (isNaN(categoryIdNum)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid category_id: Must be a valid number'
                    });
                }

                const category = await categoryRepository.findOne({
                    where: { category_id: categoryIdNum }
                });

                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: `Invalid category_id: Category with ID ${category_id} not found`
                    });
                }
                console.log('Category validation passed:', category);
            }

            // Check if title already exists for other programs
            if (title && title.trim() !== '' && title !== program.title) {
                const { Not } = require('typeorm');
                const existingProgram = await programRepository.findOne({
                    where: {
                        title: title.trim(),
                        program_id: Not(parseInt(id))
                    }
                });

                if (existingProgram) {
                    return res.status(409).json({
                        success: false,
                        message: 'Another program with this title already exists'
                    });
                }
            }

            // Store original values for logging
            const originalData = {
                title: program.title,
                description: program.description,
                age_group: program.age_group,
                category_id: program.category_id,
                status: program.status,
                img_link: program.img_link
            };

            // Update program fields only if they are provided
            if (title !== undefined && title.trim() !== '') {
                program.title = title.trim();
            }
            if (description !== undefined) {
                program.description = description;
            }
            if (age_group !== undefined) {
                program.age_group = age_group;
            }
            // Fixed category update logic - category_id is required field, so handle it properly
            if (category_id !== undefined && category_id !== null) {
                const categoryIdNum = parseInt(category_id);
                program.category_id = categoryIdNum;
                console.log(`Updating category_id from ${originalData.category_id} to ${program.category_id}`);
            }
            if (status !== undefined) {
                program.status = status;
            }
            if (img_link !== undefined) {
                program.img_link = img_link;
            }

            console.log('About to update program with data:', {
                program_id: program.program_id,
                original: originalData,
                updated: {
                    title: program.title,
                    description: program.description,
                    age_group: program.age_group,
                    category_id: program.category_id,
                    status: program.status,
                    img_link: program.img_link
                }
            });

            // Use only the update method for more reliable partial updates
            const updateData = {};
            if (title !== undefined && title.trim() !== '') {
                updateData.title = title.trim();
            }
            if (description !== undefined) {
                updateData.description = description;
            }
            if (age_group !== undefined) {
                updateData.age_group = age_group;
            }
            if (category_id !== undefined && category_id !== null) {
                updateData.category_id = parseInt(category_id);
            }
            if (status !== undefined) {
                updateData.status = status;
            }
            if (img_link !== undefined) {
                updateData.img_link = img_link;
            }

            console.log('Update data to be applied:', updateData);

            // Check if we actually have data to update
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields provided for update'
                });
            }

            // Use update method for direct database update
            const updateResult = await programRepository.update(
                { program_id: parseInt(id) },
                updateData
            );

            console.log('Update result:', updateResult);

            // Additional check: Try direct SQL update for category_id if it was provided
            if (category_id !== undefined && category_id !== null) {
                console.log('Performing direct SQL update for category_id...');
                try {
                    const directUpdateResult = await AppDataSource.query(
                        'UPDATE Programs SET category_id = ? WHERE program_id = @0',
                        [parseInt(category_id), parseInt(id)]
                    );
                    console.log('Direct SQL update result:', directUpdateResult);
                } catch (sqlError) {
                    console.error('Direct SQL update failed:', sqlError);
                }
            }

            // Fetch updated program with relations to confirm the update
            const programWithRelations = await programRepository.findOne({
                where: { program_id: parseInt(id) },
                relations: ['creator', 'category', 'enrollments', 'contents', 'surveys']
            });

            console.log('Program updated successfully:', programWithRelations.program_id);

            res.status(200).json({
                success: true,
                data: programWithRelations,
                message: 'Program updated successfully'
            });
        } catch (error) {
            console.error('Error updating program:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Failed to update program',
                error: error.message
            });
        }
    }

    /**
     * Delete program (with safety checks)
     */
    static async deleteProgram(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid program ID provided'
                });
            }

            const programRepository = AppDataSource.getRepository(Program);

            // Check if program exists with all related data
            const program = await programRepository.findOne({
                where: { program_id: parseInt(id) },
                relations: ['enrollments', 'contents', 'surveys']
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            // Safety checks - prevent deletion if program has related data
            const hasEnrollments = program.enrollments && program.enrollments.length > 0;
            const hasContents = program.contents && program.contents.length > 0;
            const hasSurveys = program.surveys && program.surveys.length > 0;

            if (hasEnrollments || hasContents || hasSurveys) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot delete program with existing enrollments, contents, or surveys',
                    details: {
                        enrollments: hasEnrollments ? program.enrollments.length : 0,
                        contents: hasContents ? program.contents.length : 0,
                        surveys: hasSurveys ? program.surveys.length : 0
                    }
                });
            }

            // Delete the program
            await programRepository.remove(program);

            res.status(200).json({
                success: true,
                message: `Program '${program.title}' deleted successfully`
            });
        } catch (error) {
            console.error('Error deleting program:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete program',
                error: error.message
            });
        }
    }

    /**
     * Get program recommendations based on user's date of birth from profile
     * Age groups: Youth (13-18), Adult (18-65), Senior (65+)
     * Requires authentication token to get user_id
     * Uses raw SQL for better performance with fallback to ORM
     */
    static async getProgramRecommendationsByAge(req, res) {
        try {
            // Get user ID from JWT token (set by verifyToken middleware)
            const userId = req.user.userId;

            // Get user's profile - try raw SQL first, fall back to ORM if needed
            let userProfile;
            try {
                const userProfileQuery = `
                    SELECT 
                        pr.user_id,
                        pr.name,
                        pr.date_of_birth
                    FROM Profile pr
                    WHERE pr.user_id = ?
                `;
                const userProfileResult = await AppDataSource.query(userProfileQuery, [parseInt(userId)]);

                if (!userProfileResult || userProfileResult.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User profile not found. Please complete your profile first.'
                    });
                }
                userProfile = userProfileResult[0];
            } catch (sqlError) {
                console.log('Raw SQL failed, falling back to ORM:', sqlError.message);
                // Fallback to ORM
                const profileRepository = AppDataSource.getRepository(Profile);
                const userProfileORM = await profileRepository.findOne({
                    where: { user_id: parseInt(userId) }
                });

                if (!userProfileORM) {
                    return res.status(404).json({
                        success: false,
                        message: 'User profile not found. Please complete your profile first.'
                    });
                }
                userProfile = userProfileORM;
            }

            if (!userProfile.date_of_birth) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth not found in profile. Please update your profile.'
                });
            }

            // Calculate age from profile date of birth
            const birthDate = new Date(userProfile.date_of_birth);
            const today = new Date();

            // Debug logging for date parsing
            console.log('Date parsing debug:', {
                raw_date_of_birth: userProfile.date_of_birth,
                parsed_birth_date: birthDate,
                today: today,
                birth_date_valid: !isNaN(birthDate.getTime())
            });

            // Validate that date was parsed correctly
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format in profile. Expected format: YYYY-MM-DD (e.g., 1985-05-15)'
                });
            }

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();


            console.log('Age calculation debug:', {
                birth_year: birthDate.getFullYear(),
                current_year: today.getFullYear(),
                month_diff: monthDiff,
                calculated_age: age
            });

            // Validate age
            if (age < 0 || age > 120) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date of birth in profile'
                });
            }

            // Determine age group based on age
            let ageGroup;
            let ageGroupLabel;

            if (age >= 13 && age <= 18) {
                ageGroup = 'youth';
                ageGroupLabel = 'Youth (13-18)';
            } else if (age > 18 && age <= 65) {
                ageGroup = 'adult';
                ageGroupLabel = 'Adult (18-65)';
            } else if (age > 65) {
                ageGroup = 'senior';
                ageGroupLabel = 'Senior (65+)';
            } else {
                // For children under 13, we might not have specific programs
                return res.status(200).json({
                    success: true,
                    data: {
                        user_info: {
                            user_id: userId,
                            name: userProfile.name,
                            age: age,
                            age_group: 'child',
                            age_group_label: 'Child (Under 13)',
                            date_of_birth: userProfile.date_of_birth
                        },
                        recommended_programs: [],
                        total_recommended: 0
                    },
                    message: 'No specific programs available for children under 13'
                });
            }

            // Get programs - try raw SQL first, fall back to ORM if needed
            let processedPrograms;
            try {
                const programsQuery = `
                    SELECT 
                        p.program_id,
                        p.title,
                        p.description,
                        p.age_group,
                        p.status,
                        p.img_link,
                        p.create_at,
                        p.create_by,
                        p.category_id,
                        c.name as category_name,
                        c.description as category_description,
                        pr.name as creator_name,
                        COUNT(DISTINCT e.enroll_id) as enrollment_count,
                        COUNT(DISTINCT cont.content_id) as content_count
                    FROM Programs p
                    LEFT JOIN Categories c ON p.category_id = c.category_id
                    LEFT JOIN Profiles pr ON p.create_by = pr.user_id
                    LEFT JOIN Enrolls e ON p.program_id = e.program_id
                    LEFT JOIN Contents cont ON p.program_id = cont.program_id
                    WHERE p.status = 'active' 
                    AND (p.age_group = ? OR p.age_group = 'all')
                    GROUP BY p.program_id, p.title, p.description, p.age_group, p.status, 
                             p.img_link, p.create_at, p.create_by, p.category_id,
                             c.name, c.description, pr.name
                    ORDER BY p.create_at DESC
                `;

                const programsResult = await AppDataSource.query(programsQuery, [ageGroup]);

                // Process programs and add recommendation scores
                processedPrograms = programsResult.map(program => {
                    // Calculate recommendation score
                    let score = 50; // Base score

                    // Boost score based on enrollment count (popularity)
                    const enrollmentCount = parseInt(program.enrollment_count) || 0;
                    score += Math.min(enrollmentCount * 2, 20); // Max 20 points for popularity

                    // Boost score based on content availability
                    const contentCount = parseInt(program.content_count) || 0;
                    score += Math.min(contentCount * 3, 15); // Max 15 points for content richness

                    // Boost score for recent programs
                    if (program.create_at) {
                        const daysSinceCreation = (new Date() - new Date(program.create_at)) / (1000 * 60 * 60 * 24);
                        if (daysSinceCreation <= 30) {
                            score += 10; // New programs get boost
                        } else if (daysSinceCreation <= 90) {
                            score += 5; // Recent programs get smaller boost
                        }
                    }

                    // Age-specific scoring adjustments
                    if (program.age_group === 'youth' && age >= 13 && age <= 18) {
                        score += 15; // Perfect age match for youth
                    } else if (program.age_group === 'adult' && age > 18 && age <= 65) {
                        score += 15; // Perfect age match for adult
                    } else if (program.age_group === 'senior' && age > 65) {
                        score += 15; // Perfect age match for senior
                    } else if (program.age_group === 'all') {
                        score += 5; // All ages programs get smaller boost
                    }

                    const recommendationScore = Math.min(score, 100); // Cap at 100

                    return {
                        program_id: program.program_id,
                        title: program.title,
                        description: program.description,
                        age_group: program.age_group,
                        status: program.status,
                        img_link: program.img_link,
                        create_at: program.create_at,
                        category: {
                            category_id: program.category_id,
                            name: program.category_name,
                            description: program.category_description
                        },
                        creator: {
                            name: program.creator_name
                        },
                        enrollment_count: enrollmentCount,
                        content_count: contentCount,
                        recommendation_score: recommendationScore
                    };
                });
            } catch (sqlError) {
                console.log('Raw SQL failed, falling back to ORM for programs:', sqlError.message);
                // Fallback to ORM approach
                const programRepository = AppDataSource.getRepository(Program);
                const recommendedPrograms = await programRepository.find({
                    where: [
                        { age_group: ageGroup, status: 'active' },
                        { age_group: 'all', status: 'active' }
                    ],
                    relations: ['creator', 'category', 'enrollments', 'contents'],
                    order: {
                        create_at: 'DESC'
                    }
                });

                // Process ORM results
                processedPrograms = recommendedPrograms.map(program => {
                    // Calculate recommendation score
                    let score = 50; // Base score

                    // Boost score based on enrollment count (popularity)
                    const enrollmentCount = program.enrollments ? program.enrollments.length : 0;
                    score += Math.min(enrollmentCount * 2, 20); // Max 20 points for popularity

                    // Boost score based on content availability
                    const contentCount = program.contents ? program.contents.length : 0;
                    score += Math.min(contentCount * 3, 15); // Max 15 points for content richness

                    // Boost score for recent programs
                    if (program.create_at) {
                        const daysSinceCreation = (new Date() - new Date(program.create_at)) / (1000 * 60 * 60 * 24);
                        if (daysSinceCreation <= 30) {
                            score += 10; // New programs get boost
                        } else if (daysSinceCreation <= 90) {
                            score += 5; // Recent programs get smaller boost
                        }
                    }

                    // Age-specific scoring adjustments
                    if (program.age_group === 'youth' && age >= 13 && age <= 18) {
                        score += 15; // Perfect age match for youth
                    } else if (program.age_group === 'adult' && age > 18 && age <= 65) {
                        score += 15; // Perfect age match for adult
                    } else if (program.age_group === 'senior' && age > 65) {
                        score += 15; // Perfect age match for senior
                    } else if (program.age_group === 'all') {
                        score += 5; // All ages programs get smaller boost
                    }

                    const recommendationScore = Math.min(score, 100); // Cap at 100

                    return {
                        program_id: program.program_id,
                        title: program.title,
                        description: program.description,
                        age_group: program.age_group,
                        status: program.status,
                        img_link: program.img_link,
                        create_at: program.create_at,
                        category: program.category ? {
                            category_id: program.category.category_id,
                            name: program.category.name,
                            description: program.category.description
                        } : null,
                        creator: program.creator ? {
                            name: program.creator.name || program.creator.username
                        } : null,
                        enrollment_count: enrollmentCount,
                        content_count: contentCount,
                        recommendation_score: recommendationScore
                    };
                });
            }

            // Sort by recommendation score (highest first)
            processedPrograms.sort((a, b) => b.recommendation_score - a.recommendation_score);

            res.status(200).json({
                success: true,
                data: {
                    user_info: {
                        user_id: userId,
                        name: userProfile.name,
                        age: age,
                        age_group: ageGroup,
                        age_group_label: ageGroupLabel,
                        date_of_birth: userProfile.date_of_birth
                    },
                    recommended_programs: processedPrograms,
                    total_recommended: processedPrograms.length
                },
                message: `Found ${processedPrograms.length} recommended programs for ${ageGroupLabel}`
            });

        } catch (error) {
            console.error('Error getting program recommendations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get program recommendations',
                error: error.message
            });
        }
    }
}

module.exports = ProgramController;
