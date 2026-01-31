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
                    {/* PWA 설치 안내 */}
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-[#3282F6] bg-[#EFF6FF] px-2 py-0.5 rounded mt-0.5 shrink-0">
                            New
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[#1A1A1A] mb-2">
                                앱으로 더 편하게 이용해보세요! (PWA 설치)
                            </p>
                            <div className="text-xs text-[#6B7280] space-y-1.5 bg-gray-50 p-2.5 rounded-lg">
                                <p className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[#4A4A4A]">Android (Chrome):</span>
                                    <span>브라우저 메뉴(⋮) → 앱 설치 / 홈 화면에 추가</span>
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[#4A4A4A]">iOS (Safari):</span>
                                    <span>공유 버튼(⎋) → 홈 화면에 추가</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
