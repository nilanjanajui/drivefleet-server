import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const verifyJWT = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ message: "Unauthorized — please log in" });
        }

        req.user = {
            email: session.user.email,
            name: session.user.name,
            id: session.user.id,
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized — invalid session" });
    }
};

export default verifyJWT;