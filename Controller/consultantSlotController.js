/**
 * Consultant Slot Controller using TypeORM
 * CRUD operations for Consultant_Slot junction table
 */
const AppDataSource = require("../src/data-source");
const ConsultantSlot = require("../src/entities/ConsultantSlot");
const Consultant = require("../src/entities/Consultant");
const Slot = require("../src/entities/Slot");

class ConsultantSlotController {

  /**
   * Get slots by consultant ID
   */
  static async getSlotsByConsultantId(req, res) {
    try {
      const { consultantId } = req.params;
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      const consultantSlots = await consultantSlotRepository.find({
        where: { consultant_id: parseInt(consultantId) },
        relations: {
          slot: true,
        },
      });

      // Format the response to include slot times
      const formattedSlots = consultantSlots.map(cs => ({
        consultant_id: cs.consultant_id,
        slot_id: cs.slot_id,
        day_of_week: cs.day_of_week,
        start_time: cs.slot.start_time,
        end_time: cs.slot.end_time
      }));

      res.status(200).json({
        success: true,
        data: formattedSlots,
        count: formattedSlots.length,
        message: `Slots for consultant ID ${consultantId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting slots by consultant ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slots by consultant ID",
        error: error.message,
      });
    }
  }
}

module.exports = ConsultantSlotController;
