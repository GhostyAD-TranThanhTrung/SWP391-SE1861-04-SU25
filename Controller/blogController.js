/**
 * Blog Controller using TypeORM
 * Handles blog operations with TypeORM
 */
const AppDataSource = require("../src/data-source");
const Blog = require("../src/entities/Blog");
const User = require("../src/entities/User");

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const blogs = await blogRepository.find({
      relations: ["author"], // Optional: Include author information
    });

    // Format the response to include author information but hide sensitive data
    const formattedBlogs = blogs.map((blog) => ({
      blogId: blog.blog_id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.created_at,
      status: blog.status,
      author: blog.author
        ? {
            userId: blog.author.user_id,
            email: blog.author.email,
            role: blog.author.role,
          }
        : null,
    }));

    res.json(formattedBlogs);
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ error: "Error retrieving blogs" });
  }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blogRepository = AppDataSource.getRepository(Blog);
    const blog = await blogRepository.findOne({
      where: { blog_id: blogId },
      relations: ["author"],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Format response
    const formattedBlog = {
      blogId: blog.blog_id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.created_at,
      status: blog.status,
      author: blog.author
        ? {
            userId: blog.author.user_id,
            email: blog.author.email,
            role: blog.author.role,
          }
        : null,
    };

    res.json(formattedBlog);
  } catch (error) {
    console.error("Get blog by ID error:", error);
    res.status(500).json({ error: "Error retrieving blog" });
  }
};

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, status = "draft" } = req.body;
    const authorId = req.user.userId; // Get from JWT token via middleware

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const blogRepository = AppDataSource.getRepository(Blog);
    const userRepository = AppDataSource.getRepository(User);

    // Verify that the author exists
    const author = await userRepository.findOne({
      where: { user_id: authorId },
    });

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    // Create new blog
    const newBlog = blogRepository.create({
      author_id: authorId,
      title: title,
      content: content,
      created_at: new Date(),
      status: status,
    });

    const savedBlog = await blogRepository.save(newBlog);

    // Return success response
    res.status(201).json({
      message: "Blog created successfully",
      blog: {
        blogId: savedBlog.blog_id,
        title: savedBlog.title,
        content: savedBlog.content,
        createdAt: savedBlog.created_at,
        status: savedBlog.status,
        authorId: savedBlog.author_id,
      },
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res
      .status(500)
      .json({ error: "Failed to create blog. Please try again later." });
  }
};

// Update an existing blog
exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content, status } = req.body;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    // Validate request
    if (!title && !content && !status) {
      return res
        .status(400)
        .json({ error: "At least one field to update is required" });
    }

    const blogRepository = AppDataSource.getRepository(Blog);

    // Find the blog to update
    const blog = await blogRepository.findOne({
      where: { blog_id: blogId },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check if user is authorized (either the author or an admin)
    if (blog.author_id !== userId && userRole !== "Admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update this blog" });
    }

    // Update blog fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (status) blog.status = status;

    // Save changes
    const updatedBlog = await blogRepository.save(blog);

    res.json({
      message: "Blog updated successfully",
      blog: {
        blogId: updatedBlog.blog_id,
        title: updatedBlog.title,
        content: updatedBlog.content,
        status: updatedBlog.status,
        authorId: updatedBlog.author_id,
        createdAt: updatedBlog.created_at,
      },
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res
      .status(500)
      .json({ error: "Failed to update blog. Please try again later." });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    const blogRepository = AppDataSource.getRepository(Blog);

    // Find the blog to delete
    const blog = await blogRepository.findOne({
      where: { blog_id: blogId },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check if user is authorized (either the author or an admin)
    if (blog.author_id !== userId && userRole !== "Admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this blog" });
    }

    // Delete the blog
    await blogRepository.remove(blog);

    res.json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete blog. Please try again later." });
  }
};

// Get blogs by author ID
exports.getBlogsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;

    const blogRepository = AppDataSource.getRepository(Blog);
    const blogs = await blogRepository.find({
      where: { author_id: authorId },
    });

    if (blogs.length === 0) {
      return res.json({ message: "No blogs found for this author", blogs: [] });
    }

    // Format the response
    const formattedBlogs = blogs.map((blog) => ({
      blogId: blog.blog_id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.created_at,
      status: blog.status,
    }));

    res.json(formattedBlogs);
  } catch (error) {
    console.error("Get blogs by author error:", error);
    res.status(500).json({ error: "Error retrieving blogs" });
  }
};

// Search blogs by title or content
exports.searchBlogs = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const blogRepository = AppDataSource.getRepository(Blog);

    // Search blogs by title or content
    const blogs = await blogRepository
      .createQueryBuilder("blog")
      .leftJoinAndSelect("blog.author", "author")
      .where("blog.title LIKE :query OR blog.content LIKE :query", {
        query: `%${query}%`,
      })
      .andWhere("blog.status = :status", { status: "published" })
      .getMany();

    // Format the response
    const formattedBlogs = blogs.map((blog) => ({
      blogId: blog.blog_id,
      title: blog.title,
      content:
        blog.content.substring(0, 200) +
        (blog.content.length > 200 ? "..." : ""), // Preview only
      createdAt: blog.created_at,
      author: blog.author
        ? {
            userId: blog.author.user_id,
            email: blog.author.email,
          }
        : null,
    }));

    res.json({
      results: formattedBlogs,
      count: formattedBlogs.length,
    });
  } catch (error) {
    console.error("Search blogs error:", error);
    res.status(500).json({ error: "Error searching blogs" });
  }
};
