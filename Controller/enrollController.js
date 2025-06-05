/**
 * Content Controller using TypeORM
 * Handles operations related to program content in the system
 */
const AppDataSource = require("../src/data-source");
const Content = require("../src/entities/Content");
const Program = require("../src/entities/Program");

// Get all content items
exports.getAllContent = async (req, res) => {
  try {
    const contentRepository = AppDataSource.getRepository(Content);
    const contentItems = await contentRepository.find({
      order: { program_id: "ASC", order: "ASC" },
    });

    // Format the response
    const formattedContentItems = contentItems.map((content) => ({
      contentId: content.content_id,
      programId: content.program_id,
      contentJson: content.content_json
        ? JSON.parse(content.content_json)
        : null,
      type: content.type,
      order: content.order,
    }));

    res.json(formattedContentItems);
  } catch (error) {
    console.error("Get all content error:", error);
    res.status(500).json({ error: "Error retrieving content" });
  }
};

// Get a single content item by ID
exports.getContentById = async (req, res) => {
  try {
    const { contentId } = req.params;

    const contentRepository = AppDataSource.getRepository(Content);
    const content = await contentRepository.findOne({
      where: { content_id: parseInt(contentId) },
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Format response
    const formattedContent = {
      contentId: content.content_id,
      programId: content.program_id,
      contentJson: content.content_json
        ? JSON.parse(content.content_json)
        : null,
      type: content.type,
      order: content.order,
    };

    res.json(formattedContent);
  } catch (error) {
    console.error("Get content by ID error:", error);
    res.status(500).json({ error: "Error retrieving content" });
  }
};

// Get all content for a specific program
exports.getContentByProgramId = async (req, res) => {
  try {
    const { programId } = req.params;

    const contentRepository = AppDataSource.getRepository(Content);
    const contentItems = await contentRepository.find({
      where: { program_id: parseInt(programId) },
      order: { order: "ASC" },
    });

    if (contentItems.length === 0) {
      return res.json({
        message: "No content found for this program",
        content: [],
      });
    }

    // Format the response
    const formattedContentItems = contentItems.map((content) => ({
      contentId: content.content_id,
      programId: content.program_id,
      contentJson: content.content_json
        ? JSON.parse(content.content_json)
        : null,
      type: content.type,
      order: content.order,
    }));

    res.json(formattedContentItems);
  } catch (error) {
    console.error("Get content by program ID error:", error);
    res.status(500).json({ error: "Error retrieving program content" });
  }
};

// Create a new content item
exports.createContent = async (req, res) => {
  try {
    const { programId, contentJson, type, order } = req.body;

    // Validate required fields
    if (!programId || !contentJson || !type) {
      return res.status(400).json({
        error: "Program ID, content JSON, and type are required",
      });
    }

    // Verify user has permissions (from JWT token)
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can create content",
      });
    }

    // Verify program exists
    const programRepository = AppDataSource.getRepository(Program);
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Handle order - if not provided, find the max order and add 1
    let contentOrder = order;
    if (!contentOrder) {
      const contentRepository = AppDataSource.getRepository(Content);
      const maxOrderContent = await contentRepository.findOne({
        where: { program_id: parseInt(programId) },
        order: { order: "DESC" },
      });

      contentOrder = maxOrderContent ? maxOrderContent.order + 1 : 1;
    }

    // Convert contentJson to string if it's an object
    const contentJsonString =
      typeof contentJson === "object"
        ? JSON.stringify(contentJson)
        : contentJson;

    const contentRepository = AppDataSource.getRepository(Content);

    // Create new content
    const newContent = contentRepository.create({
      program_id: parseInt(programId),
      content_json: contentJsonString,
      type,
      order: contentOrder,
    });

    const savedContent = await contentRepository.save(newContent);

    // Return success response
    res.status(201).json({
      message: "Content created successfully",
      content: {
        contentId: savedContent.content_id,
        programId: savedContent.program_id,
        contentJson: JSON.parse(savedContent.content_json),
        type: savedContent.type,
        order: savedContent.order,
      },
    });
  } catch (error) {
    console.error("Create content error:", error);
    res.status(500).json({
      error: "Failed to create content. Please try again later.",
      details: error.message,
    });
  }
};

// Update an existing content item
exports.updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { contentJson, type, order } = req.body;

    // Validate request
    if (!contentJson && !type && order === undefined) {
      return res.status(400).json({
        error: "At least one field to update is required",
      });
    }

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can update content",
      });
    }

    const contentRepository = AppDataSource.getRepository(Content);

    // Find content by ID
    const content = await contentRepository.findOne({
      where: { content_id: parseInt(contentId) },
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Update fields if provided
    if (contentJson) {
      const contentJsonString =
        typeof contentJson === "object"
          ? JSON.stringify(contentJson)
          : contentJson;
      content.content_json = contentJsonString;
    }

    if (type) content.type = type;
    if (order !== undefined) content.order = order;

    const updatedContent = await contentRepository.save(content);

    // Return success response
    res.json({
      message: "Content updated successfully",
      content: {
        contentId: updatedContent.content_id,
        programId: updatedContent.program_id,
        contentJson: JSON.parse(updatedContent.content_json),
        type: updatedContent.type,
        order: updatedContent.order,
      },
    });
  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({
      error: "Failed to update content. Please try again later.",
      details: error.message,
    });
  }
};

// Delete a content item
exports.deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can delete content",
      });
    }

    const contentRepository = AppDataSource.getRepository(Content);

    // Find content by ID
    const content = await contentRepository.findOne({
      where: { content_id: parseInt(contentId) },
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Get program ID before deleting for reordering
    const programId = content.program_id;

    // Delete the content
    await contentRepository.remove(content);

    // Reorder remaining content items
    const remainingContent = await contentRepository.find({
      where: { program_id: programId },
      order: { order: "ASC" },
    });

    // Update order values to be sequential
    for (let i = 0; i < remainingContent.length; i++) {
      remainingContent[i].order = i + 1;
      await contentRepository.save(remainingContent[i]);
    }

    // Return success response
    res.json({
      message: "Content deleted successfully and remaining content reordered",
    });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({
      error: "Failed to delete content. Please try again later.",
      details: error.message,
    });
  }
};

// Reorder content items for a program
exports.reorderContent = async (req, res) => {
  try {
    const { programId } = req.params;
    const { contentOrder } = req.body;

    // Validate request
    if (!contentOrder || !Array.isArray(contentOrder)) {
      return res.status(400).json({
        error: "Content order array is required",
      });
    }

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can reorder content",
      });
    }

    const contentRepository = AppDataSource.getRepository(Content);
    const programRepository = AppDataSource.getRepository(Program);

    // Verify program exists
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Get all content items for this program
    const contentItems = await contentRepository.find({
      where: { program_id: parseInt(programId) },
    });

    // Verify all content IDs in the order array exist
    const contentIds = contentItems.map((c) => c.content_id);
    for (const orderItem of contentOrder) {
      if (!contentIds.includes(orderItem.contentId)) {
        return res.status(400).json({
          error: `Content item with ID ${orderItem.contentId} not found in this program`,
        });
      }
    }

    // Update order for each content item
    for (const orderItem of contentOrder) {
      await contentRepository.update(
        { content_id: orderItem.contentId },
        { order: orderItem.order }
      );
    }

    // Get updated content items
    const updatedContentItems = await contentRepository.find({
      where: { program_id: parseInt(programId) },
      order: { order: "ASC" },
    });

    // Format the response
    const formattedContentItems = updatedContentItems.map((content) => ({
      contentId: content.content_id,
      programId: content.program_id,
      type: content.type,
      order: content.order,
    }));

    res.json({
      message: "Content items reordered successfully",
      content: formattedContentItems,
    });
  } catch (error) {
    console.error("Reorder content error:", error);
    res.status(500).json({
      error: "Failed to reorder content. Please try again later.",
      details: error.message,
    });
  }
};

// Get content by type
exports.getContentByType = async (req, res) => {
  try {
    const { type } = req.params;

    const contentRepository = AppDataSource.getRepository(Content);
    const contentItems = await contentRepository.find({
      where: { type },
      order: { program_id: "ASC", order: "ASC" },
    });

    // Format the response
    const formattedContentItems = contentItems.map((content) => ({
      contentId: content.content_id,
      programId: content.program_id,
      contentJson: content.content_json
        ? JSON.parse(content.content_json)
        : null,
      type: content.type,
      order: content.order,
    }));

    res.json(formattedContentItems);
  } catch (error) {
    console.error("Get content by type error:", error);
    res.status(500).json({ error: "Error retrieving content by type" });
  }
};
