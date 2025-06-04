const sql = require('mssql');

// GET all users with filtering
exports.getAllUsers = async (req, res) => {
    try {
        const { role, status, search, limit = 10, page = 1 } = req.query;
        
        let query = `
            SELECT u.user_id, u.email, u.role, u.status, u.date_create,
                   p.name, p.date_of_birth, p.jobs
            FROM Users u
            LEFT JOIN Profiles p ON u.user_id = p.user_id
            WHERE 1=1
        `;
        
        const request = new sql.Request();
        
        // Apply filters
        if (role) {
            query += ' AND u.role = @role';
            request.input('role', sql.VarChar, role);
        }
        
        if (status) {
            query += ' AND u.status = @status';
            request.input('status', sql.VarChar, status);
        }
        
        if (search) {
            query += ' AND (u.email LIKE @search OR p.name LIKE @search)';
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY u.date_create DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));
        
        const result = await request.query(query);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Users u
            LEFT JOIN Profiles p ON u.user_id = p.user_id
            WHERE 1=1
        `;
        
        const countRequest = new sql.Request();
        if (role) {
            countQuery += ' AND u.role = @role';
            countRequest.input('role', sql.VarChar, role);
        }
        if (status) {
            countQuery += ' AND u.status = @status';
            countRequest.input('status', sql.VarChar, status);
        }
        if (search) {
            countQuery += ' AND (u.email LIKE @search OR p.name LIKE @search)';
            countRequest.input('search', sql.NVarChar, `%${search}%`);
        }
        
        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0].total;
        
        res.json({
            data: result.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
        
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('userId', sql.Int, id);
        
        const result = await request.query(`
            SELECT u.user_id, u.email, u.role, u.status, u.date_create,
                   p.name, p.certification, p.work_hours_json, p.bio_json, 
                   p.date_of_birth, p.jobs
            FROM Users u
            LEFT JOIN Profiles p ON u.user_id = p.user_id
            WHERE u.user_id = @userId
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// UPDATE user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, status } = req.body;
        
        if (!email && !role && !status) {
            return res.status(400).json({ error: 'At least one field is required for update' });
        }
        
        let query = 'UPDATE Users SET ';
        const updates = [];
        const request = new sql.Request();
        
        if (email) {
            updates.push('email = @email');
            request.input('email', sql.NVarChar, email);
        }
        
        if (role) {
            updates.push('role = @role');
            request.input('role', sql.VarChar, role);
        }
        
        if (status) {
            updates.push('status = @status');
            request.input('status', sql.VarChar, status);
        }
        
        query += updates.join(', ');
        query += ' WHERE user_id = @userId';
        request.input('userId', sql.Int, id);
        
        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
        
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('userId', sql.Int, id);
        
        const result = await request.query('DELETE FROM Users WHERE user_id = @userId');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const { status = 'active' } = req.query;
        
        const request = new sql.Request();
        request.input('role', sql.VarChar, role);
        request.input('status', sql.VarChar, status);
        
        const result = await request.query(`
            SELECT u.user_id, u.email, u.role, u.status, u.date_create,
                   p.name, p.certification, p.bio_json, p.jobs
            FROM Users u
            LEFT JOIN Profiles p ON u.user_id = p.user_id
            WHERE u.role = @role AND u.status = @status
            ORDER BY u.date_create DESC
        `);
        
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching users by role:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET current user's profile using token
exports.getCurrentUserProfile = async (req, res) => {
    try {
        // User ID is extracted from JWT token by verifyToken middleware
        const userId = req.user.userId;
        
        console.log(`🔍 Getting profile for authenticated user ID: ${userId}`);
        console.log(`📧 User email from token: ${req.user.email}`);
        
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        
        const result = await request.query(`
            SELECT u.user_id, u.email, u.role, u.status, u.date_create,
                   p.name, p.certification, p.works_hours_json, p.bio_json, 
                   p.date_of_birth, p.job
            FROM Users u
            LEFT JOIN Profile p ON u.user_id = p.user_id
            WHERE u.user_id = @userId
        `);
        
        if (result.recordset.length === 0) {
            console.log(`❌ User not found for ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userData = result.recordset[0];
        
        console.log(`✅ Profile retrieved successfully for user: ${userData.email}`);
        console.log(`👤 Profile name: ${userData.name || 'No profile created'}`);
        
        // Structure the response
        const response = {
            message: 'Profile retrieved successfully',
            user: {
                user_id: userData.user_id,
                email: userData.email,
                role: userData.role,
                status: userData.status,
                date_create: userData.date_create
            },
            profile: userData.name ? {
                name: userData.name,
                certification: userData.certification,
                works_hours_json: userData.works_hours_json,
                bio_json: userData.bio_json,
                date_of_birth: userData.date_of_birth,
                job: userData.job
            } : null,
            hasProfile: !!userData.name
        };
        
        res.json(response);
        
    } catch (err) {
        console.error('❌ Error fetching current user profile:', err);
        res.status(500).json({ error: 'Server error while fetching profile' });
    }
};