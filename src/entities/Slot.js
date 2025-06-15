/**
 * Slot Entity for TypeORM
 * Represents the Slot table in the database
 */
const { EntitySchema } = require('typeorm');

const Slot = new EntitySchema({
    name: "Slot",
    tableName: "Slot",
    columns: {
        slot_id: {
            type: "int",
            primary: true,
            generated: true
        },
        start_time: {
            type: "time",
            nullable: false
        },
        end_time: {
            type: "time",
            nullable: false
        }
    },
    relations: {
        consultants: {
            type: "many-to-many",
            target: "Consultant",
            joinTable: {
                name: "Consultant_Slot",
                joinColumn: {
                    name: "slot_id",
                    referencedColumnName: "slot_id"
                },
                inverseJoinColumn: {
                    name: "consultant_id",
                    referencedColumnName: "id_consultant"
                }
            }
        },
        bookings: {
            type: "one-to-many",
            target: "BookingSession",
            inverseSide: "slot"
        }
    }
});

module.exports = Slot;
