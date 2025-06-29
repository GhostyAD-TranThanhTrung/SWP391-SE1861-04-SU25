/**
 * Content Controller using TypeORM
 * CRUD operations for Content table
 */
const AppDataSource = require("../src/data-source");
const Content = require("../src/entities/Content");
const Program = require("../src/entities/Program");
const fs = require('fs');
const path = require('path');

/**
 * Helper function to extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

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
   * Create YouTube video content
   * Expected request body:
   * {
   *   "program_id": 1,
   *   "title": "Introduction to Addiction Science",
   *   "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
   *   "orders": 1,
   *   "instructor": "Dr. Smith",
   *   "duration": "15:30",
   *   "description": "Overview of addiction science basics"
   * }
   */
  static async createYouTubeContent(req, res) {
    try {
      const { 
        program_id, 
        title, 
        youtube_url, 
        orders, 
        instructor, 
        duration, 
        description 
      } = req.body;

      // Validate required fields
      if (!program_id || !title || !youtube_url) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: program_id, title, and youtube_url are required"
        });
      }

      // Validate YouTube URL and extract video ID
      const videoId = extractYouTubeVideoId(youtube_url);
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube URL format"
        });
      }

      // Check if program exists
      const programRepository = AppDataSource.getRepository(Program);
      const program = await programRepository.findOne({
        where: { program_id: parseInt(program_id) }
      });

      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found"
        });
      }

      // Create metadata for YouTube content
      const metadata = {
        video_id: videoId,
        instructor: instructor || "Unknown",
        duration: duration || "Unknown",
        description: description || "",
        format: "youtube",
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embed_url: `https://www.youtube.com/embed/${videoId}`,
        created_at: new Date().toISOString()
      };

      const contentRepository = AppDataSource.getRepository(Content);

      // Create new YouTube content
      const newContent = contentRepository.create({
        program_id: parseInt(program_id),
        title,
        type: 'video',
        orders: orders ? parseInt(orders) : 1,
        content_file_link: youtube_url,
        content_type: 'video',
        content_metadata_json: JSON.stringify(metadata)
      });

      const savedContent = await contentRepository.save(newContent);

      res.status(201).json({
        success: true,
        data: {
          ...savedContent,
          parsed_metadata: metadata
        },
        message: "YouTube content created successfully"
      });
    } catch (error) {
      console.error("Error creating YouTube content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create YouTube content",
        error: error.message
      });
    }
  }

  /**
   * Create markdown content with image
   * Expected request body:
   * {
   *   "program_id": 1,
   *   "title": "Understanding Addiction Science",
   *   "markdown_file": "addiction-science.md",
   *   "image_file": "addiction-brain.jpg", // optional
   *   "orders": 1,
   *   "author": "Dr. Smith",
   *   "reading_time": "10 min",
   *   "difficulty": "intermediate",
   *   "tags": ["addiction", "science", "brain"]
   * }
   */
  static async createMarkdownContent(req, res) {
    try {
      const { 
        program_id, 
        title, 
        markdown_file,
        image_file,
        orders, 
        author, 
        reading_time, 
        difficulty,
        tags,
        description
      } = req.body;

      // Validate required fields
      if (!program_id || !title || !markdown_file) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: program_id, title, and markdown_file are required"
        });
      }

      // Check if program exists
      const programRepository = AppDataSource.getRepository(Program);
      const program = await programRepository.findOne({
        where: { program_id: parseInt(program_id) }
      });

      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found"
        });
      }

      // Validate markdown file exists
      const markdownPath = path.join(__dirname, '..', 'content', 'markdown', markdown_file);
      if (!fs.existsSync(markdownPath)) {
        return res.status(400).json({
          success: false,
          message: `Markdown file not found: ${markdown_file}`,
          path: markdownPath
        });
      }

      // Validate image file if provided
      let imagePath = null;
      if (image_file) {
        imagePath = path.join(__dirname, '..', 'content', 'image', image_file);
        if (!fs.existsSync(imagePath)) {
          return res.status(400).json({
            success: false,
            message: `Image file not found: ${image_file}`,
            path: imagePath
          });
        }
      }

      // Create metadata for markdown content
      const metadata = {
        author: author || "Unknown",
        reading_time: reading_time || "Unknown",
        difficulty: difficulty || "beginner",
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        description: description || "",
        image_file: image_file || null,
        image_url: image_file ? `/api/images/${image_file}` : null,
        markdown_path: `/content/markdown/${markdown_file}`,
        created_at: new Date().toISOString(),
        file_size: fs.statSync(markdownPath).size,
        word_count: null // Will be calculated if needed
      };

      // Calculate word count from markdown file
      try {
        const markdownContent = fs.readFileSync(markdownPath, 'utf8');
        const wordCount = markdownContent.split(/\s+/).filter(word => word.length > 0).length;
        metadata.word_count = wordCount;
        
        // Estimate reading time if not provided (average 200 words per minute)
        if (reading_time === undefined || reading_time === "Unknown") {
          const estimatedMinutes = Math.ceil(wordCount / 200);
          metadata.reading_time = `${estimatedMinutes} min`;
        }
      } catch (error) {
        console.warn("Could not calculate word count:", error.message);
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Create new markdown content
      const newContent = contentRepository.create({
        program_id: parseInt(program_id),
        title,
        type: 'article',
        orders: orders ? parseInt(orders) : 1,
        content_file_link: `/content/markdown/${markdown_file}`,
        content_type: 'markdown',
        content_metadata_json: JSON.stringify(metadata)
      });

      const savedContent = await contentRepository.save(newContent);

      res.status(201).json({
        success: true,
        data: {
          ...savedContent,
          parsed_metadata: metadata
        },
        message: "Markdown content created successfully"
      });
    } catch (error) {
      console.error("Error creating markdown content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create markdown content",
        error: error.message
      });
    }
  }

  /**
   * Create podcast/audio content
   * Expected request body:
   * {
   *   "program_id": 1,
   *   "title": "Recovery Stories Podcast",
   *   "audio_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
   *   "orders": 1,
   *   "host": "Recovery Expert",
   *   "duration": "25:00",
   *   "description": "Personal stories of recovery and hope"
   * }
   */
  static async createPodcastContent(req, res) {
    try {
      const { 
        program_id, 
        title, 
        audio_url, 
        orders, 
        host, 
        duration, 
        description,
        episode_number,
        season
      } = req.body;

      // Validate required fields
      if (!program_id || !title || !audio_url) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: program_id, title, and audio_url are required"
        });
      }

      // Check if program exists
      const programRepository = AppDataSource.getRepository(Program);
      const program = await programRepository.findOne({
        where: { program_id: parseInt(program_id) }
      });

      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found"
        });
      }

      // Create metadata for podcast content
      const metadata = {
        host: host || "Unknown",
        duration: duration || "Unknown",
        description: description || "",
        episode_number: episode_number || null,
        season: season || null,
        format: audio_url.includes('youtube.com') ? 'youtube' : 'audio',
        created_at: new Date().toISOString()
      };

      // If it's a YouTube URL, extract video ID for additional metadata
      if (audio_url.includes('youtube.com')) {
        const videoId = extractYouTubeVideoId(audio_url);
        if (videoId) {
          metadata.video_id = videoId;
          metadata.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          metadata.embed_url = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Create new podcast content
      const newContent = contentRepository.create({
        program_id: parseInt(program_id),
        title,
        type: 'podcast',
        orders: orders ? parseInt(orders) : 1,
        content_file_link: audio_url,
        content_type: 'audio',
        content_metadata_json: JSON.stringify(metadata)
      });

      const savedContent = await contentRepository.save(newContent);

      res.status(201).json({
        success: true,
        data: {
          ...savedContent,
          parsed_metadata: metadata
        },
        message: "Podcast content created successfully"
      });
    } catch (error) {
      console.error("Error creating podcast content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create podcast content",
        error: error.message
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
      const contentType = content.content_type;

      // Handle YouTube videos
      if (contentType === 'video' && fileLink.includes('youtube.com')) {
        return res.status(200).json({
          success: true,
          data: {
            type: 'youtube',
            url: fileLink,
            videoId: extractYouTubeVideoId(fileLink),
            metadata: content.content_metadata_json ? JSON.parse(content.content_metadata_json) : null
          },
          message: "YouTube video link retrieved successfully"
        });
      }

      // Handle audio/podcast content (also YouTube links in our case)
      if (contentType === 'audio' && fileLink.includes('youtube.com')) {
        return res.status(200).json({
          success: true,
          data: {
            type: 'youtube_audio',
            url: fileLink,
            videoId: extractYouTubeVideoId(fileLink),
            metadata: content.content_metadata_json ? JSON.parse(content.content_metadata_json) : null
          },
          message: "YouTube audio link retrieved successfully"
        });
      }

      // Handle external links (non-YouTube)
      if (fileLink.startsWith('http://') || fileLink.startsWith('https://')) {
        return res.status(200).json({
          success: true,
          data: {
            type: 'external_link',
            url: fileLink,
            metadata: content.content_metadata_json ? JSON.parse(content.content_metadata_json) : null
          },
          message: "External link retrieved successfully"
        });
      }

      // Handle local files
      try {
        // Remove leading slash if present
        const normalizedPath = fileLink.startsWith('/') ? fileLink.substring(1) : fileLink;
        const filePath = path.join(process.cwd(), normalizedPath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({
            success: false,
            message: "Content file not found on server",
            filePath: normalizedPath
          });
        }

        // For markdown files, send the content
        if (contentType === 'markdown') {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          return res.status(200).json({
            success: true,
            data: {
              type: 'markdown',
              content: fileContent,
              metadata: content.content_metadata_json ? JSON.parse(content.content_metadata_json) : null
            },
            message: "Markdown content retrieved successfully"
          });
        }

        // For other file types, send the file directly
        res.sendFile(filePath);
      } catch (fileError) {
        console.error("Error reading content file:", fileError);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve content file",
          error: fileError.message
        });
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
 * Get preview content by program_id - returns only Title, Type, and Order
 */
  static async getPreviewContent(req, res) {
    try {
      const { program_id } = req.params;

      if (!program_id) {
        return res.status(400).json({
          success: false,
          message: "Program ID is required"
        });
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Get content for the specified program, ordered by 'orders' field
      const content = await contentRepository.find({
        where: { program_id: parseInt(program_id) },
        select: ["content_id", "title", "type", "orders"],
        order: { orders: "ASC" }
      });

      console.log(`Retrieved ${content.length} content items for program ${program_id}`);

      res.status(200).json({
        success: true,
        data: content,
        count: content.length,
        message: 'Content preview retrieved successfully',
        program_id: parseInt(program_id)
      });
    } catch (error) {
      console.error("Error getting preview content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve preview content",
        error: error.message,
      });
    }
  }
}

module.exports = ContentController;
