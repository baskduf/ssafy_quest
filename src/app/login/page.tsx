"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [ssafyId, setSsafyId] = useState("");
    const [ssafyPwd, setSsafyPwd] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ssafyId, ssafyPwd }),
            });

            const data = await response.json();

            if (data.success) {
                if (data.isNewUser) {
                    router.push(`/register?ssafyId=${encodeURIComponent(ssafyId)}`);
                } else {
                    router.push("/mypage");
                    router.refresh();
                }
            } else {
                setError(data.message || "로그인에 실패했습니다.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-8">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">로그인</h1>
                    <p className="text-sm text-[#9CA3AF] mb-8">
                        SSAFY 계정으로 로그인하세요
                    </p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                                SSAFY ID
                            </label>
                            <input
                                type="text"
                                placeholder="이메일을 입력하세요"
                                value={ssafyId}
                                onChange={(e) => setSsafyId(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                value={ssafyPwd}
                                onChange={(e) => setSsafyPwd(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !ssafyId || !ssafyPwd}
                            className="w-full py-3 text-sm font-medium text-white bg-[#3282F6] hover:bg-[#2563EB] disabled:bg-[#9CA3AF] rounded-lg transition-colors"
                        >
                            {isLoading ? "로그인 중..." : "로그인"}
                        </button>

                        <p className="text-xs text-[#9CA3AF] text-center pt-2">
                            처음 로그인하시면 회원가입 페이지로 이동합니다.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
