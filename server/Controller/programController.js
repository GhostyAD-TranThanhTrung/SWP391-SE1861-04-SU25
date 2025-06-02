const sql = require('mssql');

// GET all programs with filtering
exports.getAllPrograms = async (req, res) => {
    try {
        const { 
            category_id, 
            status, 
            age_group, 
            created_by, 
            search, 
            limit = 10, 
            page = 1 
        } = req.query;
        
        let query = `
            SELECT p.program_id, p.title, p.description, p.status, p.age_group, 
                   p.create_at, p.create_by, u.email as creator_email,
                   pr.name as creator_name, c.description as category_name
            FROM Programs p
            LEFT JOIN Users u ON p.create_by = u.user_id
            LEFT JOIN Profiles pr ON p.create_by = pr.user_id
            LEFT JOIN Category c ON p.category_id = c.category_id
            WHERE 1=1
        `;
        
        const request = new sql.Request();
        
        // Apply filters
        if (category_id) {
            query += ' AND p.category_id = @category_id';
            request.input('category_id', sql.Int, category_id);
        }
        
        if (status) {
            query += ' AND p.status = @status';
            request.input('status', sql.VarChar, status);
        }
        
        if (age_group) {
            query += ' AND p.age_group = @age_group';
            request.input('age_group', sql.VarChar, age_group);
        }
        
        if (created_by) {
            query += ' AND p.create_by = @created_by';
            request.input('created_by', sql.Int, created_by);
        }
        
        if (search) {
            query += ' AND (p.title LIKE @search OR p.description LIKE @search)';
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY p.create_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));
        
        const result = await request.query(query);
        
        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM Programs p WHERE 1=1`;
        const countRequest = new sql.Request();
        
        if (category_id) {
            countQuery += ' AND p.category_id = @category_id';
            countRequest.input('category_id', sql.Int, category_id);
        }
        
        if (status) {
            countQuery += ' AND p.status = @status';
            countRequest.input('status', sql.VarChar, status);
        }
        
        if (age_group) {
            countQuery += ' AND p.age_group = @age_group';
            countRequest.input('age_group', sql.VarChar, age_group);
        }
        
        if (created_by) {
            countQuery += ' AND p.create_by = @created_by';
            countRequest.input('created_by', sql.Int, created_by);
        }
        
        if (search) {
            countQuery += ' AND (p.title LIKE @search OR p.description LIKE @search)';
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
        console.error('❌ Error fetching programs:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET program by ID
exports.getProgramById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('programId', sql.Int, id);
        
        const result = await request.query(`
            SELECT p.program_id, p.title, p.description, p.status, p.age_group, 
                   p.create_at, p.create_by, u.email as creator_email,
                   pr.name as creator_name, c.description as category_name,
                   c.category_id
            FROM Programs p
            LEFT JOIN Users u ON p.create_by = u.user_id
            LEFT JOIN Profiles pr ON p.create_by = pr.user_id
            LEFT JOIN Category c ON p.category_id = c.category_id
            WHERE p.program_id = @programId
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('❌ Error fetching program:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// CREATE new program
exports.createProgram = async (req, res) => {
    try {
        const { title, description, create_by, status, age_group, category_id } = req.body;
        
        if (!title || !create_by || !status) {
            return res.status(400).json({ 
                error: 'Title, creator, and status are required' 
            });
        }
        
        const request = new sql.Request();
        request.input('title', sql.NVarChar, title)
               .input('description', sql.NVarChar, description || null)
               .input('create_by', sql.Int, create_by)
               .input('status', sql.VarChar, status)
               .input('age_group', sql.VarChar, age_group || null)
               .input('category_id', sql.Int, category_id || null);
        
        const result = await request.query(`
            INSERT INTO Programs (title, description, create_by, status, age_group, category_id)
            VALUES (@title, @description, @create_by, @status, @age_group, @category_id);
            SELECT SCOPE_IDENTITY() AS program_id;
        `);
        
        const programId = result.recordset[0].program_id;
        
        console.log('✅ Program created successfully:', { program_id: programId, title });
        
        res.status(201).json({
            message: 'Program created successfully',
            program_id: programId
        });
        
    } catch (err) {
        console.error('❌ Error creating program:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// UPDATE program
exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, age_group, category_id } = req.body;
        
        if (!title && !description && !status && !age_group && !category_id) {
            return res.status(400).json({ 
                error: 'At least one field is required for update' 
            });
        }
        
        let query = 'UPDATE Programs SET ';
        const updates = [];
        const request = new sql.Request();
        
        if (title) {
            updates.push('title = @title');
            request.input('title', sql.NVarChar, title);
        }
        
        if (description !== undefined) {
            updates.push('description = @description');
            request.input('description', sql.NVarChar, description);
        }
        
        if (status) {
            updates.push('status = @status');
            request.input('status', sql.VarChar, status);
        }
        
        if (age_group !== undefined) {
            updates.push('age_group = @age_group');
            request.input('age_group', sql.VarChar, age_group);
        }
        
        if (category_id !== undefined) {
            updates.push('category_id = @category_id');
            request.input('category_id', sql.Int, category_id);
        }
        
        query += updates.join(', ') + ' WHERE program_id = @program_id';
        request.input('program_id', sql.Int, id);
        
        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        console.log('✅ Program updated successfully:', { program_id: id });
        
        res.json({ message: 'Program updated successfully' });
        
    } catch (err) {
        console.error('❌ Error updating program:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE program
exports.deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('programId', sql.Int, id);
        
        const result = await request.query('DELETE FROM Programs WHERE program_id = @programId');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        console.log('✅ Program deleted successfully:', { program_id: id });
        
        res.json({ message: 'Program deleted successfully' });
        
    } catch (err) {
        console.error('❌ Error deleting program:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET programs by category
exports.getProgramsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { status = 'active' } = req.query;
        
        const request = new sql.Request();
        request.input('categoryId', sql.Int, categoryId);
        request.input('status', sql.VarChar, status);
        
        const result = await request.query(`
            SELECT p.program_id, p.title, p.description, p.status, p.age_group, 
                   p.create_at, p.create_by, u.email as creator_email,
                   pr.name as creator_name, c.description as category_name
            FROM Programs p
            LEFT JOIN Users u ON p.create_by = u.user_id
            LEFT JOIN Profiles pr ON p.create_by = pr.user_id
            LEFT JOIN Category c ON p.category_id = c.category_id
            WHERE p.category_id = @categoryId AND p.status = @status
            ORDER BY p.create_at DESC
        `);
        
        res.json(result.recordset);
        
    } catch (err) {
        console.error('❌ Error fetching programs by category:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET programs by creator
exports.getProgramsByCreator = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.query;
        
        let query = `
            SELECT p.program_id, p.title, p.description, p.status, p.age_group, 
                   p.create_at, p.create_by, c.description as category_name
            FROM Programs p
            LEFT JOIN Category c ON p.category_id = c.category_id
            WHERE p.create_by = @userId
        `;
        
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        
        if (status) {
            query += ' AND p.status = @status';
            request.input('status', sql.VarChar, status);
        }
        
        query += ' ORDER BY p.create_at DESC';
        
        const result = await request.query(query);
        res.json(result.recordset);
        
    } catch (err) {
        console.error('❌ Error fetching programs by creator:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
