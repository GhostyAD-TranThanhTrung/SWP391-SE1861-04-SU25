/**
 * Consultation Entity for TypeORM
 * Represents the Consultations table in the database
 */
const { EntitySchema } = require("typeorm");

const Consultation = new EntitySchema({
  name: "Consultation",
  tableName: "Consultations",
  columns: {
    consultation_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    scheduled_time: {
      type: "datetime",
      nullable: true,
    },
    meeting_link: {
      type: "nvarchar",
      length: 255,
      nullable: true,
    },
    note: {
      type: "nvarchar",
      nullable: true,
    },
    status: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
  },
  relations: {
    // sessions: {
    //   type: "one-to-many",
    //   target: "BookConsultationSession",
    //   inverseSide: "consultation",
    // },
  },
});

module.exports = Consultation;
