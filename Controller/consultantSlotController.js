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

  /**
   * Update consultant slots for specific days
   * Deletes existing slots for consultant on specified days and creates new ones
   */
  static async updateConsultantSlots(req, res) {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      const { consultant_id, daysofweek, slot } = req.body;

      // Validate input
      if (!consultant_id || !daysofweek || !slot || !Array.isArray(slot)) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Required: consultant_id, daysofweek, and slot array"
        });
      }

      // Validate consultant exists
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultant_id) }
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found"
        });
      }

      // Validate slots exist
      const slotRepository = AppDataSource.getRepository(Slot);
      const existingSlots = await slotRepository.findByIds(slot);

      if (existingSlots.length !== slot.length) {
        return res.status(400).json({
          success: false,
          message: "Some slot IDs do not exist"
        });
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const consultantSlotRepository = queryRunner.manager.getRepository(ConsultantSlot);

      // Convert daysofweek to array if it's a single string
      const daysArray = Array.isArray(daysofweek) ? daysofweek : [daysofweek];

      // Delete existing consultant slots for the specified consultant and days
      await consultantSlotRepository.delete({
        consultant_id: parseInt(consultant_id),
        day_of_week: daysArray
      });

      // Create new consultant slots
      const newConsultantSlots = [];

      for (const day of daysArray) {
        for (const slotId of slot) {
          const newConsultantSlot = consultantSlotRepository.create({
            consultant_id: parseInt(consultant_id),
            slot_id: parseInt(slotId),
            day_of_week: day
          });
          newConsultantSlots.push(newConsultantSlot);
        }
      }

      // Save all new consultant slots
      const savedSlots = await consultantSlotRepository.save(newConsultantSlots);

      await queryRunner.commitTransaction();

      // Format response
      const formattedSlots = savedSlots.map(cs => ({
        consultant_id: cs.consultant_id,
        slot_id: cs.slot_id,
        day_of_week: cs.day_of_week
      }));

      res.status(200).json({
        success: true,
        data: {
          consultant_id: parseInt(consultant_id),
          days_updated: daysArray,
          slots_created: formattedSlots,
          total_slots_created: formattedSlots.length
        },
        message: `Successfully updated consultant slots for consultant ID ${consultant_id}`
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error updating consultant slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update consultant slots",
        error: error.message,
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete all slots for a consultant
   */
  static async deleteConsultantSlots(req, res) {
    try {
      const { consultantId } = req.params;
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      // Validate consultant exists
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) }
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found"
        });
      }

      // Delete all slots for the consultant
      const deleteResult = await consultantSlotRepository.delete({
        consultant_id: parseInt(consultantId)
      });

      res.status(200).json({
        success: true,
        data: {
          consultant_id: parseInt(consultantId),
          deleted_count: deleteResult.affected || 0
        },
        message: `Successfully deleted all slots for consultant ID ${consultantId}`
      });

    } catch (error) {
      console.error("Error deleting consultant slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete consultant slots",
        error: error.message,
      });
    }
  }

  /**
   * Create multiple consultant slots
   */
  static async createConsultantSlots(req, res) {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      const { consultantId } = req.params;
      const { slots } = req.body;

      // Validate input
      if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Required: slots array"
        });
      }

      // Validate consultant exists
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) }
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found"
        });
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const consultantSlotRepository = queryRunner.manager.getRepository(ConsultantSlot);

      // Create new consultant slots
      const newConsultantSlots = slots.map(slotData =>
        consultantSlotRepository.create({
          consultant_id: parseInt(consultantId),
          slot_id: parseInt(slotData.slot_id),
          day_of_week: slotData.day_of_week || 'Monday' // Default to Monday if not specified
        })
      );

      // Save all new consultant slots
      const savedSlots = await consultantSlotRepository.save(newConsultantSlots);

      await queryRunner.commitTransaction();

      // Format response
      const formattedSlots = savedSlots.map(cs => ({
        consultant_id: cs.consultant_id,
        slot_id: cs.slot_id,
        day_of_week: cs.day_of_week
      }));

      res.status(201).json({
        success: true,
        data: {
          consultant_id: parseInt(consultantId),
          slots_created: formattedSlots,
          total_slots_created: formattedSlots.length
        },
        message: `Successfully created ${formattedSlots.length} slots for consultant ID ${consultantId}`
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error creating consultant slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create consultant slots",
        error: error.message,
      });
    } finally {
      await queryRunner.release();
    }
  }
}

module.exports = ConsultantSlotController;
