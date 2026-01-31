import Link from "next/link";
import { TierBadge } from "@/components/tier-badge";
import { getTierName } from "@/lib/solved-ac";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface User {
    id: string;
    bojHandle: string;
    name: string;
    campus: string;
    classNum: number;
    tier: number;
    solvedCount: number;
    maxStreak: number;
    totalPoint: number;
    previousRank: number | null;
}

interface UserRankingTableProps {
    users: User[];
}

function RankChange({
    currentRank,
    previousRank,
}: {
    currentRank: number;
    previousRank: number | null;
}) {
    if (previousRank === null) {
        return <span className="text-[10px] text-[#9CA3AF] ml-0.5">NEW</span>;
    }

    const diff = previousRank - currentRank;

    if (diff > 0) {
        return <span className="text-[10px] text-[#22C55E] ml-0.5">▲{diff}</span>;
    } else if (diff < 0) {
        return (
            <span className="text-[10px] text-[#EF4444] ml-0.5">
                ▼{Math.abs(diff)}
            </span>
        );
    }
    return <span className="text-[10px] text-[#9CA3AF] ml-0.5">-</span>;
}

export function UserRankingTable({ users }: UserRankingTableProps) {
    if (users.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-8 text-center">
                <p className="text-[#9CA3AF]">아직 등록된 사용자가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
            <Table className="table-fixed w-full">
                <TableHeader className="bg-[#F8F9FA]">
                    <TableRow className="border-b border-[#E2E8F0] hover:bg-transparent">
                        <TableHead className="text-left font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[12%]">
                            순위
                        </TableHead>
                        <TableHead className="text-left font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[18%]">
                            이름
                        </TableHead>
                        <TableHead className="text-left font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[26%]">
                            티어
                        </TableHead>
                        <TableHead className="text-left font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[19%]">
                            해결
                        </TableHead>
                        <TableHead className="text-left font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[25%]">
                            점수
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user: User, index: number) => {
                        const currentRank = index + 1;
                        return (
                            <TableRow
                                key={user.id}
                                className="border-t border-[#EEEEEE] hover:bg-[#F8F9FA] transition-colors"
                            >
                                <TableCell className="py-2.5 px-2 whitespace-nowrap">
                                    <span
                                        className={`font-semibold text-xs ${index < 3 ? "text-[#3282F6]" : "text-[#4A4A4A]"
                                            }`}
                                    >
                                        {currentRank}
                                    </span>
                                    <RankChange
                                        currentRank={currentRank}
                                        previousRank={user.previousRank}
                                    />
                                </TableCell>
                                <TableCell className="py-2.5 px-2 whitespace-nowrap w-[18%] overflow-hidden">
                                    <Link
                                        href={`/profile/${user.bojHandle}`}
                                        className="hover:text-[#3282F6] block truncate"
                                    >
                                        <div className="font-medium text-[#1A1A1A] text-xs sm:text-sm truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-[#9CA3AF] truncate">
                                            {user.campus} {user.classNum}반
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell className="py-2.5 px-2 text-xs text-[#4A4A4A] whitespace-nowrap">
                                    <TierBadge tier={user.tier} size="sm" />
                                </TableCell>
                                <TableCell className="py-2.5 px-2 text-left text-xs text-[#4A4A4A] whitespace-nowrap">
                                    {user.solvedCount}
                                </TableCell>
                                <TableCell className="py-2.5 px-2 text-left font-semibold text-[#1A1A1A] text-xs sm:text-sm whitespace-nowrap">
                                    {user.totalPoint.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
