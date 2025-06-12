/**
 * TypeORM Configuration for JavaScript
 * This replaces the raw mssql connection with TypeORM ORM
 */

const config = {
  type: "mssql",
  host: "localhost",
  port: 1433,
  username: "SA",
  password: "12345",
  database: "SWP391-demo",
  synchronize: false, // Set to true only in development to auto-create tables
  logging: true, // Shows SQL queries in console for debugging
  entities: [
    "/entities/*.js", // Path to your entity files
  ],
  migrations: ["/migrations/*.js"],
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false,
  },
};

module.exports = config;
