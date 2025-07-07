/**
 * Slot Controller using TypeORM
 * CRUD operations for Slot table
 */
const AppDataSource = require("../src/data-source");
const Slot = require("../src/entities/Slot");

class SlotController {
  /**
   * Get all slots
   */
  static async getAllSlots(req, res) {
    try {
      const slotRepository = AppDataSource.getRepository(Slot);
      const slots = await slotRepository.find({
        order: {
          start_time: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: slots,
        message: "Slots retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slots",
        error: error.message,
      });
    }
  }

  /**
   * Get slot by ID
   */
  static async getSlotById(req, res) {
    try {
      const { id } = req.params;
      const slotRepository = AppDataSource.getRepository(Slot);
      const slot = await slotRepository.findOne({
        where: { slot_id: parseInt(id) },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      res.status(200).json({
        success: true,
        data: slot,
        message: "Slot retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting slot:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slot",
        error: error.message,
      });
    }
  }

  /**
   * Get slot with consultants
   */
  static async getSlotWithConsultants(req, res) {
    try {
      const { id } = req.params;
      const slotRepository = AppDataSource.getRepository(Slot);

      const slot = await slotRepository.findOne({
        where: { slot_id: parseInt(id) },
        relations: {
          consultants: {
            user: true,
          },
        },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      res.status(200).json({
        success: true,
        data: slot,
        message: "Slot with consultants retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting slot with consultants:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slot with consultants",
        error: error.message,
      });
    }
  }

  /**
   * Get slot with bookings
   */
  static async getSlotWithBookings(req, res) {
    try {
      const { id } = req.params;
      const slotRepository = AppDataSource.getRepository(Slot);

      const slot = await slotRepository.findOne({
        where: { slot_id: parseInt(id) },
        relations: {
          bookings: true,
        },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      res.status(200).json({
        success: true,
        data: slot,
        message: "Slot with bookings retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting slot with bookings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slot with bookings",
        error: error.message,
      });
    }
  }

  /**
   * Create new slot
   */
  static async createSlot(req, res) {
    try {
      const { start_time, end_time } = req.body;

      // Validate required fields
      if (!start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: "Start time and end time are required",
        });
      }

      // Validate time format (HH:MM:SS or HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:MM:SS or HH:MM format",
        });
      }

      // Check if start_time is before end_time
      const startParts = start_time.split(":").map(Number);
      const endParts = end_time.split(":").map(Number);

      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];

      if (startMinutes >= endMinutes) {
        return res.status(400).json({
          success: false,
          message: "Start time must be before end time",
        });
      }

      const slotRepository = AppDataSource.getRepository(Slot);

      // Check if a slot with the same time range already exists
      const existingSlot = await slotRepository.findOne({
        where: {
          start_time: start_time,
          end_time: end_time,
        },
      });

      if (existingSlot) {
        return res.status(409).json({
          success: false,
          message: "A slot with these times already exists",
        });
      }

      // Create new slot
      const newSlot = slotRepository.create({
        start_time,
        end_time,
      });

      const savedSlot = await slotRepository.save(newSlot);

      res.status(201).json({
        success: true,
        data: savedSlot,
        message: "Slot created successfully",
      });
    } catch (error) {
      console.error("Error creating slot:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create slot",
        error: error.message,
      });
    }
  }

  /**
   * Update slot
   */
  static async updateSlot(req, res) {
    try {
      const { id } = req.params;
      const { start_time, end_time } = req.body;

      // Validate required fields
      if (!start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: "Start time and end time are required",
        });
      }

      // Validate time format (HH:MM:SS or HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:MM:SS or HH:MM format",
        });
      }

      // Check if start_time is before end_time
      const startParts = start_time.split(":").map(Number);
      const endParts = end_time.split(":").map(Number);

      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];

      if (startMinutes >= endMinutes) {
        return res.status(400).json({
          success: false,
          message: "Start time must be before end time",
        });
      }

      const slotRepository = AppDataSource.getRepository(Slot);

      // Check if slot exists
      const slot = await slotRepository.findOne({
        where: { slot_id: parseInt(id) },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      // Check if another slot with the same time range already exists
      const existingSlot = await slotRepository.findOne({
        where: {
          start_time: start_time,
          end_time: end_time,
          slot_id: { $ne: parseInt(id) }, // Exclude current slot
        },
      });

      if (existingSlot) {
        return res.status(409).json({
          success: false,
          message: "Another slot with these times already exists",
        });
      }

      // Update slot fields
      slot.start_time = start_time;
      slot.end_time = end_time;

      const updatedSlot = await slotRepository.save(slot);

      res.status(200).json({
        success: true,
        data: updatedSlot,
        message: "Slot updated successfully",
      });
    } catch (error) {
      console.error("Error updating slot:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update slot",
        error: error.message,
      });
    }
  }

  /**
   * Delete slot by ID
   */
  static async deleteSlot(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid slot ID provided",
        });
      }

      const slotRepository = AppDataSource.getRepository(Slot);

      // Check if slot exists before deleting
      const slot = await slotRepository.findOne({
        where: { slot_id: parseInt(id) },
        relations: {
          bookings: true,
        },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      // Check for related bookings
      if (slot.bookings && slot.bookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete slot with existing bookings",
          bookingCount: slot.bookings.length,
        });
      }

      // Delete the slot
      await slotRepository.remove(slot);

      res.status(200).json({
        success: true,
        message: `Slot with ID ${id} deleted successfully`,
        deletedSlot: {
          slot_id: slot.slot_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
        },
      });
    } catch (error) {
      console.error("Error deleting slot:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete slot",
        error: error.message,
      });
    }
  }

  /**
   * Get available slots for a specific day
   */
  static async getAvailableSlotsForDay(req, res) {
    try {
      const { day } = req.params;

      // Validate day format
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      if (!validDays.includes(day)) {
        return res.status(400).json({
          success: false,
          message: "Invalid day. Must be one of: " + validDays.join(", "),
        });
      }

      // Use a custom query to get slots available on the specified day
      const slots = await AppDataSource.query(
        `
                SELECT s.slot_id, s.start_time, s.end_time, COUNT(DISTINCT cs.consultant_id) AS consultant_count
                FROM Slot s
                LEFT JOIN Consultant_Slot cs ON s.slot_id = cs.slot_id AND cs.day_of_week = ?
                GROUP BY s.slot_id, s.start_time, s.end_time
                ORDER BY s.start_time ASC
            `,
        [day]
      );

      res.status(200).json({
        success: true,
        data: slots,
        message: `Available slots for ${day} retrieved successfully`,
      });
    } catch (error) {
      console.error(`Error getting slots for ${day}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve available slots",
        error: error.message,
      });
    }
  }

  /**
   * Get slots by duration (in minutes)
   */
  static async getSlotsByDuration(req, res) {
    try {
      const { minutes } = req.params;
      const duration = parseInt(minutes);

      if (isNaN(duration) || duration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid duration. Must be a positive number of minutes.",
        });
      }

      const slotRepository = AppDataSource.getRepository(Slot);

      // Use raw query to calculate duration in minutes
      const slots = await AppDataSource.query(
        `
                SELECT slot_id, start_time, end_time,
                       DATEDIFF(MINUTE, 
                                CONVERT(DATETIME, CONVERT(VARCHAR, GETDATE(), 23) + ' ' + start_time),
                                CONVERT(DATETIME, CONVERT(VARCHAR, GETDATE(), 23) + ' ' + end_time)
                               ) AS duration_minutes
                FROM Slot
                WHERE DATEDIFF(MINUTE, 
                              CONVERT(DATETIME, CONVERT(VARCHAR, GETDATE(), 23) + ' ' + start_time),
                              CONVERT(DATETIME, CONVERT(VARCHAR, GETDATE(), 23) + ' ' + end_time)
                             ) = ?
                ORDER BY start_time
            `,
        [duration]
      );

      res.status(200).json({
        success: true,
        data: slots,
        count: slots.length,
        message: `Slots with ${duration} minute duration retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting slots by duration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve slots by duration",
        error: error.message,
      });
    }
  }

  /**
   * Create multiple slots at once
   */
  static async createBulkSlots(req, res) {
    try {
      const { slots } = req.body;

      if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Slots array is required and must not be empty",
        });
      }

      const slotRepository = AppDataSource.getRepository(Slot);
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      const createdSlots = [];
      const errors = [];

      // Process each slot
      for (const slotData of slots) {
        try {
          const { start_time, end_time } = slotData;

          // Validate required fields
          if (!start_time || !end_time) {
            errors.push({
              slot: slotData,
              error: "Start time and end time are required",
            });
            continue;
          }

          // Validate time format
          if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
            errors.push({
              slot: slotData,
              error: "Invalid time format. Use HH:MM:SS or HH:MM format",
            });
            continue;
          }

          // Check if start_time is before end_time
          const startParts = start_time.split(":").map(Number);
          const endParts = end_time.split(":").map(Number);

          const startMinutes = startParts[0] * 60 + startParts[1];
          const endMinutes = endParts[0] * 60 + endParts[1];

          if (startMinutes >= endMinutes) {
            errors.push({
              slot: slotData,
              error: "Start time must be before end time",
            });
            continue;
          }

          // Check if a slot with the same time range already exists
          const existingSlot = await slotRepository.findOne({
            where: {
              start_time,
              end_time,
            },
          });

          if (existingSlot) {
            errors.push({
              slot: slotData,
              error: "A slot with these times already exists",
              existingSlotId: existingSlot.slot_id,
            });
            continue;
          }

          // Create new slot
          const newSlot = slotRepository.create({
            start_time,
            end_time,
          });

          const savedSlot = await slotRepository.save(newSlot);
          createdSlots.push(savedSlot);
        } catch (slotError) {
          errors.push({
            slot: slotData,
            error: slotError.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        data: {
          createdSlots,
          errors: errors.length > 0 ? errors : undefined,
        },
        createdCount: createdSlots.length,
        errorCount: errors.length,
        message: `Created ${createdSlots.length} slots with ${errors.length} errors`,
      });
    } catch (error) {
      console.error("Error creating bulk slots:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create bulk slots",
        error: error.message,
      });
    }
  }
}

module.exports = SlotController;
