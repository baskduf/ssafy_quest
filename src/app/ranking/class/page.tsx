import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClassRankingTable, ClassStat } from "@/components/ranking/class-ranking-table";

export const revalidate = 3600;

interface SearchParams {
    campus?: string;
}

export default async function ClassRankingPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const campus = params.campus;

    const classStatsRaw = await prisma.user.groupBy({
        by: ["campus", "classNum"],
        _sum: { totalPoint: true },
        _count: { id: true },
        _avg: { totalPoint: true },
        where: campus ? { campus } : undefined,
        orderBy: { _sum: { totalPoint: "desc" } },
    });

    const classStats: ClassStat[] = classStatsRaw.map((stat) => ({
        campus: stat.campus,
        classNum: stat.classNum,
        totalPoint: stat._sum.totalPoint || 0,
        memberCount: stat._count.id,
        avgPoint: Math.round(stat._avg.totalPoint || 0),
    }));

    const campuses = ["서울", "대전", "구미", "광주", "부울경"];

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <section className="bg-white border-b border-[#E2E8F0]">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1A1A1A]">반별 순위</h1>
                            <p className="text-sm text-[#9CA3AF] mt-1">
                                {campus || "전체 캠퍼스"}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href="/ranking"
                                className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:border-[#3282F6] rounded-lg transition-colors"
                            >
                                개인
                            </Link>
                            <Link
                                href="/ranking/class"
                                className="px-4 py-2 text-sm font-medium text-white bg-[#3282F6] rounded-lg"
                            >
                                반별
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="bg-white border-b border-[#E2E8F0]">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#9CA3AF] mr-2">캠퍼스:</span>
                        <Link
                            href="/ranking/class"
                            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors ${!campus
                                ? "border-[#3282F6] bg-[#3282F6]/10 text-[#3282F6] font-medium"
                                : "border-[#E2E8F0] text-[#4A4A4A] hover:border-[#3282F6]"
                                }`}
                        >
                            전체
                        </Link>
                        {campuses.map((c) => (
                            <Link
                                key={c}
                                href={`/ranking/class?campus=${encodeURIComponent(c)}`}
                                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors ${campus === c
                                    ? "border-[#3282F6] bg-[#3282F6]/10 text-[#3282F6] font-medium"
                                    : "border-[#E2E8F0] text-[#4A4A4A] hover:border-[#3282F6]"
                                    }`}
                            >
                                {c}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
                <ClassRankingTable statistics={classStats} />
            </section>

            {/* Info */}
            <section className="max-w-4xl mx-auto px-3 sm:px-4 pb-4 sm:pb-8">
                <p className="text-xs text-[#9CA3AF]">
                    총점 = 반 전체 멤버의 개인 점수 합계
                </p>
            </section>
        </div>
    );
}
