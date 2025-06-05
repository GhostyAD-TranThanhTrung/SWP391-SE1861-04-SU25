/**
 * Profile Entity for TypeORM
 * Represents the Profile table in the database
 */
const { EntitySchema } = require("typeorm");

const Profile = new EntitySchema({
  name: "Profile",
  tableName: "Profile",
  columns: {
    user_id: {
      type: "int",
      primary: true,
    },
    name: {
      type: "nvarchar",
      length: 100,
      nullable: true,
    },
    certification: {
      type: "nvarchar",
      length: 255,
      nullable: true,
    },
    works_hours_json: {
      type: "nvarchar",
      nullable: true,
    },
    bio_json: {
      type: "nvarchar",
      nullable: true,
    },
    date_of_birth: {
      type: "date",
      nullable: true,
    },
    job: {
      type: "nvarchar",
      nullable: true,
    },
  },
  relations: {
    // user: {
    //   type: "one-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "user_id",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
});

module.exports = Profile;
