"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TierBadge } from "@/components/tier-badge";
import { RadarChart } from "@/components/radar-chart";
import { LogoutButton } from "@/components/logout-button";
import { Badge, User } from "@prisma/client";

interface ChartData {
    tag: string;
    solved: number;
}

interface RaidBadge {
    id: string;
    raid: {
        id: string;
        title: string;
        imageUrl: string | null;
    };
}

interface ProfileViewProps {
    user: User & { badges: Badge[] };
    chartData: ChartData[];
    earnedBadges: { name: string; description: string; type: string; earned: boolean }[];
    raidBadges?: RaidBadge[];
    rankInfo: {
        text: string;
        rank: number;
        total: number;
    };
    isMyPage?: boolean;
}

export function ProfileView({ user, chartData, earnedBadges, raidBadges = [], rankInfo, isMyPage = false }: ProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user.name,
        campus: user.campus,
        classNum: user.classNum,
    });
    const router = useRouter();

    const handleEdit = () => {
        setEditForm({
            name: user.name,
            campus: user.campus,
            classNum: user.classNum,
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            } else {
                alert("정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert("오류가 발생했습니다.");
        }
    };

    const campuses = ["서울", "대전", "구미", "광주", "부울경"];

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <section className="bg-white border-b border-[#E2E8F0]">
                <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-[#3282F6] bg-blue-50 text-[#3282F6]">
                                    {rankInfo.text} {rankInfo.rank}위 / {rankInfo.total}명
                                </span>
                            </div>

                            {/* Profile Info Area */}
                            <div className="space-y-1">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="text-xl sm:text-2xl font-bold text-[#1A1A1A] border-b-2 border-[#3282F6] px-1 py-0.5 w-40 focus:outline-none bg-transparent"
                                                placeholder="이름"
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="relative">
                                                <select
                                                    value={editForm.campus}
                                                    onChange={(e) => setEditForm({ ...editForm, campus: e.target.value })}
                                                    className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:border-[#3282F6]"
                                                >
                                                    {campuses.map((c) => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={editForm.classNum}
                                                    onChange={(e) => setEditForm({ ...editForm, classNum: parseInt(e.target.value) })}
                                                    className="w-16 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#3282F6]"
                                                    min={1}
                                                    max={30}
                                                />
                                                <span className="text-sm text-[#4A4A4A]">반</span>
                                            </div>
                                            <span className="text-sm text-[#9CA3AF]">/ {user.bojHandle}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-1">{user.name}</h1>
                                        <p className="text-sm text-[#9CA3AF]">
                                            {user.campus} {user.classNum}반 / {user.bojHandle}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 self-start mt-2 sm:mt-0">
                            {isMyPage && (
                                <>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="px-4 py-2 text-sm font-medium text-white bg-[#3282F6] rounded-lg hover:bg-[#2563EB] transition-colors"
                                            >
                                                저장
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:bg-[#F8F9FA] rounded-lg transition-colors"
                                            >
                                                취소
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={`/profile/${user.bojHandle}`}
                                                className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:border-[#3282F6] hover:text-[#3282F6] rounded-lg transition-colors"
                                            >
                                                공개 프로필
                                            </Link>
                                            <button
                                                onClick={handleEdit}
                                                className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:border-[#3282F6] hover:text-[#3282F6] rounded-lg transition-colors"
                                            >
                                                정보 수정
                                            </button>
                                            <LogoutButton />
                                        </>
                                    )}
                                </>
                            )}
                            {!isMyPage && (
                                <Link
                                    href="/"
                                    className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:border-[#3282F6] rounded-lg transition-colors"
                                >
                                    랭킹으로 돌아가기
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
                        <div className="text-xl font-bold text-[#1A1A1A] mb-1">{user.totalPoint.toLocaleString()}</div>
                        <div className="text-xs text-[#9CA3AF]">총점</div>
                    </div>

                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
                        <div className="mb-1">
                            <TierBadge tier={user.tier} size="md" />
                        </div>
                        <div className="text-xs text-[#9CA3AF]">티어</div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
                        <div className="text-xl font-bold text-[#1A1A1A] mb-1">{user.solvedCount}</div>
                        <div className="text-xs text-[#9CA3AF]">해결한 문제</div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
                        <div className="text-xl font-bold text-[#1A1A1A] mb-1">{user.maxStreak}일</div>
                        <div className="text-xs text-[#9CA3AF]">최대 스트릭</div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 col-span-2 sm:col-span-1">
                        <div className="text-xl font-bold text-[#1A1A1A] mb-1">{user.rating}</div>
                        <div className="text-xs text-[#9CA3AF]">레이팅</div>
                    </div>
                </div>
            </section>

            {/* Algorithm Chart */}
            <section className="max-w-4xl mx-auto px-4 pb-6">
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A] mb-4">알고리즘 역량</h2>
                    <div className="flex justify-center">
                        <RadarChart data={chartData} />
                    </div>
                </div>
            </section>

            {/* Badges */}
            {earnedBadges.length > 0 && (
                <section className="max-w-4xl mx-auto px-4 pb-6">
                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A] mb-4">획득한 배지</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {earnedBadges.map((badge) => (
                                <div key={badge.type} className="border border-[#E2E8F0] rounded-lg p-3">
                                    <div className="font-medium text-[#1A1A1A] mb-1 text-sm">{badge.name.replace(/^\S+\s/, '')}</div>
                                    <div className="text-xs text-[#9CA3AF]">{badge.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Raid Badges */}
            {raidBadges.length > 0 && (
                <section className="max-w-4xl mx-auto px-4 pb-6">
                    <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A] mb-4">레이드 클리어</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                            {raidBadges.map((rb) => (
                                <Link
                                    key={rb.id}
                                    href={`/raid/${rb.raid.id}`}
                                    className="flex flex-col items-center p-2 border border-[#E2E8F0] rounded-lg hover:border-[#3282F6] hover:shadow-sm transition-all"
                                >
                                    {rb.raid.imageUrl ? (
                                        <img
                                            src={rb.raid.imageUrl}
                                            alt={rb.raid.title}
                                            className="w-12 h-12 rounded-lg object-cover mb-2"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-2">
                                            👹
                                        </div>
                                    )}
                                    <span className="text-xs text-[#4A4A4A] text-center truncate w-full">{rb.raid.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer Info */}
            <section className="max-w-4xl mx-auto px-4 pb-6">
                <p className="text-xs text-[#9CA3AF]">
                    마지막 업데이트: {user.lastUpdatedAt?.toLocaleString("ko-KR") || "없음"}
                </p>
            </section>
        </div>
    );
}
