import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { RaidStatus } from "@prisma/client";
import { AttackButton } from "./attack-button";
import Link from "next/link";
import { ArrowLeft, Ghost, Skull, ExternalLink, Heart, Clock, Trophy, Swords } from "lucide-react";

async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

async function getRaid(id: string) {
    const raid = await prisma.raid.findUnique({
        where: { id },
        include: {
            participations: {
                where: { isSolved: true },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            campus: true,
                            classNum: true,
                            profileImage: true,
                        }
                    }
                },
                orderBy: { solvedAt: 'asc' }
            }
        }
    });
    return raid;
}

async function getUserParticipation(raidId: string, userId: string) {
    return prisma.raidParticipation.findUnique({
        where: { raidId_userId: { raidId, userId } }
    });
}

function getStatusInfo(status: RaidStatus, startAt: Date, endAt: Date) {
    const now = new Date();

    if (status === RaidStatus.SUCCESS) {
        return { label: "클리어!", color: "text-blue-400", canAttack: false };
    }
    if (status === RaidStatus.FAIL) {
        return { label: "실패", color: "text-red-400", canAttack: false };
    }
    if (status === RaidStatus.READY) {
        if (now < startAt) {
            return { label: "곧 시작", color: "text-amber-400", canAttack: false };
        }
    }
    if (status === RaidStatus.ACTIVE) {
        if (now > endAt) {
            return { label: "종료됨", color: "text-gray-400", canAttack: false };
        }
        return { label: "진행중", color: "text-green-400", canAttack: true };
    }
    return { label: "대기중", color: "text-gray-400", canAttack: false };
}

export default async function RaidDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [raid, session] = await Promise.all([
        getRaid(id),
        getSession()
    ]);

    if (!raid) {
        notFound();
    }

    const userParticipation = session.userId
        ? await getUserParticipation(id, session.userId)
        : null;

    const hpPercent = (raid.currentHp / raid.maxHp) * 100;
    const statusInfo = getStatusInfo(raid.status, raid.startAt, raid.endAt);
    const firstBlood = raid.participations[0];
    const isUserSolved = userParticipation?.isSolved ?? false;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link
                    href="/raid"
                    className="inline-flex items-center gap-1 text-[#9CA3AF] hover:text-[#4A4A4A] mb-6 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    레이드 목록
                </Link>

                {/* Boss Card */}
                <div className="relative bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/90 backdrop-blur shadow-sm border border-[#E2E8F0] ${statusInfo.color.replace('text-amber-400', 'text-amber-600').replace('text-green-400', 'text-green-600').replace('text-blue-400', 'text-blue-600').replace('text-red-400', 'text-red-600').replace('text-gray-400', 'text-gray-500')}`}>
                            {statusInfo.label}
                        </span>
                    </div>

                    {/* Boss Image & Info */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                            <div className={`relative ${isUserSolved ? '' : 'animate-pulse-slow'}`}>
                                {raid.imageUrl ? (
                                    <img
                                        src={raid.imageUrl}
                                        alt={raid.title}
                                        className="w-40 h-40 md:w-48 md:h-48 rounded-xl object-cover border border-[#E2E8F0] boss-image"
                                        id="boss-image"
                                    />
                                ) : (
                                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-6xl border border-[#E2E8F0]">
                                        <Ghost className="w-20 h-20 text-gray-300" />
                                    </div>
                                )}
                                {raid.status === RaidStatus.SUCCESS && (
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                                        <Skull className="w-16 h-16 text-white drop-shadow-lg" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
                                    {raid.title}
                                </h1>
                                {raid.description && (
                                    <p className="text-[#4A4A4A] mb-4">
                                        {raid.description}
                                    </p>
                                )}
                                <a
                                    href={`https://www.acmicpc.net/problem/${raid.problemId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] hover:border-[#3282F6] hover:text-[#3282F6] text-[#4A4A4A] rounded-lg transition-all font-medium shadow-sm text-sm hover:shadow-md"
                                >
                                    <span>백준 #{raid.problemId} 풀러가기</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* HP Bar */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-[#E2E8F0]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-red-500 font-bold flex items-center gap-2 text-sm">
                                    <Heart className="w-5 h-5 fill-red-500" /> HP
                                </span>
                                <span className="text-[#1A1A1A] font-mono text-lg font-medium">
                                    {raid.currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full h-4 bg-[#E2E8F0] rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                                    style={{ width: `${hpPercent}%` }}
                                />
                            </div>
                            {raid.bonusPoint > 0 && (
                                <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    <span className="text-[#4A4A4A]">클리어 보상:</span>
                                    <span className="font-bold text-[#3282F6]">+{raid.bonusPoint.toLocaleString()} 포인트</span>
                                </div>
                            )}
                        </div>

                        {/* Attack Button */}
                        <div className="mb-8 flex justify-center">
                            <AttackButton
                                raidId={raid.id}
                                isLoggedIn={session.isLoggedIn}
                                isSolved={isUserSolved}
                                canAttack={statusInfo.canAttack}
                                damagePerHit={raid.damagePerHit}
                                cooldownEndsAt={userParticipation?.lastAttemptAt
                                    ? new Date(userParticipation.lastAttemptAt.getTime() + 60000).toISOString()
                                    : null
                                }
                            />
                        </div>

                        {/* Time Info */}
                        <div className="flex items-center justify-center gap-6 text-xs text-[#9CA3AF] py-4 border-t border-[#E2E8F0]">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[#6B7280]">시작:</span>
                                {new Date(raid.startAt).toLocaleString("ko-KR")}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[#6B7280]">종료:</span>
                                {new Date(raid.endAt).toLocaleString("ko-KR")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* First Blood */}
                {firstBlood && (
                    <div className="mt-6 bg-white border border-[#E2E8F0] rounded-xl p-6">
                        <h3 className="text-[#1A1A1A] font-bold flex items-center gap-2 mb-3 text-sm">
                            <Trophy className="w-5 h-5 text-yellow-500" /> First Blood
                        </h3>
                        <div className="flex items-center gap-4">
                            {firstBlood.user.profileImage ? (
                                <img
                                    src={firstBlood.user.profileImage}
                                    alt={firstBlood.user.name}
                                    className="w-10 h-10 rounded-full border border-[#E2E8F0]"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] border border-[#E2E8F0] flex items-center justify-center text-[#9CA3AF] font-bold text-lg">
                                    {firstBlood.user.name[0]}
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-[#1A1A1A] text-sm">{firstBlood.user.name}</div>
                                <div className="text-xs text-[#4A4A4A]">
                                    {firstBlood.user.campus} {firstBlood.user.classNum}반 • {" "}
                                    {firstBlood.solvedAt && new Date(firstBlood.solvedAt).toLocaleString("ko-KR")}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Participants */}
                <div className="mt-6 bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <h3 className="text-[#1A1A1A] font-bold mb-4 flex items-center gap-2 text-sm">
                        <Swords className="w-5 h-5 text-[#4A4A4A]" /> 공격 성공 ({raid.participations.length})
                    </h3>
                    {raid.participations.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {raid.participations.map((p, index) => (
                                <div
                                    key={p.id}
                                    className={`p-3 rounded-lg flex items-center gap-3 border ${index === 0
                                        ? 'bg-white border-yellow-200 shadow-sm'
                                        : 'bg-white border-[#E2E8F0]'
                                        }`}
                                >
                                    <div className="shrink-0">
                                        {index === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> : <div className="w-4 h-4 rounded-full bg-gray-200" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-[#1A1A1A] text-sm truncate">
                                            {p.user.name}
                                        </div>
                                        <div className="text-xs text-[#6B7280]">
                                            {p.user.campus} {p.user.classNum}반
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Swords className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-[#9CA3AF] text-sm">
                                아직 공격에 성공한 유저가 없습니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add custom CSS for animations */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .boss-shake {
                    animation: shake 0.5s ease-in-out;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
