/**
 * Category Entity for TypeORM
 * Represents the Category table in the database
 */
const { EntitySchema } = require('typeorm');

const Category = new EntitySchema({
    name: "Category",
    tableName: "Category",
    columns: {
        category_id: {
            type: "int",
            primary: true,
            generated: true
        },
        description: {
            type: "nvarchar",
            length: 255,
            nullable: true
        }
    },
    relations: {
        programs: {
            type: "one-to-many",
            target: "Program",
            inverseSide: "category"
        }
    }
});

module.exports = Category;
