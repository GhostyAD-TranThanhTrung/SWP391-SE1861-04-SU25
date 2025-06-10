/**
 * Console Log Controller using TypeORM
 * CRUD operations for console_log table
 */
const AppDataSource = require("../src/data-source");
const ConsoleLog = require("../src/entities/ConsoleLog");

class ConsoleLogController {
  /**
   * Get all console logs
   */
  static async getAllLogs(req, res) {
    try {
      const logRepository = AppDataSource.getRepository(ConsoleLog);
      const logs = await logRepository.find({
        order: {
          date: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: logs,
        message: "Console logs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting console logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve console logs",
        error: error.message,
      });
    }
  }

  /**
   * Get console log by ID
   */
  static async getLogById(req, res) {
    try {
      const { id } = req.params;
      const logRepository = AppDataSource.getRepository(ConsoleLog);
      const log = await logRepository.findOne({
        where: { log_id: parseInt(id) },
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          message: "Console log not found",
        });
      }

      res.status(200).json({
        success: true,
        data: log,
        message: "Console log retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting console log:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve console log",
        error: error.message,
      });
    }
  }

  /**
   * Get logs with user information
   */
  static async getLogsWithUserInfo(req, res) {
    try {
      const logRepository = AppDataSource.getRepository(ConsoleLog);
      const logs = await logRepository.find({
        relations: {
          user: true,
        },
        order: {
          date: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: logs,
        message: "Console logs with user info retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting logs with user info:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve logs with user info",
        error: error.message,
      });
    }
  }

  /**
   * Create new console log
   */
  static async createLog(req, res) {
    try {
      const { user_id, action, status, error_log } = req.body;

      // Basic validation
      if (!action) {
        return res.status(400).json({
          success: false,
          message: "Action is required",
        });
      }

      const logRepository = AppDataSource.getRepository(ConsoleLog);

      // Create new log with current date
      const newLog = logRepository.create({
        user_id: user_id ? parseInt(user_id) : null,
        action,
        status,
        error_log,
        date: new Date(),
      });

      const savedLog = await logRepository.save(newLog);

      res.status(201).json({
        success: true,
        data: savedLog,
        message: "Console log created successfully",
      });
    } catch (error) {
      console.error("Error creating console log:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create console log",
        error: error.message,
      });
    }
  }

  /**
   * Update console log
   */
  static async updateLog(req, res) {
    try {
      const { id } = req.params;
      const { user_id, action, status, error_log } = req.body;

      const logRepository = AppDataSource.getRepository(ConsoleLog);

      // Check if log exists
      const log = await logRepository.findOne({
        where: { log_id: parseInt(id) },
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          message: "Console log not found",
        });
      }

      // Update log fields
      if (user_id !== undefined)
        log.user_id = user_id ? parseInt(user_id) : null;
      if (action !== undefined) log.action = action;
      if (status !== undefined) log.status = status;
      if (error_log !== undefined) log.error_log = error_log;

      const updatedLog = await logRepository.save(log);

      res.status(200).json({
        success: true,
        data: updatedLog,
        message: "Console log updated successfully",
      });
    } catch (error) {
      console.error("Error updating console log:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update console log",
        error: error.message,
      });
    }
  }

  /**
   * Delete console log by ID
   */
  static async deleteLog(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid log ID provided",
        });
      }

      const logRepository = AppDataSource.getRepository(ConsoleLog);

      // Check if log exists before deleting
      const log = await logRepository.findOne({
        where: { log_id: parseInt(id) },
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          message: "Console log not found",
        });
      }

      // Delete the log
      await logRepository.remove(log);

      res.status(200).json({
        success: true,
        message: `Console log with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting console log:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete console log",
        error: error.message,
      });
    }
  }

  /**
   * Get logs by user ID
   */
  static async getLogsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const logRepository = AppDataSource.getRepository(ConsoleLog);

      const logs = await logRepository.find({
        where: { user_id: parseInt(userId) },
        order: {
          date: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: logs,
        count: logs.length,
        message: `Console logs for user ${userId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting logs by user ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve logs by user ID",
        error: error.message,
      });
    }
  }

  /**
   * Get logs by status
   */
  static async getLogsByStatus(req, res) {
    try {
      const { status } = req.params;
      const logRepository = AppDataSource.getRepository(ConsoleLog);

      const logs = await logRepository.find({
        where: { status },
        order: {
          date: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: logs,
        count: logs.length,
        message: `Console logs with status '${status}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting logs by status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve logs by status",
        error: error.message,
      });
    }
  }

  /**
   * Get logs by date range
   */
  static async getLogsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      const logRepository = AppDataSource.getRepository(ConsoleLog);

      const logs = await logRepository
        .createQueryBuilder("log")
        .where("log.date >= :startDate", { startDate })
        .andWhere("log.date <= :endDate", { endDate })
        .orderBy("log.date", "DESC")
        .getMany();

      res.status(200).json({
        success: true,
        data: logs,
        count: logs.length,
        message: "Console logs within date range retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting logs by date range:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve logs by date range",
        error: error.message,
      });
    }
  }

  /**
   * Search logs by action or error message
   */
  static async searchLogs(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const logRepository = AppDataSource.getRepository(ConsoleLog);

      const logs = await logRepository
        .createQueryBuilder("log")
        .where("log.action LIKE :query", { query: `%${query}%` })
        .orWhere("log.error_log LIKE :query", { query: `%${query}%` })
        .orderBy("log.date", "DESC")
        .getMany();

      res.status(200).json({
        success: true,
        data: logs,
        count: logs.length,
        message: "Console log search results retrieved successfully",
      });
    } catch (error) {
      console.error("Error searching logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search logs",
        error: error.message,
      });
    }
  }

  /**
   * Clear old logs (older than specified days)
   */
  static async clearOldLogs(req, res) {
    try {
      const { days } = req.params;

      if (!days || isNaN(parseInt(days)) || parseInt(days) < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid number of days is required",
        });
      }

      const daysToKeep = parseInt(days);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const logRepository = AppDataSource.getRepository(ConsoleLog);

      const result = await logRepository
        .createQueryBuilder()
        .delete()
        .from(ConsoleLog)
        .where("date < :cutoffDate", { cutoffDate })
        .execute();

      res.status(200).json({
        success: true,
        deletedCount: result.affected,
        message: `Deleted ${result.affected} logs older than ${daysToKeep} days`,
      });
    } catch (error) {
      console.error("Error clearing old logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear old logs",
        error: error.message,
      });
    }
  }
}

module.exports = ConsoleLogController;
