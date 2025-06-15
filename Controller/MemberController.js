/**
 * Member Management Controller using TypeORM
 * Manages member operations using Users and Profile tables based on ERD diagram
 * 
 * ERD Schema:
 * Users: user_id, date_create, role, password, status, email  
 * Profile: user_id, name, bio_json, date_of_birth, job
 */
const AppDataSource = require('../src/data-source');
const User = require('../src/entities/User');
const Profile = require('../src/entities/Profile');
const bcrypt = require('bcryptjs');

class MemberController {
    /**
     * GET /api/members - Get all members
     * Returns users with member role and their profile information
     */
    static async getAllMembers(req, res) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Get all member users
            const memberUsers = await userRepository.find({
                where: { role: 'member' }
            });

            // Get profile information for each member
            const membersWithProfiles = await Promise.all(
                memberUsers.map(async (user) => {
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
                data: membersWithProfiles,
                message: 'Members retrieved successfully',
                count: membersWithProfiles.length
            });
        } catch (error) {
            console.error('Error getting members:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve members',
                error: error.message
            });
        }
    }    /**
     * GET /api/members/{memberId} - Get member by ID
     * Returns a specific member and their profile information
     */
    static async getMemberById(req, res) {
        try {
            const { memberId } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Find the member user
            const user = await userRepository.findOne({
                where: { user_id: parseInt(memberId), role: 'member' }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            // Get profile information
            const profile = await profileRepository.findOne({
                where: { user_id: user.user_id }
            });

            // Convert bio_json from text to JSON if it exists
            if (profile && profile.bio_json) {
                try {
                    profile.bio_json = JSON.parse(profile.bio_json);
                } catch (error) {
                    console.warn(`Failed to parse bio_json for user ${user.user_id}:`, error);
                }
            }

            res.status(200).json({
                success: true,
                data: {
                    ...user,
                    profile: profile || null
                },
                message: 'Member retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting member:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve member',
                error: error.message
            });
        }
    }    /**
     * POST /api/members - Create new member
     * Creates a new user with member role and optional profile
     * ERD Compliant: Only uses email, password, role, status from Users table
     * and name, bio_json, date_of_birth, job from Profile table
     */
    static async createMember(req, res) {
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

            // Create new user (ERD compliant)
            const newUser = userRepository.create({
                email,
                password: await bcrypt.hash(password, 10),
                role: 'member',
                status
                // date_create is handled by database default
            });

            const savedUser = await userRepository.save(newUser);

            // Create profile if profile data provided (ERD compliant fields only)
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
                message: 'Member created successfully'
            });
        } catch (error) {
            // Rollback transaction on any error
            await queryRunner.rollbackTransaction();
            console.error('Error creating member:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create member',
                error: error.message
            });
        } finally {
            // Release query runner resources
            await queryRunner.release();
        }
    }    /**
     * PUT /api/members/{memberId} - Update member by ID  
     * Updates both user and profile information
     * ERD Compliant: Only uses fields that exist in ERD schema
     */
    static async updateMember(req, res) {
        try {
            const { memberId } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Find the member user
            const user = await userRepository.findOne({
                where: { user_id: parseInt(memberId) }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            // Verify user is member
            if (user.role.toLowerCase() !== 'member') {
                return res.status(400).json({
                    success: false,
                    message: 'User is not a member'
                });
            }

            const {
                // Users table fields (ERD compliant)
                email,
                password,
                status,
                // Profile table fields (ERD compliant)
                name,
                bio_json,
                date_of_birth,
                job
            } = req.body;

            // Update user fields if provided
            if (email !== undefined) user.email = email;
            if (password !== undefined) user.password = await bcrypt.hash(password, 10);
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

                if (duplicateCheck && duplicateCheck.user_id !== parseInt(memberId)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }

            const updatedUser = await userRepository.save(user);

            // Update or create profile
            let updatedProfile = await profileRepository.findOne({
                where: { user_id: parseInt(memberId) }
            });

            const hasProfileData = name !== undefined || bio_json !== undefined ||
                date_of_birth !== undefined || job !== undefined;

            if (hasProfileData) {
                // Handle bio_json as string
                let bioJsonString = undefined;
                if (bio_json !== undefined) {
                    bioJsonString = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
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
                        user_id: parseInt(memberId),
                        name,
                        bio_json: bioJsonString,
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
                message: 'Member updated successfully'
            });
        } catch (error) {
            console.error('Error updating member:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update member',
                error: error.message
            });
        }
    }    /**
     * DELETE /api/members/{memberId} - Delete member by ID
     * Deletes both user and associated profile
     */
    static async deleteMember(req, res) {
        try {
            const { memberId } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            // Find the member user
            const user = await userRepository.findOne({
                where: { user_id: parseInt(memberId) }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            // Verify user is member
            if (user.role.toLowerCase() !== 'member') {
                return res.status(400).json({
                    success: false,
                    message: 'User is not a member'
                });
            }

            // Delete profile first (if exists) due to foreign key constraint
            const profile = await profileRepository.findOne({
                where: { user_id: parseInt(memberId) }
            });

            if (profile) {
                await profileRepository.remove(profile);
            }

            // Delete user
            await userRepository.remove(user);

            res.status(200).json({
                success: true,
                message: 'Member deleted successfully',
                data: {
                    deleted_user_id: parseInt(memberId),
                    deleted_profile: profile ? true : false
                }
            });
        } catch (error) {
            console.error('Error deleting member:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete member',
                error: error.message
            });
        }
    }

    /**
     * GET /api/members/search/{memberName} - Search members by name
     * Searches for members by email or name in profile
     */
    static async searchMembersByName(req, res) {
        try {
            const { memberName } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            if (!memberName || memberName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Member name parameter is required'
                });
            }

            const searchTerm = `%${memberName.trim()}%`;

            // Search users by email with member role
            const usersByEmail = await userRepository
                .createQueryBuilder('user')
                .where('user.role = :role', { role: 'member' })
                .andWhere('user.email LIKE :searchTerm', { searchTerm })
                .getMany();

            // Search profiles by name and get associated users with member role
            const profilesByName = await profileRepository
                .createQueryBuilder('profile')
                .leftJoin('profile.user', 'user')
                .where('user.role = :role', { role: 'member' })
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

                    // Convert bio_json from text to JSON if it exists
                    if (profile && profile.bio_json) {
                        try {
                            profile.bio_json = JSON.parse(profile.bio_json);
                        } catch (error) {
                            console.warn(`Failed to parse bio_json for user ${user.user_id}:`, error);
                        }
                    }

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
                        // Convert bio_json from text to JSON if it exists
                        if (profile && profile.bio_json) {
                            try {
                                profile.bio_json = JSON.parse(profile.bio_json);
                            } catch (error) {
                                console.warn(`Failed to parse bio_json for user ${user.user_id}:`, error);
                            }
                        }

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
                message: `Found ${combinedResults.length} member(s) matching "${memberName}"`,
                searchTerm: memberName,
                count: combinedResults.length
            });
        } catch (error) {
            console.error('Error searching members by name:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search members by name',
                error: error.message
            });
        }
    }

    /**
     * Helper method - Get member statistics
     */
    static async getMemberStatistics(req, res) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            const totalMembers = await userRepository.count({
                where: { role: 'member' }
            });

            const activeMembers = await userRepository.count({
                where: { role: 'member', status: 'active' }
            });

            const inactiveMembers = await userRepository.count({
                where: { role: 'member', status: 'inactive' }
            });

            const bannedMembers = await userRepository.count({
                where: { role: 'member', status: 'banned' }
            });

            // Count members with profiles
            const membersWithProfiles = await profileRepository
                .createQueryBuilder('profile')
                .leftJoin('profile.user', 'user')
                .where('user.role = :role', { role: 'member' })
                .getCount();

            res.status(200).json({
                success: true,
                data: {
                    totalMembers,
                    activeMembers,
                    inactiveMembers,
                    bannedMembers,
                    membersWithProfiles,
                    membersWithoutProfiles: totalMembers - membersWithProfiles
                },
                message: 'Member statistics retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting member statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve member statistics',
                error: error.message
            });
        }
    }
}

module.exports = MemberController; 