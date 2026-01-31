import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchRandomProblems } from "@/lib/solved-ac";
import { ProblemCarousel } from "@/components/problem-carousel";

export async function RandomProblems() {
    // 캐시 비활성화 - 항상 최신 데이터 조회
    noStore();

    // DB에서 최신 데이터 조회
    const daily = await prisma.dailyProblem.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    let problems = [];

    if (daily) {
        try {
            problems = JSON.parse(daily.problems);
        } catch (e) {
            console.error("Failed to parse daily problems JSON", e);
        }
    }

    // 데이터가 없거나 파싱 실패 시 실시간 API 호출 (Fallback)
    if (!problems || problems.length === 0) {
        problems = await fetchRandomProblems(10);
    }

    if (problems.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 w-full mt-12 mb-10">
            <h3 className="text-sm font-bold text-[#4A4A4A] mb-3 flex items-center gap-2">
                🎲 오늘의 도전 문제
                <span className="text-xs font-normal text-[#9CA3AF] bg-gray-100 px-2 py-0.5 rounded-full">
                    Silver ~ Gold random
                </span>
            </h3>
            <ProblemCarousel problems={problems} />
        </div>
    );
}
