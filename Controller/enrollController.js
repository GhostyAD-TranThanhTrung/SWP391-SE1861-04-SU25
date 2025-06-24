/**
 * Enroll Controller using TypeORM
 * CRUD operations for Enroll table
 */
const AppDataSource = require('../src/data-source');
const Enroll = require('../src/entities/Enroll');
const Content = require('../src/entities/Content');

class EnrollController {
    /**
     * Get all enrollments
     */
    static async getAllEnrollments(req, res) {
        try {
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = enrollments.map(enrollment => ({
                ...enrollment,
                progress: enrollment.progress ? JSON.parse(enrollment.progress) : []
            }));

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'Enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve enrollments',
                error: error.message
            });
        }
    }

    /**
     * Get enrollment by user ID and program ID
     */
    static async getEnrollmentById(req, res) {
        try {
            const { userId, programId } = req.params;
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Enrollment not found'
                });
            }

            // Parse progress JSON
            const parsedEnrollment = {
                ...enrollment,
                progress: enrollment.progress ? JSON.parse(enrollment.progress) : []
            };

            res.status(200).json({
                success: true,
                data: parsedEnrollment,
                message: 'Enrollment retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting enrollment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve enrollment',
                error: error.message
            });
        }
    }

    /**
     * Get enrollments by user ID
     */
    static async getEnrollmentsByUser(req, res) {
        try {
            const { userId } = req.params;
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
                where: { user_id: parseInt(userId) }
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = enrollments.map(enrollment => ({
                ...enrollment,
                progress: enrollment.progress ? JSON.parse(enrollment.progress) : []
            }));

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'User enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting user enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user enrollments',
                error: error.message
            });
        }
    }

    static async getMyEnrollment(req, res) {
        try {
            const userId = req.user.userId;
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
                where: { user_id: parseInt(userId) }
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = enrollments.map(enrollment => ({
                ...enrollment,
                progress: enrollment.progress ? JSON.parse(enrollment.progress) : []
            }));

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'User enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting user enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user enrollments',
                error: error.message
            });
        }
    }

    static async getCheckMyEnrollment(req, res) {
        try {
            const userId = req.user.userId;
            const programId = req.params.programId;
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
                where: { user_id: parseInt(userId), program_id: parseInt(programId) }
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = enrollments.map(enrollment => ({
                ...enrollment,
                progress: enrollment.progress ? JSON.parse(enrollment.progress) : []
            }));

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'User enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting user enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user enrollments',
                error: error.message
            });
        }
    }

    static async createEnrollment(req, res) {
        try {
            const { user_id, program_id } = req.body;
            const start_at = new Date();
            const complete_at = null;

            // Validate required fields
            if (!user_id || !program_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: user_id, program_id'
                });
            }

            const enrollRepository = AppDataSource.getRepository(Enroll);
            const contentRepository = AppDataSource.getRepository(Content);

            // Check if enrollment already exists
            const existingEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(user_id),
                    program_id: parseInt(program_id)
                }
            });

            if (existingEnrollment) {
                return res.status(409).json({
                    success: false,
                    message: 'User is already enrolled in this program'
                });
            }

            // Get all content for this program to create progress array
            const programContents = await contentRepository.find({
                where: { program_id: parseInt(program_id) },
                order: { orders: 'ASC' }
            });

            // Create progress array with all content items set to not completed
            const progressArray = programContents.map(content => ({
                content_id: content.content_id,
                complete: false
            }));

            // Create new enrollment
            const newEnrollment = enrollRepository.create({
                user_id: parseInt(user_id),
                program_id: parseInt(program_id),
                start_at: start_at || new Date(),
                complete_at: complete_at || null,
                progress: JSON.stringify(progressArray)
            });

            const savedEnrollment = await enrollRepository.save(newEnrollment);

            // Fetch the complete enrollment with relations
            const completeEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: savedEnrollment.user_id,
                    program_id: savedEnrollment.program_id
                },
            });

            // Parse progress JSON before returning
            const parsedEnrollment = {
                ...completeEnrollment,
                progress: completeEnrollment.progress ? JSON.parse(completeEnrollment.progress) : []
            };

            res.status(201).json({
                success: true,
                data: parsedEnrollment,
                message: 'Enrollment created successfully'
            });
        } catch (error) {
            console.error('Error creating enrollment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create enrollment',
                error: error.message
            });
        }
    }

    static async updateEnrollmentEndDate(req, res) {
        try {
            const { userId, programId } = req.params;
            const { complete_at } = req.body;

            // Validate required fields
            if (!userId || !programId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: userId, programId'
                });
            }

            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Check if enrollment exists
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Enrollment not found'
                });
            }

            // Parse current progress
            const currentProgress = enrollment.progress ? JSON.parse(enrollment.progress) : [];
            
            // If completion date is being set, mark all content as complete
            let updatedProgress = currentProgress;
            if (complete_at) {
                updatedProgress = currentProgress.map(item => ({
                    ...item,
                    complete: true
                }));
            }

            // Update enrollment end date
            await enrollRepository.update(
                {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                },
                {
                    complete_at: complete_at ? new Date(complete_at) : new Date(),
                    progress: JSON.stringify(updatedProgress)
                }
            );

            // Fetch updated enrollment
            const updatedEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            // Parse progress JSON before returning
            const parsedEnrollment = {
                ...updatedEnrollment,
                progress: updatedEnrollment.progress ? JSON.parse(updatedEnrollment.progress) : []
            };

            res.status(200).json({
                success: true,
                data: parsedEnrollment,
                message: 'Enrollment end date updated successfully'
            });
        } catch (error) {
            console.error('Error updating enrollment end date:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update enrollment end date',
                error: error.message
            });
        }
    }

    /**
     * Get enrollments by program ID
     */
    static async getEnrollmentsByProgram(req, res) {
        try {
            const { programId } = req.params;
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
                where: { program_id: parseInt(programId) }
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = enrollments.map(enrollment => ({
                ...enrollment,
                progress: enrollment.progress ? JSON.parse(enrollment.progress) : []
            }));

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'Program enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting program enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve program enrollments',
                error: error.message
            });
        }
    }

    /**
     * Update content completion status
     */
    static async updateContentProgress(req, res) {
        try {
            const { userId, programId, contentId } = req.params;
            const { complete } = req.body;

            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Check if enrollment exists
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Enrollment not found'
                });
            }

            // Parse current progress
            const currentProgress = enrollment.progress ? JSON.parse(enrollment.progress) : [];
            
            // Update the specific content item
            const updatedProgress = currentProgress.map(item => {
                if (item.content_id === parseInt(contentId)) {
                    return { ...item, complete: complete };
                }
                return item;
            });

            // Check if all content is completed
            const allCompleted = updatedProgress.every(item => item.complete);
            const updateData = {
                progress: JSON.stringify(updatedProgress)
            };

            // If all content is completed, set completion date
            if (allCompleted && !enrollment.complete_at) {
                updateData.complete_at = new Date();
            }

            // Update enrollment
            await enrollRepository.update(
                {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                },
                updateData
            );

            // Fetch updated enrollment
            const updatedEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            // Parse progress JSON before returning
            const parsedEnrollment = {
                ...updatedEnrollment,
                progress: updatedEnrollment.progress ? JSON.parse(updatedEnrollment.progress) : []
            };

            res.status(200).json({
                success: true,
                data: parsedEnrollment,
                message: 'Content progress updated successfully'
            });
        } catch (error) {
            console.error('Error updating content progress:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update content progress',
                error: error.message
            });
        }
    }

    /**
     * Update enrollment progress
     */
    static async updateEnrollment(req, res) {
        try {
            const { userId, programId } = req.params;
            const { start_at, complete_at, progress } = req.body;

            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Check if enrollment exists
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Enrollment not found'
                });
            }

            // Update enrollment
            const updateData = {
                start_at: start_at || enrollment.start_at,
                complete_at: complete_at !== undefined ? complete_at : enrollment.complete_at
            };

            // Handle progress update
            if (progress !== undefined) {
                updateData.progress = typeof progress === 'string' ? progress : JSON.stringify(progress);
            }

            await enrollRepository.update(
                {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                },
                updateData
            );

            // Fetch updated enrollment with relations
            const updatedEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                },
            });

            // Parse progress JSON before returning
            const parsedEnrollment = {
                ...updatedEnrollment,
                progress: updatedEnrollment.progress ? JSON.parse(updatedEnrollment.progress) : []
            };

            res.status(200).json({
                success: true,
                data: parsedEnrollment,
                message: 'Enrollment updated successfully'
            });
        } catch (error) {
            console.error('Error updating enrollment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update enrollment',
                error: error.message
            });
        }
    }

    /**
     * Delete enrollment
     */
    static async deleteEnrollment(req, res) {
        try {
            const { userId, programId } = req.params;
            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Check if enrollment exists
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Enrollment not found'
                });
            }

            await enrollRepository.delete({
                user_id: parseInt(userId),
                program_id: parseInt(programId)
            });

            res.status(200).json({
                success: true,
                message: 'Enrollment deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete enrollment',
                error: error.message
            });
        }
    }

    /**
     * Get enrollments by progress range (now calculates completion percentage)
     */
    static async getEnrollmentsByProgressRange(req, res) {
        try {
            const { minProgress, maxProgress } = req.query;

            if (minProgress === undefined || maxProgress === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Both minProgress and maxProgress are required'
                });
            }

            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find();

            // Filter enrollments by calculated progress percentage
            const filteredEnrollments = enrollments.filter(enrollment => {
                if (!enrollment.progress) return false;
                
                const progressArray = JSON.parse(enrollment.progress);
                const completedCount = progressArray.filter(item => item.complete).length;
                const totalCount = progressArray.length;
                const progressPercentage = totalCount > 0 ? (completedCount / totalCount) : 0;

                return progressPercentage >= parseFloat(minProgress) && progressPercentage <= parseFloat(maxProgress);
            });

            // Parse progress and add percentage calculation
            const parsedEnrollments = filteredEnrollments.map(enrollment => {
                const progressArray = JSON.parse(enrollment.progress);
                const completedCount = progressArray.filter(item => item.complete).length;
                const totalCount = progressArray.length;
                const progressPercentage = totalCount > 0 ? (completedCount / totalCount) : 0;

                return {
                    ...enrollment,
                    progress: progressArray,
                    progressPercentage: progressPercentage
                };
            }).sort((a, b) => b.progressPercentage - a.progressPercentage);

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'Enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting enrollments by progress range:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve enrollments',
                error: error.message
            });
        }
    }

    /**
     * Get completed enrollments
     */
    static async getCompletedEnrollments(req, res) {
        try {
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
                where: { complete_at: AppDataSource.createQueryBuilder().where('complete_at IS NOT NULL') },
            });

            // Filter to only include truly completed enrollments (all content completed)
            const completedEnrollments = enrollments.filter(enrollment => {
                if (!enrollment.progress) return false;
                const progressArray = JSON.parse(enrollment.progress);
                return progressArray.every(item => item.complete);
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = completedEnrollments.map(enrollment => ({
                ...enrollment,
                progress: JSON.parse(enrollment.progress)
            }));

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'Completed enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting completed enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve completed enrollments',
                error: error.message
            });
        }
    }

    /**
     * Get in-progress enrollments
     */
    static async getInProgressEnrollments(req, res) {
        try {
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find();

            // Filter to only include in-progress enrollments (some but not all content completed)
            const inProgressEnrollments = enrollments.filter(enrollment => {
                if (!enrollment.progress) return false;
                const progressArray = JSON.parse(enrollment.progress);
                const completedCount = progressArray.filter(item => item.complete).length;
                return completedCount > 0 && completedCount < progressArray.length;
            });

            // Parse progress and add percentage calculation
            const parsedEnrollments = inProgressEnrollments.map(enrollment => {
                const progressArray = JSON.parse(enrollment.progress);
                const completedCount = progressArray.filter(item => item.complete).length;
                const totalCount = progressArray.length;
                const progressPercentage = totalCount > 0 ? (completedCount / totalCount) : 0;

                return {
                    ...enrollment,
                    progress: progressArray,
                    progressPercentage: progressPercentage
                };
            }).sort((a, b) => b.progressPercentage - a.progressPercentage);

            res.status(200).json({
                success: true,
                data: parsedEnrollments,
                message: 'In-progress enrollments retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting in-progress enrollments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve in-progress enrollments',
                error: error.message
            });
        }
    }
}

module.exports = EnrollController;
