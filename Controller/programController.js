/**
 * Program Controller using TypeORM
 * Handles operations related to programs in the system
 */
const AppDataSource = require("../src/data-source");
const Program = require("../src/entities/Program");
const Category = require("../src/entities/Category");
const User = require("../src/entities/User");
const Content = require("../src/entities/Content");
const Enroll = require("../src/entities/Enroll");

// Get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const programRepository = AppDataSource.getRepository(Program);
    const programs = await programRepository.find();

    // Format the response with additional data from related entities
    const formattedPrograms = await Promise.all(
      programs.map(async (program) => {
        // Get creator and category information since relations are commented out
        const userRepository = AppDataSource.getRepository(User);
        const categoryRepository = AppDataSource.getRepository(Category);

        const creator = await userRepository.findOne({
          where: { user_id: program.create_by },
        });

        const category = program.category_id
          ? await categoryRepository.findOne({
              where: { category_id: program.category_id },
            })
          : null;

        return {
          programId: program.program_id,
          title: program.title,
          description: program.description,
          status: program.status,
          ageGroup: program.age_group,
          createdAt: program.create_at,
          creator: creator
            ? {
                userId: creator.user_id,
                email: creator.email,
                role: creator.role,
              }
            : null,
          category: category
            ? {
                categoryId: category.category_id,
                description: category.description,
              }
            : null,
        };
      })
    );

    res.json(formattedPrograms);
  } catch (error) {
    console.error("Get all programs error:", error);
    res.status(500).json({ error: "Error retrieving programs" });
  }
};

// Get a single program by ID
exports.getProgramById = async (req, res) => {
  try {
    const { programId } = req.params;

    const programRepository = AppDataSource.getRepository(Program);
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Get creator and category information
    const userRepository = AppDataSource.getRepository(User);
    const categoryRepository = AppDataSource.getRepository(Category);

    const creator = await userRepository.findOne({
      where: { user_id: program.create_by },
    });

    const category = program.category_id
      ? await categoryRepository.findOne({
          where: { category_id: program.category_id },
        })
      : null;

    // Get content items for this program
    const contentRepository = AppDataSource.getRepository(Content);
    const contentItems = await contentRepository.find({
      where: { program_id: program.program_id },
      order: { order: "ASC" },
    });

    // Format content items
    const formattedContentItems = contentItems.map((content) => ({
      contentId: content.content_id,
      type: content.type,
      order: content.order,
    }));

    // Format program response
    const formattedProgram = {
      programId: program.program_id,
      title: program.title,
      description: program.description,
      status: program.status,
      ageGroup: program.age_group,
      createdAt: program.create_at,
      creator: creator
        ? {
            userId: creator.user_id,
            email: creator.email,
            role: creator.role,
          }
        : null,
      category: category
        ? {
            categoryId: category.category_id,
            description: category.description,
          }
        : null,
      contentItems: formattedContentItems,
    };

    res.json(formattedProgram);
  } catch (error) {
    console.error("Get program by ID error:", error);
    res.status(500).json({ error: "Error retrieving program" });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const { title, description, status, ageGroup, categoryId } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!title || !status) {
      return res.status(400).json({
        error: "Title and status are required",
      });
    }

    // Verify user has permissions
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error: "Only administrators and consultants can create programs",
      });
    }

    // Verify category exists if provided
    if (categoryId) {
      const categoryRepository = AppDataSource.getRepository(Category);
      const category = await categoryRepository.findOne({
        where: { category_id: parseInt(categoryId) },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const programRepository = AppDataSource.getRepository(Program);

    // Create new program
    const newProgram = programRepository.create({
      title,
      description,
      create_by: userId,
      status,
      age_group: ageGroup,
      create_at: new Date(),
      category_id: categoryId ? parseInt(categoryId) : null,
    });

    const savedProgram = await programRepository.save(newProgram);

    // Return success response
    res.status(201).json({
      message: "Program created successfully",
      program: {
        programId: savedProgram.program_id,
        title: savedProgram.title,
        description: savedProgram.description,
        status: savedProgram.status,
        ageGroup: savedProgram.age_group,
        createdAt: savedProgram.create_at,
        createdBy: userId,
        categoryId: savedProgram.category_id,
      },
    });
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json({
      error: "Failed to create program. Please try again later.",
      details: error.message,
    });
  }
};

// Update an existing program
exports.updateProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const { title, description, status, ageGroup, categoryId } = req.body;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    // Validate that some field is provided to update
    if (
      !title &&
      !description &&
      !status &&
      !ageGroup &&
      categoryId === undefined
    ) {
      return res.status(400).json({
        error: "At least one field to update is required",
      });
    }

    const programRepository = AppDataSource.getRepository(Program);

    // Find program by ID
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Authorization check: User must be program creator or admin
    if (program.create_by !== userId && userRole !== "Admin") {
      return res.status(403).json({
        error: "You do not have permission to update this program",
      });
    }

    // Verify category exists if provided
    if (categoryId !== undefined) {
      if (categoryId !== null) {
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOne({
          where: { category_id: parseInt(categoryId) },
        });

        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
        program.category_id = parseInt(categoryId);
      } else {
        program.category_id = null;
      }
    }

    // Update fields if provided
    if (title) program.title = title;
    if (description !== undefined) program.description = description;
    if (status) program.status = status;
    if (ageGroup !== undefined) program.age_group = ageGroup;

    const updatedProgram = await programRepository.save(program);

    // Return success response
    res.json({
      message: "Program updated successfully",
      program: {
        programId: updatedProgram.program_id,
        title: updatedProgram.title,
        description: updatedProgram.description,
        status: updatedProgram.status,
        ageGroup: updatedProgram.age_group,
        createdAt: updatedProgram.create_at,
        createdBy: updatedProgram.create_by,
        categoryId: updatedProgram.category_id,
      },
    });
  } catch (error) {
    console.error("Update program error:", error);
    res.status(500).json({
      error: "Failed to update program. Please try again later.",
      details: error.message,
    });
  }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role; // From JWT token

    const programRepository = AppDataSource.getRepository(Program);

    // Find program by ID
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Authorization check: User must be program creator or admin
    if (program.create_by !== userId && userRole !== "Admin") {
      return res.status(403).json({
        error: "You do not have permission to delete this program",
      });
    }

    // Check if program has related content, enrollments or surveys - delete them first
    // Since relations are commented out in entity, we need to do this manually
    const contentRepository = AppDataSource.getRepository(Content);
    const enrollRepository = AppDataSource.getRepository(Enroll);

    // Delete related content
    await contentRepository.delete({ program_id: parseInt(programId) });

    // Delete related enrollments
    await enrollRepository.delete({ program_id: parseInt(programId) });

    // Now delete the program
    await programRepository.remove(program);

    // Return success response
    res.json({
      message: "Program and related items deleted successfully",
    });
  } catch (error) {
    console.error("Delete program error:", error);
    res.status(500).json({
      error: "Failed to delete program. Please try again later.",
      details: error.message,
    });
  }
};

// Get programs by category
exports.getProgramsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const programRepository = AppDataSource.getRepository(Program);
    const programs = await programRepository.find({
      where: { category_id: parseInt(categoryId) },
    });

    // Format the response
    const formattedPrograms = await Promise.all(
      programs.map(async (program) => {
        const userRepository = AppDataSource.getRepository(User);

        const creator = await userRepository.findOne({
          where: { user_id: program.create_by },
        });

        return {
          programId: program.program_id,
          title: program.title,
          description: program.description,
          status: program.status,
          ageGroup: program.age_group,
          createdAt: program.create_at,
          creator: creator
            ? {
                userId: creator.user_id,
                email: creator.email,
                role: creator.role,
              }
            : null,
        };
      })
    );

    res.json(formattedPrograms);
  } catch (error) {
    console.error("Get programs by category error:", error);
    res.status(500).json({ error: "Error retrieving programs by category" });
  }
};

// Get programs created by user
exports.getProgramsByCreator = async (req, res) => {
  try {
    const { userId } = req.params;

    const programRepository = AppDataSource.getRepository(Program);
    const programs = await programRepository.find({
      where: { create_by: parseInt(userId) },
    });

    // Format the response
    const formattedPrograms = await Promise.all(
      programs.map(async (program) => {
        const categoryRepository = AppDataSource.getRepository(Category);

        const category = program.category_id
          ? await categoryRepository.findOne({
              where: { category_id: program.category_id },
            })
          : null;

        return {
          programId: program.program_id,
          title: program.title,
          description: program.description,
          status: program.status,
          ageGroup: program.age_group,
          createdAt: program.create_at,
          category: category
            ? {
                categoryId: category.category_id,
                description: category.description,
              }
            : null,
        };
      })
    );

    res.json(formattedPrograms);
  } catch (error) {
    console.error("Get programs by creator error:", error);
    res.status(500).json({ error: "Error retrieving programs by creator" });
  }
};

// Enroll a user in a program
exports.enrollInProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.userId; // From JWT token

    const programRepository = AppDataSource.getRepository(Program);
    const enrollRepository = AppDataSource.getRepository(Enroll);

    // Verify program exists
    const program = await programRepository.findOne({
      where: { program_id: parseInt(programId) },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Check if program is active
    if (program.status !== "active") {
      return res
        .status(400)
        .json({ error: "Cannot enroll in an inactive program" });
    }

    // Check if user is already enrolled
    const existingEnrollment = await enrollRepository.findOne({
      where: {
        program_id: parseInt(programId),
        user_id: userId,
      },
    });

    if (existingEnrollment) {
      return res
        .status(409)
        .json({ error: "User is already enrolled in this program" });
    }

    // Create new enrollment
    const newEnrollment = enrollRepository.create({
      program_id: parseInt(programId),
      user_id: userId,
      start_at: new Date(),
      complete_at: null,
      progress: 0,
    });

    await enrollRepository.save(newEnrollment);

    // Return success response
    res.status(201).json({
      message: "Successfully enrolled in program",
      enrollment: {
        programId: parseInt(programId),
        userId: userId,
        startAt: newEnrollment.start_at,
        progress: newEnrollment.progress,
      },
    });
  } catch (error) {
    console.error("Enroll in program error:", error);
    res.status(500).json({
      error: "Failed to enroll in program. Please try again later.",
      details: error.message,
    });
  }
};

// Update enrollment progress
exports.updateEnrollmentProgress = async (req, res) => {
  try {
    const { programId } = req.params;
    const { progress, complete } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate input
    if (progress === undefined && complete === undefined) {
      return res
        .status(400)
        .json({ error: "Progress update or completion status is required" });
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res
        .status(400)
        .json({ error: "Progress must be between 0 and 100" });
    }

    const enrollRepository = AppDataSource.getRepository(Enroll);

    // Find enrollment
    const enrollment = await enrollRepository.findOne({
      where: {
        program_id: parseInt(programId),
        user_id: userId,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Update progress
    if (progress !== undefined) {
      enrollment.progress = progress;
    }

    // Mark as complete if requested
    if (complete === true) {
      enrollment.complete_at = new Date();
      enrollment.progress = 100;
    }

    await enrollRepository.save(enrollment);

    // Return success response
    res.json({
      message: "Enrollment progress updated",
      enrollment: {
        programId: parseInt(programId),
        userId: userId,
        startAt: enrollment.start_at,
        completeAt: enrollment.complete_at,
        progress: enrollment.progress,
      },
    });
  } catch (error) {
    console.error("Update enrollment progress error:", error);
    res.status(500).json({
      error: "Failed to update progress. Please try again later.",
      details: error.message,
    });
  }
};

// Get enrolled programs for user
exports.getEnrolledPrograms = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token

    const enrollRepository = AppDataSource.getRepository(Enroll);

    // Find all enrollments for this user
    const enrollments = await enrollRepository.find({
      where: { user_id: userId },
    });

    // Get program details for each enrollment
    const programRepository = AppDataSource.getRepository(Program);

    const enrolledPrograms = await Promise.all(
      enrollments.map(async (enrollment) => {
        const program = await programRepository.findOne({
          where: { program_id: enrollment.program_id },
        });

        if (!program) return null; // Skip if program doesn't exist anymore

        // Get category information
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = program.category_id
          ? await categoryRepository.findOne({
              where: { category_id: program.category_id },
            })
          : null;

        return {
          programId: program.program_id,
          title: program.title,
          description: program.description,
          status: program.status,
          ageGroup: program.age_group,
          category: category ? category.description : null,
          enrollment: {
            startAt: enrollment.start_at,
            completeAt: enrollment.complete_at,
            progress: enrollment.progress,
          },
        };
      })
    );

    // Filter out null values (programs that don't exist anymore)
    const validEnrolledPrograms = enrolledPrograms.filter(
      (program) => program !== null
    );

    res.json(validEnrolledPrograms);
  } catch (error) {
    console.error("Get enrolled programs error:", error);
    res.status(500).json({ error: "Error retrieving enrolled programs" });
  }
};

// Search programs
exports.searchPrograms = async (req, res) => {
  try {
    const { query, category, ageGroup, status } = req.query;

    const programRepository = AppDataSource.getRepository(Program);

    // Build dynamic where conditions
    let whereConditions = {};

    // Base search query on title or description
    if (query) {
      whereConditions = {
        title: Like(`%${query}%`),
        description: Like(`%${query}%`),
      };
    }

    // Add filters if provided
    if (category) {
      whereConditions.category_id = parseInt(category);
    }

    if (ageGroup) {
      whereConditions.age_group = ageGroup;
    }

    if (status) {
      whereConditions.status = status;
    }

    // Execute search
    const programs = await programRepository.find({
      where: whereConditions,
    });

    // Format the response
    const formattedPrograms = await Promise.all(
      programs.map(async (program) => {
        const categoryRepository = AppDataSource.getRepository(Category);
        const userRepository = AppDataSource.getRepository(User);

        const category = program.category_id
          ? await categoryRepository.findOne({
              where: { category_id: program.category_id },
            })
          : null;

        const creator = await userRepository.findOne({
          where: { user_id: program.create_by },
        });

        return {
          programId: program.program_id,
          title: program.title,
          description: program.description,
          status: program.status,
          ageGroup: program.age_group,
          createdAt: program.create_at,
          category: category ? category.description : null,
          creator: creator ? creator.email : null,
        };
      })
    );

    res.json({
      results: formattedPrograms,
      count: formattedPrograms.length,
    });
  } catch (error) {
    console.error("Search programs error:", error);
    res.status(500).json({ error: "Error searching programs" });
  }
};
