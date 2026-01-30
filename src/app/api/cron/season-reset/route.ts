import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Vercel Cron 인증 (또는 로컬 테스트용 force)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !force) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany();
        const now = new Date();
        // 시즌 이름: "YYYY-MM" (지난 달 기준, 왜냐하면 1일에 실행되므로 지난 달 성적 마감)
        // 단, 'Start'의 경우 현재 달로 설정할 수도 있음.
        // 여기서는 간단히 "마감되는 시즌"의 이름을 결정. 
        // 2월 1일 실행 -> 1월 시즌 마감.

        let seasonName = "";
        if (now.getDate() <= 5) {
            // 월초 실행 시: 지난 달 이름 계산
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            seasonName = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
        } else {
            // 월중 강제 실행 시: 현재 달 이름 (또는 커스텀)
            seasonName = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        console.log(`Starting Season Reset for: ${seasonName}`);

        let updatedCount = 0;

        for (const user of users) {
            // 1. 시즌 기록 저장 (History)
            // 점수가 0이면 굳이 저장 안해도 되지만, 기록 남기는게 좋을 수도.
            if (user.totalPoint > 0 || user.solvedCount > user.initialSolvedCount) {
                await prisma.seasonHistory.create({
                    data: {
                        userId: user.id,
                        seasonName: seasonName,
                        finalSolvedCount: user.solvedCount,
                        finalTier: user.tier,
                        earnedPoint: user.totalPoint,
                        rank: user.previousRank || 0, // 대략적인 순위
                    },
                });
            }

            // 2. 새로운 시즌 시작 (Reset)
            // 현재 상태를 'initial'로 설정하여 0점부터 시작하게 함
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    initialSolvedCount: user.solvedCount,
                    initialTier: user.tier,
                    totalPoint: 0, // 점수 리셋
                    lastUpdatedAt: now,
                },
            });
            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Season ${seasonName} archived and reset for ${updatedCount} users.`,
        });

    } catch (error) {
        console.error("Season reset error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
