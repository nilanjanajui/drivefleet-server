import jwt from "jsonwebtoken";

// Call this after successful Better Auth login
router.post("/api/token", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    // Generate JWT
    const token = jwt.sign(
        {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true });
});