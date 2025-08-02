/**
 * Enroll Controller using TypeORM
 * CRUD operations for Enroll table
 */
const AppDataSource = require('../src/data-source');
const Enroll = require('../src/entities/Enroll');
const Content = require('../src/entities/Content');

class EnrollController {
    /**
     * Helper function to safely parse progress JSON
     */
    static parseProgress(progressString) {
        try {
            return progressString ? JSON.parse(progressString) : [];
        } catch (err) {
            console.error('Error parsing progress JSON:', err);
            return [];
        }
    }

    /**
     * Helper function to safely parse enrollment data
     */
    static parseEnrollment(enrollment) {
        return {
            ...enrollment,
            progress: EnrollController.parseProgress(enrollment.progress)
        };
    }

    /**
     * Helper function to safely parse multiple enrollments
     */
    static parseEnrollments(enrollments) {
        return enrollments.map(enrollment => EnrollController.parseEnrollment(enrollment));
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
            const parsedEnrollment = EnrollController.parseEnrollment(enrollment);

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

    static async getMyEnrollment(req, res) {
        try {
            const userId = req.user.userId;
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
                where: { user_id: parseInt(userId) }
            });

            // Parse progress JSON for each enrollment
            const parsedEnrollments = EnrollController.parseEnrollments(enrollments);

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
            const parsedEnrollments = EnrollController.parseEnrollments(enrollments);

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
            const { program_id } = req.body;
            const userId = req.user.userId;
            const start_at = new Date();
            const complete_at = null;

            // Validate required fields
            if (!userId || !program_id) {
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
                    user_id: parseInt(userId),
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
                user_id: parseInt(userId),
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
            const parsedEnrollment = EnrollController.parseEnrollment(completeEnrollment);

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

    /**
     * Toggle content completion status (flip from false to true or true to false)
     * This is a convenience method for simple toggling
     */
    static async toggleContentCompletion(req, res) {
        try {
            const { enrollId, contentId } = req.params;

            // Parse composite enroll_id (format: "userId_programId")
            const enrollIdParts = enrollId.split('_');
            if (enrollIdParts.length !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid enroll_id format. Expected format: "userId_programId" (e.g., "6_2")'
                });
            }

            const userId = parseInt(enrollIdParts[0]);
            const programId = parseInt(enrollIdParts[1]);

            if (isNaN(userId) || isNaN(programId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid enroll_id. Both userId and programId must be valid numbers'
                });
            }

            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Check if enrollment exists
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: userId,
                    program_id: programId
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: `Enrollment not found for enroll_id: ${enrollId}`
                });
            }

            // Parse current progress
            const currentProgress = EnrollController.parseProgress(enrollment.progress);
            
            // Find the content item and toggle its completion status
            let contentFound = false;
            let newCompletionStatus = false;
            
            const updatedProgress = currentProgress.map(item => {
                if (item.content_id === parseInt(contentId)) {
                    contentFound = true;
                    newCompletionStatus = !item.complete;
                    return { ...item, complete: newCompletionStatus };
                }
                return item;
            });

            if (!contentFound) {
                return res.status(404).json({
                    success: false,
                    message: `Content with ID ${contentId} not found in enrollment progress`
                });
            }

            // Check if all content is completed
            const allCompleted = updatedProgress.every(item => item.complete);
            const updateData = {
                progress: JSON.stringify(updatedProgress)
            };

            // If all content is completed, set completion date
            if (allCompleted && !enrollment.complete_at) {
                updateData.complete_at = new Date();
            }
            // If not all completed but was previously completed, remove completion date
            else if (!allCompleted && enrollment.complete_at) {
                updateData.complete_at = null;
            }

            // Update enrollment
            await enrollRepository.update(
                {
                    user_id: userId,
                    program_id: programId
                },
                updateData
            );

            // Fetch updated enrollment
            const updatedEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: userId,
                    program_id: programId
                }
            });

            // Parse progress JSON before returning
            const parsedEnrollment = EnrollController.parseEnrollment(updatedEnrollment);

            // Calculate progress percentage for response
            const completedCount = parsedEnrollment.progress.filter(item => item.complete).length;
            const totalCount = parsedEnrollment.progress.length;
            const progressPercentage = totalCount > 0 ? (completedCount / totalCount) : 0;

            res.status(200).json({
                success: true,
                data: {
                    ...parsedEnrollment,
                    enroll_id: enrollId,
                    progressPercentage: Math.round(progressPercentage * 100),
                    completedContent: completedCount,
                    totalContent: totalCount
                },
                message: `Content ${contentId} toggled to ${newCompletionStatus ? 'completed' : 'incomplete'}`
            });
        } catch (error) {
            console.error('Error toggling content completion:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle content completion status',
                error: error.message
            });
        }
    }

    /**
     * Update enrollment completion date using composite enroll_id
     * enroll_id format: "userId_programId" (e.g., "6_2" for user 6 in program 2)
     * Sets complete_at to current timestamp and marks all content as completed
     */
    static async updateEnrollmentCompletionById(req, res) {
        try {
            const { enrollId } = req.params;

            // Parse composite enroll_id (format: "userId_programId")
            const enrollIdParts = enrollId.split('_');
            if (enrollIdParts.length !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid enroll_id format. Expected format: "userId_programId" (e.g., "6_2")'
                });
            }

            const userId = parseInt(enrollIdParts[0]);
            const programId = parseInt(enrollIdParts[1]);

            if (isNaN(userId) || isNaN(programId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid enroll_id. Both userId and programId must be valid numbers'
                });
            }

            const enrollRepository = AppDataSource.getRepository(Enroll);

            // Check if enrollment exists
            const enrollment = await enrollRepository.findOne({
                where: {
                    user_id: userId,
                    program_id: programId
                }
            });

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: `Enrollment not found for enroll_id: ${enrollId}`
                });
            }

            // Parse current progress and mark all content as completed
            const currentProgress = EnrollController.parseProgress(enrollment.progress);
            const updatedProgress = currentProgress.map(item => ({
                ...item,
                complete: true
            }));

            // Update enrollment with current timestamp and completed progress
            const currentTime = new Date();
            await enrollRepository.update(
                {
                    user_id: userId,
                    program_id: programId
                },
                {
                    complete_at: currentTime,
                    progress: JSON.stringify(updatedProgress)
                }
            );

            // Fetch updated enrollment
            const updatedEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: userId,
                    program_id: programId
                }
            });

            // Parse progress JSON before returning
            const parsedEnrollment = EnrollController.parseEnrollment(updatedEnrollment);

            // Calculate progress percentage for response
            const completedCount = parsedEnrollment.progress.filter(item => item.complete).length;
            const totalCount = parsedEnrollment.progress.length;
            const progressPercentage = totalCount > 0 ? (completedCount / totalCount) : 0;

            res.status(200).json({
                success: true,
                data: {
                    ...parsedEnrollment,
                    enroll_id: enrollId,
                    progressPercentage: Math.round(progressPercentage * 100),
                    completedContent: completedCount,
                    totalContent: totalCount
                },
                message: `Enrollment ${enrollId} marked as completed successfully`
            });
        } catch (error) {
            console.error('Error updating enrollment completion:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update enrollment completion',
                error: error.message
            });
        }
    }

    /**
     * Delete enrollment for current user (more secure version)
     * Gets user ID from token instead of path parameter
     */
    static async deleteMyEnrollment(req, res) {
        try {
            const { programId } = req.params;
            const userId = req.user.userId; // Get user ID from token
            
            if (!programId) {
                return res.status(400).json({
                    success: false,
                    message: 'Program ID is required'
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
                    message: 'Enrollment not found. You are not enrolled in this program.'
                });
            }

            // Delete the enrollment
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
}

module.exports = EnrollController;
