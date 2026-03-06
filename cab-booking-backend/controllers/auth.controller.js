import Otp from "../models/Otp.js";
import User from "../models/User.js";

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
