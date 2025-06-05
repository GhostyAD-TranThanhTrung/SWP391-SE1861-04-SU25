/**
 * ConsoleLog Entity for TypeORM
 * Represents the console_log table in the database
 */
const { EntitySchema } = require("typeorm");

const ConsoleLog = new EntitySchema({
  name: "ConsoleLog",
  tableName: "console_log",
  columns: {
    log_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    user_id: {
      type: "int",
      nullable: true,
    },
    action: {
      type: "varchar",
      length: 100,
    },
    status: {
      type: "varchar",
      length: 50,
    },
    error_log: {
      type: "nvarchar",
      nullable: true,
    },
    date: {
      type: "datetime",
    },
  },
  relations: {
    // user: {
    //   type: "many-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "user_id",
    //   },
    // },
  },
});

module.exports = ConsoleLog;
