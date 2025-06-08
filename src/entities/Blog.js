/**
 * Blog Entity for TypeORM
 * Represents the Blogs table in the database
 */
const { EntitySchema } = require('typeorm');

const Blog = new EntitySchema({
    name: "Blog",
    tableName: "Blogs",
    columns: {
        blog_id: {
            type: "int",
            primary: true,
            generated: true
        },
        author_id: {
            type: "int",
            nullable: true
        },
        title: {
            type: "nvarchar",
            length: 255,
            nullable: true
        },
        body: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        created_at: {
            type: "datetime",
            nullable: true
        },
        status: {
            type: "varchar",
            length: 50,
            nullable: true
        }
    },
    relations: {
        author: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "author_id",
                referencedColumnName: "user_id"
            }
        },
        flags: {
            type: "one-to-many",
            target: "Flag",
            inverseSide: "blog"
        }
    }
});

module.exports = Blog;
