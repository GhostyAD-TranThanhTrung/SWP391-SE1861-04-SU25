/**
 * Action Controller using TypeORM
 * CRUD operations for Actions table
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

      const actionRepository = AppDataSource.getRepository(Action);

      // Create new action
      const newAction = actionRepository.create({
        description,
        range,
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
      if (range !== undefined) action.range = range;
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
      const actionRepository = AppDataSource.getRepository(Action);

      const actions = await actionRepository.find({
        where: { type },
      });

      res.status(200).json({
        success: true,
        data: actions,
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
      });

      res.status(200).json({
        success: true,
        data: actions,
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
}

module.exports = ActionController;
