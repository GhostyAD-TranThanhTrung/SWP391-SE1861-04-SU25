/**
 * BookingSession Entity for TypeORM
 * Represents the Booking_Session table in the database
 */
const { EntitySchema } = require('typeorm');

const BookingSession = new EntitySchema({
    name: "BookingSession",
    tableName: "Booking_Session",
    columns: {
        booking_id: {
            type: "int",
            primary: true,
            generated: true
        },
        consultant_id: {
            type: "int",
            nullable: true
        },
        member_id: {
            type: "int",
            nullable: true
        },
        slot_id: {
            type: "int",
            nullable: true
        },
        booking_date: {
            type: "date",
            nullable: false
        },
        status: {
            type: "varchar",
            length: 20,
            nullable: true
        },
        notes: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        }
    },
    relations: {
        consultant: {
            type: "many-to-one",
            target: "Consultant",
            joinColumn: {
                name: "consultant_id",
                referencedColumnName: "id_consultant"
            }
        },
        member: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "member_id",
                referencedColumnName: "user_id"
            }
        },
        slot: {
            type: "many-to-one",
            target: "Slot",
            joinColumn: {
                name: "slot_id",
                referencedColumnName: "slot_id"
            }
        }
    }
});

module.exports = BookingSession;
