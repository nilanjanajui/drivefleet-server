import express from "express";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// ─── GET /api/bookings/my ──────────────────────────────────────
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

// ─── POST /api/bookings ────────────────────────────────────────
router.post("/", verifyJWT, async (req, res) => {
    try {
        const { carId, driverNeeded, specialNote, bookingDate } = req.body;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        if (!car.availability) {
            return res.status(400).json({ message: "Car is currently unavailable" });
        }

        const booking = new Booking({
            carId: car._id,
            carName: car.car_name,
            carImage: car.image_url,
            carType: car.car_type,
            dailyRentPrice: car.daily_rent_price,
            pickupLocation: car.pickup_location,
            userEmail: req.user.email,
            userName: req.user.name,
            driverNeeded: driverNeeded || false,
            specialNote: specialNote || "",
            bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
            totalPrice: car.daily_rent_price,
        });

        const savedBooking = await booking.save();

        await Car.findByIdAndUpdate(carId, {
            $inc: { booking_count: 1 },
        });

        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─── PATCH /api/bookings/:id ───────────────────────────────────
// Private — cancel a booking by setting status to "cancelled"
router.patch("/:id", verifyJWT, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.userEmail !== req.user.email) {
            return res.status(403).json({ message: "Forbidden — not your booking" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;