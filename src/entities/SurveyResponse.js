/**
 * SurveyResponse Entity for TypeORM
 * Represents the Survey_Responses table in the database
 */
const { EntitySchema } = require('typeorm');

const SurveyResponse = new EntitySchema({
    name: "SurveyResponse",
    tableName: "Survey_Responses",
    columns: {
        response_id: {
            type: "int",
            primary: true,
            generated: true
        },
        survey_id: {
            type: "int",
            nullable: true
        },
        user_id: {
            type: "int",
            nullable: true
        },
        answer_json: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        submitted_at: {
            type: "datetime",
            nullable: true
        }
    },
    relations: {
        survey: {
            type: "many-to-one",
            target: "Survey",
            joinColumn: {
                name: "survey_id",
                referencedColumnName: "survey_id"
            }
        },
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "user_id"
            }
        }
    }
});

module.exports = SurveyResponse;
