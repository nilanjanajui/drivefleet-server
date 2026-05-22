import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    // Read token from HTTPOnly cookie
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized — no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized — invalid token" });
    }
};

export default verifyJWT;