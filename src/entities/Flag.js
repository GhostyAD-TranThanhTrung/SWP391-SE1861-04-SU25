/**
 * Flag Entity for TypeORM
 * Represents the Flags table in the database
 */
const { EntitySchema } = require('typeorm');

const Flag = new EntitySchema({
    name: "Flag",
    tableName: "Flags",
    columns: {
        flag_id: {
            type: "int",
            primary: true,
            generated: true
        },
        blog_id: {
            type: "int",
            nullable: true
        },
        flagged_by: {
            type: "int",
            nullable: true
        },
        reason: {
            type: "nvarchar",
            length: 255,
            nullable: true
        },
        created_at: {
            type: "datetime",
            nullable: true
        }
    },
    relations: {
        blog: {
            type: "many-to-one",
            target: "Blog",
            joinColumn: {
                name: "blog_id",
                referencedColumnName: "blog_id"
            }
        },
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "flagged_by",
                referencedColumnName: "user_id"
            }
        }
    }
});

module.exports = Flag;
