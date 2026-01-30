import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        if (!session.isLoggedIn || !session.userId) {
            return NextResponse.json({ isLoggedIn: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { campus: true, classNum: true }
        });

        if (!user) {
            return NextResponse.json({ isLoggedIn: false }, { status: 404 });
        }

        return NextResponse.json({
            isLoggedIn: true,
            campus: user.campus,
            classNum: user.classNum,
            name: user.name, // name 추가
        });
    } catch (error) {
        console.error("API /me Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        if (!session.isLoggedIn || !session.userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, campus, classNum } = body;

        // Validation
        if (!name || !campus || !classNum) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        // DB Update
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                name,
                campus,
                classNum: parseInt(classNum),
            },
        });

        // Session Update
        session.name = name;
        session.campus = campus;
        session.classNum = parseInt(classNum);
        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API /me PATCH Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
