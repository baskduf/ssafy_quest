import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData, defaultSession } from "@/lib/session";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        session.destroy();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout API error:", error);
        return NextResponse.json(
            { success: false, message: "로그아웃 처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        if (!session.isLoggedIn) {
            return NextResponse.json(defaultSession);
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error("Session API error:", error);
        return NextResponse.json(defaultSession);
    }
}
