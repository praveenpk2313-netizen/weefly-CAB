import express from "express";
import { adminLogin, registerAdmin, getAdminStats, getAllTrips, getAllDrivers } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/register", registerAdmin);
router.get("/stats", getAdminStats);
router.get("/trips", getAllTrips);
router.get("/drivers", getAllDrivers);

export default router;
