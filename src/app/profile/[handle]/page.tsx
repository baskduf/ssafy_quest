import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTierName, fetchTagStats, fetchUserFromSolvedAc } from "@/lib/solved-ac";
import { calculateTotalPoint, checkBadges } from "@/lib/score";
import Link from "next/link";
import { RadarChart } from "@/components/radar-chart";
import { ProfileView } from "@/components/profile-view";

interface Props {
    params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: Props) {
    const { handle } = await params;

    let user = await prisma.user.findUnique({
        where: { bojHandle: handle },
        include: { badges: true },
    });

    if (!user) {
        notFound();
    }

    // Auto-refresh if stale (> 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!user.lastUpdatedAt || user.lastUpdatedAt < oneHourAgo) {
        const freshData = await fetchUserFromSolvedAc(handle);
        if (freshData) {
            const newTotalPoint = calculateTotalPoint(
                freshData.tier,
                freshData.solvedCount,
                freshData.maxStreak,
                user.initialTier,
                user.initialSolvedCount
            );

            user = await prisma.user.update({
                where: { bojHandle: handle },
                data: {
                    tier: freshData.tier,
                    rating: freshData.rating,
                    solvedCount: freshData.solvedCount,
                    maxStreak: freshData.maxStreak,
                    profileImage: freshData.profileImageUrl,
                    bio: freshData.bio,
                    totalPoint: newTotalPoint,
                    lastUpdatedAt: new Date(),
                },
                include: { badges: true },
            });
        }
    }

    const tagStats = await fetchTagStats(handle);
    const mainTags = ["dp", "implementation", "graphs", "greedy", "data_structures", "math"];
    const chartData = mainTags.map((tag) => {
        const stat = tagStats.find((s) => s.tag.key === tag);
        const names: Record<string, string> = {
            dp: "DP",
            implementation: "구현",
            graphs: "그래프",
            greedy: "그리디",
            data_structures: "자료구조",
            math: "수학",
        };
        return { tag: names[tag] || tag, solved: stat?.solved || 0 };
    });

    const allBadges = checkBadges(user.tier, user.solvedCount, user.maxStreak);
    const earnedBadges = allBadges.filter(b => b.earned);

    const globalRank = await prisma.user.count({
        where: { totalPoint: { gt: user.totalPoint } },
    }) + 1;

    const totalUsers = await prisma.user.count();

    const rankInfo = {
        text: "전체",
        rank: globalRank,
        total: totalUsers
    };

    return (
        <ProfileView
            user={user}
            chartData={chartData}
            earnedBadges={earnedBadges}
            rankInfo={rankInfo}
            isMyPage={false}
        />
    );
}
