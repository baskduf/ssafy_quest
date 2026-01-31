/**
 * Admin Task Functions
 * Reusable functions for cron jobs and admin actions
 */

import { prisma } from "@/lib/prisma";
import { fetchUserFromSolvedAc, fetchRandomProblems } from "@/lib/solved-ac";
import { calculateTotalPoint, checkBadges } from "@/lib/score";

/**
 * Sync a single user's data from Solved.ac
 */
export async function syncUserFromSolvedAc(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const solvedAcData = await fetchUserFromSolvedAc(user.bojHandle);

    if (!solvedAcData) {
        throw new Error(`Failed to fetch Solved.ac data for ${user.bojHandle}`);
    }

    // Calculate new total point
    const totalPoint = calculateTotalPoint(
        solvedAcData.tier,
        solvedAcData.solvedCount,
        solvedAcData.maxStreak,
        user.initialTier,
        user.initialSolvedCount
    );

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            tier: solvedAcData.tier,
            rating: solvedAcData.rating,
            solvedCount: solvedAcData.solvedCount,
            maxStreak: solvedAcData.maxStreak,
            profileImage: solvedAcData.profileImageUrl,
            bio: solvedAcData.bio,
            totalPoint,
            lastUpdatedAt: new Date(),
        },
    });

    // Check and award new badges
    const badges = checkBadges(
        solvedAcData.tier,
        solvedAcData.solvedCount,
        solvedAcData.maxStreak
    );
    const earnedBadges = badges.filter((b) => b.earned);

    for (const badge of earnedBadges) {
        try {
            await prisma.badge.create({
                data: {
                    userId: userId,
                    type: badge.type,
                },
            });
        } catch {
            // Badge already exists, ignore
        }
    }

    return updatedUser;
}

/**
 * Sync all users' data from Solved.ac
 */
export async function syncAllUsers() {
    const users = await prisma.user.findMany({
        select: { id: true, bojHandle: true },
    });

    const results = {
        total: users.length,
        successCount: 0,
        failedCount: 0,
        errors: [] as string[],
    };

    for (const user of users) {
        try {
            await syncUserFromSolvedAc(user.id);
            results.successCount++;
            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
            results.failedCount++;
            results.errors.push(`${user.bojHandle}: ${error}`);
        }
    }

    return results;
}

/**
 * Update ranks for all users
 */
export async function updateRanks() {
    const users = await prisma.user.findMany({
        orderBy: { totalPoint: "desc" },
        select: { id: true, totalPoint: true },
    });

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

    return {
        success: true,
        updatedCount: users.length,
        updatedAt: now,
    };
}

/**
 * Fetch and save new daily problems
 */
export async function fetchDailyProblems(count: number = 10) {
    const problems = await fetchRandomProblems(count);

    if (problems.length === 0) {
        throw new Error("Failed to fetch problems from Solved.ac");
    }

    const daily = await prisma.dailyProblem.create({
        data: {
            problems: JSON.stringify(problems),
        },
    });

    return {
        success: true,
        count: problems.length,
        id: daily.id,
    };
}

/**
 * Reset season for all users
 */
export async function resetSeason(seasonName?: string) {
    const users = await prisma.user.findMany();
    const now = new Date();

    // Determine season name
    const actualSeasonName =
        seasonName ||
        (now.getDate() <= 5
            ? (() => {
                  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
              })()
            : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

    let updatedCount = 0;
    let historyCreated = 0;

    for (const user of users) {
        // Save season history if user had activity
        if (user.totalPoint > 0 || user.solvedCount > user.initialSolvedCount) {
            await prisma.seasonHistory.create({
                data: {
                    userId: user.id,
                    seasonName: actualSeasonName,
                    finalSolvedCount: user.solvedCount,
                    finalTier: user.tier,
                    earnedPoint: user.totalPoint,
                    rank: user.previousRank || 0,
                },
            });
            historyCreated++;
        }

        // Reset for new season
        await prisma.user.update({
            where: { id: user.id },
            data: {
                initialSolvedCount: user.solvedCount,
                initialTier: user.tier,
                totalPoint: 0,
                lastUpdatedAt: now,
            },
        });
        updatedCount++;
    }

    return {
        success: true,
        seasonName: actualSeasonName,
        updatedCount,
        historyCreated,
    };
}
