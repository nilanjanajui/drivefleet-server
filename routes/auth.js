import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";

// ─── POST /api/auth/jwt ────────────────────────────────────────
// Called after Firebase login/register to issue HTTPOnly JWT cookie
router.post("/jwt", (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const token = jwt.sign(
        { email, name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res
        .cookie("token", token, {
            httpOnly: true,                          // JS cannot read it
            secure: isProduction,                    // HTTPS only in production
            sameSite: isProduction ? "none" : "strict", // cross-site in prod
            maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days in ms
        })
        .json({ success: true, message: "Token issued successfully" });
});

// ─── GET /api/auth/logout ──────────────────────────────────────
// Clears the cookie on logout
router.get("/logout", (req, res) => {
    res
        .clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
        })
        .json({ success: true, message: "Logged out successfully" });
});

export default router;