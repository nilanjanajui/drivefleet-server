import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "../lib/auth.js";

const router = express.Router();

router.post("/token", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    const token = jwt.sign(
        { id: session.user.id, email: session.user.email, name: session.user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true });
});

export default router;