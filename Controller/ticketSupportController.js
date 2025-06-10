/**
 * Ticket Support Controller using TypeORM
 * CRUD operations for Ticket_Support table
 */
const AppDataSource = require("../src/data-source");
const TicketSupport = require("../src/entities/TicketSupport");
const User = require("../src/entities/User");

class TicketSupportController {
  /**
   * Get all support tickets
   */
  static async getAllTickets(req, res) {
    try {
      const ticketRepository = AppDataSource.getRepository(TicketSupport);
      const tickets = await ticketRepository.find();

      res.status(200).json({
        success: true,
        data: tickets,
        message: "Support tickets retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting support tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve support tickets",
        error: error.message,
      });
    }
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticketRepository = AppDataSource.getRepository(TicketSupport);
      const ticket = await ticketRepository.findOne({
        where: { ticket_id: parseInt(id) },
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Support ticket not found",
        });
      }

      res.status(200).json({
        success: true,
        data: ticket,
        message: "Support ticket retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting support ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve support ticket",
        error: error.message,
      });
    }
  }

  /**
   * Get tickets with user information
   */
  static async getTicketWithUserInfo(req, res) {
    try {
      const { id } = req.params;
      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      const ticket = await ticketRepository.findOne({
        where: { ticket_id: parseInt(id) },
        relations: {
          user: true,
        },
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Support ticket not found",
        });
      }

      res.status(200).json({
        success: true,
        data: ticket,
        message: "Support ticket with user info retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting support ticket with user info:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve support ticket with user info",
        error: error.message,
      });
    }
  }

  /**
   * Get tickets by user ID
   */
  static async getTicketsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      const tickets = await ticketRepository.find({
        where: { user_id: parseInt(userId) },
      });

      res.status(200).json({
        success: true,
        data: tickets,
        count: tickets.length,
        message: `Support tickets for user ID ${userId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting tickets by user ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tickets by user ID",
        error: error.message,
      });
    }
  }

  /**
   * Get tickets by status
   */
  static async getTicketsByStatus(req, res) {
    try {
      const { status } = req.params;
      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      const tickets = await ticketRepository.find({
        where: { status },
        relations: {
          user: true,
        },
      });

      res.status(200).json({
        success: true,
        data: tickets,
        count: tickets.length,
        message: `Support tickets with status '${status}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting tickets by status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tickets by status",
        error: error.message,
      });
    }
  }

  /**
   * Get tickets by type
   */
  static async getTicketsByType(req, res) {
    try {
      const { type } = req.params;
      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      const tickets = await ticketRepository.find({
        where: { type },
        relations: {
          user: true,
        },
      });

      res.status(200).json({
        success: true,
        data: tickets,
        count: tickets.length,
        message: `Support tickets of type '${type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting tickets by type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tickets by type",
        error: error.message,
      });
    }
  }

  /**
   * Create new support ticket
   */
  static async createTicket(req, res) {
    try {
      const { user_id, content, status = "pending", type } = req.body;

      // Validate required fields
      if (!content || !type) {
        return res.status(400).json({
          success: false,
          message: "Content and type are required",
        });
      }

      // Check if user exists if user_id is provided
      if (user_id) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { user_id: parseInt(user_id) },
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
      }

      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      // Create new support ticket
      const newTicket = ticketRepository.create({
        user_id: user_id ? parseInt(user_id) : null,
        content,
        status,
        type,
      });

      const savedTicket = await ticketRepository.save(newTicket);

      res.status(201).json({
        success: true,
        data: savedTicket,
        message: "Support ticket created successfully",
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create support ticket",
        error: error.message,
      });
    }
  }

  /**
   * Update ticket
   */
  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const { content, status, type } = req.body;

      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      // Check if ticket exists
      const ticket = await ticketRepository.findOne({
        where: { ticket_id: parseInt(id) },
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Support ticket not found",
        });
      }

      // Update ticket fields if provided
      if (content !== undefined) ticket.content = content;
      if (status !== undefined) ticket.status = status;
      if (type !== undefined) ticket.type = type;

      const updatedTicket = await ticketRepository.save(ticket);

      res.status(200).json({
        success: true,
        data: updatedTicket,
        message: "Support ticket updated successfully",
      });
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update support ticket",
        error: error.message,
      });
    }
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      // Validate status value
      const validStatuses = [
        "pending",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      // Check if ticket exists
      const ticket = await ticketRepository.findOne({
        where: { ticket_id: parseInt(id) },
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Support ticket not found",
        });
      }

      // Update status
      ticket.status = status;

      const updatedTicket = await ticketRepository.save(ticket);

      res.status(200).json({
        success: true,
        data: updatedTicket,
        message: `Support ticket status updated to '${status}' successfully`,
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update ticket status",
        error: error.message,
      });
    }
  }

  /**
   * Delete ticket by ID
   */
  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket ID provided",
        });
      }

      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      // Check if ticket exists before deleting
      const ticket = await ticketRepository.findOne({
        where: { ticket_id: parseInt(id) },
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Support ticket not found",
        });
      }

      // Delete the ticket
      await ticketRepository.remove(ticket);

      res.status(200).json({
        success: true,
        message: `Support ticket with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting support ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete support ticket",
        error: error.message,
      });
    }
  }

  /**
   * Search tickets by content
   */
  static async searchTickets(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      const tickets = await ticketRepository
        .createQueryBuilder("ticket")
        .leftJoinAndSelect("ticket.user", "user")
        .where("ticket.content LIKE :query", { query: `%${query}%` })
        .getMany();

      res.status(200).json({
        success: true,
        data: tickets,
        count: tickets.length,
        message: "Support tickets search results retrieved successfully",
      });
    } catch (error) {
      console.error("Error searching tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search tickets",
        error: error.message,
      });
    }
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStats(req, res) {
    try {
      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      // Get counts by status
      const statusCounts = await ticketRepository
        .createQueryBuilder("ticket")
        .select("ticket.status", "status")
        .addSelect("COUNT(ticket.ticket_id)", "count")
        .groupBy("ticket.status")
        .getRawMany();

      // Get counts by type
      const typeCounts = await ticketRepository
        .createQueryBuilder("ticket")
        .select("ticket.type", "type")
        .addSelect("COUNT(ticket.ticket_id)", "count")
        .groupBy("ticket.type")
        .getRawMany();

      // Convert to more usable format
      const statusStats = {};
      statusCounts.forEach((item) => {
        statusStats[item.status || "unknown"] = parseInt(item.count);
      });

      const typeStats = {};
      typeCounts.forEach((item) => {
        typeStats[item.type || "unknown"] = parseInt(item.count);
      });

      // Get total count
      const totalCount = await ticketRepository.count();

      res.status(200).json({
        success: true,
        data: {
          total: totalCount,
          byStatus: statusStats,
          byType: typeStats,
        },
        message: "Support ticket statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting ticket statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve ticket statistics",
        error: error.message,
      });
    }
  }

  /**
   * Bulk update ticket status
   */
  static async bulkUpdateStatus(req, res) {
    try {
      const { ticketIds, status } = req.body;

      if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Ticket IDs array is required and must not be empty",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      // Validate status value
      const validStatuses = [
        "pending",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      const ticketRepository = AppDataSource.getRepository(TicketSupport);

      // Convert string IDs to integers
      const ids = ticketIds.map((id) => parseInt(id));

      // Update all tickets with the given IDs
      const updateResult = await ticketRepository
        .createQueryBuilder()
        .update()
        .set({ status })
        .whereInIds(ids)
        .execute();

      res.status(200).json({
        success: true,
        updatedCount: updateResult.affected,
        message: `Updated status to '${status}' for ${updateResult.affected} tickets`,
      });
    } catch (error) {
      console.error("Error bulk updating ticket status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk update ticket status",
        error: error.message,
      });
    }
  }
}

module.exports = TicketSupportController;
