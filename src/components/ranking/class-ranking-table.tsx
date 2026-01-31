import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface ClassStat {
    campus: string;
    classNum: number;
    totalPoint: number;
    memberCount: number;
    avgPoint: number;
}

interface ClassRankingTableProps {
    statistics: ClassStat[];
}

export function ClassRankingTable({ statistics }: ClassRankingTableProps) {
    if (statistics.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-8 text-center">
                <p className="text-[#9CA3AF]">아직 등록된 데이터가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
            <Table className="table-fixed w-full">
                <TableHeader className="bg-[#F8F9FA]">
                    <TableRow className="border-b border-[#E2E8F0] hover:bg-transparent">
                        <TableHead className="text-left text-xs font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[12%]">
                            순위
                        </TableHead>
                        <TableHead className="text-left text-xs font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[23%]">
                            반
                        </TableHead>
                        <TableHead className="text-left text-xs font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[15%]">
                            인원
                        </TableHead>
                        <TableHead className="text-left text-xs font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[25%]">
                            평균
                        </TableHead>
                        <TableHead className="text-left text-xs font-medium text-[#9CA3AF] py-2.5 px-2 whitespace-nowrap h-auto w-[25%]">
                            총점
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {statistics.map((stat, index) => (
                        <TableRow
                            key={`${stat.campus}-${stat.classNum}`}
                            className="border-t border-[#EEEEEE] hover:bg-[#F8F9FA] transition-colors"
                        >
                            <TableCell className="py-2.5 px-2 whitespace-nowrap">
                                <span
                                    className={`font-semibold text-xs ${index < 3 ? "text-[#3282F6]" : "text-[#4A4A4A]"
                                        }`}
                                >
                                    {index + 1}
                                </span>
                            </TableCell>
                            <TableCell className="py-2.5 px-2 whitespace-nowrap">
                                <Link
                                    href={`/ranking?campus=${encodeURIComponent(
                                        stat.campus
                                    )}&classNum=${stat.classNum}`}
                                    className="font-medium text-[#1A1A1A] hover:text-[#3282F6] text-xs sm:text-sm"
                                >
                                    <div className="font-medium text-[#1A1A1A] text-xs sm:text-sm">
                                        {stat.campus} {stat.classNum}반
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-[#9CA3AF]">멤버 보기</div>
                                </Link>
                            </TableCell>
                            <TableCell className="py-2.5 px-2 text-left text-[#4A4A4A] text-xs whitespace-nowrap">
                                {stat.memberCount}명
                            </TableCell>
                            <TableCell className="py-2.5 px-2 text-left text-[#4A4A4A] text-xs whitespace-nowrap">
                                {stat.avgPoint.toLocaleString()}
                            </TableCell>
                            <TableCell className="py-2.5 px-2 text-left font-semibold text-[#1A1A1A] text-xs sm:text-sm whitespace-nowrap">
                                {stat.totalPoint.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
