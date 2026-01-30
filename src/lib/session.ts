import { SessionOptions } from "iron-session";

export interface SessionData {
    userId?: number;
    bojHandle?: string;
    isLoggedIn: boolean;
    campus?: string;
    classNum?: number;
    name?: string;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
    cookieName: "ssafy-quest-session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};

export const defaultSession: SessionData = {
    userId: undefined,
    bojHandle: undefined,
    isLoggedIn: false,
};
