/**
 * Content Controller using TypeORM
 * CRUD operations for Content table
 */
const AppDataSource = require("../src/data-source");
const Content = require("../src/entities/Content");
const Program = require("../src/entities/Program");

class ContentController {
  /**
   * Get all content
   */
  static async getAllContent(req, res) {
    try {
      const contentRepository = AppDataSource.getRepository(Content);
      const content = await contentRepository.find({
        order: {
          orders: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: content,
        message: "Content retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content",
        error: error.message,
      });
    }
  }

  /**
   * Get content by ID
   */
  static async getContentById(req, res) {
    try {
      const { id } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);
      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) },
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      res.status(200).json({
        success: true,
        data: content,
        message: "Content retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content",
        error: error.message,
      });
    }
  }

  /**
   * Get content by program ID
   */
  static async getContentByProgramId(req, res) {
    try {
      const { programId } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);

      const content = await contentRepository.find({
        where: { program_id: parseInt(programId) },
        order: {
          orders: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: content,
        count: content.length,
        message: `Content for program ID ${programId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting content by program ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content by program ID",
        error: error.message,
      });
    }
  }

  /**
   * Get content with program information
   */
  static async getContentWithProgram(req, res) {
    try {
      const { id } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);

      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) },
        relations: {
          program: true,
        },
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      res.status(200).json({
        success: true,
        data: content,
        message: "Content with program retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting content with program:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content with program",
        error: error.message,
      });
    }
  }

  /**
   * Create new content
   */
  static async createContent(req, res) {
    try {
      const { program_id, content_json, type, orders } = req.body;

      // Validate content_json
      if (content_json) {
        try {
          if (typeof content_json === "string") {
            // Try to parse if it's a string to validate JSON format
            JSON.parse(content_json);
          }
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for content_json field",
          });
        }
      }

      // Check if program exists if program_id is provided
      if (program_id) {
        const programRepository = AppDataSource.getRepository(Program);
        const program = await programRepository.findOne({
          where: { program_id: parseInt(program_id) },
        });

        if (!program) {
          return res.status(404).json({
            success: false,
            message: "Program not found",
          });
        }
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Create new content
      const newContent = contentRepository.create({
        program_id: program_id ? parseInt(program_id) : null,
        content_json:
          typeof content_json === "object"
            ? JSON.stringify(content_json)
            : content_json,
        type,
        orders: orders ? parseInt(orders) : null,
      });

      const savedContent = await contentRepository.save(newContent);

      res.status(201).json({
        success: true,
        data: savedContent,
        message: "Content created successfully",
      });
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create content",
        error: error.message,
      });
    }
  }

  /**
   * Update content
   */
  static async updateContent(req, res) {
    try {
      const { id } = req.params;
      const { program_id, content_json, type, orders } = req.body;

      const contentRepository = AppDataSource.getRepository(Content);

      // Check if content exists
      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) },
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      // Validate content_json if provided
      if (content_json !== undefined) {
        try {
          if (typeof content_json === "string") {
            // Try to parse if it's a string to validate JSON format
            JSON.parse(content_json);
          }
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for content_json field",
          });
        }
      }

      // Check if program exists if program_id is provided
      if (program_id !== undefined) {
        const programRepository = AppDataSource.getRepository(Program);
        const program = await programRepository.findOne({
          where: { program_id: parseInt(program_id) },
        });

        if (!program) {
          return res.status(404).json({
            success: false,
            message: "Program not found",
          });
        }
      }

      // Update content fields
      if (program_id !== undefined)
        content.program_id = program_id ? parseInt(program_id) : null;
      if (content_json !== undefined) {
        content.content_json =
          typeof content_json === "object"
            ? JSON.stringify(content_json)
            : content_json;
      }
      if (type !== undefined) content.type = type;
      if (orders !== undefined)
        content.orders = orders ? parseInt(orders) : null;

      const updatedContent = await contentRepository.save(content);

      res.status(200).json({
        success: true,
        data: updatedContent,
        message: "Content updated successfully",
      });
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update content",
        error: error.message,
      });
    }
  }

  /**
   * Delete content by ID
   */
  static async deleteContent(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid content ID provided",
        });
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Check if content exists before deleting
      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) },
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      // Delete the content
      await contentRepository.remove(content);

      res.status(200).json({
        success: true,
        message: `Content with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete content",
        error: error.message,
      });
    }
  }

  /**
   * Get content by type
   */
  static async getContentByType(req, res) {
    try {
      const { type } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);

      const content = await contentRepository.find({
        where: { type },
        order: {
          orders: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: content,
        count: content.length,
        message: `Content with type '${type}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting content by type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content by type",
        error: error.message,
      });
    }
  }

  /**
   * Update content order
   */
  static async updateContentOrder(req, res) {
    try {
      const { orderedIds } = req.body;

      if (
        !orderedIds ||
        !Array.isArray(orderedIds) ||
        orderedIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "orderedIds array is required",
        });
      }

      const contentRepository = AppDataSource.getRepository(Content);
      const updatedContent = [];
      const errors = [];

      // Update order for each content item
      for (let i = 0; i < orderedIds.length; i++) {
        const contentId = orderedIds[i];

        try {
          const content = await contentRepository.findOne({
            where: { content_id: parseInt(contentId) },
          });

          if (content) {
            content.orders = i + 1; // Set order starting from 1
            const saved = await contentRepository.save(content);
            updatedContent.push(saved);
          } else {
            errors.push({
              contentId,
              error: "Content not found",
            });
          }
        } catch (error) {
          errors.push({
            contentId,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        updatedCount: updatedContent.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Updated order for ${updatedContent.length} content items`,
      });
    } catch (error) {
      console.error("Error updating content order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update content order",
        error: error.message,
      });
    }
  }

  /**
   * Get parsed JSON content by ID
   */
  static async getParsedContentById(req, res) {
    try {
      const { id } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);
      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) },
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      // Try to parse the JSON content
      let parsedContent;
      try {
        parsedContent = content.content_json
          ? JSON.parse(content.content_json)
          : null;
      } catch (jsonError) {
        return res.status(422).json({
          success: false,
          message: "Invalid JSON format in stored content",
          error: jsonError.message,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          ...content,
          parsed_content: parsedContent,
        },
        message: "Content retrieved and parsed successfully",
      });
    } catch (error) {
      console.error("Error getting parsed content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve and parse content",
        error: error.message,
      });
    }
  }
}

module.exports = ContentController;
