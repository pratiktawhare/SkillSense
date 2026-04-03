import { useState, useEffect } from 'react';

/**
 * ScoreBreakdown - Horizontal bar chart showing individual score components
 * Displays Semantic, Skill Match, and Experience scores with animated bars
 * and weight indicators
 */

const weights = {
    semantic: { label: 'Semantic', weight: 40, icon: '🧠', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    skillMatch: { label: 'Skill Match', weight: 40, icon: '🎯', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    experience: { label: 'Experience', weight: 20, icon: '📈', color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' }
};

const ScoreBreakdown = ({ scores, showWeights = true, animated = true }) => {
    const [animatedScores, setAnimatedScores] = useState({
        semantic: 0,
        skillMatch: 0,
        experience: 0
    });

    useEffect(() => {
        if (!animated) {
            setAnimatedScores({
                semantic: scores?.semantic || 0,
                skillMatch: scores?.skillMatch || 0,
                experience: Math.min(scores?.experience || 0, 1)
            });
            return;
        }

        const duration = 1000;
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            setAnimatedScores({
                semantic: (scores?.semantic || 0) * eased,
                skillMatch: (scores?.skillMatch || 0) * eased,
                experience: Math.min((scores?.experience || 0), 1) * eased
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [scores, animated]);

    const getScoreColor = (value) => {
        if (value >= 0.8) return 'text-emerald-400';
        if (value >= 0.6) return 'text-blue-400';
        if (value >= 0.4) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-slate-300">Score Breakdown</h5>
                {scores?.final !== undefined && (
                    <span className={`text-lg font-bold ${getScoreColor(scores.final / 100)}`}>
                        {Math.round(scores.final)}%
                    </span>
                )}
            </div>

            {Object.entries(weights).map(([key, config]) => {
                const rawValue = key === 'experience'
                    ? Math.min(scores?.[key] || 0, 1)
                    : (scores?.[key] || 0);
                const animValue = animatedScores[key] || 0;
                const percentage = animValue * 100;
                const contribution = rawValue * (config.weight / 100) * 100;

                return (
                    <div key={key} className={`p-3 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{config.icon}</span>
                                <span className="text-sm font-medium text-slate-300">{config.label}</span>
                                {showWeights && (
                                    <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                                        {config.weight}% weight
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold font-mono ${getScoreColor(rawValue)}`}>
                                    {Math.round(rawValue * 100)}%
                                </span>
                                {showWeights && (
                                    <span className="text-xs text-slate-500">
                                        → {Math.round(contribution)}pt
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2.5 bg-slate-700/70 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${config.color} transition-all duration-300`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Formula note */}
            <p className="text-xs text-slate-500 mt-2 text-center">
                Final = Semantic (40%) + Skills (40%) + Experience (20%)
            </p>
        </div>
    );
};

export default ScoreBreakdown;
