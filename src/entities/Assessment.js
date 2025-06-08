/**
 * Assessment Entity for TypeORM
 * Represents the Assessments table in the database
 */
const { EntitySchema } = require('typeorm');

const Assessment = new EntitySchema({
    name: "Assessment",
    tableName: "Assessments",
    columns: {
        assessment_id: {
            type: "int",
            primary: true,
            generated: true
        },
        user_id: {
            type: "int",
            nullable: true
        },
        type: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        result_json: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        create_at: {
            type: "datetime",
            nullable: true
        },
        action_id: {
            type: "int",
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
        action: {
            type: "many-to-one",
            target: "Action",
            joinColumn: {
                name: "action_id",
                referencedColumnName: "action_id"
            }
        }
    }
});

module.exports = Assessment;
