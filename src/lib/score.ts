/**
 * SSAFY 점수 산정 로직
 * Total_Point = (Tier_Score) + (Solved_Count × 5) + (Max_Streak × 10)
 */

// 티어별 점수 가중치
const TIER_BASE_SCORES: Record<string, number> = {
    unrated: 0,
    bronze: 100,
    silver: 500,
    gold: 2000,
    platinum: 5000,
    diamond: 10000,
    ruby: 20000,
    master: 50000,
};

/**
 * 티어 숫자에서 티어 등급 추출
 */
function getTierGrade(tier: number): string {
    if (tier === 0) return 'unrated';
    if (tier >= 1 && tier <= 5) return 'bronze';
    if (tier >= 6 && tier <= 10) return 'silver';
    if (tier >= 11 && tier <= 15) return 'gold';
    if (tier >= 16 && tier <= 20) return 'platinum';
    if (tier >= 21 && tier <= 25) return 'diamond';
    if (tier >= 26 && tier <= 30) return 'ruby';
    return 'master';
}

/**
 * 티어 점수 계산 (등급 내에서 레벨에 따른 보너스 포함)
 */
export function getTierScore(tier: number): number {
    const grade = getTierGrade(tier);
    const baseScore = TIER_BASE_SCORES[grade];

    if (tier === 0 || tier === 31) return baseScore;

    // 같은 등급 내에서 레벨이 높을수록 보너스
    const levelInGrade = ((tier - 1) % 5) + 1;
    const gradeBonus = Math.floor(baseScore * 0.1 * levelInGrade);

    return baseScore + gradeBonus;
}

/**
 * 총점 계산
 */
export function calculateTotalPoint(
    tier: number,
    solvedCount: number,
    maxStreak: number,
    initialTier: number = 0,
    initialSolvedCount: number = 0
): number {
    const currentTierScore = getTierScore(tier);
    const initialTierScore = getTierScore(initialTier);

    // 티어 성장 점수 (하락 시 0)
    const tierGrowth = Math.max(0, currentTierScore - initialTierScore);

    // 문제 풀이 성장 점수 (하락 시 0)
    const solvedGrowth = Math.max(0, solvedCount - initialSolvedCount);
    const solvedBonus = solvedGrowth * 50; // 유저 요청: 활동 점수 가중치 50

    // 스트릭 점수는 시즌제에서 제외 (과거 스트릭의 영향력 제거)
    // const streakBonus = maxStreak * 10; 

    return tierGrowth + solvedBonus;
}

/**
 * 뱃지 자격 확인
 */
export interface BadgeCheck {
    type: string;
    name: string;
    description: string;
    earned: boolean;
}

export function checkBadges(
    tier: number,
    solvedCount: number,
    maxStreak: number
): BadgeCheck[] {
    return [
        {
            type: 'STREAK_7',
            name: '🔥 Week Warrior',
            description: '7일 연속 문제 풀이',
            earned: maxStreak >= 7,
        },
        {
            type: 'STREAK_30',
            name: '🏃 Marathon Runner',
            description: '30일 연속 문제 풀이',
            earned: maxStreak >= 30,
        },
        {
            type: 'STREAK_100',
            name: '👑 Streak Master',
            description: '100일 연속 문제 풀이',
            earned: maxStreak >= 100,
        },
        {
            type: 'SILVER_TIER',
            name: '🥈 Silver Achiever',
            description: '실버 티어 달성',
            earned: tier >= 6,
        },
        {
            type: 'GOLD_TIER',
            name: '🥇 Gold Achiever',
            description: '골드 티어 달성',
            earned: tier >= 11,
        },
        {
            type: 'PLATINUM_TIER',
            name: '💎 Platinum Achiever',
            description: '플래티넘 티어 달성',
            earned: tier >= 16,
        },
        {
            type: 'SOLVED_100',
            name: '📚 Century Problem Solver',
            description: '100문제 해결',
            earned: solvedCount >= 100,
        },
        {
            type: 'SOLVED_500',
            name: '🎯 Elite Problem Solver',
            description: '500문제 해결',
            earned: solvedCount >= 500,
        },
        {
            type: 'SOLVED_1000',
            name: '🏆 Legend Problem Solver',
            description: '1000문제 해결',
            earned: solvedCount >= 1000,
        },
    ];
}
