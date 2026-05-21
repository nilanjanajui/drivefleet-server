import express from "express";
import Car from "../models/Car.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// ─── GET /api/cars ─────────────────────────────────────────────
// Public — get all cars with optional search + filter + sort
router.get("/", async (req, res) => {
    try {
        const { search, type, sort } = req.query;
        const filter = {};

        if (search) filter.car_name = { $regex: search, $options: "i" };
        if (type) filter.car_type = { $in: [type] };

        const sortMap = {
            price_asc: { daily_rent_price: 1 },
            price_desc: { daily_rent_price: -1 },
            newest: { createdAt: -1 },
            popular: { booking_count: -1 },
        };
        const sortQuery = sortMap[sort] || { daily_rent_price: 1 };

        const cars = await Car.find(filter).sort(sortQuery);
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/cars/my-cars ─────────────────────────────────────
// Private — must be before /:id or Express will treat "my-cars" as an id
router.get("/my-cars", verifyJWT, async (req, res) => {
    try {
        const cars = await Car.find({ owner_email: req.user.email })
            .sort({ createdAt: -1 });
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
        if (!car) return res.status(404).json({ message: "Car not found" });
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
            owner_email: req.user.email,
            owner_name: req.user.name,
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
        if (!car) return res.status(404).json({ message: "Car not found" });

        if (car.owner_email !== req.user.email)
            return res.status(403).json({ message: "Forbidden — not your car" });

        // Prevent overwriting protected fields via body
        const { owner_email, owner_name, booking_count, ...updateData } = req.body;

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
        if (!car) return res.status(404).json({ message: "Car not found" });

        if (car.owner_email !== req.user.email)
            return res.status(403).json({ message: "Forbidden — not your car" });

        await Car.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Car deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;