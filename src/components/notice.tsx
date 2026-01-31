import { Megaphone } from "lucide-react";

export function Notice() {
    return (
        <div className="max-w-4xl mx-auto px-4 w-full mt-12">
            <h3 className="text-sm font-bold text-[#4A4A4A] mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#F59E0B]" />
                공지사항
                <span className="text-xs font-normal text-[#9CA3AF] bg-gray-100 px-2 py-0.5 rounded-full">
                    Notice
                </span>
            </h3>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:border-[#3282F6] transition-all text-left">
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded mt-0.5 shrink-0">
                            Beta
                        </span>
                        <div>
                            <p className="text-sm font-medium text-[#1A1A1A]">
                                현재 베타테스트 중입니다.
                            </p>
                        </div>
                    </div>
                    {/* 추가 공지사항이 있다면 여기에 추가 */}
                </div>
            </div>
        </div>
    );
}
