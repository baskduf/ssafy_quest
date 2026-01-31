import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RaidStatus } from "@prisma/client";

async function getRaids() {
    const raids = await prisma.raid.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { participations: true }
            },
            participations: {
                where: { isSolved: true },
                take: 1,
                orderBy: { solvedAt: 'asc' },
                include: {
                    user: {
                        select: { name: true }
                    }
                }
            }
        }
    });
    return raids;
}

function getStatusBadge(status: RaidStatus) {
    const styles: Record<RaidStatus, { bg: string; text: string; label: string }> = {
        READY: { bg: 'bg-gray-100', text: 'text-gray-700', label: '대기중' },
        ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: '진행중' },
        SUCCESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: '클리어' },
        FAIL: { bg: 'bg-red-100', text: 'text-red-700', label: '실패' },
    };
    const style = styles[status];
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}

export default async function AdminRaidsPage() {
    const raids = await getRaids();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">레이드 관리</h2>
                <Link
                    href="/admin/raids/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + 새 레이드 생성
                </Link>
            </div>

            {/* Raids Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                보스
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                문제
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                HP
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                상태
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                First Blood
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                기간
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {raids.map((raid) => {
                            const hpPercent = (raid.currentHp / raid.maxHp) * 100;
                            const firstBlood = raid.participations[0];
                            return (
                                <tr key={raid.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {raid.imageUrl && (
                                                <img
                                                    src={raid.imageUrl}
                                                    alt={raid.title}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{raid.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    참여자 {raid._count.participations}명
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`https://www.acmicpc.net/problem/${raid.problemId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            #{raid.problemId}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 transition-all"
                                                    style={{ width: `${hpPercent}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {raid.currentHp}/{raid.maxHp}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(raid.status)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {firstBlood ? (
                                            <span className="text-yellow-600 font-medium">
                                                🏆 {firstBlood.user.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{new Date(raid.startAt).toLocaleDateString("ko-KR")}</div>
                                        <div className="text-gray-400">
                                            ~ {new Date(raid.endAt).toLocaleDateString("ko-KR")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/raids/${raid.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            상세보기
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {raids.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        생성된 레이드가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
