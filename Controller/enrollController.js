/**
 * Enroll Controller using TypeORM
 * CRUD operations for Enroll table
 */
const AppDataSource = require('../src/data-source');
const Enroll = require('../src/entities/Enroll');

class EnrollController {
    /**
     * Get all enrollments
     */
    static async getAllEnrollments(req, res) {
        try {
            const enrollRepository = AppDataSource.getRepository(Enroll);
            const enrollments = await enrollRepository.find({
            });

            res.status(200).json({
                success: true,
                data: enrollments,
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

            res.status(200).json({
                success: true,
                data: enrollment,
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

            res.status(200).json({
                success: true,
                data: enrollments,
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

            res.status(200).json({
                success: true,
                data: enrollments,
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
     * Create new enrollment
     */
    static async createEnrollment(req, res) {
        try {
            const { user_id, program_id, start_at, complete_at, progress } = req.body;

            // Validate required fields
            if (!user_id || !program_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: user_id, program_id'
                });
            }

            const enrollRepository = AppDataSource.getRepository(Enroll);

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

            // Create new enrollment
            const newEnrollment = enrollRepository.create({
                user_id: parseInt(user_id),
                program_id: parseInt(program_id),
                start_at: start_at || new Date(),
                complete_at: complete_at || null,
                progress: progress || 0.0
            });

            const savedEnrollment = await enrollRepository.save(newEnrollment);

            // Fetch the complete enrollment with relations
            const completeEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: savedEnrollment.user_id,
                    program_id: savedEnrollment.program_id
                },
            });

            res.status(201).json({
                success: true,
                data: completeEnrollment,
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
            await enrollRepository.update(
                {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                },
                {
                    start_at: start_at || enrollment.start_at,
                    complete_at: complete_at !== undefined ? complete_at : enrollment.complete_at,
                    progress: progress !== undefined ? progress : enrollment.progress
                }
            );

            // Fetch updated enrollment with relations
            const updatedEnrollment = await enrollRepository.findOne({
                where: {
                    user_id: parseInt(userId),
                    program_id: parseInt(programId)
                },
            });

            res.status(200).json({
                success: true,
                data: updatedEnrollment,
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
     * Get enrollments by progress range
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
            const enrollments = await enrollRepository.createQueryBuilder('enroll')
                .leftJoinAndSelect('enroll.user', 'user')
                .leftJoinAndSelect('enroll.program', 'program')
                .where('enroll.progress >= :minProgress', { minProgress: parseFloat(minProgress) })
                .andWhere('enroll.progress <= :maxProgress', { maxProgress: parseFloat(maxProgress) })
                .orderBy('enroll.progress', 'DESC')
                .getMany();

            res.status(200).json({
                success: true,
                data: enrollments,
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
                where: { progress: 1.0 },
            });

            res.status(200).json({
                success: true,
                data: enrollments,
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
            const enrollments = await enrollRepository.createQueryBuilder('enroll')
                .leftJoinAndSelect('enroll.user', 'user')
                .leftJoinAndSelect('enroll.program', 'program')
                .where('enroll.progress > 0 AND enroll.progress < 1')
                .orderBy('enroll.progress', 'DESC')
                .getMany();

            res.status(200).json({
                success: true,
                data: enrollments,
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
