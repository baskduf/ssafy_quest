import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="text-center px-8">
                <h1 className="text-6xl font-bold text-[#1A1A1A] mb-4">404</h1>
                <p className="text-[#9CA3AF] mb-8">해당 사용자를 찾을 수 없습니다.</p>
                <Link
                    href="/ranking"
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-[#3282F6] hover:bg-[#2563EB] rounded-lg transition-colors"
                >
                    랭킹으로 돌아가기
                </Link>
            </div>
        </div>
    );
}
