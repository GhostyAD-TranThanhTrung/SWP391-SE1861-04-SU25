const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Flag",
  tableName: "Flags",
  columns: {
    flag_id: {
      primary: true,
      type: "int",
      generated: true,
    },
    blog_id: {
      type: "int",
    },
    flagged_by: {
      type: "int",
    },
    reason: {
      type: "nvarchar",
      length: 255,
      nullable: true,
    },
    created_at: {
      type: "datetime",
      nullable: true,
    },
  },
  relations: {
    // blog: {
    //   type: "many-to-one",
    //   target: "Blog",
    //   joinColumn: {
    //     name: "blog_id",
    //     referencedColumnName: "blog_id",
    //   },
    // },
    // flaggedBy: {
    //   type: "many-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "flagged_by",
    //     referencedColumnName: "user_id",
    //   },
    // },
  },
});
