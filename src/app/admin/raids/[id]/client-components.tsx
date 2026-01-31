"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RaidStatus } from "@prisma/client";

export function RaidStatusControl({
    raidId,
    currentStatus,
}: {
    raidId: string;
    currentStatus: RaidStatus;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (newStatus: RaidStatus) => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/raids/${raidId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            router.refresh();
        } catch (error) {
            console.error(error);
            alert("상태 변경에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const statusButtons: { status: RaidStatus; label: string; color: string }[] = [
        { status: "READY", label: "대기중", color: "bg-gray-200 hover:bg-gray-300 text-gray-700" },
        { status: "ACTIVE", label: "진행중", color: "bg-green-500 hover:bg-green-600 text-white" },
        { status: "SUCCESS", label: "클리어", color: "bg-blue-500 hover:bg-blue-600 text-white" },
        { status: "FAIL", label: "실패", color: "bg-red-500 hover:bg-red-600 text-white" },
    ];

    return (
        <div className="space-y-2">
            {statusButtons.map(({ status, label, color }) => (
                <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={loading || currentStatus === status}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${currentStatus === status
                        ? "ring-2 ring-offset-2 ring-blue-500 " + color
                        : color + " opacity-60"
                        } disabled:opacity-50`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export function DeleteRaidButton({ raidId }: { raidId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/raids/${raidId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            router.push("/admin/raids");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("삭제에 실패했습니다.");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
            >
                {loading ? "삭제 중..." : "삭제"}
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">레이드 삭제</h3>
                        <p className="text-gray-600 mb-4">정말로 이 레이드를 삭제하시겠습니까?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                            >
                                {loading ? "삭제 중..." : "삭제"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
