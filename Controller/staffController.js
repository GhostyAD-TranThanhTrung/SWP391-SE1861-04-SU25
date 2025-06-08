/**
 * Staff Management Controller using TypeORM
 * Manages staff operations using Users and Profile tables
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
            });

            // Get profile information for each staff member
            const staffWithProfiles = await Promise.all(
                staffUsers.map(async (user) => {
                    const profile = await profileRepository.findOne({
                        where: { user_id: user.user_id }
                    });

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
     */
    static async createStaff(req, res) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const profileRepository = AppDataSource.getRepository(Profile);

            const {
                username,
                email,
                password,
                role = 'consultant', // Default to consultant if not specified
                status = 'active',
                // Profile fields (optional)
                full_name,
                phone_number,
                date_of_birth,
                gender,
                address,
                bio_json,
                profile_picture_url
            } = req.body;

            // Validate required fields
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
            }

            // Validate role is staff role
            if (!['admin', 'consultant'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role must be admin or consultant for staff creation'
                });
            }

            // Check if username or email already exists
            const existingUser = await userRepository.findOne({
                where: [
                    { username: username },
                    { email: email }
                ]
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Create new user
            const newUser = userRepository.create({
                username,
                email,
                password, // Note: In production, password should be hashed
                role,
                status,
                created_at: new Date(),
                updated_at: new Date()
            });

            const savedUser = await userRepository.save(newUser);

            // Create profile if profile data provided
            let savedProfile = null;
            if (full_name || phone_number || date_of_birth || gender || address || bio_json || profile_picture_url) {
                // Validate bio_json if provided
                let parsedBioJson = null;
                if (bio_json) {
                    try {
                        parsedBioJson = typeof bio_json === 'string' ? JSON.parse(bio_json) : bio_json;
                    } catch (error) {
                        return res.status(400).json({
                            success: false,
                            message: 'Invalid JSON format for bio_json'
                        });
                    }
                }

                const newProfile = profileRepository.create({
                    user_id: savedUser.user_id,
                    full_name,
                    phone_number,
                    date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                    gender,
                    address,
                    bio_json: parsedBioJson,
                    profile_picture_url,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                savedProfile = await profileRepository.save(newProfile);
            }

            res.status(201).json({
                success: true,
                data: {
                    user: savedUser,
                    profile: savedProfile
                },
                message: 'Staff created successfully'
            });
        } catch (error) {
            console.error('Error creating staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create staff',
                error: error.message
            });
        }
    }

    /**
     * PUT /api/staff/{staffId} - Update staff by ID
     * Updates both user and profile information
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
            if (!['admin', 'consultant'].includes(user.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not a staff member'
                });
            }

            const {
                username,
                email,
                password,
                role,
                status,
                // Profile fields
                full_name,
                phone_number,
                date_of_birth,
                gender,
                address,
                bio_json,
                profile_picture_url
            } = req.body;

            // Update user fields if provided
            if (username !== undefined) user.username = username;
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
            if (status !== undefined) user.status = status;
            user.updated_at = new Date();

            // Check for duplicate username/email if being updated
            if (username || email) {
                const duplicateCheck = await userRepository.findOne({
                    where: [
                        username ? { username: username } : {},
                        email ? { email: email } : {}
                    ].filter(condition => Object.keys(condition).length > 0)
                });

                if (duplicateCheck && duplicateCheck.user_id !== parseInt(staffId)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Username or email already exists'
                    });
                }
            }

            const updatedUser = await userRepository.save(user);

            // Update or create profile
            let updatedProfile = await profileRepository.findOne({
                where: { user_id: parseInt(staffId) }
            });

            const hasProfileData = full_name !== undefined || phone_number !== undefined ||
                date_of_birth !== undefined || gender !== undefined ||
                address !== undefined || bio_json !== undefined ||
                profile_picture_url !== undefined;

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
                    if (full_name !== undefined) updatedProfile.full_name = full_name;
                    if (phone_number !== undefined) updatedProfile.phone_number = phone_number;
                    if (date_of_birth !== undefined) updatedProfile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
                    if (gender !== undefined) updatedProfile.gender = gender;
                    if (address !== undefined) updatedProfile.address = address;
                    if (parsedBioJson !== undefined) updatedProfile.bio_json = parsedBioJson;
                    if (profile_picture_url !== undefined) updatedProfile.profile_picture_url = profile_picture_url;
                    updatedProfile.updated_at = new Date();

                    updatedProfile = await profileRepository.save(updatedProfile);
                } else {
                    // Create new profile
                    const newProfile = profileRepository.create({
                        user_id: parseInt(staffId),
                        full_name,
                        phone_number,
                        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                        gender,
                        address,
                        bio_json: parsedBioJson,
                        profile_picture_url,
                        created_at: new Date(),
                        updated_at: new Date()
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
    }

    /**
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
            }

            // Verify user is staff
            if (!['admin', 'consultant'].includes(user.role)) {
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
     * Searches for staff by username or full name in profile
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

            // Search users by username with staff roles
            const usersByUsername = await userRepository
                .createQueryBuilder('user')
                .where('user.role IN (:...roles)', { roles: ['admin', 'consultant'] })
                .andWhere('user.username LIKE :searchTerm', { searchTerm })
                .getMany();

            // Search profiles by full name and get associated users with staff roles
            const profilesByFullName = await profileRepository
                .createQueryBuilder('profile')
                .leftJoin('profile.user', 'user')
                .where('user.role IN (:...roles)', { roles: ['admin', 'consultant'] })
                .andWhere('profile.full_name LIKE :searchTerm', { searchTerm })
                .getMany();

            // Combine results and remove duplicates
            const foundUserIds = new Set();
            const combinedResults = [];

            // Add users found by username
            for (const user of usersByUsername) {
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

            // Add users found by profile full name
            for (const profile of profilesByFullName) {
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
