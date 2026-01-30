'use client';

import { useRouter } from "next/navigation";

export function MyClassButton() {
    const router = useRouter();

    const handleClick = async () => {
        try {
            const res = await fetch('/api/me');

            if (res.status === 401) {
                if (confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?')) {
                    router.push('/login');
                }
                return;
            }

            const data = await res.json();

            if (res.ok && data.isLoggedIn && data.campus && data.classNum) {
                router.push(`/ranking?campus=${encodeURIComponent(data.campus)}&classNum=${data.classNum}`);
            } else {
                alert('사용자 정보를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error("MyClassButton Error:", error);
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <button
            onClick={handleClick}
            className="px-3 py-3 text-sm font-medium text-[#9CA3AF] hover:text-[#4A4A4A] transition-colors"
        >
            우리반
        </button>
    );
}
