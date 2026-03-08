import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const JWT_EXPIRY = "5d"; // Sessions expire after 5 days

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

const signup = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with that email or username already exists" });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "An error occurred during signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (err) {
      console.error("Password comparison error:", err);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login (without triggering pre-save hook issues)
    user.lastLogin = new Date();
    try {
      await user.save();
    } catch (err) {
      console.error("Error saving last login:", err);
      // Continue anyway - auth is still valid
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Logged in successfully",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, newPassword, currentPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      user.password = newPassword;
    }

    // Update username if provided
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const logout = (req, res) => {
  // Since we're using stateless JWT, logout is just client-side token removal
  res.json({ message: "Logged out successfully" });
};

export { signup, login, getProfile, updateProfile, logout };
export default { signup, login, getProfile, updateProfile, logout };
