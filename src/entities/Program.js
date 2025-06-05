const { EntitySchema } = require("typeorm");

const Program = new EntitySchema({
  name: "Program",
  tableName: "Programs",
  columns: {
    program_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    title: {
      type: "nvarchar",
      length: 255,
    },
    description: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
    },
    create_by: {
      type: "int",
    },
    status: {
      type: "varchar",
      length: 50,
    },
    age_group: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    create_at: {
      type: "datetime",
      nullable: true,
    },
    category_id: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    // creator: {
    //   type: "many-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "create_by",
    //     referencedColumnName: "user_id",
    //   },
    // },
    // category: {
    //   type: "many-to-one",
    //   target: "Category",
    //   joinColumn: {
    //     name: "category_id",
    //     referencedColumnName: "category_id",
    //   },
    // },
    // contents: {
    //   type: "one-to-many",
    //   target: "Content",
    //   inverseSide: "program",
    // },
    // surveys: {
    //   type: "one-to-many",
    //   target: "Survey",
    //   inverseSide: "program",
    // },
    // enrollments: {
    //   type: "one-to-many",
    //   target: "Enroll",
    //   inverseSide: "program",
    // },
  },
});

module.exports = Program;
