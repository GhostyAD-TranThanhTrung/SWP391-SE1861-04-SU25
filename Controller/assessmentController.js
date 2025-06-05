/**
 * Assessment Controller using TypeORM
 * Handles operations related to user assessments in the system
 */
const AppDataSource = require("../src/data-source");
const Assessment = require("../src/entities/Assessment");
const User = require("../src/entities/User");
const Action = require("../src/entities/Action");

// Get all assessments (admin only)
exports.getAllAssessments = async (req, res) => {
  try {
    // Admin access check
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can view all assessments",
      });
    }

    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const assessments = await assessmentRepository.find({
      order: { create_at: "DESC" },
    });

    // Format the response with related data
    const formattedAssessments = await Promise.all(
      assessments.map(async (assessment) => {
        // Get user information since relations are commented out
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { user_id: assessment.user_id },
        });

        // Get action information if available
        let actionInfo = null;
        if (assessment.action_id) {
          const actionRepository = AppDataSource.getRepository(Action);
          const action = await actionRepository.findOne({
            where: { action_id: assessment.action_id },
          });

          if (action) {
            actionInfo = {
              actionId: action.action_id,
              description: action.description,
              type: action.type,
              range: action.range,
            };
          }
        }

        // Parse assessment results
        let parsedResults = null;
        try {
          if (assessment.result_json) {
            parsedResults = JSON.parse(assessment.result_json);
          }
        } catch (e) {
          console.error("Error parsing assessment results:", e);
          parsedResults = { error: "Invalid JSON data" };
        }

        return {
          assessmentId: assessment.assessment_id,
          userId: assessment.user_id,
          userEmail: user ? user.email : "Unknown user",
          type: assessment.type,
          createdAt: assessment.create_at,
          action: actionInfo,
          results: parsedResults,
        };
      })
    );

    res.json(formattedAssessments);
  } catch (error) {
    console.error("Get all assessments error:", error);
    res.status(500).json({ error: "Error retrieving assessments" });
  }
};

// Get a single assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role;

    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const assessment = await assessmentRepository.findOne({
      where: { assessment_id: parseInt(assessmentId) },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Authorization check - user can only see their own assessments unless admin/consultant
    if (
      assessment.user_id !== userId &&
      userRole !== "Admin" &&
      userRole !== "Consultant"
    ) {
      return res.status(403).json({
        error: "You do not have permission to view this assessment",
      });
    }

    // Get user information
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { user_id: assessment.user_id },
    });

    // Get action information if available
    let actionInfo = null;
    if (assessment.action_id) {
      const actionRepository = AppDataSource.getRepository(Action);
      const action = await actionRepository.findOne({
        where: { action_id: assessment.action_id },
      });

      if (action) {
        actionInfo = {
          actionId: action.action_id,
          description: action.description,
          type: action.type,
          range: action.range,
        };
      }
    }

    // Parse assessment results
    let parsedResults = null;
    try {
      if (assessment.result_json) {
        parsedResults = JSON.parse(assessment.result_json);
      }
    } catch (e) {
      console.error("Error parsing assessment results:", e);
      parsedResults = { error: "Invalid JSON data" };
    }

    // Format response
    const formattedAssessment = {
      assessmentId: assessment.assessment_id,
      userId: assessment.user_id,
      userEmail: user ? user.email : "Unknown user",
      type: assessment.type,
      createdAt: assessment.create_at,
      action: actionInfo,
      results: parsedResults,
    };

    res.json(formattedAssessment);
  } catch (error) {
    console.error("Get assessment by ID error:", error);
    res.status(500).json({ error: "Error retrieving assessment" });
  }
};

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {
    const { type, results, actionId } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!type || !results) {
      return res.status(400).json({
        error: "Assessment type and results are required",
      });
    }

    // Verify action exists if provided
    if (actionId) {
      const actionRepository = AppDataSource.getRepository(Action);
      const action = await actionRepository.findOne({
        where: { action_id: parseInt(actionId) },
      });

      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }
    }

    // Validate assessment type
    const validTypes = [
      "stress",
      "anxiety",
      "depression",
      "burnout",
      "mental_wellbeing",
      "custom",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid assessment type. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    // Convert results to JSON string if it's an object
    const resultJson =
      typeof results === "object" ? JSON.stringify(results) : results;

    const assessmentRepository = AppDataSource.getRepository(Assessment);

    // Create new assessment
    const newAssessment = assessmentRepository.create({
      user_id: userId,
      type,
      result_json: resultJson,
      create_at: new Date(),
      action_id: actionId ? parseInt(actionId) : null,
    });

    const savedAssessment = await assessmentRepository.save(newAssessment);

    // Return success response
    res.status(201).json({
      message: "Assessment created successfully",
      assessment: {
        assessmentId: savedAssessment.assessment_id,
        userId: savedAssessment.user_id,
        type: savedAssessment.type,
        createdAt: savedAssessment.create_at,
        actionId: savedAssessment.action_id,
      },
    });
  } catch (error) {
    console.error("Create assessment error:", error);
    res.status(500).json({
      error: "Failed to create assessment. Please try again later.",
      details: error.message,
    });
  }
};

// Update an assessment's action
exports.updateAssessmentAction = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { actionId } = req.body;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role;

    // Validate input
    if (!actionId && actionId !== null) {
      return res.status(400).json({
        error: "Action ID is required (can be null to remove action)",
      });
    }

    const assessmentRepository = AppDataSource.getRepository(Assessment);

    // Find assessment by ID
    const assessment = await assessmentRepository.findOne({
      where: { assessment_id: parseInt(assessmentId) },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Authorization check - user can only update their own assessments unless admin/consultant
    if (
      assessment.user_id !== userId &&
      userRole !== "Admin" &&
      userRole !== "Consultant"
    ) {
      return res.status(403).json({
        error: "You do not have permission to update this assessment",
      });
    }

    // Verify action exists if provided (not null)
    if (actionId !== null) {
      const actionRepository = AppDataSource.getRepository(Action);
      const action = await actionRepository.findOne({
        where: { action_id: parseInt(actionId) },
      });

      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }

      assessment.action_id = parseInt(actionId);
    } else {
      assessment.action_id = null;
    }

    const updatedAssessment = await assessmentRepository.save(assessment);

    // Return success response
    res.json({
      message: "Assessment action updated successfully",
      assessment: {
        assessmentId: updatedAssessment.assessment_id,
        userId: updatedAssessment.user_id,
        type: updatedAssessment.type,
        createdAt: updatedAssessment.create_at,
        actionId: updatedAssessment.action_id,
      },
    });
  } catch (error) {
    console.error("Update assessment action error:", error);
    res.status(500).json({
      error: "Failed to update assessment action. Please try again later.",
      details: error.message,
    });
  }
};

// Delete an assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role;

    const assessmentRepository = AppDataSource.getRepository(Assessment);

    // Find assessment by ID
    const assessment = await assessmentRepository.findOne({
      where: { assessment_id: parseInt(assessmentId) },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Authorization check - user can only delete their own assessments unless admin
    if (assessment.user_id !== userId && userRole !== "Admin") {
      return res.status(403).json({
        error: "You do not have permission to delete this assessment",
      });
    }

    // Delete the assessment
    await assessmentRepository.remove(assessment);

    // Return success response
    res.json({
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assessment error:", error);
    res.status(500).json({
      error: "Failed to delete assessment. Please try again later.",
      details: error.message,
    });
  }
};

// Get assessments for a user
exports.getAssessmentsByUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role;

    // Authorization check - user can only view their own assessments unless admin/consultant
    if (
      parseInt(targetUserId) !== userId &&
      userRole !== "Admin" &&
      userRole !== "Consultant"
    ) {
      return res.status(403).json({
        error: "You do not have permission to view these assessments",
      });
    }

    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const assessments = await assessmentRepository.find({
      where: { user_id: parseInt(targetUserId) },
      order: { create_at: "DESC" },
    });

    // Format the response
    const formattedAssessments = await Promise.all(
      assessments.map(async (assessment) => {
        // Get action information if available
        let actionInfo = null;
        if (assessment.action_id) {
          const actionRepository = AppDataSource.getRepository(Action);
          const action = await actionRepository.findOne({
            where: { action_id: assessment.action_id },
          });

          if (action) {
            actionInfo = {
              actionId: action.action_id,
              description: action.description,
              type: action.type,
            };
          }
        }

        // Parse assessment results
        let parsedResults = null;
        try {
          if (assessment.result_json) {
            parsedResults = JSON.parse(assessment.result_json);
          }
        } catch (e) {
          console.error("Error parsing assessment results:", e);
          parsedResults = { error: "Invalid JSON data" };
        }

        return {
          assessmentId: assessment.assessment_id,
          type: assessment.type,
          createdAt: assessment.create_at,
          action: actionInfo,
          results: parsedResults,
        };
      })
    );

    res.json(formattedAssessments);
  } catch (error) {
    console.error("Get assessments by user error:", error);
    res.status(500).json({ error: "Error retrieving user assessments" });
  }
};

// Get assessments by type
exports.getAssessmentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userRole = req.user.role;

    // Admin/Consultant access check for all user assessments
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error:
          "Only administrators and consultants can view all assessments by type",
      });
    }

    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const assessments = await assessmentRepository.find({
      where: { type },
      order: { create_at: "DESC" },
    });

    // Format the response
    const formattedAssessments = await Promise.all(
      assessments.map(async (assessment) => {
        // Get user information
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { user_id: assessment.user_id },
        });

        return {
          assessmentId: assessment.assessment_id,
          userId: assessment.user_id,
          userEmail: user ? user.email : "Unknown user",
          createdAt: assessment.create_at,
          actionId: assessment.action_id,
        };
      })
    );

    res.json(formattedAssessments);
  } catch (error) {
    console.error("Get assessments by type error:", error);
    res.status(500).json({ error: "Error retrieving assessments by type" });
  }
};

// Get assessment statistics (for admins/consultants)
exports.getAssessmentStatistics = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Admin/Consultant access check
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error:
          "Only administrators and consultants can view assessment statistics",
      });
    }

    const assessmentRepository = AppDataSource.getRepository(Assessment);

    // Get total number of assessments
    const totalAssessments = await assessmentRepository.count();

    // Get counts by type
    const types = [
      "stress",
      "anxiety",
      "depression",
      "burnout",
      "mental_wellbeing",
      "custom",
    ];
    const typeCountsPromises = types.map(async (type) => {
      const count = await assessmentRepository.count({
        where: { type },
      });
      return { type, count };
    });

    const typeCounts = await Promise.all(typeCountsPromises);

    // Get recent trend (assessments per day for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAssessments = await assessmentRepository
      .createQueryBuilder("assessment")
      .where("assessment.create_at >= :date", { date: thirtyDaysAgo })
      .orderBy("assessment.create_at", "ASC")
      .getMany();

    // Group by day
    const dailyCounts = {};
    recentAssessments.forEach((assessment) => {
      const dateStr = assessment.create_at.toISOString().split("T")[0];

      if (!dailyCounts[dateStr]) {
        dailyCounts[dateStr] = 0;
      }
      dailyCounts[dateStr]++;
    });

    // Format for chart display
    const trend = Object.keys(dailyCounts)
      .map((date) => ({
        date,
        count: dailyCounts[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get counts of assessments with actions vs. without
    const assessmentsWithActions = await assessmentRepository.count({
      where: { action_id: Not(IsNull()) },
    });

    const assessmentsWithoutActions = totalAssessments - assessmentsWithActions;

    // User participation metrics
    const uniqueUserCount = await assessmentRepository
      .createQueryBuilder("assessment")
      .select("DISTINCT assessment.user_id")
      .getCount();

    const averagePerUser =
      uniqueUserCount > 0 ? (totalAssessments / uniqueUserCount).toFixed(2) : 0;

    // Return compiled statistics
    res.json({
      totalAssessments,
      byType: typeCounts,
      actionStats: {
        withAction: assessmentsWithActions,
        withoutAction: assessmentsWithoutActions,
        actionRate:
          totalAssessments > 0
            ? ((assessmentsWithActions / totalAssessments) * 100).toFixed(2)
            : 0,
      },
      userStats: {
        uniqueUsers: uniqueUserCount,
        averagePerUser,
      },
      recentTrend: trend,
    });
  } catch (error) {
    console.error("Get assessment statistics error:", error);
    res.status(500).json({ error: "Error retrieving assessment statistics" });
  }
};

// Get user's assessment history (for timeline/progress tracking)
exports.getUserAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token
    const { type } = req.query; // Optional filter by type

    const assessmentRepository = AppDataSource.getRepository(Assessment);

    // Build query based on filters
    const whereCondition = { user_id: userId };
    if (type) {
      whereCondition.type = type;
    }

    // Find user's assessments with optional type filter
    const assessments = await assessmentRepository.find({
      where: whereCondition,
      order: { create_at: "ASC" },
    });

    // Format response for timeline view
    const timelineData = assessments.map((assessment) => {
      // Parse results to extract key metrics based on assessment type
      let keyMetric = null;
      try {
        if (assessment.result_json) {
          const results = JSON.parse(assessment.result_json);

          // Extract metrics based on assessment type
          switch (assessment.type) {
            case "stress":
            case "anxiety":
            case "depression":
            case "burnout":
              keyMetric = results.score || results.totalScore || null;
              break;
            case "mental_wellbeing":
              keyMetric = results.wellbeingIndex || results.score || null;
              break;
            default:
              keyMetric = results.score || null;
          }
        }
      } catch (e) {
        console.error("Error parsing assessment results for timeline:", e);
      }

      return {
        assessmentId: assessment.assessment_id,
        type: assessment.type,
        date: assessment.create_at,
        score: keyMetric,
        hasAction: assessment.action_id !== null,
      };
    });

    // Group by assessment type for progress tracking
    const groupedByType = {};
    timelineData.forEach((item) => {
      if (!groupedByType[item.type]) {
        groupedByType[item.type] = [];
      }
      groupedByType[item.type].push(item);
    });

    res.json({
      userId,
      timeline: timelineData,
      byType: groupedByType,
    });
  } catch (error) {
    console.error("Get user assessment history error:", error);
    res.status(500).json({ error: "Error retrieving assessment history" });
  }
};
