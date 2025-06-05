/**
 * Action Controller using TypeORM
 * Handles operations related to actions in the system
 */
const AppDataSource = require("../src/data-source");
const Action = require("../src/entities/Action");

// Get all actions
exports.getAllActions = async (req, res) => {
  try {
    const actionRepository = AppDataSource.getRepository(Action);
    const actions = await actionRepository.find();

    // Format the response
    const formattedActions = actions.map((action) => ({
      actionId: action.action_id,
      description: action.description,
      range: action.range,
      type: action.type,
    }));

    res.json(formattedActions);
  } catch (error) {
    console.error("Get all actions error:", error);
    res.status(500).json({ error: "Error retrieving actions" });
  }
};

// Get a single action by ID
exports.getActionById = async (req, res) => {
  try {
    const { actionId } = req.params;

    const actionRepository = AppDataSource.getRepository(Action);
    const action = await actionRepository.findOne({
      where: { action_id: parseInt(actionId) },
    });

    if (!action) {
      return res.status(404).json({ error: "Action not found" });
    }

    // Format response
    const formattedAction = {
      actionId: action.action_id,
      description: action.description,
      range: action.range,
      type: action.type,
    };

    res.json(formattedAction);
  } catch (error) {
    console.error("Get action by ID error:", error);
    res.status(500).json({ error: "Error retrieving action" });
  }
};

// Create a new action
exports.createAction = async (req, res) => {
  try {
    const { description, range, type } = req.body;

    // Validate required fields
    if (!description || !type) {
      return res.status(400).json({
        error: "Description and type are required",
      });
    }

    // Verify user has admin permissions (from JWT token)
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can create actions",
      });
    }

    const actionRepository = AppDataSource.getRepository(Action);

    // Create new action
    const newAction = actionRepository.create({
      description,
      range,
      type,
    });

    const savedAction = await actionRepository.save(newAction);

    // Return success response
    res.status(201).json({
      message: "Action created successfully",
      action: {
        actionId: savedAction.action_id,
        description: savedAction.description,
        range: savedAction.range,
        type: savedAction.type,
      },
    });
  } catch (error) {
    console.error("Create action error:", error);
    res.status(500).json({
      error: "Failed to create action. Please try again later.",
      details: error.message,
    });
  }
};

// Update an existing action
exports.updateAction = async (req, res) => {
  try {
    const { actionId } = req.params;
    const { description, range, type } = req.body;

    // Validate request
    if (!description && !range && !type) {
      return res.status(400).json({
        error: "At least one field to update is required",
      });
    }

    // Verify user has admin permissions
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can update actions",
      });
    }

    const actionRepository = AppDataSource.getRepository(Action);

    // Find action by ID
    const action = await actionRepository.findOne({
      where: { action_id: parseInt(actionId) },
    });

    if (!action) {
      return res.status(404).json({ error: "Action not found" });
    }

    // Update fields if provided
    if (description) action.description = description;
    if (range) action.range = range;
    if (type) action.type = type;

    const updatedAction = await actionRepository.save(action);

    // Return success response
    res.json({
      message: "Action updated successfully",
      action: {
        actionId: updatedAction.action_id,
        description: updatedAction.description,
        range: updatedAction.range,
        type: updatedAction.type,
      },
    });
  } catch (error) {
    console.error("Update action error:", error);
    res.status(500).json({
      error: "Failed to update action. Please try again later.",
      details: error.message,
    });
  }
};

// Delete an action
exports.deleteAction = async (req, res) => {
  try {
    const { actionId } = req.params;

    // Verify user has admin permissions
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can delete actions",
      });
    }

    const actionRepository = AppDataSource.getRepository(Action);

    // Find action by ID
    const action = await actionRepository.findOne({
      where: { action_id: parseInt(actionId) },
    });

    if (!action) {
      return res.status(404).json({ error: "Action not found" });
    }

    // Check if action has associated assessments before deleting
    // (This would require the Assessment entity to be properly set up)
    /* 
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const relatedAssessments = await assessmentRepository.count({
      where: { action_id: parseInt(actionId) }
    });

    if (relatedAssessments > 0) {
      return res.status(400).json({ 
        error: "Cannot delete action that has associated assessments" 
      });
    }
    */

    // Delete the action
    await actionRepository.remove(action);

    // Return success response
    res.json({
      message: "Action deleted successfully",
    });
  } catch (error) {
    console.error("Delete action error:", error);
    res.status(500).json({
      error: "Failed to delete action. Please try again later.",
      details: error.message,
    });
  }
};

// Get actions by type
exports.getActionsByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!type) {
      return res.status(400).json({ error: "Type parameter is required" });
    }

    const actionRepository = AppDataSource.getRepository(Action);

    // Find actions by type
    const actions = await actionRepository.find({
      where: { type },
    });

    // Format the response
    const formattedActions = actions.map((action) => ({
      actionId: action.action_id,
      description: action.description,
      range: action.range,
      type: action.type,
    }));

    res.json(formattedActions);
  } catch (error) {
    console.error("Get actions by type error:", error);
    res.status(500).json({ error: "Error retrieving actions by type" });
  }
};

// Get actions by range
exports.getActionsByRange = async (req, res) => {
  try {
    const { range } = req.params;

    if (!range) {
      return res.status(400).json({ error: "Range parameter is required" });
    }

    const actionRepository = AppDataSource.getRepository(Action);

    // Find actions by range
    const actions = await actionRepository.find({
      where: { range },
    });

    // Format the response
    const formattedActions = actions.map((action) => ({
      actionId: action.action_id,
      description: action.description,
      range: action.range,
      type: action.type,
    }));

    res.json(formattedActions);
  } catch (error) {
    console.error("Get actions by range error:", error);
    res.status(500).json({ error: "Error retrieving actions by range" });
  }
};

// Search actions by description
exports.searchActions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const actionRepository = AppDataSource.getRepository(Action);

    // Search actions by description
    const actions = await actionRepository
      .createQueryBuilder("action")
      .where("action.description LIKE :query", { query: `%${query}%` })
      .getMany();

    // Format the response
    const formattedActions = actions.map((action) => ({
      actionId: action.action_id,
      description: action.description,
      range: action.range,
      type: action.type,
    }));

    res.json({
      results: formattedActions,
      count: formattedActions.length,
    });
  } catch (error) {
    console.error("Search actions error:", error);
    res.status(500).json({ error: "Error searching actions" });
  }
};
