import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";


import { ClassRankingTable, ClassStat } from "@/components/ranking/class-ranking-table";
import { RandomProblems } from "@/components/random-problems";
import { MyClassButton } from "@/components/ranking/my-class-button";

export const revalidate = 3600;

interface SearchParams {
  campus?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const campus = params.campus;

  const totalUsers = await prisma.user.count();

  // Get class rankings
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
      {/* Hero Section */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 flex flex-col items-center text-center">
          <div className="mb-3">
            <Image
              src="/assets/SSAFY.png"
              alt="SSAFY"
              width={300}
              height={90}
              className="w-auto h-16 sm:h-20"
              priority
            />
          </div>
          <p className="text-sm text-[#4A4A4A] mb-2">
            SSAFY인들을 위한 백준 알고리즘 랭킹 서비스
          </p>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">
            현재 <span className="font-bold text-[#1A1A1A]">{totalUsers}</span>명이 서비스를 사용중이에요
          </p>
          <p className="text-[10px] sm:text-xs text-[#9CA3AF] mt-1">
            * 랭킹과 문제는 매일 자정(00시)에 업데이트 됩니다.
          </p>

          <RandomProblems />
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-3 py-3 text-sm font-medium text-[#3282F6] border-b-2 border-[#3282F6]"
            >
              반별 순위
            </Link>
            <Link
              href="/ranking"
              className="px-3 py-3 text-sm font-medium text-[#9CA3AF] hover:text-[#4A4A4A]"
            >
              개인 순위
            </Link>
            <MyClassButton />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/"
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
                href={`/?campus=${encodeURIComponent(c)}`}
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
    </div>
  );
}
