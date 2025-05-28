const sql = require('mssql');
const register = require('./registerController.js');
const { OAuth2Client } = require('google-auth-library');

// Google OAuth client với client ID của bạn
const client = new OAuth2Client('97185070436-degnuev5p66ua7ckv130jmbm4eilcp6f.apps.googleusercontent.com');

// Login endpoint
exports.login = (req, res) => {
    // This endpoint handles authentication requests from the React login form
    const { email, password, logwithgoogle } = req.body;
    console.log(`Login attempt for user: ${email} and password: ${password}`);  // Log login attempts

    // Query the database to check credentials
    new sql.Request()
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, password)
        .query('SELECT * FROM Users WHERE email = @email AND password = @password',
            (err, result) => {
                if (err) {
                    console.error('SQL error during login:', err);
                    return res.status(500).json({ error: 'Server error' });
                }

                if (result.recordset.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Login successful
                console.log(`User ${result.recordset[0].email} logged in successfully`);
                res.json({
                    message: 'Login successful',
                    user: {
                        id: result.recordset[0].id,
                        email: result.recordset[0].email
                    }
                });
            }
        );
};

// Google Login/Register endpoint
exports.googleAuth = async (req, res) => {//this api handles the google login and register,if the user is not registered, 
// it will register the user, or if the user is registered, it will login the user
    try {
        const { credential } = req.body;
        // Verify Google JWT token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: '97185070436-degnuev5p66ua7ckv130jmbm4eilcp6f.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        console.log(`Google auth attempt for: ${email}`);

        // Check if user exists
        const checkUserRequest = new sql.Request();
        checkUserRequest.input('email', sql.NVarChar, email);

        const userCheckResult = await checkUserRequest.query(
            'SELECT * FROM Users WHERE email = @email'
        );

        if (userCheckResult.recordset.length > 0) {
            // User exists - Login
            const user = userCheckResult.recordset[0];
            console.log(`Google user ${email} logged in successfully`);

            return res.json({
                message: 'Google login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            // User doesn't exist - Register new user
            console.log(`Creating new Google user: ${email}`);

            const registerRequest = new sql.Request();
            registerRequest.input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, googleId) // Use Google ID as password
                .input('role', sql.VarChar, 'Member')
                .input('status', sql.VarChar, 'active');

            const result = await registerRequest.query(
                `INSERT INTO Users (email, password, role, status)
                 VALUES (@email, @password, @role, @status);
                 SELECT SCOPE_IDENTITY() AS user_id;`
            );

            const userId = result.recordset[0].user_id;

            // Create profile for the new user
            const createProfileRequest = new sql.Request();
            createProfileRequest.input('userId', sql.Int, userId)
                .input('name', sql.NVarChar, name);

            await createProfileRequest.query(
                `INSERT INTO Profiles (user_id, name)
                 VALUES (@userId, @name);`
            );

            console.log(`Google user ${email} registered and logged in successfully`);

            return res.status(201).json({
                message: 'Google registration and login successful',
                user: {
                    id: userId,
                    email: email,
                    role: 'Member'
                }
            });
        }

    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(401).json({ error: 'Google authentication failed' });
    }
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