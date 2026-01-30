"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CAMPUSES = ["서울", "대전", "구미", "광주", "부울경"];

type Step = "ssafy_auth" | "boj_register";

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSsafyId = searchParams.get("ssafyId") || "";

    const [step, setStep] = useState<Step>(initialSsafyId ? "boj_register" : "ssafy_auth");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [ssafyId, setSsafyId] = useState(initialSsafyId);
    const [ssafyPwd, setSsafyPwd] = useState("");
    const [formData, setFormData] = useState({
        bojHandle: "",
        campus: "",
        classNum: "",
        name: "",
    });

    const handleSsafyAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/ssafy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: ssafyId, userPwd: ssafyPwd }),
            });

            const data = await response.json();

            if (data.success) {
                setStep("boj_register");
            } else {
                setError(data.message || "인증에 실패했습니다.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ssafyId,
                    ...formData,
                    classNum: parseInt(formData.classNum),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "등록에 실패했습니다.");
            }

            router.push("/mypage");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step === "ssafy_auth" ? "text-[#3282F6]" : "text-[#9CA3AF]"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === "ssafy_auth" ? "bg-[#3282F6] text-white" : "bg-[#E2E8F0] text-[#9CA3AF]"
                            }`}>1</span>
                        <span className="text-sm font-medium">인증</span>
                    </div>
                    <div className="w-12 h-px bg-[#E2E8F0]" />
                    <div className={`flex items-center gap-2 ${step === "boj_register" ? "text-[#3282F6]" : "text-[#9CA3AF]"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === "boj_register" ? "bg-[#3282F6] text-white" : "bg-[#E2E8F0] text-[#9CA3AF]"
                            }`}>2</span>
                        <span className="text-sm font-medium">등록</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E2E8F0] p-8">
                    {step === "ssafy_auth" ? (
                        <>
                            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">SSAFY 인증</h1>
                            <p className="text-sm text-[#9CA3AF] mb-8">
                                SSAFY 계정으로 본인 인증을 진행합니다
                            </p>

                            <form onSubmit={handleSsafyAuth} className="space-y-5">
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
                                    {isLoading ? "인증 중..." : "인증하기"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">정보 등록</h1>
                            <p className="text-sm text-[#9CA3AF] mb-8">
                                백준 계정과 기본 정보를 입력해주세요
                            </p>

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                                        백준 아이디
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="solved.ac 닉네임"
                                        value={formData.bojHandle}
                                        onChange={(e) => setFormData({ ...formData, bojHandle: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="실명을 입력하세요"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                                        캠퍼스
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {CAMPUSES.map((campus) => (
                                            <button
                                                key={campus}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, campus })}
                                                className={`py-2.5 text-sm font-medium rounded-lg border transition-colors ${formData.campus === campus
                                                        ? "bg-[#3282F6] text-white border-[#3282F6]"
                                                        : "bg-white text-[#4A4A4A] border-[#E2E8F0] hover:border-[#3282F6]"
                                                    }`}
                                            >
                                                {campus}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                                        반 번호
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        placeholder="1-20"
                                        value={formData.classNum}
                                        onChange={(e) => setFormData({ ...formData, classNum: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep("ssafy_auth")}
                                        className="flex-1 py-3 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:border-[#3282F6] rounded-lg transition-colors"
                                    >
                                        이전
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !formData.bojHandle || !formData.name || !formData.campus || !formData.classNum}
                                        className="flex-[2] py-3 text-sm font-medium text-white bg-[#3282F6] hover:bg-[#2563EB] disabled:bg-[#9CA3AF] rounded-lg transition-colors"
                                    >
                                        {isLoading ? "등록 중..." : "등록완료"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
