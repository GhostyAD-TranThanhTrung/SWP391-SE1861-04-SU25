const sql = require('mssql');

// GET all assessments with filtering
exports.getAllAssessments = async (req, res) => {
    try {
        const { 
            user_id, 
            type, 
            action_id, 
            date_from, 
            date_to, 
            limit = 10, 
            page = 1 
        } = req.query;
        
        let query = `
            SELECT a.assessment_id, a.user_id, a.type, a.result_json, 
                   a.create_at, a.action_id, u.email, p.name as user_name,
                   ac.description as action_description, ac.range as action_range
            FROM Assessments a
            LEFT JOIN Users u ON a.user_id = u.user_id
            LEFT JOIN Profiles p ON a.user_id = p.user_id
            LEFT JOIN Action ac ON a.action_id = ac.action_id
            WHERE 1=1
        `;
        
        const request = new sql.Request();
        
        // Apply filters
        if (user_id) {
            query += ' AND a.user_id = @user_id';
            request.input('user_id', sql.Int, user_id);
        }
        
        if (type) {
            query += ' AND a.type = @type';
            request.input('type', sql.VarChar, type);
        }
        
        if (action_id) {
            query += ' AND a.action_id = @action_id';
            request.input('action_id', sql.Int, action_id);
        }
        
        if (date_from) {
            query += ' AND a.create_at >= @date_from';
            request.input('date_from', sql.DateTime, new Date(date_from));
        }
        
        if (date_to) {
            query += ' AND a.create_at <= @date_to';
            request.input('date_to', sql.DateTime, new Date(date_to));
        }
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY a.create_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));
        
        const result = await request.query(query);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Assessments a
            WHERE 1=1
        `;
        
        const countRequest = new sql.Request();
        if (user_id) {
            countQuery += ' AND a.user_id = @user_id';
            countRequest.input('user_id', sql.Int, user_id);
        }
        if (type) {
            countQuery += ' AND a.type = @type';
            countRequest.input('type', sql.VarChar, type);
        }
        if (action_id) {
            countQuery += ' AND a.action_id = @action_id';
            countRequest.input('action_id', sql.Int, action_id);
        }
        if (date_from) {
            countQuery += ' AND a.create_at >= @date_from';
            countRequest.input('date_from', sql.DateTime, new Date(date_from));
        }
        if (date_to) {
            countQuery += ' AND a.create_at <= @date_to';
            countRequest.input('date_to', sql.DateTime, new Date(date_to));
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
        console.error('Error fetching assessments:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET assessment by ID
exports.getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('assessmentId', sql.Int, id);
        
        const result = await request.query(`
            SELECT a.assessment_id, a.user_id, a.type, a.result_json, 
                   a.create_at, a.action_id, u.email, p.name as user_name,
                   ac.description as action_description, ac.range as action_range, ac.type as action_type
            FROM Assessments a
            LEFT JOIN Users u ON a.user_id = u.user_id
            LEFT JOIN Profiles p ON a.user_id = p.user_id
            LEFT JOIN Action ac ON a.action_id = ac.action_id
            WHERE a.assessment_id = @assessmentId
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('Error fetching assessment:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// CREATE new assessment
exports.createAssessment = async (req, res) => {
    try {
        const { user_id, type, result_json, action_id } = req.body;
        
        if (!user_id || !type) {
            return res.status(400).json({ 
                error: 'User ID and type are required' 
            });
        }
        
        const request = new sql.Request();
        request.input('user_id', sql.Int, user_id)
               .input('type', sql.VarChar, type)
               .input('result_json', sql.NVarChar, result_json || null)
               .input('action_id', sql.Int, action_id || null);
        
        const result = await request.query(`
            INSERT INTO Assessments (user_id, type, result_json, action_id)
            VALUES (@user_id, @type, @result_json, @action_id);
            SELECT SCOPE_IDENTITY() AS assessment_id;
        `);
        
        const assessmentId = result.recordset[0].assessment_id;
        
        res.status(201).json({
            message: 'Assessment created successfully',
            assessment_id: assessmentId
        });
        
    } catch (err) {
        console.error('Error creating assessment:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// UPDATE assessment
exports.updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { result_json, action_id } = req.body;
        
        if (!result_json && !action_id) {
            return res.status(400).json({ 
                error: 'At least one field is required for update' 
            });
        }
        
        let query = 'UPDATE Assessments SET ';
        const updates = [];
        const request = new sql.Request();
        
        if (result_json !== undefined) {
            updates.push('result_json = @result_json');
            request.input('result_json', sql.NVarChar, result_json);
        }
        
        if (action_id !== undefined) {
            updates.push('action_id = @action_id');
            request.input('action_id', sql.Int, action_id);
        }
        
        query += updates.join(', ');
        query += ' WHERE assessment_id = @assessmentId';
        request.input('assessmentId', sql.Int, id);
        
        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json({ message: 'Assessment updated successfully' });
        
    } catch (err) {
        console.error('Error updating assessment:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE assessment
exports.deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('assessmentId', sql.Int, id);
        
        const result = await request.query('DELETE FROM Assessments WHERE assessment_id = @assessmentId');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json({ message: 'Assessment deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting assessment:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET assessments by user
exports.getAssessmentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type } = req.query;
        
        let query = `
            SELECT a.assessment_id, a.user_id, a.type, a.result_json, 
                   a.create_at, a.action_id, ac.description as action_description, 
                   ac.range as action_range
            FROM Assessments a
            LEFT JOIN Action ac ON a.action_id = ac.action_id
            WHERE a.user_id = @userId
        `;
        
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        
        if (type) {
            query += ' AND a.type = @type';
            request.input('type', sql.VarChar, type);
        }
        
        query += ' ORDER BY a.create_at DESC';
        
        const result = await request.query(query);
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching assessments by user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET assessments by type
exports.getAssessmentsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { limit = 50, page = 1 } = req.query;
        
        const request = new sql.Request();
        request.input('type', sql.VarChar, type);
        
        const offset = (page - 1) * limit;
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));
        
        const result = await request.query(`
            SELECT a.assessment_id, a.user_id, a.type, a.result_json, 
                   a.create_at, a.action_id, u.email, p.name as user_name,
                   ac.description as action_description, ac.range as action_range
            FROM Assessments a
            LEFT JOIN Users u ON a.user_id = u.user_id
            LEFT JOIN Profiles p ON a.user_id = p.user_id
            LEFT JOIN Action ac ON a.action_id = ac.action_id
            WHERE a.type = @type
            ORDER BY a.create_at DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
        
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching assessments by type:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET assessment statistics
exports.getAssessmentStats = async (req, res) => {
    try {
        const { type, date_from, date_to } = req.query;
        
        let whereClause = 'WHERE 1=1';
        const request = new sql.Request();
        
        if (type) {
            whereClause += ' AND a.type = @type';
            request.input('type', sql.VarChar, type);
        }
        
        if (date_from) {
            whereClause += ' AND a.create_at >= @date_from';
            request.input('date_from', sql.DateTime, new Date(date_from));
        }
        
        if (date_to) {
            whereClause += ' AND a.create_at <= @date_to';
            request.input('date_to', sql.DateTime, new Date(date_to));
        }
        
        const result = await request.query(`
            SELECT 
                COUNT(*) as total_assessments,
                COUNT(DISTINCT a.user_id) as unique_users,
                a.type,
                ac.range,
                COUNT(*) as count_by_range
            FROM Assessments a
            LEFT JOIN Action ac ON a.action_id = ac.action_id
            ${whereClause}
            GROUP BY a.type, ac.range
            ORDER BY a.type, ac.range
        `);
        
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching assessment statistics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
