/**
 * Flag Controller using TypeORM
 * CRUD operations for Flags table
 */
const AppDataSource = require("../src/data-source");
const Flag = require("../src/entities/Flag");
const Blog = require("../src/entities/Blog");
const User = require("../src/entities/User");

class FlagController {
  /**
   * Get all flags
   */
  static async getAllFlags(req, res) {
    try {
      const flagRepository = AppDataSource.getRepository(Flag);
      const flags = await flagRepository.find({
        order: {
          created_at: "DESC",
        },
      });

      res.status(200).json({
        success: true,
        data: flags,
        message: "Flags retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting flags:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve flags",
        error: error.message,
      });
    }
  }

  /**
   * Get flag by ID
   */
  static async getFlagById(req, res) {
    try {
      const { id } = req.params;
      const flagRepository = AppDataSource.getRepository(Flag);
      const flag = await flagRepository.findOne({
        where: { flag_id: parseInt(id) },
      });

      if (!flag) {
        return res.status(404).json({
          success: false,
          message: "Flag not found",
        });
      }

      res.status(200).json({
        success: true,
        data: flag,
        message: "Flag retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting flag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve flag",
        error: error.message,
      });
    }
  }

  /**
   * Get flag with related blog and user information
   */
  static async getFlagWithRelations(req, res) {
    try {
      const { id } = req.params;
      const flagRepository = AppDataSource.getRepository(Flag);

      const flag = await flagRepository.findOne({
        where: { flag_id: parseInt(id) },
        relations: {
          blog: true,
          user: true,
        },
      });

      if (!flag) {
        return res.status(404).json({
          success: false,
          message: "Flag not found",
        });
      }

      res.status(200).json({
        success: true,
        data: flag,
        message: "Flag with relations retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting flag with relations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve flag with relations",
        error: error.message,
      });
    }
  }

  /**
   * Get flags by blog ID
   */
  static async getFlagsByBlogId(req, res) {
    try {
      const { blogId } = req.params;
      const flagRepository = AppDataSource.getRepository(Flag);

      const flags = await flagRepository.find({
        where: { blog_id: parseInt(blogId) },
        order: {
          created_at: "DESC",
        },
        relations: {
          user: true,
        },
      });

      res.status(200).json({
        success: true,
        data: flags,
        count: flags.length,
        message: `Flags for blog ID ${blogId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting flags by blog ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve flags by blog ID",
        error: error.message,
      });
    }
  }

  /**
   * Get flags created by user
   */
  static async getFlagsByUser(req, res) {
    try {
      const { userId } = req.params;
      const flagRepository = AppDataSource.getRepository(Flag);

      const flags = await flagRepository.find({
        where: { flagged_by: parseInt(userId) },
        order: {
          created_at: "DESC",
        },
        relations: {
          blog: true,
        },
      });

      res.status(200).json({
        success: true,
        data: flags,
        count: flags.length,
        message: `Flags created by user ID ${userId} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting flags by user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve flags by user",
        error: error.message,
      });
    }
  }

  /**
   * Create new flag
   */
  static async createFlag(req, res) {
    try {
      const { blog_id, flagged_by, reason } = req.body;

      // Validate required fields
      if (!blog_id || !flagged_by) {
        return res.status(400).json({
          success: false,
          message: "Blog ID and flagged_by user ID are required",
        });
      }

      // Check if blog exists
      const blogRepository = AppDataSource.getRepository(Blog);
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(blog_id) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Check if user exists
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: parseInt(flagged_by) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user has already flagged this blog
      const flagRepository = AppDataSource.getRepository(Flag);
      const existingFlag = await flagRepository.findOne({
        where: {
          blog_id: parseInt(blog_id),
          flagged_by: parseInt(flagged_by),
        },
      });

      if (existingFlag) {
        return res.status(409).json({
          success: false,
          message: "You have already flagged this blog",
        });
      }

      // Create new flag with current date
      const newFlag = flagRepository.create({
        blog_id: parseInt(blog_id),
        flagged_by: parseInt(flagged_by),
        reason,
        created_at: new Date(),
      });

      const savedFlag = await flagRepository.save(newFlag);

      res.status(201).json({
        success: true,
        data: savedFlag,
        message: "Blog flagged successfully",
      });
    } catch (error) {
      console.error("Error creating flag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to flag blog",
        error: error.message,
      });
    }
  }

  /**
   * Update flag reason
   */
  static async updateFlag(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Reason is required",
        });
      }

      const flagRepository = AppDataSource.getRepository(Flag);

      // Check if flag exists
      const flag = await flagRepository.findOne({
        where: { flag_id: parseInt(id) },
      });

      if (!flag) {
        return res.status(404).json({
          success: false,
          message: "Flag not found",
        });
      }

      // Update flag reason
      flag.reason = reason;

      const updatedFlag = await flagRepository.save(flag);

      res.status(200).json({
        success: true,
        data: updatedFlag,
        message: "Flag reason updated successfully",
      });
    } catch (error) {
      console.error("Error updating flag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update flag",
        error: error.message,
      });
    }
  }

  /**
   * Delete flag by ID
   */
  static async deleteFlag(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid flag ID provided",
        });
      }

      const flagRepository = AppDataSource.getRepository(Flag);

      // Check if flag exists before deleting
      const flag = await flagRepository.findOne({
        where: { flag_id: parseInt(id) },
      });

      if (!flag) {
        return res.status(404).json({
          success: false,
          message: "Flag not found",
        });
      }

      // Delete the flag
      await flagRepository.remove(flag);

      res.status(200).json({
        success: true,
        message: `Flag with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting flag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete flag",
        error: error.message,
      });
    }
  }

  /**
   * Get most flagged blogs
   */
  static async getMostFlaggedBlogs(req, res) {
    try {
      const flagRepository = AppDataSource.getRepository(Flag);

      const flaggedBlogs = await flagRepository
        .createQueryBuilder("flag")
        .leftJoinAndSelect("flag.blog", "blog")
        .select("blog.blog_id", "blogId")
        .addSelect("blog.title", "title")
        .addSelect("COUNT(flag.flag_id)", "flagCount")
        .groupBy("blog.blog_id")
        .addGroupBy("blog.title")
        .orderBy("flagCount", "DESC")
        .getRawMany();

      res.status(200).json({
        success: true,
        data: flaggedBlogs,
        message: "Most flagged blogs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting most flagged blogs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve most flagged blogs",
        error: error.message,
      });
    }
  }

  /**
   * Remove all flags from a blog
   */
  static async clearBlogFlags(req, res) {
    try {
      const { blogId } = req.params;

      if (!blogId || isNaN(parseInt(blogId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog ID provided",
        });
      }

      // Check if blog exists
      const blogRepository = AppDataSource.getRepository(Blog);
      const blog = await blogRepository.findOne({
        where: { blog_id: parseInt(blogId) },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      const flagRepository = AppDataSource.getRepository(Flag);

      // Delete all flags for this blog
      const result = await flagRepository
        .createQueryBuilder()
        .delete()
        .from(Flag)
        .where("blog_id = :blogId", { blogId: parseInt(blogId) })
        .execute();

      res.status(200).json({
        success: true,
        deletedCount: result.affected,
        message: `Removed ${result.affected || 0} flags from blog ID ${blogId}`,
      });
    } catch (error) {
      console.error("Error clearing blog flags:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear blog flags",
        error: error.message,
      });
    }
  }
}

module.exports = FlagController;
