const sql = require('mssql');

// Login endpoint
exports.login = (req, res) => {
    // This endpoint handles authentication requests from the React login form
    const { email, password } = req.body;
    console.log(`Login attempt for user: ${email}`);  // Log login attempts

    // Query the database to check credentials
    new sql.Request()
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, password)
        .query('SELECT * FROM users WHERE email = @email AND password = @password',
            (err, result) => {
                if (err) {
                    console.error('SQL error during login:', err);
                    return res.status(500).json({ error: 'Server error' });
                }

                if (result.recordset.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Login successful
                console.log(`User ${result.recordset[0].username} logged in successfully`);
                res.json({
                    message: 'Login successful',
                    user: {
                        id: result.recordset[0].id,
                        username: result.recordset[0].username
                    }
                });
            }
        );
};

// Get all users endpoint
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

// Test API endpoint
exports.testApi = (req, res) => {
    res.json({ message: 'Hello from the API!' });
};