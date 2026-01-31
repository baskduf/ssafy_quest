"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Swords, Clock, CheckCircle } from "lucide-react";

interface AttackButtonProps {
    raidId: string;
    isLoggedIn: boolean;
    isSolved: boolean;
    canAttack: boolean;
    damagePerHit: number;
    cooldownEndsAt: string | null;
}

export function AttackButton({
    raidId,
    isLoggedIn,
    isSolved,
    canAttack,
    damagePerHit,
    cooldownEndsAt,
}: AttackButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    // Calculate cooldown
    useEffect(() => {
        if (!cooldownEndsAt) return;

        const endTime = new Date(cooldownEndsAt).getTime();

        const updateCooldown = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            setCooldownSeconds(remaining);
        };

        updateCooldown();
        const interval = setInterval(updateCooldown, 1000);

        return () => clearInterval(interval);
    }, [cooldownEndsAt]);

    const triggerConfetti = useCallback(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    const shakeBoss = useCallback(() => {
        const bossImage = document.getElementById("boss-image");
        if (bossImage) {
            bossImage.classList.add("boss-shake");
            setTimeout(() => bossImage.classList.remove("boss-shake"), 500);
        }
    }, []);

    const handleAttack = async () => {
        if (loading || cooldownSeconds > 0) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/raids/${raidId}/attack`, {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === "COOLDOWN") {
                    setCooldownSeconds(data.remainingSeconds);
                }
                setMessage({ type: "error", text: data.error || "공격에 실패했습니다." });
                return;
            }

            if (data.isSolved) {
                setMessage({
                    type: "success",
                    text: `공격 성공! ${damagePerHit} 데미지를 입혔습니다!`
                });
                triggerConfetti();
                shakeBoss();

                // Refresh after a short delay
                setTimeout(() => {
                    router.refresh();
                }, 1500);
            } else {
                setMessage({
                    type: "info",
                    text: "아직 문제를 풀지 않았습니다. 백준에서 문제를 해결하고 다시 시도하세요!"
                });
                // Start cooldown
                setCooldownSeconds(60);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
        } finally {
            setLoading(false);
        }
    };

    // Already solved state
    if (isSolved) {
        return (
            <div className="text-center">
                <button
                    disabled
                    className="relative px-12 py-5 rounded-xl font-bold text-lg bg-[#F8F9FA] border-2 border-[#E2E8F0] text-[#9CA3AF] cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                >
                    <div className="absolute inset-0 bg-gray-100/50 rounded-xl" />
                    <Swords className="w-6 h-6" />
                    <div className="relative z-10 flex flex-col items-start">
                        <span className="text-gray-900 font-extrabold text-base">ATTACKED</span>
                        <span className="text-xs font-normal">데미지 입힘</span>
                    </div>
                </button>
            </div>
        );
    }

    // Not logged in
    if (!isLoggedIn) {
        return (
            <div className="text-center">
                <button
                    onClick={() => router.push("/login")}
                    className="px-8 py-4 bg-[#3282F6] hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                    로그인하고 참여하기
                </button>
            </div>
        );
    }

    // Can't attack (raid not active)
    if (!canAttack) {
        return (
            <div className="text-center">
                <button
                    disabled
                    className="px-8 py-4 bg-[#F3F4F6] text-[#9CA3AF] border border-[#E2E8F0] rounded-xl font-bold cursor-not-allowed"
                >
                    현재 공격할 수 없습니다
                </button>
            </div>
        );
    }

    return (
        <div className="text-center relative">
            {/* Confetti */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: "-20px",
                                animationDelay: `${Math.random() * 0.5}s`,
                                backgroundColor: ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'][Math.floor(Math.random() * 6)],
                                width: "10px",
                                height: "10px",
                                borderRadius: Math.random() > 0.5 ? "50%" : "0",
                            }}
                        />
                    ))}
                </div>
            )}

            <button
                onClick={handleAttack}
                disabled={loading || cooldownSeconds > 0}
                className={`
                    relative px-12 py-5 rounded-xl font-bold text-lg transition-all transform flex items-center justify-center gap-2
                    ${cooldownSeconds > 0
                        ? "bg-[#F3F4F6] text-[#9CA3AF] border border-[#E2E8F0] cursor-not-allowed"
                        : loading
                            ? "bg-orange-500 text-white"
                            : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white hover:scale-105 active:scale-95 shadow-lg"
                    }
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        확인 중...
                    </span>
                ) : cooldownSeconds > 0 ? (
                    <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> {cooldownSeconds}초 후 재시도
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Swords className="w-5 h-5" /> 공격하기
                    </span>
                )}
            </button>

            {/* Message */}
            {message && (
                <div className={`
                    mt-4 p-4 rounded-lg text-sm
                    ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : ""}
                    ${message.type === "error" ? "bg-red-50 border border-red-200 text-red-700" : ""}
                    ${message.type === "info" ? "bg-blue-50 border border-blue-200 text-blue-700" : ""}
                `}>
                    {message.text}
                </div>
            )}

            {/* Confetti CSS */}
            <style>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti-fall 3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
