const sql = require('mssql');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const CLIENT_ID = '97185070436-degnuev5p66ua7ckv130jmbm4eilcp6f.apps.googleusercontent.com';
const clientID = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = 'swp391-super-secret-jwt-key-2025-secure'; // Your own secret for JWT tokens
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        // Verify Google JWT token
        const ticket = await clientID.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        console.log(`Google auth attempt for: ${email}`);        // Check if user exists
        const checkUserRequest = new sql.Request();
        checkUserRequest.input('email', sql.NVarChar, email)
            .input('googleId', sql.NVarChar, googleId);
        const userCheckResult = await checkUserRequest.query(
            'SELECT * FROM Users WHERE email = @email AND password = @googleId'
        ); if (userCheckResult.recordset.length > 0) {
            // User exists - Login
            const user = userCheckResult.recordset[0];
            console.log(`Google user ${email} logged in successfully`);

            // Generate JWT token for session
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role || 'Member'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                message: 'Google login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                token: token
            });
        } else {
            return exports.googleRegister(req, res);
        }

    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(401).json({ error: 'Google authentication failed' });
    }
}

exports.googleRegister = async (req, res) => {
    try {
        const { credential } = req.body;        // Verify Google JWT token
        const ticket = await clientID.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        const checkUserRequest = new sql.Request();
        checkUserRequest.input('email', sql.NVarChar, email);

        const userCheckResult = await checkUserRequest.query(
            'SELECT * FROM Users WHERE email = @email'
        );

        if (userCheckResult.recordset.length === 0) {

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
            ); console.log(`Google user ${email} registered successfully`);

            // Generate JWT token for session
            const token = jwt.sign(
                {
                    userId: userId,
                    email: email,
                    role: 'Member'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(201).json({
                message: 'Google registration successful',
                user: {
                    id: userId,
                    email: email,
                    role: 'Member'
                },
                token: token
            });
        } else {
            return exports.googleLogin(req, res);
        }

    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(401).json({ error: 'Failed to register Google' });
    }
}