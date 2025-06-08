/**
 * Program Controller using TypeORM
 * CRUD operations for Programs table
 */
const AppDataSource = require('../src/data-source');
const Program = require('../src/entities/Program');

class ProgramController {
    /**
     * Get all programs
     */
    static async getAllPrograms(req, res) {
        try {
            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.find({
                relations: ['creator', 'category', 'enrollments', 'contents']
            });

            res.status(200).json({
                success: true,
                data: programs,
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
     * Get programs by creator ID
     */
    static async getProgramsByCreator(req, res) {
        try {
            const { creatorId } = req.params;
            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.find({
                where: { create_by: parseInt(creatorId) },
                relations: ['creator', 'category', 'enrollments']
            });

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting programs by creator:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs',
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
                relations: ['creator', 'category', 'enrollments']
            });

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting programs by category:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs',
                error: error.message
            });
        }
    }

    /**
     * Get programs by status
     */
    static async getProgramsByStatus(req, res) {
        try {
            const { status } = req.params;
            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.find({
                where: { status },
                relations: ['creator', 'category', 'enrollments']
            });

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting programs by status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs',
                error: error.message
            });
        }
    }

    /**
     * Get programs by age group
     */
    static async getProgramsByAgeGroup(req, res) {
        try {
            const { ageGroup } = req.params;
            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.find({
                where: { age_group: ageGroup },
                relations: ['creator', 'category', 'enrollments']
            });

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting programs by age group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve programs',
                error: error.message
            });
        }
    }

    /**
     * Create new program
     */
    static async createProgram(req, res) {
        try {
            const { title, description, create_by, status, age_group, category_id } = req.body;

            // Validate required fields
            if (!title || !create_by) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: title, create_by'
                });
            }

            const programRepository = AppDataSource.getRepository(Program);

            // Create new program
            const newProgram = programRepository.create({
                title,
                description,
                create_by: parseInt(create_by),
                status: status || 'draft',
                age_group,
                create_at: new Date(),
                category_id: category_id ? parseInt(category_id) : null
            });

            const savedProgram = await programRepository.save(newProgram);

            // Fetch the complete program with relations
            const completeProgram = await programRepository.findOne({
                where: { program_id: savedProgram.program_id },
                relations: ['creator', 'category']
            });

            res.status(201).json({
                success: true,
                data: completeProgram,
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
            const { title, description, status, age_group, category_id } = req.body;

            const programRepository = AppDataSource.getRepository(Program);

            // Check if program exists
            const program = await programRepository.findOne({
                where: { program_id: parseInt(id) }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            // Update program
            await programRepository.update(parseInt(id), {
                title: title || program.title,
                description: description !== undefined ? description : program.description,
                status: status || program.status,
                age_group: age_group !== undefined ? age_group : program.age_group,
                category_id: category_id !== undefined ? (category_id ? parseInt(category_id) : null) : program.category_id
            });

            // Fetch updated program with relations
            const updatedProgram = await programRepository.findOne({
                where: { program_id: parseInt(id) },
                relations: ['creator', 'category', 'enrollments']
            });

            res.status(200).json({
                success: true,
                data: updatedProgram,
                message: 'Program updated successfully'
            });
        } catch (error) {
            console.error('Error updating program:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update program',
                error: error.message
            });
        }
    }

    /**
     * Delete program
     */
    static async deleteProgram(req, res) {
        try {
            const { id } = req.params;
            const programRepository = AppDataSource.getRepository(Program);

            // Check if program exists
            const program = await programRepository.findOne({
                where: { program_id: parseInt(id) }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            await programRepository.delete(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Program deleted successfully'
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
     * Search programs by title or description
     */
    static async searchPrograms(req, res) {
        try {
            const { query } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const programRepository = AppDataSource.getRepository(Program);
            const programs = await programRepository.createQueryBuilder('program')
                .leftJoinAndSelect('program.creator', 'creator')
                .leftJoinAndSelect('program.category', 'category')
                .leftJoinAndSelect('program.enrollments', 'enrollments')
                .where('program.title LIKE :query', { query: `%${query}%` })
                .orWhere('program.description LIKE :query', { query: `%${query}%` })
                .orderBy('program.create_at', 'DESC')
                .getMany();

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error searching programs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search programs',
                error: error.message
            });
        }
    }

    /**
     * Get program statistics
     */
    static async getProgramStatistics(req, res) {
        try {
            const { id } = req.params;
            const programRepository = AppDataSource.getRepository(Program);

            const program = await programRepository.findOne({
                where: { program_id: parseInt(id) },
                relations: ['enrollments']
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Program not found'
                });
            }

            const totalEnrollments = program.enrollments.length;
            const completedEnrollments = program.enrollments.filter(e => e.progress === 1.0).length;
            const inProgressEnrollments = program.enrollments.filter(e => e.progress > 0 && e.progress < 1.0).length;
            const notStartedEnrollments = program.enrollments.filter(e => e.progress === 0).length;

            const averageProgress = totalEnrollments > 0
                ? program.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments
                : 0;

            const statistics = {
                program_id: program.program_id,
                title: program.title,
                total_enrollments: totalEnrollments,
                completed_enrollments: completedEnrollments,
                in_progress_enrollments: inProgressEnrollments,
                not_started_enrollments: notStartedEnrollments,
                completion_rate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
                average_progress: averageProgress * 100
            };

            res.status(200).json({
                success: true,
                data: statistics,
                message: 'Program statistics retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting program statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve program statistics',
                error: error.message
            });
        }
    }

    /**
     * Get recent programs
     */
    static async getRecentPrograms(req, res) {
        try {
            const { limit = 10 } = req.query;
            const programRepository = AppDataSource.getRepository(Program);

            const programs = await programRepository.find({
                relations: ['creator', 'category', 'enrollments'],
                order: { create_at: 'DESC' },
                take: parseInt(limit)
            });

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Recent programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting recent programs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recent programs',
                error: error.message
            });
        }
    }

    /**
     * Get popular programs (by enrollment count)
     */
    static async getPopularPrograms(req, res) {
        try {
            const { limit = 10 } = req.query;
            const programRepository = AppDataSource.getRepository(Program);

            const programs = await programRepository.createQueryBuilder('program')
                .leftJoinAndSelect('program.creator', 'creator')
                .leftJoinAndSelect('program.category', 'category')
                .leftJoinAndSelect('program.enrollments', 'enrollments')
                .addSelect('COUNT(enrollments.user_id)', 'enrollment_count')
                .groupBy('program.program_id')
                .addGroupBy('creator.user_id')
                .addGroupBy('category.category_id')
                .orderBy('enrollment_count', 'DESC')
                .limit(parseInt(limit))
                .getMany();

            res.status(200).json({
                success: true,
                data: programs,
                message: 'Popular programs retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting popular programs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve popular programs',
                error: error.message
            });
        }
    }
}

module.exports = ProgramController;
