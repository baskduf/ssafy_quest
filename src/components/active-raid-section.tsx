"use client";

import Link from "next/link";
import { Swords, Heart, Trophy, ChevronRight } from "lucide-react";

interface ActiveRaidProps {
    raids: {
        id: string;
        title: string;
        imageUrl: string | null;
        currentHp: number;
        maxHp: number;
        bonusPoint: number;
        _count: {
            participations: number;
        };
    }[];
}

export function ActiveRaidSection({ raids }: ActiveRaidProps) {
    if (raids.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 w-full mt-8 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#4A4A4A] flex items-center gap-2">
                    <Swords className="w-4 h-4 text-red-500" />
                    진행중인 레이드
                </h3>
                <Link
                    href="/raid"
                    className="text-xs text-[#9CA3AF] hover:text-[#3282F6] flex items-center gap-1 transition-colors"
                >
                    전체보기
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {raids.slice(0, 2).map((raid) => {
                    const hpPercent = Math.round((raid.currentHp / raid.maxHp) * 100);

                    return (
                        <Link
                            key={raid.id}
                            href={`/raid/${raid.id}`}
                            className="group flex gap-3 p-3 bg-white rounded-lg border border-[#E2E8F0] hover:border-[#3282F6] hover:shadow-sm transition-all"
                        >
                            {/* Boss Image */}
                            {raid.imageUrl ? (
                                <img
                                    src={raid.imageUrl}
                                    alt={raid.title}
                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                                    <Swords className="w-6 h-6 text-[#9CA3AF]" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#3282F6] transition-colors">
                                    {raid.title}
                                </h4>

                                {/* HP Bar */}
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Heart className="w-3 h-3 text-red-500 flex-shrink-0" />
                                    <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full transition-all"
                                            style={{ width: `${hpPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">
                                        {hpPercent}%
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                                    <span>{raid._count.participations}명 참여</span>
                                    {raid.bonusPoint > 0 && (
                                        <span className="flex items-center gap-0.5 text-[#3282F6]">
                                            <Trophy className="w-3 h-3 text-yellow-500" />
                                            +{raid.bonusPoint}P
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
