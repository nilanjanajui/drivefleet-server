import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import carRoutes from "./routes/cars.js";
import bookingRoutes from "./routes/bookings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ──────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.all("/api/auth/{*path}", toNodeHandler(auth));

// ─── Other middleware ──────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Your routes ──────────────────────────────────────────────
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
    res.json({ message: "DriveFleet Server running ✅" });
});

// ─── Connect DB ────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () =>
            console.log(`✅ Server running on http://localhost:${PORT}`)
        );
    })
    .catch((err) => {
        console.error("❌ MongoDB Error:", err.message);
        process.exit(1);
    });