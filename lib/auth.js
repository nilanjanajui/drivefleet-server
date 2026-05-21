import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const db = client.db();

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, { client }),

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },

    trustedOrigins: [process.env.CLIENT_URL],
});