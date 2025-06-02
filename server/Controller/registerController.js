const sql = require('mssql');

exports.getAllUsers = (req, res) => {
    new sql.Request().query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error('SQL error', err);
            res.status(500).send('Error querying database');
            return;
        }
        res.json(result.recordset);
    });
};

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { email, password, role = 'Member' } = req.body;
        
        // Basic validation - ensure required fields are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Check if email already exists in the database to prevent duplicates
        const checkEmailRequest = new sql.Request();

        checkEmailRequest.input('email', sql.NVarChar, email);
        
        const emailCheckResult = await checkEmailRequest.query(
            'SELECT COUNT(*) as count FROM Users WHERE email = @email'
        );
          if (emailCheckResult.recordset[0].count > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }
          // Create new user with default status as 'active' according to the Users table schema
        const registerRequest = new sql.Request(); // FIX: Changed variable name for consistency
        registerRequest.input('email', sql.NVarChar, email)
          .input('password', sql.NVarChar, password)
          .input('role', sql.VarChar, role)
          .input('status', sql.VarChar, 'active');
          
        const result = await registerRequest.query( // FIX: Use the correct variable name
            `INSERT INTO Users (email, password, role, status)
             VALUES (@email, @password, @role, @status);
             SELECT SCOPE_IDENTITY() AS user_id;` // Get the auto-generated user_id
        );
        
        const userId = result.recordset[0].user_id;
        
        // Return success response with user data
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                userId,
                email,
                role,
                status: 'active'
            }
        });
    } catch (error) {
        // Log and handle any errors during registration
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again later.' });
    }
};
