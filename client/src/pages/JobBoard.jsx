import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobAPI, applicationAPI, resumeAPI } from '../api';

const JobBoard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [resumes, setResumes] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobRes = await jobAPI.getPublicJobs();
                setJobs(jobRes.data);

                if (user && user.role === 'candidate') {
                    const [appRes, resumeRes] = await Promise.all([
                        applicationAPI.getMyApplications(),
                        resumeAPI.getAll()
                    ]);
                    const appliedIds = new Set(appRes.data.map(a => a.jobId?._id || a.jobId));
                    setAppliedJobs(appliedIds);
                    setResumes(resumeRes.data);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleApply = async (jobId) => {
        setApplying(jobId);
        setMessage('');
        try {
            await applicationAPI.apply({
                jobId,
                resumeId: resumes.length > 0 ? resumes[0].id : undefined
            });
            setAppliedJobs(prev => new Set([...prev, jobId]));
            setMessage('Application submitted successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.profile?.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Job Board</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {jobs.length} open position{jobs.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>
            </div>

            {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                    {message}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-6"><div className="skeleton h-24 w-full rounded" /></div>
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {searchTerm ? 'No jobs match your search' : 'No jobs posted yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="card overflow-hidden">
                            <div
                                className="p-5 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                            {job.title}
                                        </h3>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                            Posted by {job.postedBy} · {new Date(job.createdAt).toLocaleDateString()}
                                        </p>
                                        {job.profile?.summary && (
                                            <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                                {job.profile.summary}
                                            </p>
                                        )}

                                        {/* Skills */}
                                        {job.profile?.requiredSkills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {job.profile.requiredSkills.slice(0, 6).map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs rounded-full border"
                                                        style={{
                                                            backgroundColor: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)',
                                                            borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)',
                                                            color: 'var(--accent-primary)'
                                                        }}>
                                                        {skill.name}
                                                    </span>
                                                ))}
                                                {job.profile.requiredSkills.length > 6 && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full" style={{ color: 'var(--text-tertiary)' }}>
                                                        +{job.profile.requiredSkills.length - 6} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {job.profile?.totalYearsRequired > 0 && (
                                            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                                                {job.profile.totalYearsRequired}+ years experience required
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        {user?.role === 'candidate' && (
                                            appliedJobs.has(job.id) ? (
                                                <span className="px-3 py-1.5 text-xs rounded-lg font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    ✓ Applied
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}
                                                    disabled={applying === job.id}
                                                    className="px-4 py-1.5 text-xs rounded-lg font-medium text-white disabled:opacity-50 transition-all hover:scale-105"
                                                    style={{ background: 'var(--accent-gradient)' }}
                                                >
                                                    {applying === job.id ? 'Applying...' : 'Apply Now'}
                                                </button>
                                            )
                                        )}
                                        {!user && (
                                            <a href="/login" className="px-4 py-1.5 text-xs rounded-lg font-medium text-white"
                                                style={{ background: 'var(--accent-gradient)' }}>
                                                Login to Apply
                                            </a>
                                        )}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: expandedId === job.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === job.id && (
                                <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
                                    <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                        {job.descriptionPreview}
                                    </p>
                                    {job.profile?.preferredSkills?.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>PREFERRED SKILLS</h5>
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.profile.preferredSkills.map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs rounded-full border"
                                                        style={{
                                                            backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 8%, transparent)',
                                                            borderColor: 'color-mix(in srgb, var(--accent-secondary) 25%, transparent)',
                                                            color: 'var(--accent-secondary)'
                                                        }}>
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobBoard;
