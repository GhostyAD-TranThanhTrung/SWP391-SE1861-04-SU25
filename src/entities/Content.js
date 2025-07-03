/**
 * Content Entity for TypeORM
 * Represents the Content table in the database
 */
const { EntitySchema } = require('typeorm');

const Content = new EntitySchema({
    name: "Content",
    tableName: "Content",
    columns: {
        content_id: {
            type: "int",
            primary: true,
            generated: true
        },
        program_id: {
            type: "int",
            nullable: true
        },
        title: {
            type: "nvarchar",
            length: 255,
            nullable: true
        },
        type: {
            type: "nvarchar",
            length: 50,
            nullable: true
        },
        orders: {
            type: "int",
            nullable: true
        },
        content_file_link: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        content_type: {
            type: "nvarchar",
            length: 50,
            nullable: true
        },
        content_metadata_json: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        }
    },
    relations: {
        program: {
            type: "many-to-one",
            target: "Program",
            joinColumn: {
                name: "program_id",
                referencedColumnName: "program_id"
            }
        }
    }
});

module.exports = Content;
