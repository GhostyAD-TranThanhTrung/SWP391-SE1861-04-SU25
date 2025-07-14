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
      const { blog_id, reason } = req.body;
      // Get flagged_by from the authenticated user token
      const flagged_by = req.user.userId;

      // Validate required fields
      if (!blog_id) {
        return res.status(400).json({
          success: false,
          message: "Blog ID is required",
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
        where: { user_id: flagged_by },
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
          flagged_by: flagged_by,
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
        flagged_by: flagged_by,
        reason,
        created_at: new Date(),
      });

      const savedFlag = await flagRepository.save(newFlag);

      // Check flag count and take appropriate action
      const flagCount = await flagRepository.count({
        where: { blog_id: parseInt(blog_id) }
      });

      let blogHidden = false;
      let blogDeleted = false;

      if (flagCount >= 3) {
        // Delete blog if it has 3 or more flags
        await blogRepository.remove(blog);
        blogDeleted = true;
        console.log(`Blog ${blog_id} has been auto-deleted due to ${flagCount} flag(s)`);
      } else if (flagCount >= 1 && blog.status !== 'hidden') {
        // Hide blog if it has 1 or more flags (but less than 3)
        blog.status = 'hidden';
        await blogRepository.save(blog);
        blogHidden = true;
        console.log(`Blog ${blog_id} has been auto-hidden due to ${flagCount} flag(s)`);
      }

      // Check if the blog author has more than 5 flagged posts
      if (blog.author_id) {
        // Count flagged posts by this author
        const query = `
          SELECT COUNT(DISTINCT b.blog_id) as flagged_count
          FROM Blogs b
          JOIN Flags f ON b.blog_id = f.blog_id
          WHERE b.author_id = @0
        `;

        const [result] = await AppDataSource.query(query, [blog.author_id]);
        const flaggedCount = result ? result.flagged_count : 0;

        console.log(`Author ${blog.author_id} has ${flaggedCount} flagged posts`);

        // If author has more than 5 flagged posts, ban the user
        if (flaggedCount >= 5) {
          // Get the author user
          const author = await userRepository.findOne({
            where: { user_id: blog.author_id }
          });

          if (author) {
            // Update user status to banned
            author.status = 'banned';
            await userRepository.save(author);

            console.log(`User ${blog.author_id} has been banned for having ${flaggedCount} flagged posts`);

            // Return success with additional info about the ban and blog action
            return res.status(201).json({
              success: true,
              data: savedFlag,
              message: "Blog flagged successfully",
              blogHidden: blogHidden,
              blogDeleted: blogDeleted,
              flagCount: flagCount,
              authorBanned: true,
              authorId: blog.author_id,
              flaggedPostsCount: flaggedCount,
              banMessage: `Author (ID: ${blog.author_id}) has been banned for having ${flaggedCount} flagged posts`
            });
          }
        }
      }

      res.status(201).json({
        success: true,
        data: savedFlag,
        message: "Blog flagged successfully",
        blogHidden: blogHidden,
        blogDeleted: blogDeleted,
        flagCount: flagCount,
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
   * Remove flag by ID (admin only)
   * Also checks if blog should be unhidden after flag removal
   */
  static async removeFlag(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid flag ID provided",
        });
      }

      const flagRepository = AppDataSource.getRepository(Flag);
      const blogRepository = AppDataSource.getRepository(Blog);

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

      const blogId = flag.blog_id;

      // Delete the flag
      await flagRepository.remove(flag);

      // Check remaining flag count for the blog
      const remainingFlags = await flagRepository.count({
        where: { blog_id: blogId }
      });

      // If no flags remain, unhide the blog
      let blogUnhidden = false;
      if (remainingFlags === 0) {
        const blog = await blogRepository.findOne({
          where: { blog_id: blogId }
        });

        if (blog && blog.status === 'hidden') {
          blog.status = 'Đã xuất bản'; // Set back to published
          await blogRepository.save(blog);
          blogUnhidden = true;
          console.log(`Blog ${blogId} has been unhidden after flag removal`);
        }
      }

      res.status(200).json({
        success: true,
        message: `Flag with ID ${id} removed successfully`,
        blogUnhidden: blogUnhidden,
        remainingFlags: remainingFlags,
        blogId: blogId,
      });
    } catch (error) {
      console.error("Error removing flag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove flag",
        error: error.message,
      });
    }
  }

  /**
   * Clear all flags for a blog (admin only)
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

  /**
   * Get users banned due to flags
   */
  static async getBannedUsers(req, res) {
    try {
      // Query to get users who are banned and have at least 5 flagged posts
      const query = `
        SELECT 
          u.user_id,
          u.email,
          u.role,
          u.status,
          p.name,
          COUNT(DISTINCT b.blog_id) as flagged_posts_count
        FROM 
          Users u
        LEFT JOIN 
          Profile p ON u.user_id = p.user_id
        LEFT JOIN 
          Blogs b ON u.user_id = b.author_id
        LEFT JOIN 
          Flags f ON b.blog_id = f.blog_id
        WHERE 
          u.status = 'banned'
        GROUP BY 
          u.user_id, u.email, u.role, u.status, p.name
        HAVING 
          COUNT(DISTINCT b.blog_id) >= 5
        ORDER BY 
          flagged_posts_count DESC
      `;

      const bannedUsers = await AppDataSource.query(query);

      res.status(200).json({
        success: true,
        data: bannedUsers,
        count: bannedUsers.length,
        message: "Banned users retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting banned users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve banned users",
        error: error.message,
      });
    }
  }

  /**
   * Unban a user
   */
  static async unbanUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID provided",
        });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if user exists
      const user = await userRepository.findOne({
        where: { user_id: parseInt(userId) }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is actually banned
      if (user.status !== 'banned') {
        return res.status(400).json({
          success: false,
          message: "User is not currently banned",
        });
      }

      // Update user status to active
      user.status = 'active';
      await userRepository.save(user);

      res.status(200).json({
        success: true,
        data: {
          user_id: user.user_id,
          email: user.email,
          status: user.status,
        },
        message: `User ${userId} has been unbanned successfully`,
      });
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unban user",
        error: error.message,
      });
    }
  }
}

module.exports = FlagController;
