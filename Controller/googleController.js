const sql = require('mssql');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const CLIENT_ID = '97185070436-degnuev5p66ua7ckv130jmbm4eilcp6f.apps.googleusercontent.com';
const clientID = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = 'swp391-super-secret-jwt-key-2025-secure';

exports.googleLogin = async (req, res) => {
    try {
        console.log('\n🚀 GOOGLE LOGIN API CALLED');
        console.log('='.repeat(60));
        console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
        console.log(`🌐 Request IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
        console.log(`📡 User-Agent: ${req.headers['user-agent'] || 'unknown'}`);
        
        const { credential } = req.body;
        console.log(`🎫 Credential received: ${credential ? 'Yes' : 'No'}`);
        console.log(`📏 Credential length: ${credential ? credential.length : 0} characters`);
        
        if (!credential) {
            console.log('❌ ERROR: No credential provided');
            console.log('='.repeat(60));
            return res.status(400).json({ error: 'Google credential is required' });
        }
        
        console.log('🔐 Verifying Google JWT token...');
        console.log(`🎯 CLIENT_ID: ${CLIENT_ID}`);
        
        // Verify Google JWT token
        const ticket = await clientID.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        console.log('✅ Google token verified successfully');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${name}`);
        console.log(`🆔 Google ID: ${googleId}`);
        console.log(`🔍 Token issuer: ${payload.iss}`);
        console.log(`⏰ Token expiry: ${new Date(payload.exp * 1000).toLocaleString()}`);
        console.log('🔍 Checking if user exists in database...');        // Check if user exists
        const checkUserRequest = new sql.Request();
        checkUserRequest.input('email', sql.NVarChar, email)
            .input('googleId', sql.NVarChar, googleId);
            
        console.log('📊 Executing database query...');
        console.log(`   SQL: SELECT * FROM Users WHERE email = '${email}' AND password = '${googleId}'`);
        
        const userCheckResult = await checkUserRequest.query(
            'SELECT * FROM Users WHERE email = @email AND password = @googleId'
        );
        
        console.log(`📈 Query result: ${userCheckResult.recordset.length} record(s) found`);        if (userCheckResult.recordset && userCheckResult.recordset.length > 0) {
            // User exists - Login
            const user = userCheckResult.recordset[0];
            
            // Validate user object
            if (!user || !user.id) {
                console.error('❌ ERROR: Invalid user data from database');
                return res.status(500).json({ error: 'Invalid user data' });
            }
            
            console.log('✅ USER FOUND - EXISTING GOOGLE USER');
            console.log(`🆔 User ID: ${user.id}`);
            console.log(`📧 Email: ${user.email}`);
            console.log(`👥 Role: ${user.role}`);
            console.log(`📅 Account created: ${user.created_at || 'N/A'}`);
            console.log(`✅ Status: ${user.status || 'N/A'}`);
            console.log('🔑 Generating JWT token for existing user...');

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

            console.log('✅ JWT token generated successfully');
            console.log(`🎯 Token payload: userId=${user.id}, email=${user.email}, role=${user.role || 'Member'}`);
            console.log('🎉 GOOGLE LOGIN SUCCESSFUL');
            console.log('📤 Sending response to client...');
            console.log('='.repeat(60));

            return res.json({
                message: 'Google login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role || 'Member'
                },
                token: token
            });
        } else {
            console.log('❌ USER NOT FOUND - INITIATING AUTO-REGISTRATION');
            console.log('🔄 Redirecting to Google registration flow...');
            console.log('='.repeat(60));
            
            // Call register function directly instead of using exports
            return await googleRegisterInternal(req, res);
        }
    } catch (error) {
        console.error('\n❌ GOOGLE LOGIN ERROR OCCURRED');
        console.error('='.repeat(60));
        console.error(`💥 Error type: ${error.name}`);
        console.error(`📝 Error message: ${error.message}`);
        console.error(`⏰ Error timestamp: ${new Date().toLocaleString()}`);
        
        if (error.stack) {
            console.error('📋 Stack trace:');
            console.error(error.stack);
        }
        
        // Check if it's a Google verification error
        if (error.message && error.message.includes('Token used too early')) {
            console.error('🕐 ERROR TYPE: Token timing issue');
        } else if (error.message && error.message.includes('Invalid token')) {
            console.error('🔑 ERROR TYPE: Invalid Google token');
        } else if (error.message && error.message.includes('Token expired')) {
            console.error('⏰ ERROR TYPE: Expired Google token');
        } else if (error.code) {
            console.error(`🔢 Error code: ${error.code}`);
        }
        
        console.error('📊 Request details:');
        console.error(`   📧 Email: ${req.body.email || 'N/A'}`);
        console.error(`   🎫 Credential provided: ${req.body.credential ? 'Yes' : 'No'}`);
        console.error('='.repeat(60));
        
        // Handle specific database connection errors
        if (error.code === 'ENOTOPEN') {
            console.error('🔌 ERROR TYPE: Database connection not open');
            return res.status(503).json({ error: 'Database connection unavailable' });
        } else if (error.code === 'ELOGIN') {
            console.error('🔑 ERROR TYPE: Database authentication failed');
            return res.status(503).json({ error: 'Database authentication error' });
        }
        
        return res.status(500).json({ error: 'Google authentication failed' });
    }
}

// Internal register function to avoid circular calls
async function googleRegisterInternal(req, res) {
    try {
        console.log('\n🚀 GOOGLE AUTO-REGISTRATION API CALLED');
        console.log('='.repeat(60));
        console.log(`⏰ Registration timestamp: ${new Date().toLocaleString()}`);
        
        const { credential } = req.body;
        console.log(`🎫 Re-validating credential: ${credential ? 'Yes' : 'No'}`);
        
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }
        
        console.log('🔐 Re-verifying Google JWT token for registration...');
        // Verify Google JWT token
        const ticket = await clientID.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        
        // Validate required fields
        if (!email || !name || !googleId) {
            console.error('❌ ERROR: Missing required fields from Google token');
            return res.status(400).json({ error: 'Invalid Google token payload' });
        }
        
        console.log('✅ Google token re-verified successfully');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${name}`);
        console.log(`🆔 Google ID: ${googleId}`);
        console.log('🔍 Double-checking user existence in database...');
        
        const checkUserRequest = new sql.Request();
        checkUserRequest.input('email', sql.NVarChar, email);

        console.log(`📊 Query: SELECT * FROM Users WHERE email = '${email}'`);
        const userCheckResult = await checkUserRequest.query(
            'SELECT * FROM Users WHERE email = @email'
        );
        
        console.log(`📈 User check result: ${userCheckResult.recordset.length} record(s) found`);        if (!userCheckResult.recordset || userCheckResult.recordset.length === 0) {
            console.log('✅ CONFIRMED: User does not exist - PROCEEDING WITH REGISTRATION');
            console.log('🔨 STARTING AUTO-REGISTRATION PROCESS');
            console.log('📝 Creating new user account...');

            // User doesn't exist - Register new user
            console.log(`📧 Registering new Google user: ${email}`);
            console.log(`👤 User name: ${name}`);
            console.log(`🔑 Using Google ID as password: ${googleId}`);
            console.log(`👥 Default role: Member`);
            console.log(`✅ Default status: active`);
            console.log('💾 Inserting into Users table...');

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

            // Validate registration result
            if (!result.recordset || !result.recordset[0] || !result.recordset[0].user_id) {
                console.error('❌ ERROR: Failed to create user - no ID returned');
                return res.status(500).json({ error: 'User registration failed' });
            }

            const userId = result.recordset[0].user_id;
            console.log('✅ USER ACCOUNT CREATED SUCCESSFULLY');
            console.log(`🆔 New User ID: ${userId}`);
            console.log(`📧 Email: ${email}`);
            console.log(`👥 Role: Member`);
            console.log(`✅ Status: active`);
            console.log('📝 Creating user profile...');

            // Create profile for the new user
            const createProfileRequest = new sql.Request();
            createProfileRequest.input('userId', sql.Int, userId)
                .input('name', sql.NVarChar, name);

            console.log(`💾 Inserting into Profiles table for user ID: ${userId}`);
            await createProfileRequest.query(
                `INSERT INTO Profiles (user_id, name)
                 VALUES (@userId, @name);`
            );

            console.log('✅ USER PROFILE CREATED SUCCESSFULLY');
            console.log(`🆔 Profile for User ID: ${userId}`);
            console.log(`👤 Profile Name: ${name}`);
            console.log('🔑 Generating JWT token for new user...');

            console.log('🎉 GOOGLE AUTO-REGISTRATION COMPLETED SUCCESSFULLY');
            console.log('📊 REGISTRATION SUMMARY:');
            console.log(`   📧 Email: ${email}`);
            console.log(`   👤 Name: ${name}`);
            console.log(`   🆔 User ID: ${userId}`);
            console.log(`   👥 Role: Member`);
            console.log(`   ✅ Status: active`);
            console.log(`   📅 Created: ${new Date().toLocaleString()}`);            // Generate JWT token for session
            const token = jwt.sign(
                {
                    userId: userId,
                    email: email,
                    role: 'Member'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ JWT token generated for new user');
            console.log(`🎯 Token payload: userId=${userId}, email=${email}, role=Member`);
            console.log('🎉 AUTO-REGISTRATION PROCESS COMPLETE');
            console.log('📤 Sending registration response to client...');
            console.log('='.repeat(60));

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
            console.log('⚠️  USER ALREADY EXISTS - REDIRECTING TO LOGIN');
            console.log(`📊 Found ${userCheckResult.recordset.length} existing record(s)`);
            console.log('🔄 Calling Google login function...');
            console.log('='.repeat(60));
            
            // Return to login instead of calling exports to avoid circular reference
            return exports.googleLogin(req, res);
        }
    } catch (error) {
        console.error('\n❌ GOOGLE REGISTRATION ERROR OCCURRED');
        console.error('='.repeat(60));
        console.error(`💥 Error type: ${error.name}`);
        console.error(`📝 Error message: ${error.message}`);
        console.error(`⏰ Error timestamp: ${new Date().toLocaleString()}`);
        
        if (error.stack) {
            console.error('📋 Stack trace:');
            console.error(error.stack);
        }
        
        // Check specific error types
        if (error.message && error.message.includes('IDENTITY_INSERT')) {
            console.error('🆔 ERROR TYPE: Database identity insert issue');
        } else if (error.message && error.message.includes('duplicate')) {
            console.error('🔄 ERROR TYPE: Duplicate entry detected');
        } else if (error.code) {
            console.error(`🔢 SQL Error code: ${error.code}`);
        }
        
        console.error('📊 Registration attempt details:');
        console.error(`   📧 Email: ${req.body.email || 'N/A'}`);
        console.error(`   🎫 Credential provided: ${req.body.credential ? 'Yes' : 'No'}`);
        console.error('='.repeat(60));
        
        // Handle specific database errors
        if (error.code === 'ENOTOPEN') {
            console.error('🔌 ERROR TYPE: Database connection not open');
            return res.status(503).json({ error: 'Database connection unavailable' });
        } else if (error.number === 2627) {
            console.error('🔄 ERROR TYPE: Duplicate key violation');
            return res.status(409).json({ error: 'User already exists' });
        }
        
        return res.status(500).json({ error: 'Failed to register Google user' });
    }
}

exports.googleRegister = googleRegisterInternal;