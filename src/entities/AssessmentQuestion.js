/**
 * AssessmentQuestion Entity for TypeORM
 * Represents the Assessments_question table in the database
 */
const { EntitySchema } = require('typeorm');

const AssessmentQuestion = new EntitySchema({
    name: "AssessmentQuestion",
    tableName: "Assessments_question",
    columns: {
        assessment_question_id: {
            type: "int",
            primary: true,
            generated: true
        },
        question: {
            type: "nvarchar",
            length: "MAX",
            nullable: false
        },
        type: {
            type: "nvarchar",
            length: 100,
            nullable: false
        },
        note: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        assessment_type: {
            type: "nvarchar",
            length: 50,
            nullable: false
        },
        multiSelect: {
            type: "bit",
            nullable: false,
            default: 0
        },
        allowMultiple: {
            type: "bit",
            nullable: false,
            default: 0
        },
        category: {
            type: "nvarchar",
            length: 50,
            nullable: true
        },
        substance: {
            type: "nvarchar",
            length: 50,
            nullable: true
        },
        letter: {
            type: "nvarchar",
            length: 10,
            nullable: true
        }
    },
    relations: {
        options: {  // Changed from answers to options
            type: "one-to-many",
            target: "Answer",
            inverseSide: "assessmentQuestion"
        }
    }
});

module.exports = AssessmentQuestion;
