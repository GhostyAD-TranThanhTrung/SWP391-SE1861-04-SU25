/**
 * Consultant Entity for TypeORM
 * Represents the Consultant table in the database
 */
const { EntitySchema } = require("typeorm");

const Consultant = new EntitySchema({
  name: "Consultant",
  tableName: "Consultant",
  columns: {
    id_consultant: {
      type: "int",
      primary: true,
      generated: true,
    },
    user_id: {
      type: "int",
      nullable: false,
      unique: true,
    },
    cost: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    certification: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
    },
    speciality: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "user_id",
      },
    },
    bookingSessions: {
      type: "one-to-many",
      target: "BookingSession",
      inverseSide: "consultant",
    },
    consultantSlots: {
      type: "one-to-many",
      target: "ConsultantSlot",
      inverseSide: "consultant",
    },
  },
});

module.exports = Consultant;
