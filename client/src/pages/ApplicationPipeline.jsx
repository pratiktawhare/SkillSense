import { useState, useEffect } from 'react';
import { applicationAPI, jobAPI } from '../api';

const STAGES = ['applied', 'screening', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];
const STAGE_COLORS = {
    applied: '#3b82f6',
    screening: '#f59e0b',
    shortlisted: '#10b981',
    interview: '#8b5cf6',
    offered: '#06b6d4',
    hired: '#22c55e',
    rejected: '#ef4444'
};

const ApplicationPipeline = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await jobAPI.getAll();
                setJobs(res.data);
                if (res.data.length > 0) {
                    setSelectedJobId(res.data[0].id);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        if (!selectedJobId) return;
        const fetchApplications = async () => {
            try {
                const res = await applicationAPI.getJobApplications(selectedJobId);
                setApplications(res.data);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setApplications([]);
            }
        };
        fetchApplications();
    }, [selectedJobId]);

    const handleStatusChange = async (appId, newStatus) => {
        setUpdating(appId);
        try {
            await applicationAPI.updateStatus(appId, newStatus);
            setApplications(prev => prev.map(a =>
                a._id === appId ? { ...a, status: newStatus } : a
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getCountByStatus = (status) => applications.filter(a => a.status === status).length;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Applications Pipeline
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                View and manage candidate applications
            </p>

            {/* Job Selector */}
            {loading ? (
                <div className="skeleton h-10 w-64 mb-6 rounded-lg" />
            ) : jobs.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No jobs posted yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        Create a job to start receiving applications
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <select
                            value={selectedJobId || ''}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                borderColor: 'var(--border-primary)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stage Summary Bar */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {STAGES.map(stage => (
                            <div key={stage} className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
                                <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                                    {stage}
                                </span>
                                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {getCountByStatus(stage)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Applicant List */}
                    {applications.length === 0 ? (
                        <div className="card p-8 text-center">
                            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                                No applications for this job yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.map(app => (
                                <div key={app._id} className="card p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                                                style={{ background: 'var(--accent-gradient)' }}>
                                                {(app.candidateId?.name || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                    {app.candidateId?.name || 'Unknown Candidate'}
                                                </h4>
                                                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                                                    {app.candidateId?.email || 'No email'} · Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Current Status Badge */}
                                            <span className="px-2.5 py-1 text-xs rounded-full font-medium capitalize"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${STAGE_COLORS[app.status]} 15%, transparent)`,
                                                    color: STAGE_COLORS[app.status]
                                                }}>
                                                {app.status}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                {/* Reject Button (if not already rejected/hired) */}
                                                {app.status !== 'rejected' && app.status !== 'hired' && (
                                                    <button
                                                        onClick={() => handleStatusChange(app._id, 'rejected')}
                                                        disabled={updating === app._id}
                                                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
                                                        title="Reject Candidate"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Restore Button (if rejected) */}
                                                {app.status === 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusChange(app._id, 'applied')}
                                                        disabled={updating === app._id}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                                                        title="Restore to Applied"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                            <path d="M3 3v5h5" />
                                                        </svg>
                                                        <span>Restore</span>
                                                    </button>
                                                )}

                                                {/* Advance Button (if next stage exists) */}
                                                {(() => {
                                                    const idx = STAGES.indexOf(app.status);
                                                    // Allow advancing up to 'hired' (index 5). 'rejected' is index 6.
                                                    if (idx !== -1 && idx < 5) {
                                                        const nextStage = STAGES[idx + 1];
                                                        return (
                                                            <button
                                                                onClick={() => handleStatusChange(app._id, nextStage)}
                                                                disabled={updating === app._id}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                                                                title={`Move to ${nextStage}`}
                                                            >
                                                                <span>Next: {nextStage.charAt(0).toUpperCase() + nextStage.slice(1)}</span>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                                </svg>
                                                            </button>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ApplicationPipeline;
