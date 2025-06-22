/**
 * Blog Controller using TypeORM
 * CRUD operations for Blogs table
 */
const AppDataSource = require("../src/data-source");
const Blog = require("../src/entities/Blog");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'SWP391-SE1861-04-SU25/public/uploads/blog-images/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
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

class BlogController {
  /**
   * Get all published blogs
   */
  static async getAllBlogs(req, res) {
    try {
      const blogRepository = AppDataSource.getRepository(Blog);
      const blogs = await blogRepository.find({
        where: { status: "published" },
        order: {
          created_at: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
        message: "Published blogs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting published blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve published blogs",
        error: error.message,
      });
    }
  }

  /**
   * Get blogs authored by the currently authenticated user
   * Uses the user ID from the JWT token
   */
  static async getMyBlogs(req, res) {
    try {
      // Get user ID from the verified token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);

      const blogs = await blogRepository.find({
        where: { author_id: userId },
        order: {
          created_at: "DESC",
        },
        relations: {
          flags: true,
        },
      });

      res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
        message: "Your blogs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting user blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve your blogs",
        error: error.message,
      });
    }
  }

  /**
   * Get blog by ID
   */
  static async getBlogById(req, res) {
    try {
      const { id } = req.params;
      const blogRepository = AppDataSource.getRepository(Blog);
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(id) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      res.status(200).json({
        success: true,
        data: blog,
        message: "Blog retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting blog:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve blog",
        error: error.message,
      });
    }
  }

  /**
   * Get blog with author and flags
   */
  static async getBlogWithRelations(req, res) {
    try {
      const { id } = req.params;
      const blogRepository = AppDataSource.getRepository(Blog);

      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(id) },
        relations: {
          author: true,
          flags: true,
        },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      res.status(200).json({
        success: true,
        data: blog,
        message: "Blog with relations retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting blog with relations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve blog with relations",
        error: error.message,
      });
    }
  }

  /**
   * Get blogs by author ID
   */
  static async getBlogsByAuthorId(req, res) {
    try {
      const { authorId } = req.params;
      const blogRepository = AppDataSource.getRepository(Blog);

      const blogs = await blogRepository.find({
        where: { author_id: parseInt(authorId) },
      });

      res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
        message: `Blogs by author ${authorId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting blogs by author ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve blogs by author ID",
        error: error.message,
      });
    }
  }

  /**
   * Create new blog with optional image upload
   */
  static createBlogWithImage = [
    upload.single('image'),
    async (req, res) => {
      try {
        const { title, body, status = "draft" } = req.body;

        // Get user ID from the verified token (set by verifyToken middleware)
        const userId = req.user.userId;

        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "Authentication required",
          });
        }

        // Validate required fields
        if (!title || !body) {
          return res.status(400).json({
            success: false,
            message: "Title and body are required",
          });
        }

        const blogRepository = AppDataSource.getRepository(Blog);

        // Handle image upload
        let imgLink = null;
        if (req.file) {
          // Store relative path for database
          imgLink = `/uploads/blog-images/${req.file.filename}`;
        }

        // Create new blog with current date and authenticated user as author
        const newBlog = blogRepository.create({
          author_id: parseInt(userId),
          title,
          body,
          created_at: new Date(),
          status,
          img_link: imgLink,
        });

        const savedBlog = await blogRepository.save(newBlog);

        res.status(201).json({
          success: true,
          data: savedBlog,
          message: "Blog created successfully",
        });
      } catch (error) {
        console.error("Error creating blog:", error);

        // Clean up uploaded file if blog creation failed
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting uploaded file:", unlinkError);
          }
        }

        res.status(500).json({
          success: false,
          message: "Failed to create blog",
          error: error.message,
        });
      }
    }
  ];

  /**
   * Create new blog (legacy method for backward compatibility)
   */
  static async createBlog(req, res) {
    try {
      const { title, body, status = "draft" } = req.body;

      // Get user ID from the verified token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Validate required fields
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: "Title and body are required",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);

      // Create new blog with current date and authenticated user as author
      const newBlog = blogRepository.create({
        author_id: parseInt(userId),
        title,
        body,
        created_at: new Date(),
        status,
        img_link: null,
      });

      const savedBlog = await blogRepository.save(newBlog);

      res.status(201).json({
        success: true,
        data: savedBlog,
        message: "Blog created successfully",
      });
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create blog",
        error: error.message,
      });
    }
  }

  /**
   * Update blog
   */
  static async updateBlog(req, res) {
    try {
      const { id } = req.params;
      const { title, body, status } = req.body;

      const blogRepository = AppDataSource.getRepository(Blog);

      // Check if blog exists
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(id) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Update blog fields
      if (title !== undefined) blog.title = title;
      if (body !== undefined) blog.body = body;
      if (status !== undefined) blog.status = status;

      const updatedBlog = await blogRepository.save(blog);

      res.status(200).json({
        success: true,
        data: updatedBlog,
        message: "Blog updated successfully",
      });
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update blog",
        error: error.message,
      });
    }
  }

  /**
   * Delete blog by ID
   */
  static async deleteBlog(req, res) {
    try {
      const { id } = req.params;

      // Get user ID from the verified token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog ID provided",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);

      // Check if blog exists before deleting
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(id) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Check if user is the author of the blog
      if (blog.author_id !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own blogs",
        });
      }

      // Delete the blog
      await blogRepository.remove(blog);

      res.status(200).json({
        success: true,
        message: `Blog with ID ${id} deleted successfully`,
        deletedBlog: {
          blog_id: blog.blog_id,
          title: blog.title,
        },
      });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete blog",
        error: error.message,
      });
    }
  }

  /**
   * Get published blogs
   */
  static async getPublishedBlogs(req, res) {
    try {
      const blogRepository = AppDataSource.getRepository(Blog);

      const blogs = await blogRepository.find({
        where: { status: "published" },
        order: {
          created_at: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
        message: "Published blogs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting published blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve published blogs",
        error: error.message,
      });
    }
  }

  /**
   * Update blog status
   */
  static async updateBlogStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Get user ID from the verified token (set by verifyToken middleware)
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!status || !["draft", "published", "archived", "hidden"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid status is required (draft, published, archived, hidden)",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);

      // Check if blog exists
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(id) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Check if user is the author of the blog
      if (blog.author_id !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own blogs",
        });
      }

      // Update blog status
      blog.status = status;
      const updatedBlog = await blogRepository.save(blog);

      res.status(200).json({
        success: true,
        data: updatedBlog,
        message: `Blog status updated to '${status}' successfully`,
      });
    } catch (error) {
      console.error("Error updating blog status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update blog status",
        error: error.message,
      });
    }
  }

  /**
   * Hide blog
   */
  static async hideBlog(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const blogRepository = AppDataSource.getRepository(Blog);

      // Check if blog exists
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(id) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Store the previous status in metadata if needed
      const previousStatus = blog.status;

      // Update blog status to hidden
      blog.status = "hidden";

      // If we have metadata field, we could store the reason and previous status
      // This assumes the Blog entity has a body field
      // If it doesn't, you would need to modify the entity or create a separate table
      if (blog.body) {
        let metadata = {};
        try {
          metadata = JSON.parse(blog.body);
        } catch (e) {
          metadata = {};
        }

        metadata.hidden_reason = reason || "No reason provided";
        metadata.hidden_at = new Date().toISOString();
        metadata.previous_status = previousStatus;

        blog.body = JSON.stringify(metadata);
      }

      const updatedBlog = await blogRepository.save(blog);

      res.status(200).json({
        success: true,
        data: updatedBlog,
        message: "Blog hidden successfully",
        previousStatus,
      });
    } catch (error) {
      console.error("Error hiding blog:", error);
      res.status(500).json({
        success: false,
        message: "Failed to hide blog",
        error: error.message,
      });
    }
  }
  static async BlogPagination(req, res) {
    try {
      const { page = 1 } = req.params;
      const blogRepository = AppDataSource.getRepository(Blog);
      const result = await blogRepository.createQueryBuilder("blog")
        .orderBy("blog.created_at", "DESC")
        .offset((page - 1) * 6)
        .limit(6)
        .getMany()
      return res.status(200).json({
        success: true,
        data: result,
        message: "Blogs paginated successfully"
      })
    } catch (error) {
      console.error("Error in BlogPagination:", error);
      res.status(500).json({
        success: false,
        message: "Failed to paginate blogs",
        error: error.message,
      })
    }
  }
  /**
   * Get hidden blogs
   */
  static async getHiddenBlogs(req, res) {
    try {
      const blogRepository = AppDataSource.getRepository(Blog);

      const blogs = await blogRepository.find({
        where: { status: "hidden" },
        order: {
          created_at: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
        message: "Hidden blogs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting hidden blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve hidden blogs",
        error: error.message,
      });
    }
  }

  /**
   * Search blogs by title or content
   */
  static async searchBlogs(req, res) {
    try {
      const { query, includeHidden } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);
      let queryBuilder = blogRepository
        .createQueryBuilder("blog")
        .where("blog.title LIKE :query", { query: `%${query}%` })
        .orWhere("blog.body LIKE :query", { query: `%${query}%` });

      // Exclude hidden blogs by default unless explicitly requested
      if (includeHidden !== 'true') {
        queryBuilder = queryBuilder.andWhere("blog.status != :status", { status: "hidden" });
      }

      const blogs = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
        message: "Blog search results retrieved successfully",
      });
    } catch (error) {
      console.error("Error searching blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search blogs",
        error: error.message,
      });
    }
  }

  /**
   * Get blog image with fallback to placeholder
   */
  static async getBlogImage(req, res) {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '../SWP391-SE1861-04-SU25/public/uploads/blog-images/', filename);
      const placeholderPath = path.join(__dirname, '../SWP391-SE1861-04-SU25/public/uploads/blog-images/placeholder.jpg');

      // Check if image exists
      if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
      } else {
        // Send placeholder if image doesn't exist
        if (fs.existsSync(placeholderPath)) {
          res.sendFile(placeholderPath);
        } else {
          // Create a simple placeholder response if no placeholder file exists
          res.status(404).json({
            success: false,
            message: "Image not found",
          });
        }
      }
    } catch (error) {
      console.error("Error serving blog image:", error);
      res.status(500).json({
        success: false,
        message: "Failed to serve image",
        error: error.message,
      });
    }
  }

  /**
   * Middleware function to export
   */
  static getUploadMiddleware() {
    return upload.single('image');
  }
}

module.exports = BlogController;
