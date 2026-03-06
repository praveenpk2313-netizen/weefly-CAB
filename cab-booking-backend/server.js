import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import locationRoutes from "./routes/location.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://weefly-cab.onrender.com",
  "https://weefly-cab.vercel.app",
];

// ✅ CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // postman
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight safe (NO app.options("*") here)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ✅ DB
connectDB();

app.get("/", (req, res) => res.send("Backend Running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/admin", adminRoutes);

// ---------------- SOCKET.IO ----------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // More permissive for deployment
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRide", ({ rideId }) => {
    if (!rideId) return;
    socket.join(rideId);
    socket.emit("joinedRide", { rideId });
  });

  socket.on("driverLocation", ({ rideId, lat, lng }) => {
    if (!rideId || typeof lat !== "number" || typeof lng !== "number") return;
    io.to(rideId).emit("driverLocationUpdate", { lat, lng, at: Date.now() });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
