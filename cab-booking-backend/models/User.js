import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "User" },
    role: { type: String, enum: ["customer", "driver", "admin"], default: "customer" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);