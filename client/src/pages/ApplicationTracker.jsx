import { useState, useEffect } from 'react';
import { applicationAPI } from '../api';
import StatusStepper from '../components/StatusStepper';

const ApplicationTracker = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await applicationAPI.getMyApplications();
                setApplications(res.data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'applied', label: 'Applied' },
        { key: 'screening', label: 'Screening' },
        { key: 'shortlisted', label: 'Shortlisted' },
        { key: 'interview', label: 'Interview' },
        { key: 'offered', label: 'Offered' },
        { key: 'hired', label: 'Hired' },
        { key: 'rejected', label: 'Rejected' }
    ];

    const filtered = filter === 'all'
        ? applications
        : applications.filter(a => a.status === filter);

    const statusColors = {
        applied: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
        screening: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
        shortlisted: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
        interview: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
        offered: { bg: 'bg-green-500/15', text: 'text-green-400' },
        hired: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
        rejected: { bg: 'bg-red-500/15', text: 'text-red-400' }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                My Applications
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Track the status of your job applications
            </p>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map(f => {
                    const count = f.key === 'all'
                        ? applications.length
                        : applications.filter(a => a.status === f.key).length;

                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap border transition-all ${filter === f.key
                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                    : 'border-transparent hover:border-[var(--border-primary)]'
                                }`}
                            style={filter !== f.key ? { color: 'var(--text-secondary)' } : {}}
                        >
                            {f.label} {count > 0 ? `(${count})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Application List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-6"><div className="skeleton h-20 w-full rounded" /></div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {filter === 'all' ? 'Browse jobs and start applying!' : 'Try a different filter'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(app => {
                        const colors = statusColors[app.status] || statusColors.applied;
                        return (
                            <div key={app._id} className="card p-5">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {app.jobId?.title || 'Unknown Job'}
                                        </h3>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                            Applied on {new Date(app.appliedAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${colors.bg} ${colors.text}`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </div>

                                {/* Status Stepper */}
                                <StatusStepper currentStatus={app.status} />

                                {/* Status History */}
                                {app.statusHistory && app.statusHistory.length > 1 && (
                                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                        <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                            STATUS HISTORY
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {app.statusHistory.map((h, i) => (
                                                <span key={i} className="text-[11px] px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: 'var(--bg-tertiary)',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                    {h.status} · {new Date(h.changedAt).toLocaleDateString()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ApplicationTracker;
