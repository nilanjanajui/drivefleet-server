import express from "express";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// GET my bookings (private)
router.get("/my", verifyJWT, async (req, res) => {
    try {
        const bookings = await Booking.find({ userEmail: req.user.email }).sort({
            createdAt: -1,
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST book a car (private)
router.post("/", verifyJWT, async (req, res) => {
    try {
        const booking = new Booking({
            ...req.body,
            userEmail: req.user.email,
            userName: req.user.name,
        });
        await booking.save();

        // Increment booking_count using $inc
        await Car.findByIdAndUpdate(req.body.carId, {
            $inc: { booking_count: 1 },
        });

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE cancel booking (private)
router.delete("/:id", verifyJWT, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.userEmail !== req.user.email)
            return res.status(403).json({ message: "Forbidden" });

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking cancelled" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;