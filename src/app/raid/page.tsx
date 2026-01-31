import { prisma } from "@/lib/prisma";
import { RaidStatus } from "@prisma/client";
import Link from "next/link";
import { Swords, Ghost, Castle, Users, Clock, Trophy } from "lucide-react";

async function getActiveRaids() {
    const raids = await prisma.raid.findMany({
        where: {
            status: {
                in: [RaidStatus.ACTIVE, RaidStatus.READY]
            }
        },
        orderBy: { startAt: 'asc' },
        include: {
            _count: {
                select: { participations: true }
            }
        }
    });
    return raids;
}

async function getCompletedRaids() {
    const raids = await prisma.raid.findMany({
        where: {
            status: {
                in: [RaidStatus.SUCCESS, RaidStatus.FAIL]
            }
        },
        orderBy: { endAt: 'desc' },
        take: 10,
        include: {
            _count: {
                select: { participations: true }
            }
        }
    });
    return raids;
}

function getStatusBadge(status: RaidStatus) {
    const styles: Record<RaidStatus, { bg: string; text: string; label: string }> = {
        READY: { bg: 'bg-amber-100', text: 'text-amber-700', label: '곧 시작' },
        ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: '진행중' },
        SUCCESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: '클리어!' },
        FAIL: { bg: 'bg-red-100', text: 'text-red-700', label: '실패' },
    };
    const style = styles[status];
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}

export default async function RaidListPage() {
    const [activeRaids, completedRaids] = await Promise.all([
        getActiveRaids(),
        getCompletedRaids()
    ]);

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <section className="bg-white border-b border-[#E2E8F0] mb-8">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-50 rounded-full">
                            <Swords className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">클래스 레이드</h1>
                    <p className="text-sm text-[#4A4A4A]">
                        반 친구들과 함께 보스를 처치하세요!
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 pb-12">
                {/* Active Raids */}
                <section className="mb-12">
                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                        <Swords className="w-5 h-5 text-red-500" />
                        현재 진행중인 레이드
                    </h2>

                    {activeRaids.length > 0 ? (
                        <div className="space-y-4">
                            {activeRaids.map((raid) => {
                                const hpPercent = (raid.currentHp / raid.maxHp) * 100;
                                return (
                                    <Link
                                        key={raid.id}
                                        href={`/raid/${raid.id}`}
                                        className="block bg-white border border-[#E2E8F0] rounded-xl p-6 hover:border-[#3282F6] hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {raid.imageUrl ? (
                                                <img
                                                    src={raid.imageUrl}
                                                    alt={raid.title}
                                                    className="w-20 h-20 rounded-lg object-cover border border-[#E2E8F0]"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-3xl border border-[#E2E8F0]">
                                                    <Ghost className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#3282F6] transition-colors truncate">
                                                        {raid.title}
                                                    </h3>
                                                    {getStatusBadge(raid.status)}
                                                </div>
                                                {raid.description && (
                                                    <p className="text-[#4A4A4A] text-sm mb-3 line-clamp-1">
                                                        {raid.description}
                                                    </p>
                                                )}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-red-500 font-medium text-xs">HP</span>
                                                        <span className="text-[#4A4A4A] font-mono text-xs">
                                                            {raid.currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${hpPercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-xs text-[#9CA3AF]">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        <span>{raid._count.participations}명 참여</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>~ {new Date(raid.endAt).toLocaleDateString("ko-KR")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-[#E2E8F0] flex flex-col items-center">
                            <div className="p-4 bg-gray-50 rounded-full mb-3">
                                <Castle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-[#4A4A4A] font-medium">현재 진행중인 레이드가 없습니다.</p>
                            <p className="text-[#9CA3AF] text-sm mt-1">곧 새로운 보스가 등장할 예정입니다!</p>
                        </div>
                    )}
                </section>

                {/* Completed Raids */}
                {completedRaids.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            완료된 레이드
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {completedRaids.map((raid) => (
                                <Link
                                    key={raid.id}
                                    href={`/raid/${raid.id}`}
                                    className="bg-white border border-[#E2E8F0] rounded-lg p-4 hover:border-[#3282F6] hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        {raid.imageUrl ? (
                                            <img
                                                src={raid.imageUrl}
                                                alt={raid.title}
                                                className="w-12 h-12 rounded-lg object-cover opacity-80"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center border border-[#E2E8F0]">
                                                <Ghost className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-[#1A1A1A] group-hover:text-[#3282F6] transition-colors truncate text-sm">
                                                    {raid.title}
                                                </span>
                                                {getStatusBadge(raid.status)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-1">
                                                <Users className="w-3 h-3" />
                                                <span>{raid._count.participations}명</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
