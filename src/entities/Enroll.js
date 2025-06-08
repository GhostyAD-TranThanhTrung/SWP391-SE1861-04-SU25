/**
 * Enroll Entity for TypeORM
 * Represents the Enroll table in the database
 */
const { EntitySchema } = require('typeorm');

const Enroll = new EntitySchema({
    name: "Enroll",
    tableName: "Enroll",
    columns: {
        user_id: {
            type: "int",
            primary: true
        },
        program_id: {
            type: "int",
            primary: true
        },
        start_at: {
            type: "datetime",
            nullable: true
        },
        complete_at: {
            type: "datetime",
            nullable: true
        },
        progress: {
            type: "float",
            nullable: true
        }
    },
    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "user_id"
            }
        },
        program: {
            type: "many-to-one",
            target: "Program",
            joinColumn: {
                name: "program_id",
                referencedColumnName: "program_id"
            }
        }
    }
});

module.exports = Enroll;
