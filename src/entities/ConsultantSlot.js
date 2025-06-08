/**
 * ConsultantSlot Entity for TypeORM
 * Represents the Consultant_Slot junction table in the database
 */
const { EntitySchema } = require('typeorm');

const ConsultantSlot = new EntitySchema({
    name: "ConsultantSlot",
    tableName: "Consultant_Slot",
    columns: {
        consultant_id: {
            type: "int",
            primary: true
        },
        slot_id: {
            type: "int",
            primary: true
        },
        day_of_week: {
            type: "varchar",
            length: 20,
            primary: true
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

module.exports = ConsultantSlot;
