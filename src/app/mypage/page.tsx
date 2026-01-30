import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTierName, fetchTagStats } from "@/lib/solved-ac";
import { checkBadges } from "@/lib/score";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { RadarChart } from "@/components/radar-chart";
import { ProfileView } from "@/components/profile-view";

export default async function MyPage() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { badges: true },
    });

    if (!user) {
        redirect("/login");
    }

    const tagStats = await fetchTagStats(user.bojHandle);
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

    const classRank = await prisma.user.count({
        where: {
            campus: user.campus,
            classNum: user.classNum,
            totalPoint: { gt: user.totalPoint },
        },
    }) + 1;

    const classTotal = await prisma.user.count({
        where: { campus: user.campus, classNum: user.classNum },
    });


    // Rank info calculation
    const rankInfo = {
        text: "반",
        rank: classRank,
        total: classTotal
    };

    return (
        <ProfileView
            user={user}
            chartData={chartData}
            earnedBadges={earnedBadges}
            rankInfo={rankInfo}
            isMyPage={true}
        />
    );
}
