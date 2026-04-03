import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, resumeAPI } from '../api';
import StatusStepper from '../components/StatusStepper';

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [resumeCount, setResumeCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appRes, resRes] = await Promise.all([
                    applicationAPI.getMyApplications(),
                    resumeAPI.getAll()
                ]);
                setApplications(appRes.data);
                setResumeCount(resRes.data.length);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const statCards = [
        { label: 'Total Applications', value: applications.length, color: 'var(--accent-primary)' },
        { label: 'Shortlisted', value: statusCounts.shortlisted || 0, color: '#10b981' },
        { label: 'Interviews', value: statusCounts.interview || 0, color: '#8b5cf6' },
        { label: 'Resumes', value: resumeCount, color: '#f59e0b' }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Welcome, {user?.name}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Here's your application overview
            </p>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {statCards.map((card, i) => (
                    <div key={i} className="card p-4">
                        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {loading ? (
                                <div className="skeleton h-8 w-12 rounded" />
                            ) : (
                                card.value
                            )}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                        <div className="h-1 mt-3 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${card.color} 20%, transparent)` }}>
                            <div className="h-full rounded-full" style={{ backgroundColor: card.color, width: '60%' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <Link to="/candidate/jobs" className="card flex items-center gap-4 group transition-all hover:border-[var(--accent-primary)]">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', color: 'var(--accent-primary)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Browse Jobs</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Find and apply to open positions</p>
                    </div>
                </Link>
                <Link to="/candidate/applications" className="card flex items-center gap-4 group transition-all hover:border-[var(--accent-primary)]">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, #10b981 10%, transparent)', color: '#10b981' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>My Applications</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Track your application statuses</p>
                    </div>
                </Link>
                <Link to="/candidate/resumes" className="card flex items-center gap-4 group transition-all hover:border-[var(--accent-primary)]">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, #f59e0b 10%, transparent)', color: '#f59e0b' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>My Resumes</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Upload and manage your resumes</p>
                    </div>
                </Link>
            </div>

            {/* Recent Applications */}
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Applications</h2>
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-4"><div className="skeleton h-16 w-full rounded" /></div>
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>No applications yet</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>Browse jobs and start applying!</p>
                    <Link to="/candidate/jobs"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                        style={{ background: 'var(--accent-gradient)' }}>
                        Browse Jobs →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {applications.slice(0, 5).map(app => (
                        <div key={app._id} className="card p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {app.jobId?.title || 'Unknown Job'}
                                    </h4>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${app.status === 'hired' ? 'bg-emerald-500/15 text-emerald-400' :
                                        app.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                                            app.status === 'interview' ? 'bg-purple-500/15 text-purple-400' :
                                                app.status === 'shortlisted' ? 'bg-blue-500/15 text-blue-400' :
                                                    'bg-slate-500/15 text-slate-400'
                                    }`}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                            </div>
                            <StatusStepper currentStatus={app.status} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateDashboard;
