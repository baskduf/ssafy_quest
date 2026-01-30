"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData, defaultSession } from "./session";
import { prisma } from "./prisma";
import { verifySsafyLogin } from "./ssafy-auth";
import { fetchUserFromSolvedAc } from "./solved-ac";
import { calculateTotalPoint, checkBadges } from "./score";

export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
        return defaultSession;
    }

    return session;
}

export async function login(ssafyId: string, ssafyPwd: string) {
    // SSAFY 로그인 검증
    const ssafyResult = await verifySsafyLogin(ssafyId, ssafyPwd);

    if (!ssafyResult.success) {
        return { success: false, message: ssafyResult.message };
    }

    // 기존 유저 찾기
    const existingUser = await prisma.user.findFirst({
        where: { bojHandle: ssafyId }, // SSAFY ID로 찾거나 별도 필드 필요 시 수정
    });

    if (existingUser) {
        // 세션 생성
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        session.userId = existingUser.id;
        session.bojHandle = existingUser.bojHandle;
        session.isLoggedIn = true;

        await session.save();

        return { success: true, user: existingUser, isNewUser: false };
    }

    return { success: true, isNewUser: true, ssafyId };
}

export async function register(
    ssafyId: string,
    bojHandle: string,
    campus: string,
    classNum: number,
    name?: string
) {
    // Solved.ac에서 유저 정보 가져오기
    const solvedAcUser = await fetchUserFromSolvedAc(bojHandle);

    if (!solvedAcUser) {
        return { success: false, message: "Solved.ac에서 유저 정보를 찾을 수 없습니다." };
    }

    // 중복 확인
    const existing = await prisma.user.findUnique({ where: { bojHandle } });
    if (existing) {
        return { success: false, message: "이미 등록된 백준 아이디입니다." };
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
            bojHandle,
            campus,
            classNum,
            name: name || null,
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

    // 뱃지 부여
    const badges = checkBadges(solvedAcUser.tier, solvedAcUser.solvedCount, solvedAcUser.maxStreak);
    const earnedBadges = badges.filter((b) => b.earned);

    if (earnedBadges.length > 0) {
        await prisma.badge.createMany({
            data: earnedBadges.map((badge) => ({
                userId: user.id,
                type: badge.type,
            })),
            skipDuplicates: true,
        });
    }

    // 세션 생성
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    session.userId = user.id;
    session.bojHandle = user.bojHandle;
    session.isLoggedIn = true;

    await session.save();

    return { success: true, user };
}

export async function logout() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    session.destroy();

    return { success: true };
}
