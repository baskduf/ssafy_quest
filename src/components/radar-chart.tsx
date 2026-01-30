"use client";

interface RadarChartProps {
    data: { tag: string; solved: number }[];
    maxValue?: number;
}

export function RadarChart({ data, maxValue }: RadarChartProps) {
    const size = 280;
    const center = size / 2;
    const levels = 5;
    const radius = 100;

    // Calculate max value from data if not provided
    const max = maxValue || Math.max(...data.map(d => d.solved), 10);

    // Calculate points for hexagon at each level
    const getHexagonPoints = (level: number) => {
        const r = (radius * level) / levels;
        return data.map((_, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(" ");
    };

    // Calculate data points
    const dataPoints = data.map((item, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        const value = Math.min(item.solved / max, 1);
        const r = radius * value;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    });

    const dataPath = dataPoints.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(" ") + " Z";

    // Label positions
    const labelPositions = data.map((item, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        const r = radius + 24;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
            tag: item.tag,
            solved: item.solved,
        };
    });

    return (
        <div className="flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background hexagon levels */}
                {[1, 2, 3, 4, 5].map((level) => (
                    <polygon
                        key={level}
                        points={getHexagonPoints(level)}
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis lines */}
                {data.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="#E2E8F0"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data area */}
                <path
                    d={dataPath}
                    fill="rgba(50, 130, 246, 0.2)"
                    stroke="#3282F6"
                    strokeWidth="2"
                />

                {/* Data points */}
                {dataPoints.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#3282F6"
                    />
                ))}

                {/* Labels */}
                {labelPositions.map((label, i) => (
                    <g key={i}>
                        <text
                            x={label.x}
                            y={label.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs fill-[#4A4A4A]"
                            style={{ fontSize: '11px' }}
                        >
                            {label.tag}
                        </text>
                        <text
                            x={label.x}
                            y={label.y + 14}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs fill-[#3282F6] font-medium"
                            style={{ fontSize: '10px' }}
                        >
                            {label.solved}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
