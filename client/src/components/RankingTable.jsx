import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rankingsAPI } from '../api';
import NoteEditor from './NoteEditor';

const TIER_CONFIG = {
    top: { label: 'Top', color: 'var(--success)', badge: '🥇' },
    strong: { label: 'Strong', color: 'var(--accent-primary)', badge: '🥈' },
    average: { label: 'Average', color: 'var(--warning)', badge: '🥉' },
    below: { label: 'Below Avg', color: 'var(--text-tertiary)', badge: '' }
};

const RankingTable = ({ jobId }) => {
    const navigate = useNavigate();
    const [ranked, setRanked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [expandedId, setExpandedId] = useState(null);
    const [sortBy, setSortBy] = useState('composite'); // composite, match, credibility

    useEffect(() => {
        if (jobId) loadRankings();
    }, [jobId]);

    const loadRankings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await rankingsAPI.getRanked(jobId);
            setRanked(res.data);
        } catch (err) {
            setError('Failed to load rankings');
        }
        setLoading(false);
    };

    const toggleSelect = (resumeId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(resumeId)) {
                next.delete(resumeId);
            } else if (next.size < 3) {
                next.add(resumeId);
            }
            return next;
        });
    };

    const handleCompare = () => {
        if (selectedIds.size >= 2) {
            navigate(`/dashboard/compare?jobId=${jobId}&ids=${[...selectedIds].join(',')}`);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--accent-primary)';
        if (score >= 40) return 'var(--warning)';
        return 'var(--error)';
    };

    const sortedRanked = [...ranked].sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'credibility') return b.credibilityScore - a.credibilityScore;
        return b.compositeScore - a.compositeScore;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
                <span className="ml-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading rankings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p style={{ color: 'var(--error)' }}>{error}</p>
                <button onClick={loadRankings} className="btn-primary mt-3 text-sm">Retry</button>
            </div>
        );
    }

    if (!ranked.length) {
        return (
            <div className="text-center py-12 card">
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No ranked candidates yet</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Run matching first to see rankings</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    📊 Candidate Rankings ({ranked.length})
                </h3>

                <div className="flex items-center gap-3">
                    {/* Sort */}
                    <div className="flex items-center gap-1 text-xs">
                        <span style={{ color: 'var(--text-tertiary)' }}>Sort:</span>
                        {['composite', 'match', 'credibility'].map(s => (
                            <button
                                key={s}
                                onClick={() => setSortBy(s)}
                                className="px-2 py-1 rounded capitalize transition"
                                style={{
                                    backgroundColor: sortBy === s ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                    color: sortBy === s ? 'white' : 'var(--text-secondary)'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Compare button */}
                    {selectedIds.size >= 2 && (
                        <button onClick={handleCompare} className="btn-primary text-sm">
                            ⚖️ Compare ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            {/* Selection hint */}
            {selectedIds.size > 0 && selectedIds.size < 2 && (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Select {2 - selectedIds.size} more candidate(s) to compare
                </p>
            )}

            {/* Ranking List */}
            <div className="space-y-2">
                {sortedRanked.map((candidate) => {
                    const tier = TIER_CONFIG[candidate.tier] || TIER_CONFIG.below;
                    const isSelected = selectedIds.has(candidate.resumeId.toString());
                    const isExpanded = expandedId === candidate.matchId;

                    return (
                        <div
                            key={candidate.matchId}
                            className="card transition-all"
                            style={{
                                padding: '12px 16px',
                                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)',
                                boxShadow: isSelected ? '0 0 0 1px var(--accent-primary)' : undefined
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Select checkbox */}
                                <button
                                    onClick={() => toggleSelect(candidate.resumeId.toString())}
                                    className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition"
                                    style={{
                                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-secondary)',
                                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent'
                                    }}
                                >
                                    {isSelected && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>

                                {/* Rank badge */}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ backgroundColor: `color-mix(in srgb, ${tier.color} 20%, transparent)`, color: tier.color }}>
                                    {candidate.rank}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                            {tier.badge} {candidate.candidateName}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${candidate.status === 'shortlisted' ? 'bg-emerald-500/15 text-emerald-400' :
                                                candidate.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                                                    'bg-slate-500/15 text-slate-400'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        <span>{candidate.interpretation?.label}</span>
                                        <span>•</span>
                                        <span>{candidate.matchedSkillCount} skills matched</span>
                                    </div>
                                </div>

                                {/* Scores */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="text-center">
                                        <div className="text-lg font-bold" style={{ color: getScoreColor(candidate.compositeScore) }}>
                                            {candidate.compositeScore}
                                        </div>
                                        <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Composite</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                            {candidate.matchScore}
                                        </div>
                                        <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Match</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                            {candidate.credibilityScore}
                                        </div>
                                        <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Trust</div>
                                    </div>
                                </div>

                                {/* Expand */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : candidate.matchId)}
                                    className="w-7 h-7 rounded flex items-center justify-center transition"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                            </div>

                            {/* Expanded: Notes */}
                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                    <NoteEditor resumeId={candidate.resumeId} jobId={jobId} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RankingTable;
