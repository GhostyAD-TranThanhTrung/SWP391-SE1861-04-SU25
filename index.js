/*
 * EXPRESS SERVER SETUP
 * This file sets up the Express backend that the React frontend connects to.
 * The connection between React and Express is handled through HTTP requests.
 */

// Required packages for the server
const e = require('express');
const express = require('express');
const cors = require('cors');  // Enables Cross-Origin Resource Sharing so React can connect

const sql = require('mssql');  // For database connections

const app = express();

app.use(cors());  // This allows the React app to make requests to this server
app.use(express.json());  // This parses JSON request bodies from React fetch calls

const config = {
    user: 'SA',
    password: '12345',
    server: 'localhost',
    port: 1433,
    database: 'SWP391-demo',
    options: {
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
}

sql.connect(config, err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
}
)



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Import controllers
const authController = require('./Controller/authController');
const registerController = require('./Controller/registerController'); // Import the register controller

// User routes
app.get('/', authController.getAllUsers);
app.get('/api/data', authController.testApi);
app.post('/api/login', authController.login);
app.post('/api/register', registerController.registerUser); // Registration endpoint - handles new user creation