/**
 * Action Entity for TypeORM
 * Represents the Action table in the database
 */
const { EntitySchema } = require('typeorm');

const Action = new EntitySchema({
    name: "Action",
    tableName: "Action",
    columns: {
        action_id: {
            type: "int",
            primary: true,
            generated: true
        },
        description: {
            type: "nvarchar",
            length: 255,
            nullable: true
        },
        range: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        type: {
            type: "varchar",
            length: 50,
            nullable: true
        }
    },
    relations: {
        assessments: {
            type: "one-to-many",
            target: "Assessment",
            inverseSide: "action"
        }
    }
});

module.exports = Action;
