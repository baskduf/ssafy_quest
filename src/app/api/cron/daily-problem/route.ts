import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchRandomProblems } from '@/lib/solved-ac';

export const dynamic = 'force-dynamic';

// Force recompile to load Prisma Client
export async function GET(request: Request) {
    try {
        console.log("Cron: Fetching daily random problems...");

        // Fetch new random problems
        const problems = await fetchRandomProblems(10);

        if (problems.length === 0) {
            console.error("Cron: Failed to fetch problems (empty list)");
            return NextResponse.json({ success: false, error: "No problems found" }, { status: 500 });
        }

        // Save to DB
        const daily = await prisma.dailyProblem.create({
            data: {
                problems: JSON.stringify(problems),
            },
        });

        console.log(`Cron: Saved ${problems.length} problems. ID: ${daily.id}`);

        return NextResponse.json({ success: true, count: problems.length, id: daily.id });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
