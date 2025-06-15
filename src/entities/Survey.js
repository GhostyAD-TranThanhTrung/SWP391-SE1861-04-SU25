/**
 * Survey Entity for TypeORM
 * Represents the Surveys table in the database
 */
const { EntitySchema } = require('typeorm');

const Survey = new EntitySchema({
    name: "Survey",
    tableName: "Surveys",
    columns: {
        survey_id: {
            type: "int",
            primary: true,
            generated: true
        },
        program_id: {
            type: "int",
            nullable: true
        },
        type: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        questions_json: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        }
    },
    relations: {
        program: {
            type: "many-to-one",
            target: "Program",
            joinColumn: {
                name: "program_id",
                referencedColumnName: "program_id"
            }
        },
        responses: {
            type: "one-to-many",
            target: "SurveyResponse",
            inverseSide: "survey"
        }
    }
});

module.exports = Survey;
