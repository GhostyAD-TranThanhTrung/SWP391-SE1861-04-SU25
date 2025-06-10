/**
 * Category Controller using TypeORM
 * CRUD operations for Category table
 */
const AppDataSource = require("../src/data-source");
const Category = require("../src/entities/Category");

class CategoryController {
  /**
   * Get all categories
   */
  static async getAllCategories(req, res) {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const categories = await categoryRepository.find();

      res.status(200).json({
        success: true,
        data: categories,
        message: "Categories retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve categories",
        error: error.message,
      });
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const categoryRepository = AppDataSource.getRepository(Category);
      const category = await categoryRepository.findOne({
        where: { category_id: parseInt(id) },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        data: category,
        message: "Category retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting category:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve category",
        error: error.message,
      });
    }
  }

  /**
   * Get category with related programs
   */
  static async getCategoryWithPrograms(req, res) {
    try {
      const { id } = req.params;
      const categoryRepository = AppDataSource.getRepository(Category);

      const category = await categoryRepository.findOne({
        where: { category_id: parseInt(id) },
        relations: {
          programs: true,
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        data: category,
        message: "Category with programs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting category with programs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve category with programs",
        error: error.message,
      });
    }
  }

  /**
   * Create new category
   */
  static async createCategory(req, res) {
    try {
      const { description } = req.body;

      // Validate required fields
      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      }

      const categoryRepository = AppDataSource.getRepository(Category);

      // Create new category
      const newCategory = categoryRepository.create({
        description,
      });

      const savedCategory = await categoryRepository.save(newCategory);

      res.status(201).json({
        success: true,
        data: savedCategory,
        message: "Category created successfully",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error.message,
      });
    }
  }

  /**
   * Update category
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      }

      const categoryRepository = AppDataSource.getRepository(Category);

      // Check if category exists
      const category = await categoryRepository.findOne({
        where: { category_id: parseInt(id) },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Update category fields
      category.description = description;

      const updatedCategory = await categoryRepository.save(category);

      res.status(200).json({
        success: true,
        data: updatedCategory,
        message: "Category updated successfully",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update category",
        error: error.message,
      });
    }
  }

  /**
   * Delete category by ID
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID provided",
        });
      }

      const categoryRepository = AppDataSource.getRepository(Category);

      // Check if category exists before deleting
      const category = await categoryRepository.findOne({
        where: { category_id: parseInt(id) },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check if there are related programs before deleting
      const categoryWithPrograms = await categoryRepository.findOne({
        where: { category_id: parseInt(id) },
        relations: {
          programs: true,
        },
      });

      if (categoryWithPrograms && categoryWithPrograms.programs.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with associated programs",
          programCount: categoryWithPrograms.programs.length,
        });
      }

      // Delete the category
      await categoryRepository.remove(category);

      res.status(200).json({
        success: true,
        message: `Category with ID ${id} deleted successfully`,
        deletedCategory: {
          category_id: category.category_id,
          description: category.description,
        },
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete category",
        error: error.message,
      });
    }
  }

  /**
   * Get all categories with their associated programs
   */
  static async getAllCategoriesWithPrograms(req, res) {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);

      const categories = await categoryRepository.find({
        relations: {
          programs: true,
        },
      });

      res.status(200).json({
        success: true,
        data: categories,
        message: "All categories with programs retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting all categories with programs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve categories with programs",
        error: error.message,
      });
    }
  }

  /**
   * Get categories by program count (most popular)
   */
  static async getCategoriesByProgramCount(req, res) {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);

      const categories = await categoryRepository
        .createQueryBuilder("category")
        .leftJoinAndSelect("category.programs", "program")
        .select("category.category_id", "id")
        .addSelect("category.description", "description")
        .addSelect("COUNT(program.program_id)", "programCount")
        .groupBy("category.category_id")
        .addGroupBy("category.description")
        .orderBy("programCount", "DESC")
        .getRawMany();

      res.status(200).json({
        success: true,
        data: categories,
        message: "Categories by program count retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting categories by program count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve categories by program count",
        error: error.message,
      });
    }
  }
}

module.exports = CategoryController;
