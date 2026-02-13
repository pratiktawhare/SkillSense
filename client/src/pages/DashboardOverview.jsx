import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, jobAPI } from '../api';

const DashboardOverview = () => {
    const [stats, setStats] = useState({ resumes: 0, jobs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [resumeRes, jobRes] = await Promise.all([
                    resumeAPI.getAll(),
                    jobAPI.getAll()
                ]);
                setStats({
                    resumes: resumeRes.data.length,
                    jobs: jobRes.data.length,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        {
            label: 'Total Resumes',
            value: stats.resumes,
            color: 'var(--accent-primary)',
            path: '/dashboard/resumes',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            )
        },
        {
            label: 'Active Jobs',
            value: stats.jobs,
            color: 'var(--accent-secondary)',
            path: '/dashboard/jobs',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            )
        },
        {
            label: 'Start Matching',
            value: 'Go',
            color: 'var(--success)',
            path: '/dashboard/matching',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
            )
        }
    ];

    const quickActions = [
        { label: 'Upload Resume', path: '/dashboard/resumes', desc: 'Add new PDF resumes for AI analysis' },
        { label: 'Create Job', path: '/dashboard/jobs', desc: 'Define a new role with required skills' },
        { label: 'Run Matching', path: '/dashboard/matching', desc: 'Match candidates to job openings' }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Welcome to SkillSense. Here's an overview of your recruitment data.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {cards.map((card, i) => (
                    <Link key={i} to={card.path} className="card group transition-all hover:scale-[1.02]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                                    color: card.color
                                }}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {loading ? (
                                <div className="skeleton h-8 w-12 rounded" />
                            ) : (
                                card.value
                            )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, i) => (
                    <Link key={i} to={action.path}
                        className="card flex items-center gap-4 group transition-all hover:border-[var(--accent-primary)]">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                                color: 'var(--accent-primary)'
                            }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {action.label}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                {action.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardOverview;
