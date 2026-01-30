/**
 * Solved.ac API v3 유틸리티
 * https://solved.ac/api/v3
 */

const SOLVED_AC_API = 'https://solved.ac/api/v3';

export interface SolvedAcUser {
    handle: string;
    bio: string;
    tier: number;
    rating: number;
    solvedCount: number;
    maxStreak: number;
    profileImageUrl: string | null;
}

export interface TagStat {
    tag: {
        key: string;
        displayNames: Array<{ language: string; name: string }>;
    };
    solved: number;
    level: number;
}

/**
 * 사용자 정보 가져오기
 */
export async function fetchUserFromSolvedAc(handle: string): Promise<SolvedAcUser | null> {
    try {
        const response = await fetch(`${SOLVED_AC_API}/user/show?handle=${encodeURIComponent(handle)}`, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 3600 }, // 1시간 캐시
        });

        if (!response.ok) {
            console.error(`Solved.ac API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        return {
            handle: data.handle,
            bio: data.bio || '',
            tier: data.tier || 0,
            rating: data.rating || 0,
            solvedCount: data.solvedCount || 0,
            maxStreak: data.maxStreak || 0,
            profileImageUrl: data.profileImageUrl || null,
        };
    } catch (error) {
        console.error('Failed to fetch from Solved.ac:', error);
        return null;
    }
}

/**
 * 태그별 통계 가져오기 (레이더 차트용)
 */
export async function fetchTagStats(handle: string): Promise<TagStat[]> {
    try {
        const response = await fetch(
            `${SOLVED_AC_API}/user/problem_tag_stats?handle=${encodeURIComponent(handle)}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 3600 },
            }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Failed to fetch tag stats:', error);
        return [];
    }
}

/**
 * 티어 이름 변환
 */
export function getTierName(tier: number): string {
    if (tier === 0) return 'Unrated';

    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];
    const levels = ['V', 'IV', 'III', 'II', 'I'];

    const tierIndex = Math.floor((tier - 1) / 5);
    const levelIndex = (tier - 1) % 5;

    if (tier === 31) return 'Master';

    return `${tiers[tierIndex]} ${levels[levelIndex]}`;
}

/**
 * 티어 색상 반환
 */
export function getTierColor(tier: number): string {
    if (tier === 0) return '#2d2d2d';
    if (tier >= 1 && tier <= 5) return '#ad5600';   // Bronze
    if (tier >= 6 && tier <= 10) return '#435f7a';  // Silver
    if (tier >= 11 && tier <= 15) return '#ec9a00'; // Gold
    if (tier >= 16 && tier <= 20) return '#27e2a4'; // Platinum
    if (tier >= 21 && tier <= 25) return '#00b4fc'; // Diamond
    if (tier >= 26 && tier <= 30) return '#ff0062'; // Ruby
    return '#b491ff'; // Master
}

/**
 * 랜덤 문제 가져오기 (브실골, 5문제)
 */
export async function fetchRandomProblems(count: number = 5) {
    try {
        // tier:6..15 (Silver 5 ~ Gold 1), solvable:true
        const response = await fetch(
            `https://solved.ac/api/v3/search/problem?query=tier:6..15+solvable:true+sort:random+lang:ko&direction=asc&page=1`,
            {
                next: { revalidate: 0 } // Always fresh random
            }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return (data.items || []).slice(0, count);
    } catch (error) {
        console.error("Error fetching random problems:", error);
        return [];
    }
}


