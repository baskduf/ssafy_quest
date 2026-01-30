'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { getTierName } from "@/lib/solved-ac";

interface Problem {
    problemId: number;
    titleKo: string;
    level: number;
    tags: Array<{ key: string }>;
}

export function ProblemCarousel({ problems }: { problems: Problem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="relative group">
            {/* Left Button */}
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 bg-white border border-[#E2E8F0] shadow-md rounded-full p-2 text-[#4A4A4A] hover:text-[#3282F6] hover:border-[#3282F6] transition-all hidden md:block"
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth"
            >
                {problems.map((problem) => (
                    <Link
                        key={problem.problemId}
                        href={`https://www.acmicpc.net/problem/${problem.problemId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-40 sm:w-48 bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-[#3282F6] hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${problem.level >= 11 ? 'bg-[#FFD700]/10 text-[#DAA520]' : // Gold
                                    problem.level >= 6 ? 'bg-[#C0C0C0]/10 text-[#708090]' : // Silver
                                        'bg-[#B87333]/10 text-[#B87333]' // Bronze
                                }`}>
                                {getTierName(problem.level)}
                            </span>
                            <span className="text-xs text-[#9CA3AF]">
                                #{problem.problemId}
                            </span>
                        </div>
                        <h4 className="text-sm font-medium text-[#1A1A1A] line-clamp-2 group-hover:text-[#3282F6] mb-2 h-10">
                            {problem.titleKo}
                        </h4>
                        <div className="flex flex-wrap gap-1 h-5 overflow-hidden">
                            {problem.tags.slice(0, 2).map((tag) => (
                                <span key={tag.key} className="text-[10px] text-[#9CA3AF] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                                    #{tag.key}
                                </span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Right Button */}
            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 bg-white border border-[#E2E8F0] shadow-md rounded-full p-2 text-[#4A4A4A] hover:text-[#3282F6] hover:border-[#3282F6] transition-all hidden md:block"
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            )}
        </div>
    );
}
