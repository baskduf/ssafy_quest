import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";


import { ClassRankingTable, ClassStat } from "@/components/ranking/class-ranking-table";
import { RandomProblems } from "@/components/random-problems";
import { MyClassButton } from "@/components/ranking/my-class-button";

import { Notice } from "@/components/notice";

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
  const [classStatsRaw, classRankingHistory] = await Promise.all([
    prisma.user.groupBy({
      by: ["campus", "classNum"],
      _sum: { totalPoint: true },
      _count: { id: true },
      _avg: { totalPoint: true },
      where: campus ? { campus } : undefined,
      orderBy: { _sum: { totalPoint: "desc" } },
    }),
    prisma.classRanking.findMany({
      where: params.campus ? { campus: params.campus } : undefined,
    })
  ]);

  const classStats: ClassStat[] = classStatsRaw.map((stat, index) => {
    // Find previous rank from history
    const history = classRankingHistory.find(
      (h) => h.campus === stat.campus && h.classNum === stat.classNum
    );

    return {
      campus: stat.campus,
      classNum: stat.classNum,
      totalPoint: stat._sum.totalPoint || 0,
      memberCount: stat._count.id,
      avgPoint: Math.round(stat._avg.totalPoint || 0),
      previousRank: history?.previousRank ?? null, // Add previousRank
    };
  });

  // Get user session and determine my class rank
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  let myClassRank: (ClassStat & { rank: number }) | undefined;

  if (session.isLoggedIn && session.campus && session.classNum) {
    const userCampus = session.campus;
    const userClassNum = session.classNum;

    const myClassStatIndex = classStats.findIndex(
      (s) => s.campus === userCampus && s.classNum === userClassNum
    );

    if (myClassStatIndex !== -1) {
      myClassRank = {
        ...classStats[myClassStatIndex],
        rank: myClassStatIndex + 1,
      };
    }
  }

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

          <div className="mt-6 flex flex-col items-center gap-2 animate-fade-in-up">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ec9a00] text-white text-xs font-bold rounded-full shadow-sm border border-[#d68b00]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Season 1</span>
            </div>
            <div className="text-[10px] sm:text-xs text-[#9CA3AF] bg-[#F3F4F6] px-3 py-1.5 rounded-md border border-[#E5E7EB] mt-1">
              <span className="font-semibold text-[#4B5563]">점수 산정:</span> (이번 달 푼 문제 × 50) + (티어 성장 점수)
            </div>
          </div>

          <Notice />
          <RandomProblems />
        </div>
      </section >

      {/* Tabs */}
      < section className="bg-white border-b border-[#E2E8F0]" >
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
      </section >

      {/* Filters */}
      < section className="bg-white border-b border-[#E2E8F0]" >
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
      </section >

      {/* Table */}
      < section className="max-w-4xl mx-auto px-3 sm:px-4 py-4" >
        <ClassRankingTable statistics={classStats} myRankInfo={myClassRank} />
      </section >
    </div >
  );
}
