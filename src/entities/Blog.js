/**
 * Blog Entity for TypeORM
 * Represents the Blogs table in the database
 */
const { EntitySchema } = require("typeorm");

const Blog = new EntitySchema({
  name: "Blog",
  tableName: "Blogs",
  columns: {
    blog_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    author_id: {
      type: "int",
    },
    title: {
      type: "nvarchar",
      length: 255,
    },
    content: {
      type: "nvarchar",
    },
    created_at: {
      type: "datetime",
      createDate: true,
    },
    status: {
      type: "varchar",
      length: 50,
    },
  },
  relations: {
    // author: {
    //   type: "many-to-one",
    //   target: "User",
    //   joinColumn: {
    //     name: "author_id",
    //   },
    // },
    // flags: {
    //   type: "one-to-many",
    //   target: "Flag",
    //   inverseSide: "blog",
    // },
  },
});

module.exports = Blog;
