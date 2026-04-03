import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { rankingsAPI } from '../api';

const CompareView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const jobId = searchParams.get('jobId');
    const resumeIds = searchParams.get('ids')?.split(',') || [];

    useEffect(() => {
        if (jobId && resumeIds.length >= 2) {
            loadComparison();
        }
    }, [jobId]);

    const loadComparison = async () => {
        setLoading(true);
        try {
            const res = await rankingsAPI.compare(jobId, resumeIds);
            setCandidates(res.data);
        } catch (err) {
            setError('Failed to load comparison');
        }
        setLoading(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--accent-primary)';
        if (score >= 40) return 'var(--warning)';
        return 'var(--error)';
    };

    const getTrustColor = (trust) => {
        if (trust === 'high') return 'var(--success)';
        if (trust === 'medium') return 'var(--warning)';
        return 'var(--error)';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (error || candidates.length < 2) {
        return (
            <div className="p-6">
                <div className="card text-center py-12">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {error || 'Select at least 2 candidates to compare'}
                    </p>
                    <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
                </div>
            </div>
        );
    }

    // Find the best score for highlighting
    const maxComposite = Math.max(...candidates.map(c => c.compositeScore));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Side-by-Side Comparison
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        Comparing {candidates.length} candidates for {candidates[0]?.jobTitle}
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
                    ← Back to Rankings
                </button>
            </div>

            {/* Comparison Grid */}
            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
                {candidates.map((c, i) => {
                    const isBest = c.compositeScore === maxComposite;
                    return (
                        <div
                            key={c.matchId}
                            className="card relative"
                            style={{
                                borderColor: isBest ? 'var(--accent-primary)' : 'var(--border-primary)',
                                boxShadow: isBest ? '0 0 20px color-mix(in srgb, var(--accent-primary) 20%, transparent)' : undefined
                            }}
                        >
                            {isBest && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                                    style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                                    Best Match
                                </div>
                            )}

                            {/* Name & Rank */}
                            <div className="text-center mb-4 pt-2">
                                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold text-white"
                                    style={{ background: 'var(--accent-gradient)' }}>
                                    {c.candidateName?.charAt(0)?.toUpperCase()}
                                </div>
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {c.candidateName}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                    Rank #{c.rank}
                                </span>
                            </div>

                            {/* Composite Score */}
                            <div className="text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                                <div className="text-3xl font-bold" style={{ color: getScoreColor(c.compositeScore) }}>
                                    {c.compositeScore}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Composite Score</div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="space-y-3 mb-4">
                                {[
                                    { label: 'Match Score', value: c.matchScore, weight: '60%' },
                                    { label: 'Credibility', value: c.credibilityScore, weight: '25%' },
                                    { label: 'Recency', value: c.recencyScore, weight: '15%' }
                                ].map(({ label, value, weight }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                            <span style={{ color: 'var(--text-primary)' }}>{value} <span style={{ color: 'var(--text-tertiary)' }}>({weight})</span></span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${value}%`, backgroundColor: getScoreColor(value) }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Trust Level */}
                            <div className="flex items-center justify-between p-2 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-input)' }}>
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Trust</span>
                                <span className="text-xs font-semibold capitalize" style={{ color: getTrustColor(c.credibilityTrust) }}>
                                    {c.credibilityTrust}
                                </span>
                            </div>

                            {/* Skills Summary */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)' }}>
                                    <div className="font-bold" style={{ color: 'var(--success)' }}>{c.matchedSkillCount}</div>
                                    <div style={{ color: 'var(--text-tertiary)' }}>Matched</div>
                                </div>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)' }}>
                                    <div className="font-bold" style={{ color: 'var(--error)' }}>{c.missingSkillCount}</div>
                                    <div style={{ color: 'var(--text-tertiary)' }}>Missing</div>
                                </div>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--info) 10%, transparent)' }}>
                                    <div className="font-bold" style={{ color: 'var(--info)' }}>{c.bonusSkillCount}</div>
                                    <div style={{ color: 'var(--text-tertiary)' }}>Bonus</div>
                                </div>
                            </div>

                            {/* Interpretation */}
                            {c.interpretation && (
                                <div className="mt-3 p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {c.interpretation.label}
                                    </span>
                                    {' — '}{c.interpretation.summary}
                                </div>
                            )}

                            {/* Status */}
                            <div className="mt-3 text-center">
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${c.status === 'shortlisted' ? 'bg-emerald-500/15 text-emerald-400' :
                                        c.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                                            'bg-slate-500/15 text-slate-400'
                                    }`}>
                                    {c.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CompareView;
