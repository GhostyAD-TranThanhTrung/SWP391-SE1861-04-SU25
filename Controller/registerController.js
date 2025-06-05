/**
 * Register Controller using TypeORM
 * Handles user registration operations with TypeORM
 */
const AppDataSource = require("../src/data-source");
const User = require("../src/entities/User");

exports.getAllUsers = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();

    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Error querying database" });
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { email, password, role = "Member" } = req.body;

    // Basic validation - ensure required fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Check if email already exists in the database to prevent duplicates
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Create new user with default status as 'active' according to the Users table schema
    const newUser = userRepository.create({
      email,
      password, // Note: In production, hash the password with bcrypt
      role,
      status: "active",
    });

    const savedUser = await userRepository.save(newUser);

    // Return success response with user data
    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: savedUser.user_id,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        dateCreate: savedUser.date_create,
      },
    });
  } catch (error) {
    // Log and handle any errors during registration
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ error: "Registration failed. Please try again later." });
  }
};
