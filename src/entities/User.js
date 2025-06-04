/**
 * User Entity for TypeORM
 * Represents the Users table in the database
 */
const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
    name: "User",
    tableName: "Users",
    columns: {
        user_id: {
            type: "int",
            primary: true,
            generated: true
        },
        date_create: {
            type: "datetime",
            default: () => "GETDATE()"
        },
        role: {
            type: "varchar",
            length: 50
        },
        password: {
            type: "nvarchar",
            length: 255
        },
        status: {
            type: "varchar",
            length: 20,
            enum: ['active', 'inactive', 'banned']
        },
        email: {
            type: "nvarchar",
            length: 255,
            unique: true
        }

    },
    relations: {

    }
});

module.exports = User;
