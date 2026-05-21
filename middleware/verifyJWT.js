import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    // Read token from HTTPOnly cookie
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized — no token found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { email, name, iat, exp }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Forbidden — invalid or expired token" });
    }
};

export default verifyJWT;