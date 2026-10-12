import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const optionalString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const PUBLIC_ROLES = ["corps_member", "landlord", "agent"];

const normalizeRole = (role) =>
  String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");

const publicUser = (user) => {
  const ppa = user.ppa_name ?? null;
  const profile = {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    state: user.state,
    lga: user.lga,
    ppa_name: ppa,
    ppa,
    ppa_proximity: user.ppa_proximity ?? null,
    role: user.role,
  };

  if (user.role === "landlord" || user.role === "agent") {
    profile.verification_status = user.account_verification?.status || "not_submitted";
  }

  return profile;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, phone, email, password, state, lga, ppa, ppa_name, ppa_proximity, role } = req.body;

    // Validate required input
    if (!name || !phone || !email || !password || !state || !lga) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const assignedRole = role ? normalizeRole(role) : "corps_member";

    if (assignedRole === "admin") {
      return res.status(403).json({
        message: "Self-registration as an administrator is not permitted",
      });
    }

    if (!PUBLIC_ROLES.includes(assignedRole)) {
      return res.status(400).json({
        message: "Invalid role. Must be corps_member, landlord, or agent",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if phone number or email is already registered
    const existingUser = await User.findOne({
      $or: [{ phone }, { email: normalizedEmail }],
    });
    if (existingUser) {
      const message = existingUser.phone === phone
        ? "User already exists with this phone number"
        : "User already exists with this email";
      return res.status(400).json({ message });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user record
    const user = await User.create({
      name,
      phone,
      email: normalizedEmail,
      password_hash: hashedPassword,
      state,
      lga,
      ppa_name: optionalString(ppa ?? ppa_name) ?? null,
      ppa_proximity: optionalString(ppa_proximity) ?? null,
      role: assignedRole,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Please provide phone number and password" });
    }

    // Find user and explicitly select password_hash
    const user = await User.findOne({ phone }).select("+password_hash");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me and GET /api/v1/users/me
// @access  Private (Protected)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password_hash");
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update current user's location / PPA
// @route   PATCH /api/v1/users/me
// @access  Private (Protected)
export const updateMe = async (req, res) => {
  try {
    const { state, lga, ppa, ppa_name, ppa_proximity } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    if (state !== undefined) {
      const nextState = optionalString(state);
      if (!nextState) {
        return res.status(400).json({ message: "state cannot be empty" });
      }
      user.state = nextState;
    }

    if (lga !== undefined) {
      const nextLga = optionalString(lga);
      if (!nextLga) {
        return res.status(400).json({ message: "lga cannot be empty" });
      }
      user.lga = nextLga;
    }

    if (ppa !== undefined || ppa_name !== undefined) {
      user.ppa_name = optionalString(ppa !== undefined ? ppa : ppa_name);
    }

    if (ppa_proximity !== undefined) {
      user.ppa_proximity = optionalString(ppa_proximity);
    }

    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};