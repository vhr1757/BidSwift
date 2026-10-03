import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    if (
      typeof first_name !== "string" ||
      typeof last_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }

    const trimmedFirstName = first_name.trim();
    const trimmedLastName = last_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (trimmedFirstName.length < 2 || trimmedFirstName.length > 50) {
      return res.status(400).json({
        message: "First name must be between 2 and 50 characters",
      });
    }

    if (trimmedLastName.length < 2 || trimmedLastName.length > 50) {
      return res.status(400).json({
        message: "Last name must be between 2 and 50 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    if (role !== undefined && typeof role !== "string") {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const userRole = role || "buyer";

    const allowedRoles = ["buyer", "seller"];

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const user = await User.create({
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      email: normalizedEmail,
      password: password,
      role: userRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "User registration failed",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid password data",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({
        message: "New password is too long",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    if (
      typeof first_name !== "string" ||
      typeof last_name !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        message: "First name, last name and email are required",
      });
    }

    const trimmedFirstName = first_name.trim();

    const trimmedLastName = last_name.trim();

    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedFirstName || !trimmedLastName || !normalizedEmail) {
      return res.status(400).json({
        message: "First name, last name and email are required",
      });
    }

    if (trimmedFirstName.length < 2 || trimmedFirstName.length > 50) {
      return res.status(400).json({
        message: "First name must be between 2 and 50 characters",
      });
    }

    if (trimmedLastName.length < 2 || trimmedLastName.length > 50) {
      return res.status(400).json({
        message: "Last name must be between 2 and 50 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: {
        $ne: req.user.userId,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.first_name = trimmedFirstName;

    user.last_name = trimmedLastName;

    user.email = normalizedEmail;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

export {
    login,
    registerUser,
    updatePassword,
    updateProfile
};
