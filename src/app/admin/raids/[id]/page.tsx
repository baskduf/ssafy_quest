import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RaidStatus } from "@prisma/client";
import { RaidStatusControl, DeleteRaidButton } from "./client-components";

async function getRaid(id: string) {
    const raid = await prisma.raid.findUnique({
        where: { id },
        include: {
            participations: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            bojHandle: true,
                            campus: true,
                            classNum: true,
                        }
                    }
                },
                orderBy: { solvedAt: 'asc' }
            }
        }
    });
    return raid;
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
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}

export default async function AdminRaidDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const raid = await getRaid(id);

    if (!raid) {
        notFound();
    }

    const hpPercent = (raid.currentHp / raid.maxHp) * 100;
    const solvedParticipants = raid.participations.filter(p => p.isSolved);
    const pendingParticipants = raid.participations.filter(p => !p.isSolved);
    const firstBlood = solvedParticipants[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/raids"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ← 목록으로
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">{raid.title}</h2>
                    {getStatusBadge(raid.status)}
                </div>
                <DeleteRaidButton raidId={raid.id} />
            </div>

            {/* Boss Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex gap-6">
                        {raid.imageUrl && (
                            <img
                                src={raid.imageUrl}
                                alt={raid.title}
                                className="w-40 h-40 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">보스 정보</h3>
                            {raid.description && (
                                <p className="text-gray-600 mb-4">{raid.description}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">문제 번호:</span>
                                    <a
                                        href={`https://www.acmicpc.net/problem/${raid.problemId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:underline"
                                    >
                                        #{raid.problemId}
                                    </a>
                                </div>
                                <div>
                                    <span className="text-gray-500">공격당 데미지:</span>
                                    <span className="ml-2 font-medium">{raid.damagePerHit}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">시작:</span>
                                    <span className="ml-2">{new Date(raid.startAt).toLocaleString("ko-KR")}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">종료:</span>
                                    <span className="ml-2">{new Date(raid.endAt).toLocaleString("ko-KR")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HP Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">HP</span>
                            <span className="text-sm text-gray-600">
                                {raid.currentHp} / {raid.maxHp}
                            </span>
                        </div>
                        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                                style={{ width: `${hpPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Status Control */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">상태 관리</h3>
                    <RaidStatusControl raidId={raid.id} currentStatus={raid.status} />

                    {firstBlood && (
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="text-sm text-yellow-700 font-medium flex items-center gap-2">
                                🏆 First Blood
                            </div>
                            <div className="mt-1 font-semibold text-yellow-800">
                                {firstBlood.user.name}
                            </div>
                            <div className="text-xs text-yellow-600">
                                {firstBlood.solvedAt && new Date(firstBlood.solvedAt).toLocaleString("ko-KR")}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-700">{solvedParticipants.length}</div>
                            <div className="text-sm text-green-600">공격 성공</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-700">{pendingParticipants.length}</div>
                            <div className="text-sm text-gray-600">대기중</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    공격 성공 유저 ({solvedParticipants.length})
                </h3>
                {solvedParticipants.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {solvedParticipants.map((p, index) => (
                            <div
                                key={p.id}
                                className={`p-4 rounded-lg border ${index === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {index === 0 && <span>🏆</span>}
                                    <span className="font-medium">{p.user.name}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {p.user.campus} {p.user.classNum}반
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {p.solvedAt && new Date(p.solvedAt).toLocaleString("ko-KR")}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">아직 공격에 성공한 유저가 없습니다.</p>
                )}
            </div>
        </div>
    );
}
