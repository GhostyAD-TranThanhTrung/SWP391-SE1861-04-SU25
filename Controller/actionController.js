/**
 * Action Controller using TypeORM
 * CRUD operations for Actions table
 * Updated to align with ERD diagram structure
 */
const AppDataSource = require("../src/data-source");
const Action = require("../src/entities/Action");

class ActionController {
  /**
   * Get all actions
   */
  static async getAllActions(req, res) {
    try {
      const actionRepository = AppDataSource.getRepository(Action);
      const actions = await actionRepository.find();

      res.status(200).json({
        success: true,
        data: actions,
        message: "Actions retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting actions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve actions",
        error: error.message,
      });
    }
  }

  /**
   * Get action by ID
   */
  static async getActionById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid action ID provided",
        });
      }

      const actionRepository = AppDataSource.getRepository(Action);
      const action = await actionRepository.findOne({
        where: { action_id: parseInt(id) },
      });

      if (!action) {
        return res.status(404).json({
          success: false,
          message: "Action not found",
        });
      }

      res.status(200).json({
        success: true,
        data: action,
        message: "Action retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting action:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve action",
        error: error.message,
      });
    }
  }

  /**
   * Create new action
   */
  static async createAction(req, res) {
    try {
      const { description, range, type } = req.body;

      // Validate required fields
      if (!description || !type) {
        return res.status(400).json({
          success: false,
          message: "Description and type are required fields",
        });
      }

      // Validate range is a number if provided
      if (range !== undefined && range !== null && isNaN(parseInt(range))) {
        return res.status(400).json({
          success: false,
          message: "Range must be a valid integer",
        });
      }

      const actionRepository = AppDataSource.getRepository(Action);

      // Create new action
      const newAction = actionRepository.create({
        description,
        range: range !== undefined ? parseInt(range) : null,
        type,
      });

      const savedAction = await actionRepository.save(newAction);

      res.status(201).json({
        success: true,
        data: savedAction,
        message: "Action created successfully",
      });
    } catch (error) {
      console.error("Error creating action:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create action",
        error: error.message,
      });
    }
  }

  /**
   * Update action
   */
  static async updateAction(req, res) {
    try {
      const { id } = req.params;
      const { description, range, type } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid action ID provided",
        });
      }

      // Validate range is a number if provided
      if (range !== undefined && range !== null && isNaN(parseInt(range))) {
        return res.status(400).json({
          success: false,
          message: "Range must be a valid integer",
        });
      }

      const actionRepository = AppDataSource.getRepository(Action);

      // Check if action exists
      const action = await actionRepository.findOne({
        where: { action_id: parseInt(id) },
      });

      if (!action) {
        return res.status(404).json({
          success: false,
          message: "Action not found",
        });
      }

      // Update action fields
      if (description !== undefined) action.description = description;
      if (range !== undefined) action.range = range !== null ? parseInt(range) : null;
      if (type !== undefined) action.type = type;

      const updatedAction = await actionRepository.save(action);

      res.status(200).json({
        success: true,
        data: updatedAction,
        message: "Action updated successfully",
      });
    } catch (error) {
      console.error("Error updating action:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update action",
        error: error.message,
      });
    }
  }

  /**
   * Delete action by ID
   */
  static async deleteAction(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid action ID provided",
        });
      }

      const actionRepository = AppDataSource.getRepository(Action);

      // Check if action exists before deleting
      const action = await actionRepository.findOne({
        where: { action_id: parseInt(id) },
      });

      if (!action) {
        return res.status(404).json({
          success: false,
          message: "Action not found",
        });
      }

      // Delete the action
      await actionRepository.remove(action);

      res.status(200).json({
        success: true,
        message: `Action with ID ${id} deleted successfully`,
        deletedAction: {
          action_id: action.action_id,
          description: action.description,
          type: action.type,
        },
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete action",
        error: error.message,
      });
    }
  }

  /**
   * Get actions by type
   */
  static async getActionsByType(req, res) {
    try {
      const { type } = req.params;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "Type parameter is required",
        });
      }

      const actionRepository = AppDataSource.getRepository(Action);

      const actions = await actionRepository.find({
        where: { type },
        order: { range: 'ASC' } // Order by range for better organization
      });

      res.status(200).json({
        success: true,
        data: actions,
        count: actions.length,
        message: `Actions with type '${type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting actions by type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve actions by type",
        error: error.message,
      });
    }
  }

  /**
   * Get actions with related assessments
   */
  static async getActionsWithAssessments(req, res) {
    try {
      const actionRepository = AppDataSource.getRepository(Action);

      const actions = await actionRepository.find({
        relations: {
          assessments: true,
        },
        order: { action_id: 'ASC' }
      });

      res.status(200).json({
        success: true,
        data: actions,
        count: actions.length,
        message: "Actions with assessments retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting actions with assessments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve actions with assessments",
        error: error.message,
      });
    }
  }

  /**
   * Get actions by range
   */
  static async getActionsByRange(req, res) {
    try {
      const { minRange, maxRange } = req.query;

      const actionRepository = AppDataSource.getRepository(Action);
      let whereCondition = {};

      if (minRange !== undefined) {
        whereCondition.range = { ...whereCondition.range, gte: parseInt(minRange) };
      }
      if (maxRange !== undefined) {
        whereCondition.range = { ...whereCondition.range, lte: parseInt(maxRange) };
      }

      const actions = await actionRepository.find({
        where: whereCondition,
        order: { range: 'ASC' }
      });

      res.status(200).json({
        success: true,
        data: actions,
        count: actions.length,
        message: "Actions filtered by range retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting actions by range:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve actions by range",
        error: error.message,
      });
    }
  }
}

module.exports = ActionController;
