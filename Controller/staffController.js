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
const Program = require('../src/entities/Program');
const Flag = require('../src/entities/Flag');
const bcrypt = require('bcryptjs');

class StaffController {
    /**
     * GET /api/staff - Get all staff information
     * Returns users with staff roles (admin) and their profile information
     */
    static async getAllStaff(req, res) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Check if the requesting user is an admin (from verified token)
            const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'admin';

            // Get all staff users (admin and consultant roles)
            const staffUsers = await userRepository.find({
                where: [
                    { role: 'admin' },
                    { role: 'staff' },
                    { role: 'manager' }
                ]
            });

            // Get profile information for each staff member
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

                    const staffData = {
                        ...user,
                        profile: profile || null
                    };

                    // Include password only if the requesting user is an admin
                    if (!isAdmin) {
                        delete staffData.password;
                    }

                    return staffData;
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
     */
    static async createStaff(req, res) {
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
            if (!email || !password || !role) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Email, password, and role are required'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Validate password strength
            if (password.length < 6) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            // Validate role is staff/admin role
            if (!['staff', 'manager', 'admin'].includes(role)) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Role must be staff, manager, or admin for staff creation'
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
                password: password,
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

            // Prepare response data (exclude password)
            const { password: _, ...userWithoutPassword } = savedUser;

            // Parse bio_json if it exists in the saved profile
            if (savedProfile && savedProfile.bio_json) {
                try {
                    savedProfile.bio_json = JSON.parse(savedProfile.bio_json);
                } catch (error) {
                    // Keep as string if parsing fails
                    console.warn(`Failed to parse bio_json for new user ${savedUser.user_id}:`, error);
                }
            }

            res.status(201).json({
                success: true,
                data: {
                    ...userWithoutPassword,
                    profile: savedProfile
                },
                message: `Staff ${role} created successfully with email: ${email}`
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
            console.log('Update staff request received for ID:', staffId);
            console.log('Request body:', req.body);
            
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Validate staff ID
            if (!staffId || isNaN(parseInt(staffId))) {
                console.error('Invalid staff ID provided:', staffId);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid staff ID provided'
                });
            }

            // Find the staff user
            const user = await userRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            if (!user) {
                console.error('Staff not found for ID:', staffId);
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found'
                });
            }

            console.log('Staff found for update:', {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                status: user.status
            });

            // Verify user is staff
            if (!['admin', 'staff', 'manager'].includes(user.role.toLowerCase())) {
                console.error('User is not a staff member. User role:', user.role);
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
            if (password !== undefined && password.trim() !== "") {
                user.password = password;
            }
            if (role !== undefined) {
                if (!['staff', 'manager', 'admin'].includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Role must be staff, manager, or admin'
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

            console.log('Saving user updates...');
            const updatedUser = await userRepository.save(user);
            console.log('User updated successfully');

            // Update or create profile
            let updatedProfile = await profileRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            const hasProfileData = name !== undefined || bio_json !== undefined ||
                date_of_birth !== undefined || job !== undefined;
                
            console.log('Has profile data:', hasProfileData);
            console.log('Profile data:', { name, bio_json, date_of_birth, job });

            if (hasProfileData) {
                // Validate bio_json if provided
                let bioJsonString = undefined;

                if (bio_json !== undefined) {
                    try {
                        bioJsonString = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
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
                    if (bioJsonString !== undefined) updatedProfile.bio_json = bioJsonString;
                    if (date_of_birth !== undefined) updatedProfile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
                    if (job !== undefined) updatedProfile.job = job;

                    updatedProfile = await profileRepository.save(updatedProfile);
                } else {
                    // Create new profile
                    const newProfile = profileRepository.create({
                        user_id: parseInt(staffId),
                        name,
                        bio_json: bioJsonString,
                        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                        job
                    });

                    updatedProfile = await profileRepository.save(newProfile);
                }
            }

            console.log('Update completed successfully');
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
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Failed to update staff',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }    /**
     * DELETE /api/staff/{staffId} - Delete staff by ID or set to inactive if has programs/flags
     * Deletes both user and associated profile, or sets status to inactive if references exist
     */
    static async deleteStaff(req, res) {
        try {
            const { staffId } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);
            const programRepository = AppDataSource.getRepository(Program);
            const flagRepository = AppDataSource.getRepository(Flag);

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
            if (!['admin', 'staff', 'manager'].includes(user.role.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not a staff member'
                });
            }

            // Check if staff has any programs or flags
            const programs = await programRepository.find({
                where: { creator: { user_id: parseInt(staffId) } },
                relations: { creator: true }
            });

            const flags = await flagRepository.find({
                where: { user: { user_id: parseInt(staffId) } },
                relations: { user: true }
            });

            const totalReferences = programs.length + flags.length;

            // Start transaction to ensure data integrity
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                if (totalReferences > 0) {
                    // If staff has programs or flags, set user status to inactive instead of deleting
                    await queryRunner.manager.update(User, 
                        { user_id: parseInt(staffId) }, 
                        { status: "inactive" }
                    );

                    await queryRunner.commitTransaction();

                    res.status(200).json({
                        success: true,
                        message: `Staff has ${totalReferences} reference(s) (${programs.length} programs, ${flags.length} flags). User status set to inactive instead of deletion.`,
                        data: {
                            staff_id: parseInt(staffId),
                            user_id: parseInt(staffId),
                            action: "status_changed_to_inactive",
                            references: {
                                programs_count: programs.length,
                                flags_count: flags.length,
                                total_count: totalReferences
                            }
                        }
                    });

                } else {
                    // If no references, perform deletion in order: profile -> user
                    
                    // 1. Delete profile if exists
                    const profile = await queryRunner.manager.findOne(Profile, {
                        where: { user_id: parseInt(staffId) }
                    });
                    
                    if (profile) {
                        await queryRunner.manager.delete(Profile, { 
                            user_id: parseInt(staffId) 
                        });
                    }

                    // 2. Delete user
                    await queryRunner.manager.delete(User, { 
                        user_id: parseInt(staffId) 
                    });

                    await queryRunner.commitTransaction();

                    res.status(200).json({
                        success: true,
                        message: "Staff and all related data deleted successfully",
                        data: {
                            staff_id: parseInt(staffId),
                            user_id: parseInt(staffId),
                            action: "completely_deleted",
                            deleted_entities: {
                                profile: profile ? true : false,
                                user: true
                            }
                        }
                    });
                }

            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }

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
                .where('user.role IN (:...roles)', { roles: ['admin', 'staff', 'manager'] })
                .andWhere('user.email LIKE :searchTerm', { searchTerm })
                .getMany();

            // Search profiles by name and get associated users with staff roles
            const profilesByName = await profileRepository
                .createQueryBuilder('profile')
                .leftJoin('profile.user', 'user')
                .where('user.role IN (:...roles)', { roles: ['admin', 'staff', 'manager'] })
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
