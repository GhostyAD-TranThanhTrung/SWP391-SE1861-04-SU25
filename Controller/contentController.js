/**
 * Content Controller using TypeORM
 * CRUD operations for Content table
 */
const AppDataSource = require("../src/data-source");
const Content = require("../src/entities/Content");
const Program = require("../src/entities/Program");
const fs = require('fs');
const path = require('path');

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
      const { program_id, title, type, orders, content_file_link, content_type, content_metadata_json } = req.body;

      // Validate content_metadata_json
      if (content_metadata_json) {
        try {
          if (typeof content_metadata_json === "string") {
            JSON.parse(content_metadata_json);
          }
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for content_metadata_json field",
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
        title,
        type,
        orders: orders ? parseInt(orders) : null,
        content_file_link,
        content_type,
        content_metadata_json: typeof content_metadata_json === "object" 
          ? JSON.stringify(content_metadata_json) 
          : content_metadata_json
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
      const { program_id, title, type, orders, content_file_link, content_type, content_metadata_json } = req.body;

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

      // Validate content_metadata_json if provided
      if (content_metadata_json !== undefined) {
        try {
          if (typeof content_metadata_json === "string") {
            JSON.parse(content_metadata_json);
          }
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for content_metadata_json field",
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
      if (program_id !== undefined) content.program_id = program_id ? parseInt(program_id) : null;
      if (title !== undefined) content.title = title;
      if (type !== undefined) content.type = type;
      if (orders !== undefined) content.orders = orders ? parseInt(orders) : null;
      if (content_file_link !== undefined) content.content_file_link = content_file_link;
      if (content_type !== undefined) content.content_type = content_type;
      if (content_metadata_json !== undefined) {
        content.content_metadata_json = typeof content_metadata_json === "object"
          ? JSON.stringify(content_metadata_json)
          : content_metadata_json;
      }

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

      if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
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
   * Get parsed metadata content by ID
   */
  static async getParsedMetadataContentById(req, res) {
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

      // Try to parse the metadata JSON content
      let parsedMetadata;
      try {
        parsedMetadata = content.content_metadata_json
          ? JSON.parse(content.content_metadata_json)
          : null;
      } catch (jsonError) {
        return res.status(422).json({
          success: false,
          message: "Invalid JSON format in stored metadata",
          error: jsonError.message,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          ...content,
          parsed_metadata: parsedMetadata,
        },
        message: "Content metadata retrieved and parsed successfully",
      });
    } catch (error) {
      console.error("Error getting parsed metadata content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve and parse content metadata",
        error: error.message,
      });
    }
  }

  /**
   * Get content by content_type
   */
  static async getContentByContentType(req, res) {
    try {
      const { contentType } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);

      const content = await contentRepository.find({
        where: { content_type: contentType },
        order: {
          orders: "ASC",
        },
      });

      res.status(200).json({
        success: true,
        data: content,
        count: content.length,
        message: `Content with content_type '${contentType}' retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting content by content_type:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content by content_type",
        error: error.message,
      });
    }
  }

  /**
   * Get content file based on content_file_link
   */
  static async getContentFile(req, res) {
    try {
      const { id } = req.params;
      const contentRepository = AppDataSource.getRepository(Content);
      
      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) }
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found"
        });
      }

      const fileLink = content.content_file_link;
      
      // Handle different types of links
      if (fileLink.startsWith('http://') || fileLink.startsWith('https://')) {
        // For external links, redirect
        return res.redirect(fileLink);
      } else {
        // For local files
        try {
          // Remove leading slash if present
          const normalizedPath = fileLink.startsWith('/') ? fileLink.substring(1) : fileLink;
          const filePath = path.join(process.cwd(), normalizedPath);
          
          // Check if file exists
          if (!fs.existsSync(filePath)) {
            return res.status(404).json({
              success: false,
              message: "Content file not found on server"
            });
          }

          // For markdown files, send the content
          if (content.content_type === 'markdown') {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return res.status(200).json({
              success: true,
              data: {
                content: fileContent,
                metadata: content.content_metadata_json ? JSON.parse(content.content_metadata_json) : null
              },
              message: "Content file retrieved successfully"
            });
          }
          
          // For other file types, send the file
          res.sendFile(filePath);
        } catch (fileError) {
          console.error("Error reading content file:", fileError);
          res.status(500).json({
            success: false,
            message: "Failed to retrieve content file",
            error: fileError.message
          });
        }
      }
    } catch (error) {
      console.error("Error getting content file:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content file",
        error: error.message
      });
    }
  }

  /**
   * Get content with program details
   */
  static async getContentWithProgramDetails(req, res) {
    try {
      const { programId } = req.params;
      
      const contentQuery = `
        SELECT 
          c.content_id,
          c.program_id,
          c.title,
          c.type,
          c.orders,
          c.content_file_link,
          c.content_type,
          c.content_metadata_json,
          p.title as program_title,
          p.description as program_description,
          p.img_link as program_img_link,
          p.status as program_status,
          p.age_group as program_age_group,
          cat.description as category_description
        FROM Content c
        JOIN Programs p ON c.program_id = p.program_id
        LEFT JOIN Category cat ON p.category_id = cat.category_id
        WHERE c.program_id = @0
        ORDER BY c.orders ASC
      `;

      const contentItems = await AppDataSource.query(contentQuery, [parseInt(programId)]);

      if (!contentItems || contentItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No content found for program ID ${programId}`
        });
      }

      // Group content by program
      const programDetails = {
        program_id: contentItems[0].program_id,
        title: contentItems[0].program_title,
        description: contentItems[0].program_description,
        img_link: contentItems[0].program_img_link,
        status: contentItems[0].program_status,
        age_group: contentItems[0].program_age_group,
        category: contentItems[0].category_description,
        content: contentItems.map(item => ({
          content_id: item.content_id,
          title: item.title,
          type: item.type,
          orders: item.orders,
          content_file_link: item.content_file_link,
          content_type: item.content_type,
          content_metadata_json: item.content_metadata_json ? JSON.parse(item.content_metadata_json) : null
        }))
      };

      res.status(200).json({
        success: true,
        data: programDetails,
        message: `Content with program details for program ID ${programId} retrieved successfully`
      });
    } catch (error) {
      console.error("Error getting content with program details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content with program details",
        error: error.message
      });
    }
  }

  /**
   * Get content by title, type, and order
   */
  static async getContentByTitleTypeAndOrder(req, res) {
    try {
      const { title, type, orderBy, direction } = req.query;
      const contentRepository = AppDataSource.getRepository(Content);
      
      // Build query conditions
      const whereConditions = {};
      const queryParams = [];
      let whereClause = '';
      let index = 0;
      
      if (title) {
        whereClause += `${index > 0 ? ' AND ' : ''}c.title LIKE @${index}`;
        queryParams.push(`%${title}%`);
        index++;
      }
      
      if (type) {
        whereClause += `${index > 0 ? ' AND ' : ''}c.type = @${index}`;
        queryParams.push(type);
        index++;
      }
      
      // Set default order if not provided
      const validOrderColumns = ['title', 'type', 'orders', 'content_type'];
      const orderColumn = validOrderColumns.includes(orderBy) ? orderBy : 'orders';
      const orderDirection = direction === 'DESC' ? 'DESC' : 'ASC';
      
      // Build the SQL query
      let query = `
        SELECT 
          c.content_id,
          c.program_id,
          c.title,
          c.type,
          c.orders,
          c.content_file_link,
          c.content_type,
          c.content_metadata_json,
          p.title as program_title
        FROM Content c
        LEFT JOIN Programs p ON c.program_id = p.program_id
      `;
      
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }
      
      query += ` ORDER BY c.${orderColumn} ${orderDirection}`;
      
      console.log('Query:', query);
      console.log('Params:', queryParams);
      
      const content = await AppDataSource.query(query, queryParams);
      
      // Process content_metadata_json for each item
      const processedContent = content.map(item => ({
        ...item,
        content_metadata_json: item.content_metadata_json ? JSON.parse(item.content_metadata_json) : null
      }));
      
      res.status(200).json({
        success: true,
        data: processedContent,
        count: processedContent.length,
        message: 'Content retrieved successfully',
        filters: {
          title: title || null,
          type: type || null,
          orderBy: orderColumn,
          direction: orderDirection
        }
      });
    } catch (error) {
      console.error("Error getting filtered content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve filtered content",
        error: error.message,
      });
    }
  }
}

module.exports = ContentController;
