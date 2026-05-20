import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Issue JWT → set HTTPOnly cookie
router.post("/jwt", (req, res) => {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const token = jwt.sign({ email, name }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res
        .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({ success: true });
});

// Clear cookie on logout
router.get("/logout", (req, res) => {
    res
        .clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .json({ success: true });
});

export default router;