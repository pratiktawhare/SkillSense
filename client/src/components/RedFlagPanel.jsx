import { useState, useEffect } from 'react';
import { credibilityAPI } from '../api';

const SEVERITY_CONFIG = {
    minor: {
        label: 'Minor',
        color: 'var(--warning)',
        penalty: -5,
        icon: '⚠️'
    },
    moderate: {
        label: 'Moderate',
        color: '#f97316',
        penalty: -15,
        icon: '🟠'
    },
    severe: {
        label: 'Severe',
        color: 'var(--error)',
        penalty: -30,
        icon: '🔴'
    }
};

const FLAG_TYPE_LABELS = {
    'tech_age_exaggeration': 'Technology Age Issue',
    'expert_overload': 'Expert Overload',
    'skill_experience_mismatch': 'Skill-Experience Mismatch',
    'skill_count_anomaly': 'Skill Count Anomaly'
};

const RedFlagPanel = ({ resumeId }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (resumeId) {
            loadReport();
        }
    }, [resumeId]);

    const loadReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await credibilityAPI.getReport(resumeId);
            setReport(res.data);
        } catch (err) {
            setError('Failed to load credibility report');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading credibility report...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: 'var(--error)', backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)' }}>
                <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
        );
    }

    if (!report) return null;

    const { score, trustLevel, flags, penaltySummary, totalPenalty } = report;
    const trustConfig = {
        high: { label: 'High Trust', color: 'var(--success)' },
        medium: { label: 'Medium Trust', color: 'var(--warning)' },
        low: { label: 'Low Trust', color: 'var(--error)' }
    };
    const trust = trustConfig[trustLevel] || trustConfig.medium;

    return (
        <div className="mt-4 space-y-3">
            {/* Score Header */}
            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)' }}>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={trust.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Credibility Report
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold" style={{ color: trust.color }}>{score}</span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/100</span>
                    </div>
                </div>

                {/* Score Bar */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${score}%`,
                            backgroundColor: trust.color
                        }}
                    />
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium" style={{ color: trust.color }}>{trust.label}</span>
                    {totalPenalty > 0 && (
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            -{totalPenalty} points deducted
                        </span>
                    )}
                </div>
            </div>

            {/* Flags List */}
            {flags.length > 0 ? (
                <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Red Flags ({flags.length})
                    </h5>
                    {flags.map((flag, i) => {
                        const severity = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.minor;
                        return (
                            <div
                                key={i}
                                className="p-3 rounded-lg border flex items-start gap-3"
                                style={{
                                    borderColor: `color-mix(in srgb, ${severity.color} 30%, transparent)`,
                                    backgroundColor: `color-mix(in srgb, ${severity.color} 5%, transparent)`
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${severity.color} 20%, transparent)`,
                                        color: severity.color
                                    }}
                                >
                                    {severity.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold" style={{ color: severity.color }}>
                                            {severity.label}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                                            {FLAG_TYPE_LABELS[flag.type] || flag.type}
                                        </span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {flag.message}
                                    </p>
                                </div>
                                <span className="text-xs font-mono flex-shrink-0" style={{ color: severity.color }}>
                                    {severity.penalty}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-3 rounded-lg border text-center" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)' }}>
                    <p className="text-sm" style={{ color: 'var(--success)' }}>
                        ✓ No red flags detected
                    </p>
                </div>
            )}
        </div>
    );
};

export default RedFlagPanel;
