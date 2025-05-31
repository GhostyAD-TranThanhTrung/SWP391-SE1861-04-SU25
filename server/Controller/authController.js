const sql = require('mssql');
// Import the jsonwebtoken library for JWT token generation
const jwt = require('jsonwebtoken');

// Define a secret key for signing the JWT tokens
// NOTE: In production, this should be stored in environment variables for security
const JWT_SECRET = 'your-secret-key-here';

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
                }                if (result.recordset.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Get the user record from the database result
                const user = result.recordset[0];
                
                // Generate a JWT token with user information as the payload
                // NOTE: The token contains user data that will be available in protected routes
                const token = jwt.sign(
                    { 
                        userId: user.user_id,              // Include user ID in the token payload
                        email: user.email,            // Include email in the token payload
                        role: user.role || 'Member'   // Include user role with a default value
                    }, 
                    JWT_SECRET,                       // Sign the token with our secret key
                    { expiresIn: '24h' }              // Token will expire in 24 hours
                );                // Login successful - log information
                console.log('='.repeat(50));
                console.log(`✅ LOGIN SUCCESSFUL`);
                console.log(`📧 Email: ${user.email}`);
                console.log(`🆔 User ID: ${user.user_id}`);
                console.log(`🔑 JWT Token generated successfully`);
                console.log(`⏰ Login time: ${new Date().toLocaleString()}`);
                console.log('='.repeat(50));
                
                // Return success response with user data and the token
                // NOTE: The client will store this token and use it for authenticated requests
                res.json({
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username
                    },
                    token: token  // Include the JWT token in the response
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

// Middleware to verify JWT token for protected routes
// NOTE: This middleware can be added to any route that requires authentication
exports.verifyToken = (req, res, next) => {
    // Get the authorization header from the request
    // NOTE: The client must send the token in the Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if the auth header exists and starts with "Bearer "
    // NOTE: Bearer tokens should be formatted as "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Extract the token by removing the "Bearer " prefix
    const token = authHeader.split(' ')[1];
    
    try {
        // Verify the token signature using our secret key
        // NOTE: This will throw an error if the token is invalid or expired
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Add the decoded user information to the request object
        // NOTE: This makes the user data available to route handlers
        req.user = decoded;
        
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Token verification failed
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid token.' });
    }
};