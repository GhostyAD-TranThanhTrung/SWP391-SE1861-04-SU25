/**
 * Staff Management Controller using TypeORM
 * Manages staff operations using Users and Profile tables based on ERD diagram
 * 
 * ERD Schema:
 * Users: user_id, date_create, role, password, status, email  
 * Profile: user_id, name, bio_json, date_of_birth, job
 */
const AppDataSource = require('../src/data-source');
const User = require('../src/entities/User');
const Profile = require('../src/entities/Profile');

class StaffController {
    /**
     * GET /api/staff - Get all staff information
     * Returns users with staff roles (admin, consultant) and their profile information
     */
    static async getAllStaff(req, res) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Get all staff users (admin and consultant roles)
            const staffUsers = await userRepository.find({
                where: [
                    { role: 'admin' },
                    { role: 'consultant' }
                ]
            });            // Get profile information for each staff member
            const staffWithProfiles = await Promise.all(
                staffUsers.map(async (user) => {
                    const profile = await profileRepository.findOne({
                        where: { user_id: user.user_id }
                    });

                    // Convert bio_json from text to JSON if it exists
                    if (profile && profile.bio_json) {
                        try {
                            profile.bio_json = JSON.parse(profile.bio_json);
                        } catch (error) {
                            // If parsing fails, keep as string
                            console.warn(`Failed to parse bio_json for user ${user.user_id}:`, error);
                        }
                    }

                    return {
                        ...user,
                        profile: profile || null
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: staffWithProfiles,
                message: 'Staff retrieved successfully',
                count: staffWithProfiles.length
            });
        } catch (error) {
            console.error('Error getting staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve staff',
                error: error.message
            });
        }
    }

    /**
     * POST /api/staff - Create new staff
     * Creates a new user with staff role and optional profile
     * ERD Compliant: Only uses email, password, role, status from Users table
     * and name, bio_json, date_of_birth, job from Profile table
     */    static async createStaff(req, res) {
        // Start database transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userRepository = queryRunner.manager.getRepository(User);
            const profileRepository = queryRunner.manager.getRepository(Profile);

            const {
                // Users table fields (ERD compliant)
                email,
                password,
                role,
                status = 'active',
                // Profile table fields (ERD compliant)
                name,
                bio_json,
                date_of_birth,
                job
            } = req.body;

            // Validate required fields
            if (!email || !password) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Validate role is staff role
            if (!['admin', 'consultant'].includes(role)) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Role must be admin or consultant for staff creation'
                });
            }

            // Validate status
            if (!['active', 'inactive', 'banned'].includes(status)) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Status must be active, inactive, or banned'
                });
            }

            // Check if email already exists
            const existingUser = await userRepository.findOne({
                where: { email: email }
            });

            if (existingUser) {
                await queryRunner.rollbackTransaction();
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Create new user (ERD compliant - no username field)
            const newUser = userRepository.create({
                email,
                password, // Note: In production, password should be hashed
                role,
                status
                // date_create is handled by database default
            });

            const savedUser = await userRepository.save(newUser);            // Create profile if profile data provided (ERD compliant fields only)
            let savedProfile = null;
            if (name || bio_json || date_of_birth || job) {
                // Store bio_json as string
                let bioJsonString = null;
                if (bio_json) {
                    bioJsonString = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
                }

                const newProfile = profileRepository.create({
                    user_id: savedUser.user_id,
                    name,
                    bio_json: bioJsonString,
                    date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                    job
                });

                savedProfile = await profileRepository.save(newProfile);
            }

            // Commit transaction if all operations successful
            await queryRunner.commitTransaction();

            res.status(201).json({
                success: true,
                data: {
                    user: savedUser,
                    profile: savedProfile
                },
                message: 'Staff created successfully'
            });
        } catch (error) {
            // Rollback transaction on any error
            await queryRunner.rollbackTransaction();
            console.error('Error creating staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create staff',
                error: error.message
            });
        } finally {
            // Release query runner resources
            await queryRunner.release();
        }
    }

    /**
     * PUT /api/staff/{staffId} - Update staff by ID  
     * Updates both user and profile information
     * ERD Compliant: Only uses fields that exist in ERD schema
     */
    static async updateStaff(req, res) {
        try {
            const { staffId } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Find the staff user
            const user = await userRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found'
                });
            }

            // Verify user is staff
            if (!['admin', 'consultant'].includes(user.role.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not a staff member'
                });
            }

            const {
                // Users table fields (ERD compliant)
                email,
                password,
                role,
                status,
                // Profile table fields (ERD compliant)
                name,
                bio_json,
                date_of_birth,
                job
            } = req.body;

            // Update user fields if provided
            if (email !== undefined) user.email = email;
            if (password !== undefined) user.password = password; // Note: Should be hashed in production
            if (role !== undefined) {
                if (!['admin', 'consultant'].includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Role must be admin or consultant'
                    });
                }
                user.role = role;
            }
            if (status !== undefined) {
                if (!['active', 'inactive', 'banned'].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Status must be active, inactive, or banned'
                    });
                }
                user.status = status;
            }

            // Check for duplicate email if being updated
            if (email) {
                const duplicateCheck = await userRepository.findOne({
                    where: { email: email }
                });

                if (duplicateCheck && duplicateCheck.user_id !== parseInt(staffId)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }

            const updatedUser = await userRepository.save(user);

            // Update or create profile
            let updatedProfile = await profileRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            const hasProfileData = name !== undefined || bio_json !== undefined ||
                date_of_birth !== undefined || job !== undefined;

            if (hasProfileData) {
                // Validate bio_json if provided
                let parsedBioJson = undefined;
                if (bio_json !== undefined) {
                    try {
                        parsedBioJson = typeof bio_json === 'string' ? JSON.parse(bio_json) : bio_json;
                    } catch (error) {
                        return res.status(400).json({
                            success: false,
                            message: 'Invalid JSON format for bio_json'
                        });
                    }
                }

                if (updatedProfile) {
                    // Update existing profile
                    if (name !== undefined) updatedProfile.name = name;
                    if (parsedBioJson !== undefined) updatedProfile.bio_json = parsedBioJson;
                    if (date_of_birth !== undefined) updatedProfile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
                    if (job !== undefined) updatedProfile.job = job;

                    updatedProfile = await profileRepository.save(updatedProfile);
                } else {
                    // Create new profile
                    const newProfile = profileRepository.create({
                        user_id: parseInt(staffId),
                        name,
                        bio_json: parsedBioJson,
                        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                        job
                    });

                    updatedProfile = await profileRepository.save(newProfile);
                }
            }

            res.status(200).json({
                success: true,
                data: {
                    user: updatedUser,
                    profile: updatedProfile
                },
                message: 'Staff updated successfully'
            });
        } catch (error) {
            console.error('Error updating staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update staff',
                error: error.message
            });
        }
    }    /**
     * DELETE /api/staff/{staffId} - Delete staff by ID
     * Deletes both user and associated profile
     */
    static async deleteStaff(req, res) {
        try {
            const { staffId } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Find the staff user
            const user = await userRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found'
                });
            }            // Verify user is staff
            if (!['admin', 'consultant'].includes(user.role.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not a staff member'
                });
            }

            // Delete profile first (if exists) due to foreign key constraint
            const profile = await profileRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            if (profile) {
                await profileRepository.remove(profile);
            }

            // Delete user
            await userRepository.remove(user);

            res.status(200).json({
                success: true,
                message: 'Staff deleted successfully',
                data: {
                    deleted_user_id: parseInt(staffId),
                    deleted_profile: profile ? true : false
                }
            });
        } catch (error) {
            console.error('Error deleting staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete staff',
                error: error.message
            });
        }
    }

    /**
     * GET /api/staff/{staffName} - Search staff by name
     * Searches for staff by email or name in profile
     */
    static async searchStaffByName(req, res) {
        try {
            const { staffName } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            if (!staffName || staffName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Staff name parameter is required'
                });
            }

            const searchTerm = `%${staffName.trim()}%`;

            // Search users by email with staff roles
            const usersByEmail = await userRepository
                .createQueryBuilder('user')
                .where('user.role IN (:...roles)', { roles: ['admin', 'consultant'] })
                .andWhere('user.email LIKE :searchTerm', { searchTerm })
                .getMany();

            // Search profiles by name and get associated users with staff roles
            const profilesByName = await profileRepository
                .createQueryBuilder('profile')
                .leftJoin('profile.user', 'user')
                .where('user.role IN (:...roles)', { roles: ['admin', 'consultant'] })
                .andWhere('profile.name LIKE :searchTerm', { searchTerm })
                .getMany();

            // Combine results and remove duplicates
            const foundUserIds = new Set();
            const combinedResults = [];

            // Add users found by email
            for (const user of usersByEmail) {
                if (!foundUserIds.has(user.user_id)) {
                    foundUserIds.add(user.user_id);
                    const profile = await profileRepository.findOne({
                        where: { user_id: user.user_id }
                    });
                    combinedResults.push({
                        ...user,
                        profile: profile || null
                    });
                }
            }

            // Add users found by profile name
            for (const profile of profilesByName) {
                if (!foundUserIds.has(profile.user_id)) {
                    foundUserIds.add(profile.user_id);
                    const user = await userRepository.findOne({
                        where: { user_id: profile.user_id }
                    });
                    if (user) {
                        combinedResults.push({
                            ...user,
                            profile: profile
                        });
                    }
                }
            }

            res.status(200).json({
                success: true,
                data: combinedResults,
                message: `Found ${combinedResults.length} staff member(s) matching "${staffName}"`,
                searchTerm: staffName,
                count: combinedResults.length
            });
        } catch (error) {
            console.error('Error searching staff by name:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search staff by name',
                error: error.message
            });
        }
    }

    /**
     * Helper method - Get staff statistics
     */
    static async getStaffStatistics(req, res) {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const totalStaff = await userRepository.count({
                where: [
                    { role: 'admin' },
                    { role: 'consultant' }
                ]
            });

            const activeStaff = await userRepository.count({
                where: [
                    { role: 'admin', status: 'active' },
                    { role: 'consultant', status: 'active' }
                ]
            });

            const adminCount = await userRepository.count({
                where: { role: 'admin' }
            });

            const consultantCount = await userRepository.count({
                where: { role: 'consultant' }
            });

            res.status(200).json({
                success: true,
                data: {
                    totalStaff,
                    activeStaff,
                    inactiveStaff: totalStaff - activeStaff,
                    adminCount,
                    consultantCount
                },
                message: 'Staff statistics retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting staff statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve staff statistics',
                error: error.message
            });
        }
    }
}

module.exports = StaffController;
