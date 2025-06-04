const { DataSource } = require('typeorm');
const ormConfig = require('../ormconfig');

// Import entities
const User = require('./entities/User.js');

const AppDataSource = new DataSource({
    ...ormConfig,
    entities: [
        User
    ]
});

module.exports = AppDataSource;
