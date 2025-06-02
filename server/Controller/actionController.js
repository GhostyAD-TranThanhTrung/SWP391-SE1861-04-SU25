const sql = require('mssql');

// GET all actions with filtering
exports.getAllActions = async (req, res) => {
    try {
        const { type, range, search, limit = 50, page = 1 } = req.query;
        
        let query = `
            SELECT a.action_id, a.description, a.range, a.type,
                   COUNT(ass.assessment_id) as usage_count
            FROM Action a
            LEFT JOIN Assessments ass ON a.action_id = ass.action_id
            WHERE 1=1
        `;
        
        const request = new sql.Request();
        
        // Apply filters
        if (type) {
            query += ' AND a.type = @type';
            request.input('type', sql.VarChar, type);
        }
        
        if (range) {
            query += ' AND a.range = @range';
            request.input('range', sql.VarChar, range);
        }
        
        if (search) {
            query += ' AND a.description LIKE @search';
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        query += ` 
            GROUP BY a.action_id, a.description, a.range, a.type
            ORDER BY a.type, a.range, a.description
        `;
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));
        
        const result = await request.query(query);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Action a
            WHERE 1=1
        `;
        
        const countRequest = new sql.Request();
        if (type) {
            countQuery += ' AND a.type = @type';
            countRequest.input('type', sql.VarChar, type);
        }
        if (range) {
            countQuery += ' AND a.range = @range';
            countRequest.input('range', sql.VarChar, range);
        }
        if (search) {
            countQuery += ' AND a.description LIKE @search';
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
        console.error('Error fetching actions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET action by ID
exports.getActionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('actionId', sql.Int, id);
        
        const result = await request.query(`
            SELECT a.action_id, a.description, a.range, a.type,
                   COUNT(ass.assessment_id) as usage_count
            FROM Action a
            LEFT JOIN Assessments ass ON a.action_id = ass.action_id
            WHERE a.action_id = @actionId
            GROUP BY a.action_id, a.description, a.range, a.type
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Action not found' });
        }
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('Error fetching action:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// CREATE new action
exports.createAction = async (req, res) => {
    try {
        const { description, range, type } = req.body;
        
        if (!description || !range || !type) {
            return res.status(400).json({ 
                error: 'Description, range, and type are required' 
            });
        }
        
        // Check if action with same description, range, and type already exists
        const checkRequest = new sql.Request();
        checkRequest.input('description', sql.NVarChar, description)
                   .input('range', sql.VarChar, range)
                   .input('type', sql.VarChar, type);
        
        const existingAction = await checkRequest.query(
            'SELECT COUNT(*) as count FROM Action WHERE description = @description AND range = @range AND type = @type'
        );
        
        if (existingAction.recordset[0].count > 0) {
            return res.status(409).json({ error: 'Action with these parameters already exists' });
        }
        
        const request = new sql.Request();
        request.input('description', sql.NVarChar, description)
               .input('range', sql.VarChar, range)
               .input('type', sql.VarChar, type);
        
        const result = await request.query(`
            INSERT INTO Action (description, range, type)
            VALUES (@description, @range, @type);
            SELECT SCOPE_IDENTITY() AS action_id;
        `);
        
        const actionId = result.recordset[0].action_id;
        
        res.status(201).json({
            message: 'Action created successfully',
            action_id: actionId,
            description: description,
            range: range,
            type: type
        });
        
    } catch (err) {
        console.error('Error creating action:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// UPDATE action
exports.updateAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, range, type } = req.body;
        
        if (!description && !range && !type) {
            return res.status(400).json({ 
                error: 'At least one field is required for update' 
            });
        }
        
        let query = 'UPDATE Action SET ';
        const updates = [];
        const request = new sql.Request();
        
        if (description) {
            updates.push('description = @description');
            request.input('description', sql.NVarChar, description);
        }
        
        if (range) {
            updates.push('range = @range');
            request.input('range', sql.VarChar, range);
        }
        
        if (type) {
            updates.push('type = @type');
            request.input('type', sql.VarChar, type);
        }
        
        query += updates.join(', ');
        query += ' WHERE action_id = @actionId';
        request.input('actionId', sql.Int, id);
        
        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Action not found' });
        }
        
        res.json({ message: 'Action updated successfully' });
        
    } catch (err) {
        console.error('Error updating action:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE action
exports.deleteAction = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if action is being used by assessments
        const checkRequest = new sql.Request();
        checkRequest.input('actionId', sql.Int, id);
        
        const assessmentCount = await checkRequest.query(
            'SELECT COUNT(*) as count FROM Assessments WHERE action_id = @actionId'
        );
        
        if (assessmentCount.recordset[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete action that is being used by assessments' 
            });
        }
        
        const request = new sql.Request();
        request.input('actionId', sql.Int, id);
        
        const result = await request.query('DELETE FROM Action WHERE action_id = @actionId');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Action not found' });
        }
        
        res.json({ message: 'Action deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting action:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET actions by type
exports.getActionsByType = async (req, res) => {
    try {
        const { type } = req.params;
        
        const request = new sql.Request();
        request.input('type', sql.VarChar, type);
        
        const result = await request.query(`
            SELECT a.action_id, a.description, a.range, a.type,
                   COUNT(ass.assessment_id) as usage_count
            FROM Action a
            LEFT JOIN Assessments ass ON a.action_id = ass.action_id
            WHERE a.type = @type
            GROUP BY a.action_id, a.description, a.range, a.type
            ORDER BY a.range, a.description
        `);
        
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching actions by type:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET actions by range
exports.getActionsByRange = async (req, res) => {
    try {
        const { range } = req.params;
        const { type } = req.query;
        
        let query = `
            SELECT a.action_id, a.description, a.range, a.type,
                   COUNT(ass.assessment_id) as usage_count
            FROM Action a
            LEFT JOIN Assessments ass ON a.action_id = ass.action_id
            WHERE a.range = @range
        `;
        
        const request = new sql.Request();
        request.input('range', sql.VarChar, range);
        
        if (type) {
            query += ' AND a.type = @type';
            request.input('type', sql.VarChar, type);
        }
        
        query += `
            GROUP BY a.action_id, a.description, a.range, a.type
            ORDER BY a.type, a.description
        `;
        
        const result = await request.query(query);
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching actions by range:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET action statistics
exports.getActionStats = async (req, res) => {
    try {
        const result = await new sql.Request().query(`
            SELECT 
                a.type,
                a.range,
                COUNT(*) as action_count,
                SUM(CASE WHEN ass.assessment_id IS NOT NULL THEN 1 ELSE 0 END) as used_actions,
                COUNT(ass.assessment_id) as total_usage
            FROM Action a
            LEFT JOIN Assessments ass ON a.action_id = ass.action_id
            GROUP BY a.type, a.range
            ORDER BY a.type, a.range
        `);
        
        res.json(result.recordset);
        
    } catch (err) {
        console.error('Error fetching action statistics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
