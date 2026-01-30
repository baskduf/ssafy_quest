import { getTierName, getTierColor } from "@/lib/solved-ac";

interface TierBadgeProps {
    tier: number;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

export function TierBadge({ tier, size = "md", showText = true, className = "" }: TierBadgeProps) {
    const tierName = getTierName(tier);
    const color = getTierColor(tier);

    // 사이즈 설정
    const iconSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
    const fontSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";
    const gap = size === "sm" ? "gap-1" : "gap-1.5";

    // 티어 0 (Unrated) 처리
    if (tier === 0) {
        return (
            <div className={`flex items-center ${gap} ${className}`}>
                <span className={`text-[#9CA3AF] ${fontSize} font-medium`}>Unrated</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${gap} ${className}`}>
            {/* Gem Icon by Tier */}
            <div
                className="relative flex items-center justify-center shrink-0"
                style={{ color: color }}
            >
                {/* Master (Ruby color like) uses specifically different shape or effect if needed, but for now unify */}
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="filter drop-shadow-sm"
                >
                    {/* Simple Gem Shape */}
                    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="currentColor" />
                </svg>
            </div>

            {showText && (
                <span
                    className={`${fontSize} font-bold`}
                    style={{ color: color }}
                >
                    {tierName}
                </span>
            )}
        </div>
    );
}
