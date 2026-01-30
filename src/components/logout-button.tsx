"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E2E8F0] hover:border-[#3282F6] rounded-lg transition-colors disabled:opacity-50"
        >
            {isLoading ? "..." : "로그아웃"}
        </button>
    );
}
