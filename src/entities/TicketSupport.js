/**
 * TicketSupport Entity for TypeORM
 * Represents the Ticket_Support table in the database
 */
const { EntitySchema } = require('typeorm');

const TicketSupport = new EntitySchema({
    name: "TicketSupport",
    tableName: "Ticket_Support",
    columns: {
        ticket_id: {
            type: "int",
            primary: true,
            generated: true
        },
        user_id: {
            type: "int",
            nullable: true
        },
        content: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        status: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        type: {
            type: "varchar",
            length: 50,
            nullable: true
        }
    },
    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "user_id"
            }
        }
    }
});

module.exports = TicketSupport;
