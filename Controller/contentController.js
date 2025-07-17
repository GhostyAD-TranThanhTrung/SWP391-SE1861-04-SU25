/**
 * Content Controller using TypeORM
 * CRUD operations for Content table
 * 
 * MARKDOWN CONTENT HANDLING:
 * This controller supports two formats for markdown content:
 * 
 * 1. DIRECT CONTENT (New Format - Recommended):
 *    - content_file_link contains the actual markdown content
 *    - Detected when content starts with '#' or contains newlines
 *    - Faster access, no file system dependencies
 *    - Used by data_vietnamese.sql
 * 
 * 2. FILE-BASED CONTENT (Legacy Format):
 *    - content_file_link contains file path (e.g., "/content/markdown/file.md")
 *    - Requires file system access
 *    - Maintained for backward compatibility
 * 
 * API METHODS:
 * - getContentFile(): Automatically detects format and returns content
 * - createMarkdownContent(): Supports both markdown_content (direct) and markdown_file (legacy)
 * - updateContentToDirectMarkdown(): Converts specific content to direct format
 * - convertAllMarkdownToDirectContent(): Migrates all file-based content to direct format
 * - uploadImage(): Uploads images to /content/image directory
 */
const AppDataSource = require("../src/data-source");
const Content = require("../src/entities/Content");
const Program = require("../src/entities/Program");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'content', 'image');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${timestamp}-${randomNum}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
   * Upload image file
   * Saves image to /content/image directory and returns relative path
   */
  static uploadImage = [
    upload.single('image'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No image file provided"
          });
        }

        // Return relative path for frontend use
        const relativePath = `../image/${req.file.filename}`;

        res.status(200).json({
          success: true,
          data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            relativePath: relativePath,
            size: req.file.size,
            mimetype: req.file.mimetype
          },
          imageUrl: relativePath,
          message: "Image uploaded successfully"
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: error.message
        });
      }
    }
  ];

  /**
   * Get image file
   * Serves images from /content/image directory
   */
  static async getImage(req, res) {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '..', 'content', 'image', filename);

      console.log('🖼️ Image request for:', filename);
      console.log('📁 Looking for image at:', imagePath);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log('❌ Image not found:', imagePath);
        return res.status(404).json({
          success: false,
          message: "Image not found",
          filename: filename,
          path: imagePath
        });
      }

      // Get file extension to determine content type
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      }[ext] || 'image/jpeg';

      console.log('✅ Serving image:', filename, 'as', contentType);

      // Set appropriate headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Send the image file
      res.sendFile(imagePath, (err) => {
        if (err) {
          console.error('💥 Error sending image:', err);
          res.status(500).json({
            success: false,
            message: 'Error serving image',
            error: err.message
          });
        } else {
          console.log('🎉 Image served successfully:', filename);
        }
      });
    } catch (error) {
      console.error("Error getting image:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve image",
        error: error.message
      });
    }
  }

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

      // Update enrollment progress for all users enrolled in this program (if content was added to a program)
      if (program_id) {
        await ContentController.updateEnrollmentProgressForProgram(parseInt(program_id));
      }

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

      // Update enrollment progress for all users enrolled in this program
      await ContentController.updateEnrollmentProgressForProgram(parseInt(program_id));

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
   *   "markdown_content": "# Title\n\nContent here...", // Direct markdown content
   *   "markdown_file": "addiction-science.md", // Optional: file path (legacy)
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
        markdown_content,
        markdown_file,
        image_file,
        orders,
        author,
        reading_time,
        difficulty,
        tags,
        description
      } = req.body;

      // Validate required fields - either markdown_content or markdown_file is required
      if (!program_id || !title || (!markdown_content && !markdown_file)) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: program_id, title, and either markdown_content or markdown_file are required"
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

      let finalMarkdownContent = '';
      let wordCount = 0;

      // Handle direct markdown content (new format)
      if (markdown_content) {
        finalMarkdownContent = markdown_content;
        wordCount = markdown_content.split(/\s+/).filter(word => word.length > 0).length;
      }
      // Handle file-based markdown content (legacy format)
      else if (markdown_file) {
        // Validate markdown file exists
        const markdownPath = path.join(__dirname, '..', 'content', 'markdown', markdown_file);
        if (!fs.existsSync(markdownPath)) {
          return res.status(400).json({
            success: false,
            message: `Markdown file not found: ${markdown_file}`,
            path: markdownPath
          });
        }

        try {
          finalMarkdownContent = fs.readFileSync(markdownPath, 'utf8');
          wordCount = finalMarkdownContent.split(/\s+/).filter(word => word.length > 0).length;
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to read markdown file",
            error: error.message
          });
        }
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
        created_at: new Date().toISOString(),
        word_count: wordCount,
        content_type: markdown_content ? 'direct' : 'file'
      };

      // If using file, add file path to metadata
      if (markdown_file) {
        metadata.markdown_path = `/content/markdown/${markdown_file}`;
        try {
          const markdownPath = path.join(__dirname, '..', 'content', 'markdown', markdown_file);
          metadata.file_size = fs.statSync(markdownPath).size;
        } catch (error) {
          console.warn("Could not get file size:", error.message);
        }
      }

      // Estimate reading time if not provided (average 200 words per minute)
      if (reading_time === undefined || reading_time === "Unknown") {
        const estimatedMinutes = Math.ceil(wordCount / 200);
        metadata.reading_time = `${estimatedMinutes} min`;
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Create new markdown content
      const newContent = contentRepository.create({
        program_id: parseInt(program_id),
        title,
        type: 'article',
        orders: orders ? parseInt(orders) : 1,
        content_file_link: finalMarkdownContent, // Store the actual content or file path
        content_type: 'markdown',
        content_metadata_json: JSON.stringify(metadata)
      });

      const savedContent = await contentRepository.save(newContent);

      // Update enrollment progress for all users enrolled in this program
      await ContentController.updateEnrollmentProgressForProgram(parseInt(program_id));

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

      // Update enrollment progress for all users enrolled in this program
      await ContentController.updateEnrollmentProgressForProgram(parseInt(program_id));

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
      if (content_file_link !== undefined) {
        content.content_file_link = content_file_link;

        // If updating markdown content with direct content, update metadata
        if (content.content_type === 'markdown' && (content_file_link.startsWith('#') || content_file_link.includes('\n'))) {
          try {
            let metadata = {};
            if (content.content_metadata_json) {
              metadata = JSON.parse(content.content_metadata_json);
            }

            // Calculate word count for new content
            const wordCount = content_file_link.split(/\s+/).filter(word => word.length > 0).length;
            metadata.word_count = wordCount;
            metadata.content_type = 'direct';
            metadata.updated_at = new Date().toISOString();

            // Recalculate reading time (average 200 words per minute)
            const estimatedMinutes = Math.ceil(wordCount / 200);
            metadata.reading_time = `${estimatedMinutes} min`;

            content.content_metadata_json = JSON.stringify(metadata);
          } catch (error) {
            console.warn("Could not update metadata for direct markdown content:", error.message);
          }
        }
      }
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

      // Store program_id before deletion for enrollment progress update
      const programId = content.program_id;

      // Delete the content
      await contentRepository.remove(content);

      // Update enrollment progress for all users enrolled in this program (if content was part of a program)
      if (programId) {
        await ContentController.updateEnrollmentProgressForProgram(programId);
      }

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

      // Handle direct markdown content (new format where content_file_link contains actual markdown)
      if (contentType === 'markdown' && (fileLink.startsWith('#') || fileLink.includes('\n'))) {
        return res.status(200).json({
          success: true,
          data: {
            type: 'markdown',
            content: fileLink,
            metadata: content.content_metadata_json ? JSON.parse(content.content_metadata_json) : null
          },
          message: "Markdown content retrieved successfully"
        });
      }

      // Handle local files (legacy format)
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

  /**
   * Update content to use direct markdown content instead of file paths
   * Expected request body:
   * {
   *   "markdown_content": "# Title\n\nContent here..."
   * }
   */
  static async updateContentToDirectMarkdown(req, res) {
    try {
      const { id } = req.params;
      const { markdown_content } = req.body;

      if (!markdown_content) {
        return res.status(400).json({
          success: false,
          message: "markdown_content is required"
        });
      }

      const contentRepository = AppDataSource.getRepository(Content);

      // Check if content exists
      const content = await contentRepository.findOne({
        where: { content_id: parseInt(id) }
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found"
        });
      }

      // Verify this is markdown content
      if (content.content_type !== 'markdown') {
        return res.status(400).json({
          success: false,
          message: "This method only works for markdown content"
        });
      }

      // Calculate word count for new content
      const wordCount = markdown_content.split(/\s+/).filter(word => word.length > 0).length;

      // Update metadata
      let metadata = {};
      if (content.content_metadata_json) {
        try {
          metadata = JSON.parse(content.content_metadata_json);
        } catch (error) {
          console.warn("Could not parse existing metadata:", error.message);
        }
      }

      // Update metadata with new information
      metadata.word_count = wordCount;
      metadata.content_type = 'direct';
      metadata.updated_at = new Date().toISOString();

      // Recalculate reading time (average 200 words per minute)
      const estimatedMinutes = Math.ceil(wordCount / 200);
      metadata.reading_time = `${estimatedMinutes} min`;

      // Update the content
      content.content_file_link = markdown_content;
      content.content_metadata_json = JSON.stringify(metadata);

      const updatedContent = await contentRepository.save(content);

      res.status(200).json({
        success: true,
        data: {
          ...updatedContent,
          parsed_metadata: metadata
        },
        message: "Content updated to use direct markdown successfully"
      });
    } catch (error) {
      console.error("Error updating content to direct markdown:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update content to direct markdown",
        error: error.message
      });
    }
  }

  /**
   * Get content format statistics
   * Shows distribution of direct vs file-based markdown content
   */
  static async getContentStatistics(req, res) {
    try {
      const contentRepository = AppDataSource.getRepository(Content);

      // Get all content
      const allContent = await contentRepository.find();

      const stats = {
        total_content: allContent.length,
        by_type: {},
        markdown_formats: {
          direct_content: 0,
          file_based: 0,
          external_links: 0
        },
        by_program: {}
      };

      // Analyze content
      allContent.forEach(content => {
        // Count by type
        if (!stats.by_type[content.type]) {
          stats.by_type[content.type] = 0;
        }
        stats.by_type[content.type]++;

        // Count by program
        if (content.program_id) {
          if (!stats.by_program[content.program_id]) {
            stats.by_program[content.program_id] = 0;
          }
          stats.by_program[content.program_id]++;
        }

        // Analyze markdown formats
        if (content.content_type === 'markdown') {
          const fileLink = content.content_file_link;

          if (fileLink.startsWith('http://') || fileLink.startsWith('https://')) {
            stats.markdown_formats.external_links++;
          } else if (fileLink.startsWith('#') || fileLink.includes('\n')) {
            stats.markdown_formats.direct_content++;
          } else {
            stats.markdown_formats.file_based++;
          }
        }
      });

      res.status(200).json({
        success: true,
        data: stats,
        message: "Content statistics retrieved successfully"
      });
    } catch (error) {
      console.error("Error getting content statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve content statistics",
        error: error.message
      });
    }
  }

  /**
   * Convert all file-based markdown content to direct markdown content
   * This method migrates existing content from file paths to direct content storage
   */
  static async convertAllMarkdownToDirectContent(req, res) {
    try {
      const contentRepository = AppDataSource.getRepository(Content);

      // Find all markdown content that still uses file paths
      const markdownContent = await contentRepository.find({
        where: { content_type: 'markdown' }
      });

      const results = {
        total: markdownContent.length,
        converted: 0,
        skipped: 0,
        errors: []
      };

      for (const content of markdownContent) {
        try {
          const fileLink = content.content_file_link;

          // Skip if already using direct content (starts with # or contains newlines)
          if (fileLink.startsWith('#') || fileLink.includes('\n')) {
            results.skipped++;
            continue;
          }

          // Skip if it's not a file path
          if (fileLink.startsWith('http://') || fileLink.startsWith('https://')) {
            results.skipped++;
            continue;
          }

          // Try to read the file
          const normalizedPath = fileLink.startsWith('/') ? fileLink.substring(1) : fileLink;
          const filePath = path.join(process.cwd(), normalizedPath);

          if (!fs.existsSync(filePath)) {
            results.errors.push({
              content_id: content.content_id,
              title: content.title,
              error: "File not found",
              path: normalizedPath
            });
            continue;
          }

          // Read file content
          const markdownFileContent = fs.readFileSync(filePath, 'utf8');
          const wordCount = markdownFileContent.split(/\s+/).filter(word => word.length > 0).length;

          // Update metadata
          let metadata = {};
          if (content.content_metadata_json) {
            try {
              metadata = JSON.parse(content.content_metadata_json);
            } catch (error) {
              console.warn(`Could not parse metadata for content ${content.content_id}:`, error.message);
            }
          }

          // Update metadata
          metadata.word_count = wordCount;
          metadata.content_type = 'direct';
          metadata.converted_at = new Date().toISOString();
          metadata.original_file_path = fileLink;

          // Recalculate reading time
          const estimatedMinutes = Math.ceil(wordCount / 200);
          metadata.reading_time = `${estimatedMinutes} min`;

          // Update the content
          content.content_file_link = markdownFileContent;
          content.content_metadata_json = JSON.stringify(metadata);

          await contentRepository.save(content);
          results.converted++;

        } catch (error) {
          results.errors.push({
            content_id: content.content_id,
            title: content.title,
            error: error.message
          });
        }
      }

      res.status(200).json({
        success: true,
        data: results,
        message: `Conversion completed. ${results.converted} items converted, ${results.skipped} skipped, ${results.errors.length} errors.`
      });
    } catch (error) {
      console.error("Error converting markdown content:", error);
      res.status(500).json({
        success: false,
        message: "Failed to convert markdown content",
        error: error.message
      });
    }
  }

  /**
   * Manually recalculate enrollment progress for a program
   * Useful for fixing any inconsistencies in progress tracking
   */
  static async recalculateEnrollmentProgress(req, res) {
    try {
      const { programId } = req.params;

      if (!programId || isNaN(parseInt(programId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid program ID provided"
        });
      }

      // Check if program exists
      const programRepository = AppDataSource.getRepository(Program);
      const program = await programRepository.findOne({
        where: { program_id: parseInt(programId) }
      });

      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found"
        });
      }

      // Update enrollment progress
      const success = await ContentController.updateEnrollmentProgressForProgram(parseInt(programId));

      if (success) {
        res.status(200).json({
          success: true,
          message: `Enrollment progress recalculated successfully for program ${programId}`
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to recalculate enrollment progress"
        });
      }
    } catch (error) {
      console.error("Error recalculating enrollment progress:", error);
      res.status(500).json({
        success: false,
        message: "Failed to recalculate enrollment progress",
        error: error.message
      });
    }
  }

  /**
   * Helper method to update enrollment progress for all users enrolled in a program
   * This method synchronizes the progress array with current content items
   * Used when content is added or removed from a program
   */
  static async updateEnrollmentProgressForProgram(programId) {
    try {
      const Enroll = require('../src/entities/Enroll');
      const enrollRepository = AppDataSource.getRepository(Enroll);
      const contentRepository = AppDataSource.getRepository(Content);

      // Get all current content for this program
      const programContents = await contentRepository.find({
        where: { program_id: parseInt(programId) },
        order: { orders: 'ASC' }
      });

      // Get all enrollments for this program
      const enrollments = await enrollRepository.find({
        where: { program_id: parseInt(programId) }
      });

      console.log(`Updating progress for ${enrollments.length} enrollments in program ${programId} with ${programContents.length} content items`);

      // Update each enrollment's progress array
      for (const enrollment of enrollments) {
        try {
          // Parse current progress
          let currentProgress = [];
          try {
            currentProgress = enrollment.progress ? JSON.parse(enrollment.progress) : [];
          } catch (parseError) {
            console.error('Error parsing progress JSON:', parseError);
            currentProgress = [];
          }

          // Create a map of existing progress by content_id
          const progressMap = new Map();
          currentProgress.forEach(item => {
            if (item && item.content_id) {
              progressMap.set(item.content_id, item.complete || false);
            }
          });

          // Create new progress array based on current content
          const updatedProgress = programContents.map(content => ({
            content_id: content.content_id,
            complete: progressMap.get(content.content_id) || false
          }));

          // Update the enrollment with new progress
          await enrollRepository.update(
            {
              user_id: enrollment.user_id,
              program_id: enrollment.program_id
            },
            {
              progress: JSON.stringify(updatedProgress)
            }
          );

          console.log(`Updated progress for user ${enrollment.user_id} in program ${programId}`);

        } catch (enrollmentError) {
          console.error(`Error updating enrollment for user ${enrollment.user_id}:`, enrollmentError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating enrollment progress for program:', error);
      return false;
    }
  }
}

module.exports = ContentController;
