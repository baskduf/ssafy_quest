import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { verifySsafyLogin } from "@/lib/ssafy-auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ssafyId, ssafyPwd } = body;

        if (!ssafyId || !ssafyPwd) {
            return NextResponse.json(
                { success: false, message: "SSAFY ID와 비밀번호를 입력해주세요." },
                { status: 400 }
            );
        }

        // 기본 유효성 검사 (SSAFY 서버 부하 방지용)
        if (typeof ssafyId !== 'string' || ssafyId.length < 2 || typeof ssafyPwd !== 'string' || ssafyPwd.length < 4) {
            return NextResponse.json(
                { success: false, message: "올바른 형식의 아이디와 비밀번호를 입력해주세요." },
                { status: 400 }
            );
        }

        // SSAFY 로그인 검증
        const ssafyResult = await verifySsafyLogin(ssafyId, ssafyPwd);

        if (!ssafyResult.success) {
            return NextResponse.json(
                { success: false, message: ssafyResult.message },
                { status: 401 }
            );
        }

        // 기존 유저 찾기 (ssafyId로 검색)
        const existingUser = await prisma.user.findUnique({
            where: { ssafyId },
        });

        if (existingUser) {
            // 세션 생성
            const cookieStore = await cookies();
            const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

            session.userId = existingUser.id;
            session.bojHandle = existingUser.bojHandle;
            session.name = existingUser.name;
            session.campus = existingUser.campus;
            session.classNum = existingUser.classNum;
            session.isLoggedIn = true;

            await session.save();

            return NextResponse.json({
                success: true,
                isNewUser: false,
                user: {
                    id: existingUser.id,
                    bojHandle: existingUser.bojHandle,
                    name: existingUser.name,
                },
            });
        }

        // 신규 유저 - 등록 필요
        return NextResponse.json({
            success: true,
            isNewUser: true,
            ssafyId,
        });
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
