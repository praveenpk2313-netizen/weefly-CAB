import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    pickup: { type: String, required: true },
    drop: { type: String, required: true },
    cabType: { type: String, required: true },
    fare: { type: Number, required: true },
    distanceKm: { type: Number, default: 0 },

    // ✅ driver flow
    status: {
      type: String,
      enum: ["pending", "accepted", "arrived", "started", "completed", "cancelled"],
      default: "pending",
    },
    driverId: { type: String, default: null },
    driverName: { type: String, default: null },
    vehicleInfo: { type: String, default: null },

    // ✅ START OTP (important)
    startOtp: {
      type: String,
      default: null,
    },

    pickupLatLng: { type: Object, default: null },
    dropLatLng: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
