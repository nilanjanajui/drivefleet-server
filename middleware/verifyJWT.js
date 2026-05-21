import { auth } from "../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const verifyJWT = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            return res.status(401).json({
                message: "Unauthorized — please log in",
            });
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
        };

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized — invalid session",
        });
    }
};

export default verifyJWT;