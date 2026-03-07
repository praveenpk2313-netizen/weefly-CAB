import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// POST /api/admin/register
export const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password required" });
        }

        const existing = await Admin.findOne({ username: username.trim() });
        if (existing) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const admin = await Admin.create({
            username: username.trim().toLowerCase(),
            password: password.trim(), // In production, hash this!
        });

        res.json({ success: true, message: "Admin registered", admin });
    } catch (err) {
        console.error("Admin Register Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/admin/login
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const inputUser = (username || "").toString().trim();
        const inputPass = (password || "").toString().trim();

        // 1. Check DB first (case-insensitive)
        const dbAdmin = await Admin.findOne({ 
            username: { $regex: new RegExp(`^${inputUser}$`, "i") } 
        });
        let isValid = false;

        if (dbAdmin && dbAdmin.password === inputPass) {
            isValid = true;
        } else {
            // 2. Fallback to .env master account
            const envUser = (process.env.ADMIN_USERNAME || "admin").trim();
            const envPass = (process.env.ADMIN_PASSWORD || "admin123").trim();
            if (inputUser === envUser && inputPass === envPass) {
                isValid = true;
            }
        }

        if (isValid) {
            console.log(`[Admin Login] Success: ${inputUser}`);
            // ✅ Generate Admin JWT
            const token = jwt.sign(
                { username: dbAdmin?.username || inputUser, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.json({
                success: true,
                message: "Admin login successful",
                token,
                role: "admin"
            });
        }

        console.warn(`[Admin Login] Failure: ${inputUser}`);
        return res.status(401).json({
            success: false,
            message: "Invalid admin credentials"
        });
    } catch (err) {
        console.error("Admin Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const totalRides = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: "pending" });
        const completedRides = await Booking.countDocuments({ status: "completed" });
        const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
        const ongoingTrips = await Booking.countDocuments({ status: { $in: ["accepted", "arrived", "started"] } });

        const revenueAgg = await Booking.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$fare" } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        const totalClients = await User.countDocuments({ role: "customer" });
        const totalDrivers = await User.countDocuments({ role: "driver" });
        const availableCabs = await User.countDocuments({ role: "driver", isOnline: true });
        const systemUsers = await Admin.countDocuments();

        const recentTrips = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.json({
            totalRides,
            pendingBookings,
            completedRides,
            cancelledBookings,
            ongoingTrips,
            totalRevenue,
            totalClients,
            totalDrivers,
            availableCabs,
            systemUsers,
            recentTrips,
        });
    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/admin/trips
export const getAllTrips = async (req, res) => {
    try {
        const trips = await Booking.find().sort({ createdAt: -1 }).lean();
        res.json(trips);
    } catch (err) {
        console.error("Get all trips error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/admin/drivers
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: "driver" }).sort({ createdAt: -1 }).lean();
        res.json(drivers);
    } catch (err) {
        console.error("Get all drivers error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
