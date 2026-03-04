const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { calculateCredibility } = require('../services/credibilityCalculator');

/**
 * GET /api/credibility/resume/:id
 * Get credibility report for a specific resume
 */
router.get('/resume/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        const report = calculateCredibility(resume);

        // Save credibility data to resume
        resume.credibility = {
            score: report.score,
            trustLevel: report.trustLevel,
            flagCount: report.flagCount,
            analyzedAt: report.analyzedAt
        };
        await resume.save();

        res.json(report);
    } catch (error) {
        console.error('Credibility analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze credibility' });
    }
});

/**
 * POST /api/credibility/analyze
 * Run credibility analysis on a resume by ID
 */
router.post('/analyze', auth, async (req, res) => {
    try {
        const { resumeId } = req.body;
        if (!resumeId) {
            return res.status(400).json({ error: 'resumeId is required' });
        }

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        const report = calculateCredibility(resume);

        // Save credibility data to resume
        resume.credibility = {
            score: report.score,
            trustLevel: report.trustLevel,
            flagCount: report.flagCount,
            analyzedAt: report.analyzedAt
        };
        await resume.save();

        res.json(report);
    } catch (error) {
        console.error('Credibility analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze credibility' });
    }
});

/**
 * POST /api/credibility/batch-analyze
 * Run credibility analysis on all resumes
 */
router.post('/batch-analyze', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({});
        const results = [];

        for (const resume of resumes) {
            const report = calculateCredibility(resume);
            resume.credibility = {
                score: report.score,
                trustLevel: report.trustLevel,
                flagCount: report.flagCount,
                analyzedAt: report.analyzedAt
            };
            await resume.save();
            results.push({
                resumeId: resume._id,
                candidateName: resume.candidateName,
                score: report.score,
                trustLevel: report.trustLevel,
                flagCount: report.flagCount
            });
        }

        res.json({
            analyzed: results.length,
            results
        });
    } catch (error) {
        console.error('Batch credibility analysis error:', error);
        res.status(500).json({ error: 'Failed to batch analyze' });
    }
});

module.exports = router;
