import { useState, useEffect } from 'react';

/**
 * Animated circular score gauge (0-100%)
 * Shows a ring that fills up with color based on score tier
 */
const ScoreGauge = ({ score, size = 100, strokeWidth = 8, label = 'Match' }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Animate from 0 to score
        const duration = 800;
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(score * eased * 10) / 10);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [score]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;
    const center = size / 2;

    // Color based on score tier
    const getColor = (s) => {
        if (s >= 85) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        if (s >= 70) return { stroke: '#3b82f6', text: 'text-blue-400', bg: 'bg-blue-500/10' };
        if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10' };
        return { stroke: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10' };
    };

    const colors = getColor(score);

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background ring */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgb(51, 65, 85)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Score ring */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${colors.text}`}>
                        {Math.round(animatedScore)}%
                    </span>
                </div>
            </div>
            {label && (
                <span className="text-xs text-slate-400 mt-1">{label}</span>
            )}
        </div>
    );
};

export default ScoreGauge;
