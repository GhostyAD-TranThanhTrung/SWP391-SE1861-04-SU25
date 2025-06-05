/**
 * User Entity for TypeORM
 * Represents the Users table in the database
 */
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "Users",
  columns: {
    user_id: {
      primary: true,
      type: "int",
      generated: true,
    },
    date_create: {
      type: "datetime",
      default: () => "CURRENT_TIMESTAMP",
    },
    role: {
      type: "varchar",
      length: 50,
    },
    password: {
      type: "nvarchar",
      length: 255,
    },
    status: {
      type: "varchar",
      length: 20,
    },
    email: {
      type: "nvarchar",
      length: 255,
      unique: true,
    },
  },
  relations: {
    // profile: {
    //   type: "one-to-one",
    //   target: "Profile",
    //   inverseSide: "user",
    // },
    // blogs: {
    //   type: "one-to-many",
    //   target: "Blog",
    //   inverseSide: "author",
    // },
    // consultationsAsConsultant: {
    //   type: "one-to-many",
    //   target: "BookConsultationSession",
    //   inverseSide: "consultant",
    // },
    // consultationsAsMember: {
    //   type: "one-to-many",
    //   target: "BookConsultationSession",
    //   inverseSide: "member",
    // },
    // flags: {
    //   type: "one-to-many",
    //   target: "Flag",
    //   inverseSide: "flaggedBy",
    // },
    // tickets: {
    //   type: "one-to-many",
    //   target: "TicketSupport",
    //   inverseSide: "user",
    // },
    // logs: {
    //   type: "one-to-many",
    //   target: "ConsoleLog",
    //   inverseSide: "user",
    // },
    // assessments: {
    //   type: "one-to-many",
    //   target: "Assessment",
    //   inverseSide: "user",
    // },
    // programs: {
    //   type: "one-to-many",
    //   target: "Program",
    //   inverseSide: "creator",
    // },
    // enrollments: {
    //   type: "one-to-many",
    //   target: "Enroll",
    //   inverseSide: "user",
    // },
    // surveyResponses: {
    //   type: "one-to-many",
    //   target: "SurveyResponse",
    //   inverseSide: "user",
    // },
  },
});
