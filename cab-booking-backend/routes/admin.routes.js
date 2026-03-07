import express from "express";
import { adminLogin, registerAdmin, getAdminStats, getAllTrips, getAllDrivers, getAllClients, getAllAdmins } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/register", registerAdmin);
router.get("/stats", getAdminStats);
router.get("/trips", getAllTrips);
router.get("/drivers", getAllDrivers);
router.get("/clients", getAllClients);
router.get("/users", getAllAdmins);

export default router;
