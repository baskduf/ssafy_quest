import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
    const [totalUsers, campusStats, lastRankUpdate, dailyProblemCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
            by: ["campus"],
            _count: { id: true },
        }),
        prisma.user.findFirst({
            where: { rankUpdatedAt: { not: null } },
            orderBy: { rankUpdatedAt: "desc" },
            select: { rankUpdatedAt: true },
        }),
        prisma.dailyProblem.count(),
    ]);

    return {
        totalUsers,
        campusStats,
        lastRankUpdate: lastRankUpdate?.rankUpdatedAt,
        dailyProblemCount,
    };
}

export default async function AdminPage() {
    const stats = await getStats();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {stats.totalUsers}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Daily Problems</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {stats.dailyProblemCount}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Last Rank Update</div>
                    <div className="text-lg font-medium text-gray-900">
                        {stats.lastRankUpdate
                            ? new Date(stats.lastRankUpdate).toLocaleString("ko-KR")
                            : "Never"}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Campuses</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {stats.campusStats.length}
                    </div>
                </div>
            </div>

            {/* Campus Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Users by Campus
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {stats.campusStats.map((campus) => (
                        <div
                            key={campus.campus}
                            className="bg-gray-50 rounded-lg p-4 text-center"
                        >
                            <div className="text-sm text-gray-500">{campus.campus}</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {campus._count.id}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h3>
                <div className="flex gap-4">
                    <Link
                        href="/admin/users"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Manage Users
                    </Link>
                    <Link
                        href="/admin/system"
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        System Controls
                    </Link>
                </div>
            </div>
        </div>
    );
}
