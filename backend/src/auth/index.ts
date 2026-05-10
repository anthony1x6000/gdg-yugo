import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema.js";
import { username } from "better-auth/plugins";

export function getAuth(db: D1Database) {
    return betterAuth({
        database: drizzleAdapter(drizzle(db), {
            provider: "sqlite",
            schema: schema,
        }),
        emailAndPassword: {
            enabled: true,
        },
        plugins: [
            username()
        ],
        user: {
            additionalFields: {
                highscore: {
                    type: "number",
                    defaultValue: 0,
                },
                profilePictureUrl: {
                    type: "string",
                    required: false,
                },
            },
        },
    });
}
