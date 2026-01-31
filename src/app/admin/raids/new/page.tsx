"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewRaidPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        problemUrl: "",
        maxHp: 10,
        damagePerHit: 1,
        bonusPoint: 100,
        startAt: "",
        endAt: "",
    });

    // 백준 URL에서 문제 번호 파싱
    const parseProblemId = (url: string): number | null => {
        const match = url.match(/acmicpc\.net\/problem\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/raids/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { url } = await res.json();
            setImageUrl(url);
        } catch (err) {
            console.error(err);
            setError("이미지 업로드에 실패했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const problemId = parseProblemId(formData.problemUrl);
        if (!problemId) {
            setError("올바른 백준 문제 URL을 입력해주세요. (예: https://www.acmicpc.net/problem/1000)");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/raids", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    imageUrl,
                    problemId,
                    maxHp: formData.maxHp,
                    damagePerHit: formData.damagePerHit,
                    bonusPoint: formData.bonusPoint,
                    startAt: formData.startAt,
                    endAt: formData.endAt,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create raid");
            }

            router.push("/admin/raids");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "레이드 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새 레이드 생성</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* 보스 이미지 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        보스 이미지
                    </label>
                    <div className="flex items-start gap-4">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Boss preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                미리보기
                            </div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {uploading && (
                                <p className="mt-2 text-sm text-gray-500">업로드 중...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 보스 이름 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        보스 이름 *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="예: 플래티넘의 지배자"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* 설명 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        설명
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="보스에 대한 설명이나 스토리를 입력하세요"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* 백준 문제 URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        백준 문제 URL *
                    </label>
                    <input
                        type="url"
                        value={formData.problemUrl}
                        onChange={(e) => setFormData({ ...formData, problemUrl: e.target.value })}
                        placeholder="https://www.acmicpc.net/problem/1000"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.problemUrl && parseProblemId(formData.problemUrl) && (
                        <p className="mt-1 text-sm text-green-600">
                            ✓ 문제 번호: {parseProblemId(formData.problemUrl)}
                        </p>
                    )}
                </div>

                {/* HP 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            최대 HP *
                        </label>
                        <input
                            type="number"
                            value={formData.maxHp}
                            onChange={(e) => setFormData({ ...formData, maxHp: parseInt(e.target.value) || 1 })}
                            min={1}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            공격당 데미지 *
                        </label>
                        <input
                            type="number"
                            value={formData.damagePerHit}
                            onChange={(e) => setFormData({ ...formData, damagePerHit: parseInt(e.target.value) || 1 })}
                            min={1}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* 보너스 포인트 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        보너스 포인트 (클리어 시 참여자 보상)
                    </label>
                    <input
                        type="number"
                        value={formData.bonusPoint}
                        onChange={(e) => setFormData({ ...formData, bonusPoint: parseInt(e.target.value) || 0 })}
                        min={0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        레이드 클리어 성공 시, 공격에 성공한 모든 유저에게 지급됩니다.
                    </p>
                </div>

                {/* 기간 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            시작 일시 *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.startAt}
                            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            종료 일시 *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.endAt}
                            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "생성 중..." : "레이드 생성"}
                    </button>
                </div>
            </form>
        </div>
    );
}
