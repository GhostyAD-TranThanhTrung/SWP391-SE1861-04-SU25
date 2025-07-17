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
const Assessment = require('../src/entities/Assessment');
const Blog = require('../src/entities/Blog');
const BookingSession = require('../src/entities/BookingSession');
const SurveyResponse = require('../src/entities/SurveyResponse');
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

            // Check if the requesting user is an admin (from verified token)
            const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'admin';

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

                    const memberData = {
                        ...user,
                        profile: profile || null
                    };

                    // Include password only if the requesting user is an admin
                    if (!isAdmin) {
                        delete memberData.password;
                    }

                    return memberData;
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
    }
    
    static async getFullMemberById(req, res) {
        try {
            const { memberId } = req.params;

            // Validate member ID
            if (!memberId || isNaN(parseInt(memberId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid member ID provided'
                });
            }

            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);
            const assessmentRepository = AppDataSource.getRepository(Assessment);

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
                    // Keep as string if parsing fails
                }
            }

            // Get assessments with Action relations (properly handle multiple assessments)
            const assessments = await assessmentRepository.find({
                where: { user_id: user.user_id },
                relations: {
                    action: true
                },
                order: {
                    create_at: 'DESC'
                }
            });

            // Format assessments data
            const formattedAssessments = assessments.map(assessment => ({
                assessment_id: assessment.assessment_id,
                type: assessment.type,
                result_json: assessment.result_json,
                create_at: assessment.create_at,
                action: assessment.action ? {
                    action_id: assessment.action.action_id,
                    description: assessment.action.description,
                    range: assessment.action.range,
                    type: assessment.action.type
                } : null
            }));

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        user_id: user.user_id,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        img_link: user.img_link,
                        date_create: user.date_create
                    },
                    profile: profile || null,
                    assessments: formattedAssessments,
                    assessment_count: formattedAssessments.length
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
    }
    
    /**
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
     * DELETE /api/members/{memberId} - Delete member by ID or set to inactive if has references
     * Deletes both user and associated profile, or sets status to inactive if references exist
     */
    static async deleteMember(req, res) {
        try {
            const { memberId } = req.params;
            console.log('Delete member request received for ID:', memberId);
            
            // Validate member ID
            if (!memberId || isNaN(parseInt(memberId))) {
                console.error('Invalid member ID provided:', memberId);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid member ID provided'
                });
            }

            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);
            const assessmentRepository = AppDataSource.getRepository(Assessment);
            const blogRepository = AppDataSource.getRepository(Blog);
            const bookingSessionRepository = AppDataSource.getRepository(BookingSession);
            const surveyResponseRepository = AppDataSource.getRepository(SurveyResponse);

            const memberIdInt = parseInt(memberId);

            // Find the member user
            const user = await userRepository.findOne({
                where: { user_id: memberIdInt }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            // Verify user is member
            if (user.role.toLowerCase() !== 'member') {
                console.error('User is not a member. User role:', user.role);
                return res.status(400).json({
                    success: false,
                    message: 'User is not a member'
                });
            }

            console.log('Member found for deletion:', {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                status: user.status
            });

            // Check if member has any blogs, booking sessions, survey responses, or assessments
            // Use simple where clauses instead of complex relations to avoid relation errors
            let blogs = [];
            let bookingSessions = [];
            let surveyResponses = [];
            let assessments = [];

            try {
                blogs = await blogRepository.find({
                    where: { author_id: memberIdInt }
                });
            } catch (error) {
                console.warn('Error checking blogs:', error.message);
                blogs = [];
            }

            try {
                bookingSessions = await bookingSessionRepository.find({
                    where: { member_id: memberIdInt }
                });
            } catch (error) {
                console.warn('Error checking booking sessions:', error.message);
                bookingSessions = [];
            }

            try {
                surveyResponses = await surveyResponseRepository.find({
                    where: { user_id: memberIdInt }
                });
            } catch (error) {
                console.warn('Error checking survey responses:', error.message);
                surveyResponses = [];
            }

            try {
                assessments = await assessmentRepository.find({
                    where: { user_id: memberIdInt }
                });
            } catch (error) {
                console.warn('Error checking assessments:', error.message);
                assessments = [];
            }

            const totalReferences = blogs.length + bookingSessions.length + surveyResponses.length + assessments.length;

            if (totalReferences > 0) {
                // If member has references, set user status to inactive instead of deleting
                try {
                    await userRepository.update(
                        { user_id: memberIdInt }, 
                        { status: "inactive" }
                    );

                    res.status(200).json({
                        success: true,
                        message: `Member has ${totalReferences} reference(s) (${blogs.length} blogs, ${bookingSessions.length} booking sessions, ${surveyResponses.length} survey responses, ${assessments.length} assessments). User status set to inactive instead of deletion.`,
                        data: {
                            member_id: memberIdInt,
                            user_id: memberIdInt,
                            action: "status_changed_to_inactive",
                            references: {
                                blogs_count: blogs.length,
                                booking_sessions_count: bookingSessions.length,
                                survey_responses_count: surveyResponses.length,
                                assessments_count: assessments.length,
                                total_count: totalReferences
                            }
                        }
                    });
                } catch (updateError) {
                    console.error('Error updating user status:', updateError);
                    throw new Error('Failed to update user status to inactive');
                }

            } else {
                // If no references, perform deletion in order: profile -> user
                try {
                    // 1. Delete profile if exists
                    const profile = await profileRepository.findOne({
                        where: { user_id: memberIdInt }
                    });
                    
                    if (profile) {
                        await profileRepository.delete({ user_id: memberIdInt });
                    }

                    // 2. Delete user
                    await userRepository.delete({ user_id: memberIdInt });

                    res.status(200).json({
                        success: true,
                        message: "Member and all related data deleted successfully",
                        data: {
                            member_id: memberIdInt,
                            user_id: memberIdInt,
                            action: "completely_deleted",
                            deleted_entities: {
                                profile: profile ? true : false,
                                user: true
                            }
                        }
                    });
                } catch (deleteError) {
                    console.error('Error deleting member data:', deleteError);
                    throw new Error('Failed to delete member data');
                }
            }

        } catch (error) {
            console.error('Error deleting member:', error);
            console.error('Error stack:', error.stack);
            
            // Send more detailed error information for debugging
            res.status(500).json({
                success: false,
                message: 'Failed to delete member',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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