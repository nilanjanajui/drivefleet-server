import express from "express";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// ─── GET /api/bookings/my ──────────────────────────────────────
// Private — get all bookings for the logged-in user
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
// Private — book a car + increment booking_count using $inc
router.post("/", verifyJWT, async (req, res) => {
    try {
        const { carId, driverNeeded, specialNote, bookingDate } = req.body;

        // Fetch the car to get its details
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        if (!car.availability) {
            return res.status(400).json({ message: "Car is currently unavailable" });
        }

        // Create the booking
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
            totalPrice: car.daily_rent_price,      // ← was car.dailyRentPrice
        });

        const savedBooking = await booking.save();

        // Increment booking_count on the car using $inc
        await Car.findByIdAndUpdate(carId, {
            $inc: { booking_count: 1 },
        });

        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─── DELETE /api/bookings/:id ──────────────────────────────────
// Private — cancel a booking (user only)
router.delete("/:id", verifyJWT, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only the person who booked can cancel
        if (booking.userEmail !== req.user.email) {
            return res.status(403).json({ message: "Forbidden — not your booking" });
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Booking cancelled successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;