import { useState } from 'react';
import { credibilityAPI } from '../api';

const TRUST_CONFIG = {
    high: {
        label: 'High Trust',
        color: 'var(--success)',
        bgClass: 'bg-emerald-500/15',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 12 15 16 10" />
            </svg>
        )
    },
    medium: {
        label: 'Medium Trust',
        color: 'var(--warning)',
        bgClass: 'bg-amber-500/15',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        )
    },
    low: {
        label: 'Low Trust',
        color: 'var(--error)',
        bgClass: 'bg-red-500/15',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        )
    }
};

const CredibilityBadge = ({ resume, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const credibility = resume?.credibility;

    const handleAnalyze = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            await credibilityAPI.analyze(resume._id || resume.id);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to analyze:', err);
        }
        setLoading(false);
    };

    // Not yet analyzed
    if (!credibility?.score && credibility?.score !== 0) {
        return (
            <button
                onClick={handleAnalyze}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)'
                }}
                title="Run credibility analysis"
            >
                {loading ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                )}
                {loading ? 'Analyzing...' : 'Analyze'}
            </button>
        );
    }

    const config = TRUST_CONFIG[credibility.trustLevel] || TRUST_CONFIG.medium;

    return (
        <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
                backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                color: config.color,
                border: `1px solid color-mix(in srgb, ${config.color} 30%, transparent)`
            }}
            title={`Credibility: ${credibility.score}/100 — ${config.label}`}
        >
            {config.icon}
            <span>{credibility.score}</span>
        </div>
    );
};

export default CredibilityBadge;
