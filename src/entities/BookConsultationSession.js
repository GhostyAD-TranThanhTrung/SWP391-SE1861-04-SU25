/**
 * BookConsultationSession Entity for TypeORM
 * Represents the Book_Consultation_Session table in the database
 */
const { EntitySchema } = require("typeorm");

const BookConsultationSession = new EntitySchema({
  name: "BookConsultationSession",
  tableName: "Book_Consultation_Session",
  columns: {
    consultation_id: {
      type: "int",
      primary: true,
    },
    session_number: {
      type: "int",
      primary: true,
    },
    consultant_id: {
      type: "int",
      primary: true,
    },
    member_id: {
      type: "int",
      primary: true,
    },
  },
  relations: {
    // consultation: {
    //   type: "many-to-one",
    //   target: "Consultation",
    //   joinColumn: {
    //     name: "consultation_id",
    //   },
    // },
    // consultant: {
    //   type: "many-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "consultant_id",
    //   },
    // },
    // member: {
    //   type: "many-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "member_id",
    //   },
    // },
  },
});

module.exports = BookConsultationSession;
