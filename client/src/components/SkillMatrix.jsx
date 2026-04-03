/**
 * SkillMatrix - Visual grid showing matched, missing, and bonus skills
 * Color-coded by category with interactive layout
 * Reusable in MatchCard expanded view, CandidateDetail, and CompareView
 */

const categoryConfig = {
    programming: { label: 'Programming', emoji: '💻', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30', dot: 'bg-blue-400' },
    frontend: { label: 'Frontend', emoji: '🎨', bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', dot: 'bg-purple-400' },
    backend: { label: 'Backend', emoji: '⚙️', bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30', dot: 'bg-green-400' },
    database: { label: 'Database', emoji: '🗄️', bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', dot: 'bg-orange-400' },
    cloud: { label: 'Cloud/DevOps', emoji: '☁️', bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
    ai_ml: { label: 'AI/ML', emoji: '🤖', bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30', dot: 'bg-pink-400' },
    tools: { label: 'Tools', emoji: '🔧', bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', dot: 'bg-slate-400' },
    other: { label: 'Other', emoji: '📦', bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', dot: 'bg-slate-400' }
};

const SkillPill = ({ skill, variant = 'matched' }) => {
    const cat = categoryConfig[skill.category] || categoryConfig.other;

    const variantStyles = {
        matched: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        missing: 'bg-red-500/15 text-red-300 border-red-500/30',
        bonus: 'bg-violet-500/15 text-violet-300 border-violet-500/30'
    };

    const variantIcons = {
        matched: '✓',
        missing: '✗',
        bonus: '+'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all hover:scale-105 ${variantStyles[variant]}`}
            title={`${skill.name} (${cat.label}) — ${variant}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
            <span className="opacity-70">{variantIcons[variant]}</span>
            {skill.name}
        </span>
    );
};

const SkillMatrix = ({
    matchedSkills = [],
    missingSkills = [],
    bonusSkills = [],
    layout = 'columns', // 'columns' | 'grid' | 'compact'
    maxBonusShow = 10,
    showCoverageBar = true
}) => {
    const totalRequired = matchedSkills.length + missingSkills.length;
    const coveragePercent = totalRequired > 0
        ? Math.round((matchedSkills.length / totalRequired) * 100)
        : 100;

    const getCoverageColor = (pct) => {
        if (pct >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Excellent' };
        if (pct >= 70) return { bar: 'bg-blue-500', text: 'text-blue-400', label: 'Good' };
        if (pct >= 50) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Partial' };
        return { bar: 'bg-red-500', text: 'text-red-400', label: 'Low' };
    };

    const coverage = getCoverageColor(coveragePercent);

    if (layout === 'compact') {
        return (
            <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                    {matchedSkills.map((s, i) => (
                        <SkillPill key={`m-${i}`} skill={s} variant="matched" />
                    ))}
                    {missingSkills.map((s, i) => (
                        <SkillPill key={`x-${i}`} skill={s} variant="missing" />
                    ))}
                    {bonusSkills.slice(0, 5).map((s, i) => (
                        <SkillPill key={`b-${i}`} skill={s} variant="bonus" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Coverage bar */}
            {showCoverageBar && totalRequired > 0 && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-400">Skill Coverage</span>
                        <span className={`text-xs font-bold ${coverage.text}`}>
                            {coveragePercent}% — {coverage.label}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${coverage.bar}`}
                            style={{ width: `${coveragePercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {matchedSkills.length} of {totalRequired} required skills matched
                    </p>
                </div>
            )}

            {/* Skill columns */}
            <div className={`grid gap-4 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                {/* Matched skills */}
                <div className="space-y-2">
                    <h6 className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">✅</span>
                        Matched ({matchedSkills.length})
                    </h6>
                    <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map((s, i) => (
                            <SkillPill key={i} skill={s} variant="matched" />
                        ))}
                        {matchedSkills.length === 0 && (
                            <span className="text-xs text-slate-500 italic">No matches</span>
                        )}
                    </div>
                </div>

                {/* Missing skills */}
                <div className="space-y-2">
                    <h6 className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                        <span className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center text-[10px]">❌</span>
                        Missing ({missingSkills.length})
                    </h6>
                    <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((s, i) => (
                            <SkillPill key={i} skill={s} variant="missing" />
                        ))}
                        {missingSkills.length === 0 && (
                            <span className="text-xs text-slate-500 italic">Full coverage! 🎉</span>
                        )}
                    </div>
                </div>

                {/* Bonus skills */}
                <div className="space-y-2">
                    <h6 className="flex items-center gap-1.5 text-xs font-semibold text-violet-400">
                        <span className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center text-[10px]">🎁</span>
                        Bonus ({bonusSkills.length})
                    </h6>
                    <div className="flex flex-wrap gap-1.5">
                        {bonusSkills.slice(0, maxBonusShow).map((s, i) => (
                            <SkillPill key={i} skill={s} variant="bonus" />
                        ))}
                        {bonusSkills.length > maxBonusShow && (
                            <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-lg">
                                +{bonusSkills.length - maxBonusShow} more
                            </span>
                        )}
                        {bonusSkills.length === 0 && (
                            <span className="text-xs text-slate-500 italic">None</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillMatrix;
