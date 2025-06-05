/**
 * User Controller using TypeORM
 * Handles user operations with TypeORM
 */
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");
const { Like } = require("typeorm");

// GET all users with filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, limit = 10, page = 1 } = req.query;

    const userRepository = AppDataSource.getRepository(User);

    // Build query conditions
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    // Build query builder for complex filtering
    let queryBuilder = userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile");

    // Apply filters
    if (role) {
      queryBuilder = queryBuilder.andWhere("user.role = :role", { role });
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere("user.status = :status", { status });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        "(user.email LIKE :search OR profile.name LIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Add pagination and ordering
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder
      .orderBy("user.date_create", "DESC")
      .skip(offset)
      .take(parseInt(limit));

    // Get results and total count
    const [users, total] = await queryBuilder.getManyAndCount();

    // Format response data
    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      date_create: user.date_create,
      name: user.profile?.name || null,
      date_of_birth: user.profile?.date_of_birth || null,
      jobs: user.profile?.jobs || null,
    }));

    res.json({
      data: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { user_id: parseInt(id) },
      relations: ["profile"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Format response
    const response = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      date_create: user.date_create,
      name: user.profile?.name || null,
      certification: user.profile?.certification || null,
      work_hours_json: user.profile?.work_hours_json || null,
      bio_json: user.profile?.bio_json || null,
      date_of_birth: user.profile?.date_of_birth || null,
      jobs: user.profile?.jobs || null,
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;

    if (!email && !role && !status) {
      return res
        .status(400)
        .json({ error: "At least one field is required for update" });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Check if user exists
    const user = await userRepository.findOne({
      where: { user_id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await userRepository.save(user);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);

    const result = await userRepository.delete(parseInt(id));

    if (result.affected === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { status = "active" } = req.query;

    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find({
      where: { role, status },
      relations: ["profile"],
      order: { date_create: "DESC" },
    });

    // Format response
    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      date_create: user.date_create,
      name: user.profile?.name || null,
      certification: user.profile?.certification || null,
      bio_json: user.profile?.bio_json || null,
      jobs: user.profile?.jobs || null,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Error fetching users by role:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET current user's profile using token
exports.getCurrentUserProfile = async (req, res) => {
  try {
    // User ID is extracted from JWT token by verifyToken middleware
    const userId = req.user.userId;

    console.log(`🔍 Getting profile for authenticated user ID: ${userId}`);
    console.log(`📧 User email from token: ${req.user.email}`);

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { user_id: userId },
      relations: ["profile"],
    });

    if (!user) {
      console.log(`❌ User not found for ID: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Profile retrieved successfully for user: ${user.email}`);
    console.log(
      `👤 Profile name: ${user.profile?.name || "No profile created"}`
    );

    // Structure the response
    const response = {
      message: "Profile retrieved successfully",
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        status: user.status,
        date_create: user.date_create,
      },
      profile: user.profile
        ? {
            name: user.profile.name,
            certification: user.profile.certification,
            works_hours_json: user.profile.works_hours_json,
            bio_json: user.profile.bio_json,
            date_of_birth: user.profile.date_of_birth,
            job: user.profile.job,
          }
        : null,
      hasProfile: !!user.profile,
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching current user profile:", err);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
};
