import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fetchUserFromSolvedAc } from "@/lib/solved-ac";
import { calculateTotalPoint, checkBadges } from "@/lib/score";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ssafyId, bojHandle, campus, classNum, name } = body;

        // 유효성 검사
        if (!ssafyId || !bojHandle || !campus || !classNum || !name) {
            return NextResponse.json(
                { error: "SSAFY ID, 백준 아이디, 이름, 캠퍼스, 반 번호는 필수입니다." },
                { status: 400 }
            );
        }

        // 중복 확인
        const existing = await prisma.user.findUnique({
            where: { bojHandle },
        });

        if (existing) {
            return NextResponse.json(
                { error: "이미 등록된 백준 아이디입니다." },
                { status: 400 }
            );
        }

        // Solved.ac에서 유저 정보 가져오기
        const solvedAcUser = await fetchUserFromSolvedAc(bojHandle);

        if (!solvedAcUser) {
            return NextResponse.json(
                { error: "Solved.ac에서 유저 정보를 찾을 수 없습니다. 백준 아이디를 확인해주세요." },
                { status: 404 }
            );
        }

        // 점수 계산
        const totalPoint = calculateTotalPoint(
            solvedAcUser.tier,
            solvedAcUser.solvedCount,
            solvedAcUser.maxStreak
        );

        // 유저 생성
        const user = await prisma.user.create({
            data: {
                ssafyId,
                bojHandle,
                campus,
                classNum,
                name,
                tier: solvedAcUser.tier,
                rating: solvedAcUser.rating,
                solvedCount: solvedAcUser.solvedCount,
                maxStreak: solvedAcUser.maxStreak,
                profileImage: solvedAcUser.profileImageUrl,
                bio: solvedAcUser.bio,
                totalPoint,
                lastUpdatedAt: new Date(),
            },
        });

        // 뱃지 확인 및 생성
        const badges = checkBadges(solvedAcUser.tier, solvedAcUser.solvedCount, solvedAcUser.maxStreak);
        const earnedBadges = badges.filter((b) => b.earned);

        // SQLite 호환: createMany 대신 개별 create 사용
        for (const badge of earnedBadges) {
            try {
                await prisma.badge.create({
                    data: {
                        userId: user.id,
                        type: badge.type,
                    },
                });
            } catch {
                // 중복 뱃지 무시
            }
        }

        // 세션 생성 (자동 로그인)
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        session.userId = user.id;
        session.bojHandle = user.bojHandle;
        session.isLoggedIn = true;
        await session.save();

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("User registration error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
