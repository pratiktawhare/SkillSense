import { useState, useEffect } from 'react';
import { jobAPI, matchAPI } from '../api';
import MatchCard from '../components/MatchCard';
import ScoreGauge from '../components/ScoreGauge';

const MatchingView = ({ onBack }) => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [matches, setMatches] = useState([]);
    const [matchMeta, setMatchMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matching, setMatching] = useState(false);
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [filter, setFilter] = useState('all'); // all, shortlisted, rejected, pending

    // Fetch jobs on mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await jobAPI.getAll();
            setJobs(res.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    // When a job is selected, try to load cached results
    useEffect(() => {
        if (selectedJobId) {
            loadCachedResults(selectedJobId);
        }
    }, [selectedJobId]);

    const loadCachedResults = async (jobId) => {
        setLoading(true);
        try {
            const res = await matchAPI.getResults(jobId);
            setMatches(res.data.matches || []);
            setMatchMeta(res.data);
        } catch {
            setMatches([]);
            setMatchMeta(null);
        } finally {
            setLoading(false);
        }
    };

    const runMatching = async () => {
        if (!selectedJobId) return;
        setMatching(true);
        try {
            const res = await matchAPI.runMatching(selectedJobId);
            setMatches(res.data.matches || []);
            setMatchMeta(res.data);
        } catch (error) {
            console.error('Matching error:', error);
        } finally {
            setMatching(false);
        }
    };

    const handleStatusChange = async (matchId, newStatus) => {
        setUpdatingIds(prev => new Set([...prev, matchId]));
        try {
            await matchAPI.updateStatus(matchId, newStatus);
            setMatches(prev => prev.map(m =>
                m.id === matchId ? { ...m, status: newStatus } : m
            ));
        } catch (error) {
            console.error('Status update error:', error);
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(matchId);
                return next;
            });
        }
    };

    // Filter matches
    const filteredMatches = matches.filter(m => {
        if (filter === 'all') return true;
        return m.status === filter;
    });

    // Stats
    const stats = {
        total: matches.length,
        shortlisted: matches.filter(m => m.status === 'shortlisted').length,
        rejected: matches.filter(m => m.status === 'rejected').length,
        pending: matches.filter(m => m.status === 'pending').length,
        avgScore: matches.length > 0
            ? Math.round(matches.reduce((s, m) => s + m.scores.final, 0) / matches.length * 10) / 10
            : 0,
        topScore: matches.length > 0 ? matches[0]?.scores.final : 0
    };

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const readyJobs = jobs.filter(j => j.embeddingStatus === 'ready');

    return (
        <div className="space-y-6">
            {/* Job selector */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🎯 Select Job to Match</h3>

                {readyJobs.length === 0 ? (
                    <div className="text-center py-6">
                        <span className="text-3xl">🔄</span>
                        <p className="text-slate-400 mt-2">
                            No jobs with AI embeddings yet. Go to Jobs tab to create and embed jobs first.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {readyJobs.map(job => (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJobId(job.id)}
                                    className={`p-3 rounded-xl text-left transition-all border ${selectedJobId === job.id
                                        ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                        : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                                        }`}
                                >
                                    <h4 className="text-white font-medium text-sm truncate">{job.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-emerald-400">🧠 AI Ready</span>
                                        {job.profile?.requiredSkills?.length > 0 && (
                                            <span className="text-xs text-slate-500">
                                                {job.profile.requiredSkills.length} required skills
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Non-ready jobs notice */}
                        {jobs.length > readyJobs.length && (
                            <p className="text-xs text-slate-500">
                                {jobs.length - readyJobs.length} job(s) not shown (embedding not ready)
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Match controls */}
            {selectedJobId && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Matching: {selectedJob?.title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {matches.length > 0
                                    ? `${matches.length} candidates matched • Average score: ${stats.avgScore}%`
                                    : 'Click "Run Matching" to analyze all resumes against this job'
                                }
                            </p>
                        </div>
                        <button
                            onClick={runMatching}
                            disabled={matching}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {matching ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span> Matching...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    🎯 {matches.length > 0 ? 'Re-match' : 'Run Matching'}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats bar with score gauges */}
            {matches.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        {/* Score gauges */}
                        <div className="flex items-center gap-8">
                            <ScoreGauge score={stats.avgScore} size={90} strokeWidth={7} label="Average" />
                            <ScoreGauge score={stats.topScore} size={90} strokeWidth={7} label="Top Score" />
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-xs text-slate-400 mt-1">Total Candidates</p>
                            </div>
                            <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-2xl font-bold text-emerald-400">{stats.shortlisted}</p>
                                <p className="text-xs text-slate-400 mt-1">Shortlisted</p>
                            </div>
                            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                                <p className="text-xs text-slate-400 mt-1">Pending</p>
                            </div>
                            <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                                <p className="text-xs text-slate-400 mt-1">Rejected</p>
                            </div>
                        </div>
                    </div>

                    {/* Score distribution mini bar */}
                    {(() => {
                        const excellent = matches.filter(m => m.scores.final >= 85).length;
                        const good = matches.filter(m => m.scores.final >= 70 && m.scores.final < 85).length;
                        const partial = matches.filter(m => m.scores.final >= 50 && m.scores.final < 70).length;
                        const weak = matches.filter(m => m.scores.final < 50).length;
                        const total = matches.length;

                        return (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                    <span>Score Distribution</span>
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent ({excellent})</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Good ({good})</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Partial ({partial})</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Weak ({weak})</span>
                                    </div>
                                </div>
                                <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-700">
                                    {excellent > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(excellent / total) * 100}%` }} />}
                                    {good > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(good / total) * 100}%` }} />}
                                    {partial > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${(partial / total) * 100}%` }} />}
                                    {weak > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(weak / total) * 100}%` }} />}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Filter tabs */}
            {matches.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: `All (${stats.total})` },
                        { key: 'shortlisted', label: `Shortlisted (${stats.shortlisted})`, color: 'emerald' },
                        { key: 'pending', label: `Pending (${stats.pending})` },
                        { key: 'rejected', label: `Rejected (${stats.rejected})`, color: 'red' }
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f.key
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading state */}
            {(loading || matching) && (
                <div className="flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                        <p className="text-slate-400 text-sm">
                            {matching ? 'Analyzing resumes...' : 'Loading results...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Results */}
            {!loading && !matching && matches.length > 0 && (
                <div className="space-y-3">
                    {filteredMatches.length === 0 ? (
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
                            <p className="text-slate-400">No candidates match this filter.</p>
                        </div>
                    ) : (
                        filteredMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                rank={match.rank}
                                onStatusChange={handleStatusChange}
                                updating={updatingIds.has(match.id)}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Empty state after matching */}
            {!loading && !matching && selectedJobId && matches.length === 0 && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
                    <span className="text-4xl">🎯</span>
                    <h3 className="text-lg font-medium text-white mt-4">Ready to Match</h3>
                    <p className="text-slate-400 mt-2">
                        Click "Run Matching" to analyze all uploaded resumes against this job.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MatchingView;
