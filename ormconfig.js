/**
 * TypeORM Configuration for JavaScript
 * This replaces the raw mssql connection with TypeORM ORM
 */

const config = {
  type: "mssql",
  host: "localhost",
  port: 1433,
  username: "sa",
  password: "12345",
  database: "SWP391demo",
  synchronize: false, // Set to true only in development to auto-create tables
  logging: true, // Shows SQL queries in console for debugging

  // Remove entity and migration paths since we're importing directly in data-source.js
  // entities: ["src/entities/*.js"],
  // migrations: ["src/migrations/*.js"],

  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false,
  },

  // Connection pooling settings for better performance
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  // Connection timeout settings
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// Optional: Add environment variable support
// Uncomment to use environment variables
/*
if (process.env.DB_HOST) config.host = process.env.DB_HOST;
if (process.env.DB_PORT) config.port = parseInt(process.env.DB_PORT);
if (process.env.DB_USERNAME) config.username = process.env.DB_USERNAME;
if (process.env.DB_PASSWORD) config.password = process.env.DB_PASSWORD;
if (process.env.DB_NAME) config.database = process.env.DB_NAME;
*/

module.exports = config;
