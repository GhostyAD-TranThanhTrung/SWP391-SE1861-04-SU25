/**
 * Blog Controller using TypeORM
 * CRUD operations for Blogs table
 */
const AppDataSource = require("../src/data-source");
const Blog = require("../src/entities/Blog");

class BlogController {
  /**
   * Get all blogs
   */
  static async getAllBlogs(req, res) {
    try {
      const blogRepository = AppDataSource.getRepository(Blog);
      const blogs = await blogRepository.find();

      res.status(200).json({
        success: true,
        data: blogs,
        message: "Blogs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve blogs",
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
   * Create new blog
   */
  static async createBlog(req, res) {
    try {
      const { author_id, title, body, status = "draft" } = req.body;

      // Validate required fields
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: "Title and body are required",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);

      // Create new blog with current date
      const newBlog = blogRepository.create({
        author_id: author_id ? parseInt(author_id) : null,
        title,
        body,
        created_at: new Date(),
        status,
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

      if (!status || !["draft", "published", "archived"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid status is required (draft, published, archived)",
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
   * Search blogs by title or content
   */
  static async searchBlogs(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const blogRepository = AppDataSource.getRepository(Blog);

      const blogs = await blogRepository
        .createQueryBuilder("blog")
        .where("blog.title LIKE :query", { query: `%${query}%` })
        .orWhere("blog.body LIKE :query", { query: `%${query}%` })
        .getMany();

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
}

module.exports = BlogController;
