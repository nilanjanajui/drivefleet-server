import express from "express";
import Car from "../models/Car.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// ─── GET /api/cars ─────────────────────────────────────────────
// Public — get all cars with optional search + filter
router.get("/", async (req, res) => {
    try {
        const { search, type } = req.query;
        const filter = {};

        // Search by car name using $regex (case-insensitive)
        if (search) {
            filter.carName = { $regex: search, $options: "i" };
        }

        // Filter by car type using $in operator
        if (type) {
            filter.carType = { $in: [type] };
        }

        const cars = await Car.find(filter).sort({ createdAt: -1 });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/cars/my-cars ─────────────────────────────────────
// Private — get only the logged-in user's cars
// NOTE: must be before /:id route so it doesn't get caught
router.get("/my-cars", verifyJWT, async (req, res) => {
    try {
        const cars = await Car.find({ ownerEmail: req.user.email }).sort({
            createdAt: -1,
        });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/cars/:id ─────────────────────────────────────────
// Public — get single car details
router.get("/:id", async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.json(car);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── POST /api/cars ────────────────────────────────────────────
// Private — add a new car listing
router.post("/", verifyJWT, async (req, res) => {
    try {
        const car = new Car({
            ...req.body,
            ownerEmail: req.user.email, // taken from JWT, not request body
            ownerName: req.user.name,
        });

        const savedCar = await car.save();
        res.status(201).json(savedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─── PUT /api/cars/:id ─────────────────────────────────────────
// Private — update own car (owner only)
router.put("/:id", verifyJWT, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        // Only owner can update
        if (car.ownerEmail !== req.user.email) {
            return res.status(403).json({ message: "Forbidden — not your car" });
        }

        // Prevent overwriting ownerEmail via body
        const { ownerEmail, ownerName, booking_count, ...updateData } = req.body;

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─── DELETE /api/cars/:id ──────────────────────────────────────
// Private — delete own car (owner only)
router.delete("/:id", verifyJWT, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        // Only owner can delete
        if (car.ownerEmail !== req.user.email) {
            return res.status(403).json({ message: "Forbidden — not your car" });
        }

        await Car.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Car deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;