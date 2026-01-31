"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
    syncUserFromSolvedAc as syncUser,
    syncAllUsers as syncAll,
    updateRanks as updateRanksTask,
    fetchDailyProblems as fetchProblemsTask,
    resetSeason as resetSeasonTask,
} from "@/lib/admin-tasks";

/**
 * Revalidate all public pages
 */
function revalidateAllPages() {
    revalidatePath("/");
    revalidatePath("/ranking");
    revalidatePath("/ranking/class");
}

const ADMIN_EMAIL = "baskduf@gmail.com";

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    return session.isLoggedIn && session.ssafyId === ADMIN_EMAIL;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
    if (!(await isAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidateAllPages();
        return { success: true };
    } catch (error) {
        console.error("Delete user error:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

/**
 * Update a user's basic info
 */
export async function updateUser(
    userId: string,
    data: {
        name?: string;
        campus?: string;
        classNum?: number;
    }
) {
    if (!(await isAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
        });

        revalidateAllPages();
        return { success: true, user: updatedUser };
    } catch (error) {
        console.error("Update user error:", error);
        return { success: false, error: "Failed to update user" };
    }
}

/**
 * Sync a single user from Solved.ac
 */
export async function syncUserFromSolvedAc(userId: string) {
    if (!(await isAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await syncUser(userId);
        revalidateAllPages();
        return { success: true, user };
    } catch (error) {
        console.error("Sync user error:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Sync all users from Solved.ac
 */
export async function syncAllUsers() {
    if (!(await isAdmin())) {
        return { success: false as const, error: "Unauthorized" };
    }

    try {
        const result = await syncAll();
        revalidateAllPages();
        return { success: true as const, ...result };
    } catch (error) {
        console.error("Sync all users error:", error);
        return { success: false as const, error: String(error) };
    }
}

/**
 * Update all user ranks
 */
export async function updateRanks() {
    if (!(await isAdmin())) {
        return { success: false as const, error: "Unauthorized" };
    }

    try {
        const result = await updateRanksTask();
        revalidateAllPages();
        return result;
    } catch (error) {
        console.error("Update ranks error:", error);
        return { success: false as const, error: String(error) };
    }
}

/**
 * Fetch new daily problems
 */
export async function fetchDailyProblems() {
    if (!(await isAdmin())) {
        return { success: false as const, error: "Unauthorized" };
    }

    try {
        const result = await fetchProblemsTask();
        revalidateAllPages();
        return result;
    } catch (error) {
        console.error("Fetch daily problems error:", error);
        return { success: false as const, error: String(error) };
    }
}

/**
 * Reset season (archive current and start new)
 */
export async function resetSeason() {
    if (!(await isAdmin())) {
        return { success: false as const, error: "Unauthorized" };
    }

    try {
        const result = await resetSeasonTask();
        revalidateAllPages();
        return result;
    } catch (error) {
        console.error("Reset season error:", error);
        return { success: false as const, error: String(error) };
    }
}

/**
 * Get users with pagination and search
 */
export async function getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    campus?: string;
}) {
    if (!(await isAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 20, search, campus } = options;
    const skip = (page - 1) * limit;

    try {
        const where: {
            AND?: Array<{
                OR?: Array<{
                    name?: { contains: string };
                    ssafyId?: { contains: string };
                    bojHandle?: { contains: string };
                }>;
                campus?: string;
            }>;
        } = {};

        if (search || campus) {
            where.AND = [];
            if (search) {
                where.AND.push({
                    OR: [
                        { name: { contains: search } },
                        { ssafyId: { contains: search } },
                        { bojHandle: { contains: search } },
                    ],
                });
            }
            if (campus) {
                where.AND.push({ campus });
            }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    ssafyId: true,
                    bojHandle: true,
                    campus: true,
                    classNum: true,
                    tier: true,
                    solvedCount: true,
                    totalPoint: true,
                    lastUpdatedAt: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            success: true,
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error("Get users error:", error);
        return { success: false, error: String(error) };
    }
}
