const jwt = require('jsonwebtoken');

// Test JWT token generation and verification
const JWT_SECRET = 'swp391-super-secret-jwt-key-2025-secure';

// Simulate token creation (like in googleController)
const testToken = jwt.sign(
    {
        userId: 123,
        email: 'test@gmail.com',
        role: 'Member'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
);

console.log('🔐 Generated Token:', testToken);

// Simulate token verification (like in authController)
try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Token Verification Successful:', decoded);
} catch (error) {
    console.log('❌ Token Verification Failed:', error.message);
}