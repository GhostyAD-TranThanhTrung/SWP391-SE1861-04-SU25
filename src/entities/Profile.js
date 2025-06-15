/**
 * Profile Entity for TypeORM
 * Represents the Profile table in the database
 */
const { EntitySchema } = require('typeorm');

const Profile = new EntitySchema({
    name: "Profile",
    tableName: "Profile",
    columns: {
        user_id: {
            type: "int",
            primary: true,
            nullable: false
        },
        name: {
            type: "nvarchar",
            length: 100,
            nullable: true
        },
        bio_json: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        date_of_birth: {
            type: "date",
            nullable: true
        },
        job: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        }
    },
    relations: {
        user: {
            type: "one-to-one",
            target: "User",
            joinColumn: { name: "user_id" },
            onDelete: "CASCADE"
        }
    }
});

module.exports = Profile;