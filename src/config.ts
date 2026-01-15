import dotenv from 'dotenv';
import { z } from 'zod';

// Only load .env file if not in production (Docker handles env vars in production)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Define the configuration schema with Zod
const configSchema = z.object({
    targetUrl: z.string().url({ message: "TARGET_URL must be a valid URL" }),
    selectors: z.object({
        username: z.string().min(1, { message: "USERNAME_SELECTOR is required" }),
        password: z.string().min(1, { message: "PASSWORD_SELECTOR is required" }),
        loginButton: z.string().min(1, { message: "LOGIN_BUTTON_SELECTOR is required" }),
        postLoginLink: z.string().optional(),
    }),
    credentials: z.object({
        username: z.string().min(1, { message: "USER_LOGIN is required" }),
        password: z.string().min(1, { message: "USER_PASSWORD is required" }),
    }),
    ntfy: z.object({
        server: z.string().url().optional(),
        topic: z.string().optional(),
        user: z.string().optional(),
        password: z.string().optional(),
    }),
    timeouts: z.object({
        selector: z.coerce.number().default(10000),
        networkIdle: z.coerce.number().default(5000),
    }),
    delays: z.object({
        typingMin: z.coerce.number().default(50),
        typingMax: z.coerce.number().default(150),
        loginPauseMin: z.coerce.number().default(500),
        loginPauseMax: z.coerce.number().default(1500),
        navPauseMin: z.coerce.number().default(1000),
        navPauseMax: z.coerce.number().default(3000),
    }),
    // Custom preprocess for headless to correctly handle 'true'/'false' strings and default
    headless: z.preprocess((val) => {
        if (typeof val === 'string') {
            const lowerVal = val.toLowerCase();
            if (lowerVal === 'true') return true;
            if (lowerVal === 'false') return false;
        }
        // If not 'true' or 'false' string, or not a string, return undefined
        // so the default(true) can be applied for undefined values.
        return undefined;
    }, z.boolean().default(true)),
    cronSchedule: z.string().optional(),
});

// Pass the raw environment variables to Zod for parsing
const rawConfig = {
    targetUrl: process.env.TARGET_URL,
    selectors: {
        username: process.env.USERNAME_SELECTOR,
        password: process.env.PASSWORD_SELECTOR,
        loginButton: process.env.LOGIN_BUTTON_SELECTOR,
        postLoginLink: process.env.POST_LOGIN_LINK_SELECTOR
    },
    credentials: {
        username: process.env.USER_LOGIN,
        password: process.env.USER_PASSWORD
    },
    ntfy: {
        server: process.env.NTFY_SERVER,
        topic: process.env.NTFY_TOPIC,
        user: process.env.NTFY_USER,
        password: process.env.NTFY_PASSWORD
    },
    timeouts: {
        selector: process.env.TIMEOUT_SELECTOR,
        networkIdle: process.env.TIMEOUT_NETWORK_IDLE
    },
    delays: {
        typingMin: process.env.DELAY_TYPING_MIN,
        typingMax: process.env.DELAY_TYPING_MAX,
        loginPauseMin: process.env.DELAY_LOGIN_PAUSE_MIN,
        loginPauseMax: process.env.DELAY_LOGIN_PAUSE_MAX,
        navPauseMin: process.env.DELAY_NAV_PAUSE_MIN,
        navPauseMax: process.env.DELAY_NAV_PAUSE_MAX
    },
    headless: process.env.HEADLESS, // Pass the raw value to let Zod preprocess it
    cronSchedule: process.env.CRON_SCHEDULE
};

// Validate and export
let config: z.infer<typeof configSchema>;

try {
    config = configSchema.parse(rawConfig);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error("❌ Invalid configuration:");
        error.errors.forEach((err) => {
            console.error(` - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}

export type Config = z.infer<typeof configSchema>;
export default config;
