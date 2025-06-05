/**
 * Category Controller using TypeORM
 * Handles operations related to categories in the system
 */
const AppDataSource = require("../src/data-source");
const Category = require("../src/entities/Category");

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories = await categoryRepository.find();

    // Format the response
    const formattedCategories = categories.map((category) => ({
      categoryId: category.category_id,
      description: category.description,
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error("Get all categories error:", error);
    res.status(500).json({ error: "Error retrieving categories" });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.findOne({
      where: { category_id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Format response
    const formattedCategory = {
      categoryId: category.category_id,
      description: category.description,
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(500).json({ error: "Error retrieving category" });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { description } = req.body;

    // Validate required fields
    if (!description) {
      return res.status(400).json({
        error: "Description is required",
      });
    }

    // Verify user has admin permissions (from JWT token)
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can create categories",
      });
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    // Check if a similar category already exists
    const existingCategory = await categoryRepository.findOne({
      where: { description },
    });

    if (existingCategory) {
      return res.status(409).json({
        error: "A category with this description already exists",
      });
    }

    // Create new category
    const newCategory = categoryRepository.create({
      description,
    });

    const savedCategory = await categoryRepository.save(newCategory);

    // Return success response
    res.status(201).json({
      message: "Category created successfully",
      category: {
        categoryId: savedCategory.category_id,
        description: savedCategory.description,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      error: "Failed to create category. Please try again later.",
      details: error.message,
    });
  }
};

// Update an existing category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { description } = req.body;

    // Validate request
    if (!description) {
      return res.status(400).json({
        error: "Description is required",
      });
    }

    // Verify user has admin permissions
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can update categories",
      });
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    // Find category by ID
    const category = await categoryRepository.findOne({
      where: { category_id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if another category with the same description exists
    const duplicateCategory = await categoryRepository.findOne({
      where: {
        description,
        category_id: categoryId, // Exclude the current category from check
      },
    });

    if (
      duplicateCategory &&
      duplicateCategory.category_id !== parseInt(categoryId)
    ) {
      return res.status(409).json({
        error: "Another category with this description already exists",
      });
    }

    // Update fields
    category.description = description;

    const updatedCategory = await categoryRepository.save(category);

    // Return success response
    res.json({
      message: "Category updated successfully",
      category: {
        categoryId: updatedCategory.category_id,
        description: updatedCategory.description,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      error: "Failed to update category. Please try again later.",
      details: error.message,
    });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Verify user has admin permissions
    const userRole = req.user.role;
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can delete categories",
      });
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    // Find category by ID
    const category = await categoryRepository.findOne({
      where: { category_id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if category has associated programs
    // (If relations are set up in the future)
    /* 
    const programRepository = AppDataSource.getRepository(Program);
    const relatedPrograms = await programRepository.count({
      where: { category_id: parseInt(categoryId) }
    });

    if (relatedPrograms > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category that has associated programs" 
      });
    }
    */

    // Delete the category
    await categoryRepository.remove(category);

    // Return success response
    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      error: "Failed to delete category. Please try again later.",
      details: error.message,
    });
  }
};

// Search categories by description
exports.searchCategories = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    // Search categories by description
    const categories = await categoryRepository
      .createQueryBuilder("category")
      .where("category.description LIKE :query", { query: `%${query}%` })
      .getMany();

    // Format the response
    const formattedCategories = categories.map((category) => ({
      categoryId: category.category_id,
      description: category.description,
    }));

    res.json({
      results: formattedCategories,
      count: formattedCategories.length,
    });
  } catch (error) {
    console.error("Search categories error:", error);
    res.status(500).json({ error: "Error searching categories" });
  }
};

// Get categories with their program counts
exports.getCategoriesWithProgramCounts = async (req, res) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);

    /* 
    // This would work if relations are set up
    const categories = await categoryRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.programs", "program")
      .select([
        "category.category_id AS categoryId",
        "category.description AS description",
        "COUNT(program.program_id) AS programCount"
      ])
      .groupBy("category.category_id")
      .addGroupBy("category.description")
      .getRawMany();
    */

    // Since relations are commented out, we'll use a simpler approach
    const categories = await categoryRepository.find();

    // Format the response
    const formattedCategories = categories.map((category) => ({
      categoryId: category.category_id,
      description: category.description,
      programCount: 0, // This would be dynamic if relations were active
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error("Get categories with program counts error:", error);
    res
      .status(500)
      .json({ error: "Error retrieving categories with program counts" });
  }
};
