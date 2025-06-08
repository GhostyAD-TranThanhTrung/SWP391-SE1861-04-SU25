/**
 * User Entity for TypeORM
 * Represents the Users table in the database
 */
const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
    name: "User",
    tableName: "Users",
    columns: {
        user_id: {
            type: "int",
            primary: true,
            generated: true
        },
        date_create: {
            type: "datetime",
            nullable: false,
            default: () => "GETDATE()"
        },
        role: {
            type: "varchar",
            length: 50,
            nullable: false
        },
        password: {
            type: "nvarchar",
            length: 255,
            nullable: false
        },
        status: {
            type: "varchar",
            length: 20,
            nullable: false
        },
        email: {
            type: "nvarchar",
            length: 255,
            unique: true,
            nullable: false
        }
    },
    relations: {
        profile: {
            type: "one-to-one",
            target: "Profile",
            inverseSide: "user"
        },
        consultant: {
            type: "one-to-one",
            target: "Consultant",
            inverseSide: "user"
        },
        bookingSessions: {
            type: "one-to-many",
            target: "BookingSession",
            inverseSide: "member"
        },
        blogs: {
            type: "one-to-many",
            target: "Blog",
            inverseSide: "author"
        },
        flags: {
            type: "one-to-many",
            target: "Flag",
            inverseSide: "user"
        },
        tickets: {
            type: "one-to-many",
            target: "TicketSupport",
            inverseSide: "user"
        },
        logs: {
            type: "one-to-many",
            target: "ConsoleLog",
            inverseSide: "user"
        },
        assessments: {
            type: "one-to-many",
            target: "Assessment",
            inverseSide: "user"
        },
        programs: {
            type: "one-to-many",
            target: "Program",
            inverseSide: "creator"
        },
        enrollments: {
            type: "one-to-many",
            target: "Enroll",
            inverseSide: "user"
        },
        surveyResponses: {
            type: "one-to-many",
            target: "SurveyResponse",
            inverseSide: "user"
        }
    }
});

module.exports = User;
