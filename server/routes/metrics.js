const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const metricsService = require('../services/metricsService');

// All metrics routes require auth (and role check in a real app)

/**
 * GET /api/metrics/overview
 * Get high-level KPI overview
 */
router.get('/overview', auth, async (req, res) => {
    try {
        const recruiterId = req.user._id;
        const [overview, scoreDistribution, hiringFunnel, activityFeed] = await Promise.all([
            metricsService.getDashboardOverview(recruiterId),
            metricsService.getScoreDistribution(recruiterId),
            metricsService.getHiringFunnel(recruiterId),
            metricsService.getActivityFeed(recruiterId)
        ]);

        const skillGaps = await metricsService.getSkillGaps(recruiterId);

        res.json({
            overview,
            scoreDistribution,
            hiringFunnel,
            skillGaps,
            activityFeed
        });
    } catch (error) {
        console.error('Metrics overview error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics overview' });
    }
});

/**
 * GET /api/metrics/job/:jobId
 * Get analytics specifically for a single job
 */
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        const recruiterId = req.user._id;
        const jobId = req.params.jobId;

        const [scoreDistribution, hiringFunnel] = await Promise.all([
            metricsService.getScoreDistribution(recruiterId, jobId),
            metricsService.getHiringFunnel(recruiterId, jobId)
        ]);

        res.json({
            scoreDistribution,
            hiringFunnel
        });
    } catch (error) {
        console.error(`Metrics API Error (Job ${req.params.jobId}):`, error);
        res.status(500).json({ error: 'Failed to fetch job metrics' });
    }
});

module.exports = router;
