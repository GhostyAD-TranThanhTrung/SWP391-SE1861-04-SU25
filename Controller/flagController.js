/**
 * Flag Controller using TypeORM
 * Handles operations related to flagged content in the system
 */
const AppDataSource = require("../src/data-source");
const Flag = require("../src/entities/Flag");
const Blog = require("../src/entities/Blog");
const User = require("../src/entities/User");

// Get all flags
exports.getAllFlags = async (req, res) => {
  try {
    // Admin access check
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can view all flags",
      });
    }

    const flagRepository = AppDataSource.getRepository(Flag);
    const flags = await flagRepository.find();

    // Format the response
    const formattedFlags = await Promise.all(
      flags.map(async (flag) => {
        // Get blog and user information since relations are commented out
        const blogRepository = AppDataSource.getRepository(Blog);
        const userRepository = AppDataSource.getRepository(User);

        const blog = await blogRepository.findOne({
          where: { blog_id: flag.blog_id },
        });

        const user = await userRepository.findOne({
          where: { user_id: flag.flagged_by },
        });

        return {
          flagId: flag.flag_id,
          blogId: flag.blog_id,
          blogTitle: blog ? blog.title : "Blog not found",
          flaggedBy: flag.flagged_by,
          flaggedByEmail: user ? user.email : "User not found",
          reason: flag.reason,
          createdAt: flag.created_at,
        };
      })
    );

    res.json(formattedFlags);
  } catch (error) {
    console.error("Get all flags error:", error);
    res.status(500).json({ error: "Error retrieving flags" });
  }
};

// Get all flags for a specific blog
exports.getFlagsForBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Admin access check
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can view flags for blogs",
      });
    }

    const flagRepository = AppDataSource.getRepository(Flag);
    const flags = await flagRepository.find({
      where: { blog_id: parseInt(blogId) },
    });

    // Format the response
    const formattedFlags = await Promise.all(
      flags.map(async (flag) => {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { user_id: flag.flagged_by },
        });

        return {
          flagId: flag.flag_id,
          flaggedBy: flag.flagged_by,
          flaggedByEmail: user ? user.email : "User not found",
          reason: flag.reason,
          createdAt: flag.created_at,
        };
      })
    );

    res.json(formattedFlags);
  } catch (error) {
    console.error("Get flags for blog error:", error);
    res.status(500).json({ error: "Error retrieving flags for blog" });
  }
};

// Flag a blog
exports.flagBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!reason) {
      return res.status(400).json({
        error: "Reason for flagging is required",
      });
    }

    const blogRepository = AppDataSource.getRepository(Blog);
    const flagRepository = AppDataSource.getRepository(Flag);

    // Verify blog exists
    const blog = await blogRepository.findOne({
      where: { blog_id: parseInt(blogId) },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check if user already flagged this blog
    const existingFlag = await flagRepository.findOne({
      where: {
        blog_id: parseInt(blogId),
        flagged_by: userId,
      },
    });

    if (existingFlag) {
      return res
        .status(409)
        .json({ error: "You have already flagged this blog" });
    }

    // Create new flag
    const newFlag = flagRepository.create({
      blog_id: parseInt(blogId),
      flagged_by: userId,
      reason,
      created_at: new Date(),
    });

    const savedFlag = await flagRepository.save(newFlag);

    // Return success response
    res.status(201).json({
      message: "Blog flagged successfully",
      flag: {
        flagId: savedFlag.flag_id,
        blogId: savedFlag.blog_id,
        flaggedBy: savedFlag.flagged_by,
        reason: savedFlag.reason,
        createdAt: savedFlag.created_at,
      },
    });
  } catch (error) {
    console.error("Flag blog error:", error);
    res.status(500).json({
      error: "Failed to flag blog. Please try again later.",
      details: error.message,
    });
  }
};

// Remove a flag (admin only)
exports.removeFlag = async (req, res) => {
  try {
    const { flagId } = req.params;

    // Admin access check
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can remove flags",
      });
    }

    const flagRepository = AppDataSource.getRepository(Flag);

    // Find flag by ID
    const flag = await flagRepository.findOne({
      where: { flag_id: parseInt(flagId) },
    });

    if (!flag) {
      return res.status(404).json({ error: "Flag not found" });
    }

    // Delete the flag
    await flagRepository.remove(flag);

    // Return success response
    res.json({
      message: "Flag removed successfully",
    });
  } catch (error) {
    console.error("Remove flag error:", error);
    res.status(500).json({
      error: "Failed to remove flag. Please try again later.",
      details: error.message,
    });
  }
};

// Get flags by flagged user
exports.getFlagsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Admin access check
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can view flags by user",
      });
    }

    const flagRepository = AppDataSource.getRepository(Flag);
    const flags = await flagRepository.find({
      where: { flagged_by: parseInt(userId) },
    });

    // Format the response
    const formattedFlags = await Promise.all(
      flags.map(async (flag) => {
        const blogRepository = AppDataSource.getRepository(Blog);
        const blog = await blogRepository.findOne({
          where: { blog_id: flag.blog_id },
        });

        return {
          flagId: flag.flag_id,
          blogId: flag.blog_id,
          blogTitle: blog ? blog.title : "Blog not found",
          reason: flag.reason,
          createdAt: flag.created_at,
        };
      })
    );

    res.json(formattedFlags);
  } catch (error) {
    console.error("Get flags by user error:", error);
    res.status(500).json({ error: "Error retrieving flags for user" });
  }
};

// Get flag statistics (admin only)
exports.getFlagStatistics = async (req, res) => {
  try {
    // Admin access check
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can view flag statistics",
      });
    }

    const flagRepository = AppDataSource.getRepository(Flag);

    // Get total number of flags
    const totalFlags = await flagRepository.count();

    // Get most flagged blogs
    const mostFlaggedBlogs = await flagRepository
      .createQueryBuilder("flag")
      .select("flag.blog_id", "blogId")
      .addSelect("COUNT(flag.flag_id)", "flagCount")
      .groupBy("flag.blog_id")
      .orderBy("flagCount", "DESC")
      .limit(5)
      .getRawMany();

    // Get detailed information for most flagged blogs
    const blogRepository = AppDataSource.getRepository(Blog);
    const detailedMostFlaggedBlogs = await Promise.all(
      mostFlaggedBlogs.map(async (item) => {
        const blog = await blogRepository.findOne({
          where: { blog_id: item.blogId },
        });

        return {
          blogId: parseInt(item.blogId),
          blogTitle: blog ? blog.title : "Blog not found",
          flagCount: parseInt(item.flagCount),
        };
      })
    );

    // Get recent flags
    const recentFlags = await flagRepository.find({
      order: { created_at: "DESC" },
      take: 10,
    });

    // Format recent flags
    const formattedRecentFlags = await Promise.all(
      recentFlags.map(async (flag) => {
        const blogRepository = AppDataSource.getRepository(Blog);
        const userRepository = AppDataSource.getRepository(User);

        const blog = await blogRepository.findOne({
          where: { blog_id: flag.blog_id },
        });

        const user = await userRepository.findOne({
          where: { user_id: flag.flagged_by },
        });

        return {
          flagId: flag.flag_id,
          blogId: flag.blog_id,
          blogTitle: blog ? blog.title : "Blog not found",
          flaggedBy: user ? user.email : "Unknown user",
          reason: flag.reason,
          createdAt: flag.created_at,
        };
      })
    );

    res.json({
      totalFlags,
      mostFlaggedBlogs: detailedMostFlaggedBlogs,
      recentFlags: formattedRecentFlags,
    });
  } catch (error) {
    console.error("Get flag statistics error:", error);
    res.status(500).json({ error: "Error retrieving flag statistics" });
  }
};
