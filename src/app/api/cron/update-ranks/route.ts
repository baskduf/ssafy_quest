import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 순위 갱신 API - cron job 또는 수동 호출
// POST /api/cron/update-ranks
export async function POST(request: Request) {
    // 간단한 인증 (선택적)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 모든 사용자를 점수 순으로 조회
        const users = await prisma.user.findMany({
            orderBy: { totalPoint: "desc" },
            select: { id: true, totalPoint: true },
        });

        // 현재 순위 계산 및 이전 순위로 저장
        const now = new Date();

        for (let i = 0; i < users.length; i++) {
            const currentRank = i + 1;
            await prisma.user.update({
                where: { id: users[i].id },
                data: {
                    previousRank: currentRank,
                    rankUpdatedAt: now,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: `Updated ranks for ${users.length} users`,
            updatedAt: now.toISOString(),
        });
    } catch (error) {
        console.error("Rank update error:", error);
        return NextResponse.json(
            { error: "Failed to update ranks" },
            { status: 500 }
        );
    }
}

// GET - 현재 순위 상태 조회
export async function GET() {
    const lastUpdated = await prisma.user.findFirst({
        where: { rankUpdatedAt: { not: null } },
        orderBy: { rankUpdatedAt: "desc" },
        select: { rankUpdatedAt: true },
    });

    const usersWithRank = await prisma.user.count({
        where: { previousRank: { not: null } },
    });

    return NextResponse.json({
        lastUpdated: lastUpdated?.rankUpdatedAt,
        usersWithRank,
    });
}
