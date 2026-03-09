import express from "express";
import {
  createBooking,
  getSingleBooking,
  getAvailableBookings,
  acceptRide,
  verifyStartOtp,
  updateRideStatus,
  getDriverActiveTrip,
  getBookingsByPhone,
  completeRideAndPay,
  submitFeedback,
} from "../controllers/booking.controller.js";

const router = express.Router();

// customer
router.post("/create", createBooking);
router.get("/history/:phone", getBookingsByPhone);
router.post("/feedback", submitFeedback);

// driver
router.get("/available", getAvailableBookings);
router.post("/accept", acceptRide);
router.post("/update-status", updateRideStatus);
router.post("/verify-start-otp", verifyStartOtp);
router.get("/driver-active/:driverId", getDriverActiveTrip);
router.post("/complete-and-pay", completeRideAndPay);

// trip detail page
router.get("/:id", getSingleBooking);

export default router;
