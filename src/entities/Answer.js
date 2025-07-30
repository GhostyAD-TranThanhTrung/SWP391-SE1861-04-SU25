/**
 * Answer Entity for TypeORM
 * Represents the Answers table in the database
 */
const { EntitySchema } = require("typeorm");

const Answer = new EntitySchema({
  name: "Answer",
  tableName: "Answers",
  columns: {
    answer_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    assessment_question_id: {
      type: "int",
      nullable: false,
    },
    option_id: {
      type: "int",
      nullable: false,
    },
    text: {
      type: "nvarchar",
      length: "MAX",
      nullable: false,
    },
    score: {
      type: "int",
      nullable: false,
      default: 0,
    },
    answer_order: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    assessmentQuestion: {
      type: "many-to-one",
      target: "AssessmentQuestion",
      joinColumn: {
        name: "assessment_question_id",
        referencedColumnName: "assessment_question_id",
      },
      onDelete: "CASCADE",
    },
  },
});

module.exports = Answer;
