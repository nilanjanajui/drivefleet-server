import express from "express";
import Car from "../models/Car.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// GET all cars (public) — with search + filter
router.get("/", async (req, res) => {
    try {
        const { search, type } = req.query;
        const filter = {};

        if (search) filter.carName = { $regex: search, $options: "i" };
        if (type) filter.carType = type;

        const cars = await Car.find(filter).sort({ createdAt: -1 });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single car (public)
router.get("/:id", async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: "Car not found" });
        res.json(car);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add car (private)
router.post("/", verifyJWT, async (req, res) => {
    try {
        const car = new Car({ ...req.body, ownerEmail: req.user.email });
        await car.save();
        res.status(201).json(car);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update car (private — owner only)
router.put("/:id", verifyJWT, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: "Car not found" });
        if (car.ownerEmail !== req.user.email)
            return res.status(403).json({ message: "Forbidden" });

        const updated = await Car.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE car (private — owner only)
router.delete("/:id", verifyJWT, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: "Car not found" });
        if (car.ownerEmail !== req.user.email)
            return res.status(403).json({ message: "Forbidden" });

        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: "Car deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;