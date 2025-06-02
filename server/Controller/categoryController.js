const sql = require('mssql');

// GET all categories
exports.getAllCategories = async (req, res) => {
    try {
        const { search, limit = 50, page = 1 } = req.query;
        
        let query = `
            SELECT c.category_id, c.description,
                   COUNT(p.program_id) as program_count
            FROM Category c
            LEFT JOIN Programs p ON c.category_id = p.category_id
            WHERE 1=1
        `;
        
        const request = new sql.Request();
        
        if (search) {
            query += ' AND c.description LIKE @search';
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        query += ` 
            GROUP BY c.category_id, c.description
            ORDER BY c.description
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
            FROM Category c
            WHERE 1=1
        `;
        
        const countRequest = new sql.Request();
        if (search) {
            countQuery += ' AND c.description LIKE @search';
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
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = new sql.Request();
        request.input('categoryId', sql.Int, id);
        
        const result = await request.query(`
            SELECT c.category_id, c.description,
                   COUNT(p.program_id) as program_count
            FROM Category c
            LEFT JOIN Programs p ON c.category_id = p.category_id
            WHERE c.category_id = @categoryId
            GROUP BY c.category_id, c.description
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// CREATE new category
exports.createCategory = async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ 
                error: 'Description is required' 
            });
        }
        
        // Check if category already exists
        const checkRequest = new sql.Request();
        checkRequest.input('description', sql.NVarChar, description);
        
        const existingCategory = await checkRequest.query(
            'SELECT COUNT(*) as count FROM Category WHERE description = @description'
        );
        
        if (existingCategory.recordset[0].count > 0) {
            return res.status(409).json({ error: 'Category already exists' });
        }
        
        const request = new sql.Request();
        request.input('description', sql.NVarChar, description);
        
        const result = await request.query(`
            INSERT INTO Category (description)
            VALUES (@description);
            SELECT SCOPE_IDENTITY() AS category_id;
        `);
        
        const categoryId = result.recordset[0].category_id;
        
        res.status(201).json({
            message: 'Category created successfully',
            category_id: categoryId,
            description: description
        });
        
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ 
                error: 'Description is required for update' 
            });
        }
        
        // Check if new description already exists (excluding current category)
        const checkRequest = new sql.Request();
        checkRequest.input('description', sql.NVarChar, description);
        checkRequest.input('categoryId', sql.Int, id);
        
        const existingCategory = await checkRequest.query(
            'SELECT COUNT(*) as count FROM Category WHERE description = @description AND category_id != @categoryId'
        );
        
        if (existingCategory.recordset[0].count > 0) {
            return res.status(409).json({ error: 'Category with this description already exists' });
        }
        
        const request = new sql.Request();
        request.input('description', sql.NVarChar, description);
        request.input('categoryId', sql.Int, id);
        
        const result = await request.query(
            'UPDATE Category SET description = @description WHERE category_id = @categoryId'
        );
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ message: 'Category updated successfully' });
        
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if category has associated programs
        const checkRequest = new sql.Request();
        checkRequest.input('categoryId', sql.Int, id);
        
        const programCount = await checkRequest.query(
            'SELECT COUNT(*) as count FROM Programs WHERE category_id = @categoryId'
        );
        
        if (programCount.recordset[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category that has associated programs' 
            });
        }
        
        const request = new sql.Request();
        request.input('categoryId', sql.Int, id);
        
        const result = await request.query('DELETE FROM Category WHERE category_id = @categoryId');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ message: 'Category deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET categories with program details
exports.getCategoriesWithPrograms = async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        
        const request = new sql.Request();
        request.input('status', sql.VarChar, status);
        
        const result = await request.query(`
            SELECT c.category_id, c.description as category_name,
                   p.program_id, p.title, p.description as program_description,
                   p.age_group, p.create_at
            FROM Category c
            LEFT JOIN Programs p ON c.category_id = p.category_id AND p.status = @status
            ORDER BY c.description, p.create_at DESC
        `);
        
        // Group programs by category
        const categoriesMap = {};
        result.recordset.forEach(row => {
            if (!categoriesMap[row.category_id]) {
                categoriesMap[row.category_id] = {
                    category_id: row.category_id,
                    category_name: row.category_name,
                    programs: []
                };
            }
            
            if (row.program_id) {
                categoriesMap[row.category_id].programs.push({
                    program_id: row.program_id,
                    title: row.title,
                    description: row.program_description,
                    age_group: row.age_group,
                    create_at: row.create_at
                });
            }
        });
        
        const categories = Object.values(categoriesMap);
        res.json(categories);
        
    } catch (err) {
        console.error('Error fetching categories with programs:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
