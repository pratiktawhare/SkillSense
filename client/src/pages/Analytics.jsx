import { useState, useEffect } from 'react';
import { metricsAPI } from '../api';
import StatsCard from '../components/StatsCard';
import MatchDistribution from '../components/MatchDistribution';
import SkillGapChart from '../components/SkillGapChart';
import HiringFunnel from '../components/HiringFunnel';
import ActivityFeed from '../components/ActivityFeed';

const Analytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const res = await metricsAPI.getOverview();
            setMetrics(res.data);
        } catch (err) {
            console.error('Failed to load metrics', err);
            setError('Failed to load dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center card">
                <p className="text-xl font-medium mb-4" style={{ color: 'var(--error)' }}>{error}</p>
                <button onClick={loadMetrics} className="btn-primary">Retry</button>
            </div>
        );
    }

    if (!metrics) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Analytics Dashboard
            </h1>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Candidates"
                    value={metrics.overview.totalCandidates}
                    trend={metrics.overview.trends.candidates}
                    icon="👥"
                    color="var(--accent-primary)"
                />
                <StatsCard
                    title="Active Jobs"
                    value={metrics.overview.activeJobs}
                    trend={metrics.overview.trends.jobs}
                    icon="💼"
                    color="var(--info)"
                />
                <StatsCard
                    title="Avg Match Score"
                    value={metrics.overview.avgMatchScore}
                    trend={metrics.overview.trends.score}
                    icon="🎯"
                    color="var(--warning)"
                />
                <StatsCard
                    title="Shortlist Rate"
                    value={`${metrics.overview.shortlistRate}%`}
                    trend={metrics.overview.trends.rate}
                    icon="⭐"
                    color="var(--success)"
                />
            </div>

            {/* Charts Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MatchDistribution data={metrics.scoreDistribution} />
                <HiringFunnel data={metrics.hiringFunnel} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillGapChart data={metrics.skillGaps} />
                <ActivityFeed activities={metrics.activityFeed} />
            </div>
        </div>
    );
};

export default Analytics;
