import Booking from "../models/Booking.js";

// helper: 4-digit OTP
const genOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// ✅ Create booking (Customer side) + generate startOtp
export const createBooking = async (req, res) => {
  try {
    const startOtp = genOtp();

    const booking = await Booking.create({
      ...req.body,
      status: req.body.status || "pending",
      startOtp, // store OTP
    });

    console.log("✅ Booking saved:", booking._id, "OTP:", startOtp);
    res.json({ message: "Booking stored", booking });
  } catch (err) {
    console.log("Booking error:", err);
    res.status(500).json({ message: "Booking error" });
  }
};

// ✅ Get single booking by id
export const getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Trip not found" });

    res.json(booking);
  } catch (err) {
    console.log("Get trip error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Available bookings list
export const getAvailableBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    res.json(bookings);
  } catch (err) {
    console.log("Available bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Driver accept booking
export const acceptRide = async (req, res) => {
  try {
    const { bookingId, driverId, driverName, vehicleInfo } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Already accepted / not available" });
    }

    booking.status = "accepted";
    booking.driverId = driverId || "DRIVER-001";
    booking.driverName = driverName || "Driver";
    booking.vehicleInfo = vehicleInfo || "Cab";
    await booking.save();

    res.json({ message: "Ride accepted", booking });
  } catch (err) {
    console.log("Accept ride error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Driver active trip
export const getDriverActiveTrip = async (req, res) => {
  try {
    const { driverId } = req.params;

    const trip = await Booking.findOne({
      driverId,
      status: { $in: ["accepted", "arrived", "started"] },
    }).sort({ updatedAt: -1 });

    res.json(trip || null);
  } catch (err) {
    console.log("Active trip error:", err);
    res.status(500).json({ message: "Error fetching active trip" });
  }
};

// ✅ Verify start OTP + auto start trip
export const verifyStartOtp = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;

    if (!bookingId || !otp) {
      return res.status(400).json({
        success: false,
        message: "bookingId and otp required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "arrived") {
      return res.status(400).json({
        success: false,
        message: "OTP allowed only after arrived",
      });
    }

    // safe compare
    const dbOtp = (booking.startOtp || "").toString().trim();
    const inputOtp = otp.toString().trim();

    if (dbOtp !== inputOtp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }

    // ✅ OTP correct → start trip automatically
    booking.status = "started";
    await booking.save();

    return res.json({
      success: true,
      message: "OTP verified. Trip started",
      booking,
    });
  } catch (err) {
    console.log("Verify OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update ride status
export const updateRideStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const allowed = [
      "pending",
      "accepted",
      "arrived",
      "started",
      "completed",
      "cancelled",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    // flow rules
    if (status === "arrived" && booking.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Arrived allowed only after accepted" });
    }
    if (status === "completed" && booking.status !== "started") {
      return res
        .status(400)
        .json({ message: "Completed allowed only after started" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Status updated", booking });
  } catch (err) {
    console.log("Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get bookings by phone (trip history)
export const getBookingsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const bookings = await Booking.find({ phone })
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (err) {
    console.log("Booking history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
