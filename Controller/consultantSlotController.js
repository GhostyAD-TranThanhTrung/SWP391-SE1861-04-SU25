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
   * Get all consultant slots
   */
  static async getAllConsultantSlots(req, res) {
    try {
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);
      const consultantSlots = await consultantSlotRepository.find();

      res.status(200).json({
        success: true,
        data: consultantSlots,
        message: "Consultant slots retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant slots",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant slots with consultant and slot information
   */
  static async getSlotsWithDetails(req, res) {
    try {
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);
      const consultantSlots = await consultantSlotRepository.find({
        relations: {
          consultant: true,
          slot: true,
        },
      });

      res.status(200).json({
        success: true,
        data: consultantSlots,
        message: "Consultant slots with details retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant slots with details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant slots with details",
        error: error.message,
      });
    }
  }

  /**
   * Get slots by consultant ID
   */
  static async getSlotsByConsultantId(req, res) {
    try {
      const { consultantId } = req.params;
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      const consultantSlots = await consultantSlotRepository.find({
        where: { consultant_id: parseInt(consultantId) },
        relations: {
          slot: true,
        },
      });

      res.status(200).json({
        success: true,
        data: consultantSlots,
        count: consultantSlots.length,
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
   * Get consultants by slot ID
   */
  static async getConsultantsBySlotId(req, res) {
    try {
      const { slotId } = req.params;
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      const consultantSlots = await consultantSlotRepository.find({
        where: { slot_id: parseInt(slotId) },
        relations: {
          consultant: {
            user: true,
          },
        },
      });

      res.status(200).json({
        success: true,
        data: consultantSlots,
        count: consultantSlots.length,
        message: `Consultants for slot ID ${slotId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting consultants by slot ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultants by slot ID",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant slots by day of week
   */
  static async getSlotsByDayOfWeek(req, res) {
    try {
      const { day } = req.params;
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      const consultantSlots = await consultantSlotRepository.find({
        where: { day_of_week: day },
        relations: {
          consultant: true,
          slot: true,
        },
      });

      res.status(200).json({
        success: true,
        data: consultantSlots,
        count: consultantSlots.length,
        message: `Slots for day ${day} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting slots by day of week:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slots by day of week",
        error: error.message,
      });
    }
  }

  /**
   * Create new consultant slot
   */
  static async createConsultantSlot(req, res) {
    try {
      const { consultant_id, slot_id, day_of_week } = req.body;

      // Validate required fields
      if (!consultant_id || !slot_id || !day_of_week) {
        return res.status(400).json({
          success: false,
          message: "Consultant ID, slot ID, and day of week are required",
        });
      }

      // Validate day of week format
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      if (!validDays.includes(day_of_week)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid day of week. Must be one of: " + validDays.join(", "),
        });
      }

      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const slotRepository = AppDataSource.getRepository(Slot);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultant_id) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Check if slot exists
      const slot = await slotRepository.findOne({
        where: { slot_id: parseInt(slot_id) },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      // Check if the consultant slot already exists
      const existingSlot = await consultantSlotRepository.findOne({
        where: {
          consultant_id: parseInt(consultant_id),
          slot_id: parseInt(slot_id),
          day_of_week,
        },
      });

      if (existingSlot) {
        return res.status(409).json({
          success: false,
          message: "This consultant slot already exists",
        });
      }

      // Create new consultant slot
      const newConsultantSlot = consultantSlotRepository.create({
        consultant_id: parseInt(consultant_id),
        slot_id: parseInt(slot_id),
        day_of_week,
      });

      const savedConsultantSlot = await consultantSlotRepository.save(
        newConsultantSlot
      );

      res.status(201).json({
        success: true,
        data: savedConsultantSlot,
        message: "Consultant slot created successfully",
      });
    } catch (error) {
      console.error("Error creating consultant slot:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create consultant slot",
        error: error.message,
      });
    }
  }

  /**
   * Delete consultant slot
   */
  static async deleteConsultantSlot(req, res) {
    try {
      const { consultantId, slotId, dayOfWeek } = req.params;

      if (!consultantId || !slotId || !dayOfWeek) {
        return res.status(400).json({
          success: false,
          message: "Consultant ID, slot ID, and day of week are required",
        });
      }

      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      // Check if consultant slot exists
      const consultantSlot = await consultantSlotRepository.findOne({
        where: {
          consultant_id: parseInt(consultantId),
          slot_id: parseInt(slotId),
          day_of_week: dayOfWeek,
        },
      });

      if (!consultantSlot) {
        return res.status(404).json({
          success: false,
          message: "Consultant slot not found",
        });
      }

      // Delete the consultant slot
      await consultantSlotRepository.remove(consultantSlot);

      res.status(200).json({
        success: true,
        message: "Consultant slot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting consultant slot:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete consultant slot",
        error: error.message,
      });
    }
  }

  /**
   * Get available consultant slots by day and consultant
   */
  static async getAvailableSlots(req, res) {
    try {
      const { consultantId, dayOfWeek } = req.query;

      if (!dayOfWeek) {
        return res.status(400).json({
          success: false,
          message: "Day of week is required",
        });
      }

      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      if (!validDays.includes(dayOfWeek)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid day of week. Must be one of: " + validDays.join(", "),
        });
      }

      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      let query = consultantSlotRepository
        .createQueryBuilder("consultantSlot")
        .leftJoinAndSelect("consultantSlot.slot", "slot")
        .leftJoinAndSelect("consultantSlot.consultant", "consultant")
        .leftJoinAndSelect("consultant.user", "user")
        .where("consultantSlot.day_of_week = :dayOfWeek", { dayOfWeek });

      if (consultantId) {
        query = query.andWhere("consultantSlot.consultant_id = :consultantId", {
          consultantId: parseInt(consultantId),
        });
      }

      const availableSlots = await query.getMany();

      res.status(200).json({
        success: true,
        data: availableSlots,
        count: availableSlots.length,
        message: "Available slots retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting available slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve available slots",
        error: error.message,
      });
    }
  }

  /**
   * Bulk create consultant slots
   */
  static async bulkCreateConsultantSlots(req, res) {
    try {
      const { consultant_id, slots } = req.body;

      if (
        !consultant_id ||
        !slots ||
        !Array.isArray(slots) ||
        slots.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Consultant ID and slots array are required",
        });
      }

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const slotRepository = AppDataSource.getRepository(Slot);
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultant_id) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const savedSlots = [];
      const errors = [];

      // Process each slot in parallel
      const slotPromises = slots.map(async (slotData) => {
        try {
          const { slot_id, day_of_week } = slotData;

          // Skip invalid entries
          if (!slot_id || !day_of_week || !validDays.includes(day_of_week)) {
            errors.push({
              slot_id,
              day_of_week,
              error: "Invalid slot data or day of week",
            });
            return;
          }

          // Check if slot exists
          const slot = await slotRepository.findOne({
            where: { slot_id: parseInt(slot_id) },
          });

          if (!slot) {
            errors.push({
              slot_id,
              day_of_week,
              error: "Slot not found",
            });
            return;
          }

          // Check for duplicates
          const existingSlot = await consultantSlotRepository.findOne({
            where: {
              consultant_id: parseInt(consultant_id),
              slot_id: parseInt(slot_id),
              day_of_week,
            },
          });

          if (existingSlot) {
            errors.push({
              slot_id,
              day_of_week,
              error: "Slot already assigned to this consultant on this day",
            });
            return;
          }

          // Create and save the consultant slot
          const newConsultantSlot = consultantSlotRepository.create({
            consultant_id: parseInt(consultant_id),
            slot_id: parseInt(slot_id),
            day_of_week,
          });

          const savedSlot = await consultantSlotRepository.save(
            newConsultantSlot
          );
          savedSlots.push(savedSlot);
        } catch (error) {
          errors.push({
            slot_id: slotData.slot_id,
            day_of_week: slotData.day_of_week,
            error: error.message,
          });
        }
      });

      // Wait for all slots to be processed
      await Promise.all(slotPromises);

      res.status(201).json({
        success: true,
        data: {
          savedSlots,
          errors: errors.length > 0 ? errors : undefined,
        },
        savedCount: savedSlots.length,
        errorCount: errors.length,
        message: `Created ${savedSlots.length} consultant slots${
          errors.length > 0 ? ` with ${errors.length} errors` : ""
        }`,
      });
    } catch (error) {
      console.error("Error bulk creating consultant slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create consultant slots",
        error: error.message,
      });
    }
  }

  /**
   * Clear consultant schedule (remove all slots for a consultant)
   */
  static async clearConsultantSchedule(req, res) {
    try {
      const { consultantId } = req.params;

      if (!consultantId) {
        return res.status(400).json({
          success: false,
          message: "Consultant ID is required",
        });
      }

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultantSlotRepository =
        AppDataSource.getRepository(ConsultantSlot);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Delete all slots for this consultant
      const result = await consultantSlotRepository
        .createQueryBuilder()
        .delete()
        .from(ConsultantSlot)
        .where("consultant_id = :consultantId", {
          consultantId: parseInt(consultantId),
        })
        .execute();

      res.status(200).json({
        success: true,
        deletedCount: result.affected,
        message: `Removed ${
          result.affected || 0
        } slots from consultant schedule`,
      });
    } catch (error) {
      console.error("Error clearing consultant schedule:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear consultant schedule",
        error: error.message,
      });
    }
  }
}

module.exports = ConsultantSlotController;
