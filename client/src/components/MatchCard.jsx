import { useState } from 'react';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';
import SkillMatrix from './SkillMatrix';

/**
 * Individual match result card
 * Shows candidate name, score gauge, skill analysis, and quick actions
 * Uses standalone ScoreBreakdown and SkillMatrix components
 */

const tierConfig = {
    excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '🏆' },
    good: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: '✅' },
    partial: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '⚠️' },
    weak: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '❌' }
};

const statusConfig = {
    pending: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
    shortlisted: { label: 'Shortlisted', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
};

const MatchCard = ({ match, rank, onStatusChange, updating }) => {
    const [expanded, setExpanded] = useState(false);

    const tier = tierConfig[match.interpretation?.tier] || tierConfig.weak;
    const status = statusConfig[match.status] || statusConfig.pending;

    return (
        <div
            className={`bg-slate-800/50 backdrop-blur-xl border rounded-xl transition-all cursor-pointer ${expanded
                ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                : match.status === 'shortlisted'
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : match.status === 'rejected'
                        ? 'border-red-500/20 opacity-60 hover:opacity-80'
                        : 'border-slate-700 hover:border-slate-600'
                }`}
            onClick={() => setExpanded(!expanded)}
        >
            {/* Main row */}
            <div className="p-4 flex items-center gap-4">
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                        rank === 3 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                            'bg-slate-700/50 text-slate-400'
                    }`}>
                    {rank}
                </div>

                {/* Score gauge */}
                <ScoreGauge score={match.scores.final} size={64} strokeWidth={5} label="" />

                {/* Candidate info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium truncate">{match.candidateName}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${tier.bg} ${tier.color} ${tier.border}`}>
                            {tier.icon} {match.interpretation?.label}
                        </span>
                        {match.status !== 'pending' && (
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${status.bg} ${status.color} ${status.border}`}>
                                {status.label}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                        {match.interpretation?.summary}
                    </p>
                    {/* Mini skill preview */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {match.matchedSkills?.slice(0, 5).map((s, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                                ✓ {s.name}
                            </span>
                        ))}
                        {match.missingSkills?.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">
                                ✗ {s.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions + chevron */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(match.id, 'shortlisted'); }}
                        disabled={updating || match.status === 'shortlisted'}
                        className={`p-2 rounded-lg transition text-sm ${match.status === 'shortlisted'
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                            : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'
                            }`}
                        title="Shortlist"
                    >
                        👍
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(match.id, 'rejected'); }}
                        disabled={updating || match.status === 'rejected'}
                        className={`p-2 rounded-lg transition text-sm ${match.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 cursor-default'
                            : 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                            }`}
                        title="Reject"
                    >
                        👎
                    </button>
                    <span className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-slate-700 pt-4 space-y-4">
                    {/* Score breakdown - using standalone component */}
                    <ScoreBreakdown scores={match.scores} showWeights={true} />

                    {/* Skill Matrix - using standalone component */}
                    <SkillMatrix
                        matchedSkills={match.matchedSkills || []}
                        missingSkills={match.missingSkills || []}
                        bonusSkills={match.bonusSkills || []}
                        layout="columns"
                        showCoverageBar={true}
                    />

                    {/* Status change buttons (larger, in detail view) */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
                        <button
                            onClick={(e) => { e.stopPropagation(); onStatusChange(match.id, 'shortlisted'); }}
                            disabled={updating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${match.status === 'shortlisted'
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                        >
                            👍 {match.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onStatusChange(match.id, 'rejected'); }}
                            disabled={updating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${match.status === 'rejected'
                                ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                }`}
                        >
                            👎 {match.status === 'rejected' ? 'Rejected' : 'Reject'}
                        </button>
                        {match.status !== 'pending' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onStatusChange(match.id, 'pending'); }}
                                disabled={updating}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition"
                            >
                                ↩ Reset
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchCard;
