import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import User from "../models/User.js";

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { username, name, phone, email, password } = req.body;

    if (!username || !name || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email, username, or phone" });
    }

    const user = await User.create({
      username,
      name,
      phone,
      email,
      password, // In production, hash this!
      role: req.body.role || "customer"
    });

    res.status(201).json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ message: "Phone required" });

    // basic validation (India 10-digit)
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter valid mobile number" });
    }

    // ✅ user doc create (optional)
    await User.updateOne({ phone }, { $setOnInsert: { phone } }, { upsert: true });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // ✅ old unused OTPs invalid
    await Otp.updateMany({ phone, isUsed: false }, { $set: { isUsed: true } });

    await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUsed: false,
    });

    // ✅ testing: OTP console-la varum
    console.log("OTP for", phone, ":", otp);

    res.json({ success: true, message: "OTP sent", otp });
  } catch (err) {
    console.log("Send OTP error:", err);
    res.status(500).json({ message: "Send OTP failed" });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const record = await Otp.findOne({
      phone,
      otp: String(otp),
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid/Expired OTP" });
    }

    record.isUsed = true;
    await record.save();

    // ✅ confirm user exists & update role
    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { phone, role: role || "customer" } },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "OTP verified", user });
  } catch (err) {
    console.log("Verify OTP error:", err);
    res.status(500).json({ message: "OTP verify failed" });
  }
};

// GET /api/auth/user/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
