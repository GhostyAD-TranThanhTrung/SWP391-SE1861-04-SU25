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
    user: 'sa',
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

app.get('/', (req, res) => {
    new sql.Request().query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error('SQL error', err);
            res.status(500).send('Error querying database');
            return;
        }
        res.json(result.recordset);
    });
});

app.get('/api/data', (req, res) => {
    // This is a test endpoint used by the React app to verify connection
    res.json({ message: 'Hello from the API!' });
});

app.post('/api/login', (req, res) => {
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
                console.log(`User ${username} logged in successfully`);
                res.json({
                    message: 'Login successful',
                    user: {
                        id: result.recordset[0].id,
                        username: result.recordset[0].username
                    }
                });
            }
        );
});