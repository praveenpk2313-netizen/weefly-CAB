import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    name: { type: String, default: "User" },
    role: { type: String, enum: ["customer", "driver", "admin"], default: "customer" },
    wallet: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);