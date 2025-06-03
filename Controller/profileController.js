const sql = require('mssql');

// Get profile by user ID
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
          const result = await request.query(
            'SELECT * FROM Profile WHERE user_id = @userId'
        );
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json({
            message: 'Profile retrieved successfully',
            profile: result.recordset[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to retrieve profile. Please try again later.' });
    }
};

// Get all profiles
exports.getAllProfiles = async (req, res) => {
    try {
        const request = new sql.Request();
          const result = await request.query(`
            SELECT p.*, u.email, u.role, u.status 
            FROM Profile p 
            INNER JOIN Users u ON p.user_id = u.user_id
        `);
        
        res.json({
            message: 'Profiles retrieved successfully',
            profiles: result.recordset
        });
    } catch (error) {
        console.error('Get all profiles error:', error);
        res.status(500).json({ error: 'Failed to retrieve profiles. Please try again later.' });
    }
};

// Create a new profile
exports.createProfile = async (req, res) => {
    try {
        const { name, certification, workHoursJson, bioJson, dateOfBirth, job } = req.body;
        
        // Get user ID from the verified JWT token (set by verifyToken middleware)
        const userId = req.user.userId;
        
        // Basic validation
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Check if user exists
        const checkUserRequest = new sql.Request();
        checkUserRequest.input('userId', sql.Int, userId);
        
        const userCheckResult = await checkUserRequest.query(
            'SELECT COUNT(*) as count FROM Users WHERE user_id = @userId'
        );
        
        if (userCheckResult.recordset[0].count === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
          // Check if profile already exists for this user
        const checkProfileRequest = new sql.Request();
        checkProfileRequest.input('userId', sql.Int, userId);
        
        const profileCheckResult = await checkProfileRequest.query(
            'SELECT COUNT(*) as count FROM Profile WHERE user_id = @userId'
        );
        
        if (profileCheckResult.recordset[0].count > 0) {
            return res.status(409).json({ error: 'Profile already exists for this user' });
        }
        
        // Validate JSON strings if provided
        if (workHoursJson) {
            try {
                JSON.parse(workHoursJson);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid work hours JSON format' });
            }
        }
        
        if (bioJson) {
            try {
                JSON.parse(bioJson);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid bio JSON format' });
            }
        }
        
        // Create new profile
        const createProfileRequest = new sql.Request();
        createProfileRequest.input('userId', sql.Int, userId)
            .input('name', sql.NVarChar, name || null)
            .input('certification', sql.NVarChar, certification || null)
            .input('workHoursJson', sql.NVarChar, workHoursJson || null)
            .input('bioJson', sql.NVarChar, bioJson || null)
            .input('dateOfBirth', sql.Date, dateOfBirth || null)            .input('job', sql.NVarChar, job || null);
          await createProfileRequest.query(
            `INSERT INTO Profile (user_id, name, certification, works_hours_json, bio_json, date_of_birth, job)
             VALUES (@userId, @name, @certification, @workHoursJson, @bioJson, @dateOfBirth, @job)`
        );
        
        // Return the created profile
        const getProfileRequest = new sql.Request();
        getProfileRequest.input('userId', sql.Int, userId);
          const createdProfile = await getProfileRequest.query(
            'SELECT * FROM Profile WHERE user_id = @userId'
        );
        
        res.status(201).json({
            message: 'Profile created successfully',
            profile: createdProfile.recordset[0]
        });
    } catch (error) {
        console.error('Create profile error:', error);
        res.status(500).json({ error: 'Profile creation failed. Please try again later.' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, certification, workHoursJson, bioJson, dateOfBirth, jobs } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Check if profile exists
        const checkProfileRequest = new sql.Request();
        checkProfileRequest.input('userId', sql.Int, userId);
        
        const profileCheckResult = await checkProfileRequest.query(
            'SELECT COUNT(*) as count FROM Profiles WHERE user_id = @userId'
        );
        
        if (profileCheckResult.recordset[0].count === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        // Validate JSON strings if provided
        if (workHoursJson) {
            try {
                JSON.parse(workHoursJson);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid work hours JSON format' });
            }
        }
        
        if (bioJson) {
            try {
                JSON.parse(bioJson);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid bio JSON format' });
            }
        }
        
        // Build update query dynamically based on provided fields
        let updateFields = [];
        let updateRequest = new sql.Request();
        updateRequest.input('userId', sql.Int, userId);
        
        if (name !== undefined) {
            updateFields.push('name = @name');
            updateRequest.input('name', sql.NVarChar, name);
        }
        if (certification !== undefined) {
            updateFields.push('certification = @certification');
            updateRequest.input('certification', sql.NVarChar, certification);
        }
        if (workHoursJson !== undefined) {
            updateFields.push('work_hours_json = @workHoursJson');
            updateRequest.input('workHoursJson', sql.NVarChar, workHoursJson);
        }
        if (bioJson !== undefined) {
            updateFields.push('bio_json = @bioJson');
            updateRequest.input('bioJson', sql.NVarChar, bioJson);
        }
        if (dateOfBirth !== undefined) {
            updateFields.push('date_of_birth = @dateOfBirth');
            updateRequest.input('dateOfBirth', sql.Date, dateOfBirth);
        }
        if (jobs !== undefined) {
            updateFields.push('jobs = @jobs');
            updateRequest.input('jobs', sql.NVarChar, jobs);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        const updateQuery = `UPDATE Profiles SET ${updateFields.join(', ')} WHERE user_id = @userId`;
        
        await updateRequest.query(updateQuery);
        
        // Return the updated profile
        const getProfileRequest = new sql.Request();
        getProfileRequest.input('userId', sql.Int, userId);
        
        const updatedProfile = await getProfileRequest.query(
            'SELECT * FROM Profiles WHERE user_id = @userId'
        );
        
        res.json({
            message: 'Profile updated successfully',
            profile: updatedProfile.recordset[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Profile update failed. Please try again later.' });
    }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Check if profile exists
        const checkProfileRequest = new sql.Request();
        checkProfileRequest.input('userId', sql.Int, userId);
        
        const profileCheckResult = await checkProfileRequest.query(
            'SELECT COUNT(*) as count FROM Profiles WHERE user_id = @userId'
        );
        
        if (profileCheckResult.recordset[0].count === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        // Delete profile
        const deleteRequest = new sql.Request();
        deleteRequest.input('userId', sql.Int, userId);
        
        await deleteRequest.query('DELETE FROM Profiles WHERE user_id = @userId');
        
        res.json({
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ error: 'Profile deletion failed. Please try again later.' });
    }
};
