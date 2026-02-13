const express = require('express');
const Match = require('../models/Match');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { matchResumeToJob } = require('../services/matchingEngine');

const router = express.Router();

// ─── POST /api/match/job/:jobId ────────────────────────────────────────────
// @desc    Run matching for all resumes against a job
// @access  Private
router.post('/job/:jobId', auth, async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.jobId,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Get all resumes for this recruiter
        const resumes = await Resume.find({ recruiter: req.user._id });

        if (resumes.length === 0) {
            return res.json({ message: 'No resumes to match', matches: [], count: 0 });
        }

        const matches = [];
        let newCount = 0;
        let updatedCount = 0;

        for (const resume of resumes) {
            // Run matching algorithm
            const result = matchResumeToJob(resume, job);

            // Upsert match record (update if exists, create if not)
            const matchDoc = await Match.findOneAndUpdate(
                { jobId: job._id, resumeId: resume._id },
                {
                    recruiter: req.user._id,
                    jobId: job._id,
                    resumeId: resume._id,
                    scores: result.scores,
                    matchedSkills: result.matchedSkills,
                    missingSkills: result.missingSkills,
                    bonusSkills: result.bonusSkills,
                    interpretation: result.interpretation,
                    candidateName: result.candidateName,
                    jobTitle: result.jobTitle,
                    calculatedAt: new Date()
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (matchDoc.isNew) {
                newCount++;
            } else {
                updatedCount++;
            }

            matches.push({
                id: matchDoc._id,
                resumeId: resume._id,
                candidateName: result.candidateName,
                scores: result.scores,
                matchedSkills: result.matchedSkills,
                missingSkills: result.missingSkills,
                bonusSkills: result.bonusSkills,
                interpretation: result.interpretation,
                status: matchDoc.status,
                calculatedAt: matchDoc.calculatedAt
            });
        }

        // Sort by final score descending
        matches.sort((a, b) => b.scores.final - a.scores.final);

        // Add rank
        matches.forEach((m, idx) => {
            m.rank = idx + 1;
        });

        console.log(`🎯 Matched ${matches.length} resumes against "${job.title}" (${newCount} new, ${updatedCount} updated)`);

        res.json({
            jobId: job._id,
            jobTitle: job.title,
            matches,
            count: matches.length,
            averageScore: matches.length > 0
                ? Math.round(matches.reduce((sum, m) => sum + m.scores.final, 0) / matches.length * 10) / 10
                : 0
        });
    } catch (error) {
        console.error('Matching error:', error);
        res.status(500).json({ message: 'Error running matching' });
    }
});

// ─── GET /api/match/job/:jobId/results ─────────────────────────────────────
// @desc    Get cached match results for a job
// @access  Private
router.get('/job/:jobId/results', auth, async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.jobId,
            recruiter: req.user._id
        }).select('title');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const matches = await Match.find({
            jobId: req.params.jobId,
            recruiter: req.user._id
        }).sort({ 'scores.final': -1 });

        const results = matches.map((m, idx) => ({
            id: m._id,
            resumeId: m.resumeId,
            candidateName: m.candidateName,
            scores: m.scores,
            matchedSkills: m.matchedSkills,
            missingSkills: m.missingSkills,
            bonusSkills: m.bonusSkills,
            interpretation: m.interpretation,
            status: m.status,
            calculatedAt: m.calculatedAt,
            rank: idx + 1
        }));

        res.json({
            jobId: job._id,
            jobTitle: job.title,
            matches: results,
            count: results.length,
            averageScore: results.length > 0
                ? Math.round(results.reduce((sum, m) => sum + m.scores.final, 0) / results.length * 10) / 10
                : 0
        });
    } catch (error) {
        console.error('Get match results error:', error);
        res.status(500).json({ message: 'Error fetching match results' });
    }
});

// ─── PUT /api/match/:matchId/status ────────────────────────────────────────
// @desc    Update match status (shortlist, reject, pending)
// @access  Private
router.put('/:matchId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use: pending, shortlisted, rejected' });
        }

        const match = await Match.findOneAndUpdate(
            { _id: req.params.matchId, recruiter: req.user._id },
            { status },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        res.json({
            id: match._id,
            status: match.status,
            candidateName: match.candidateName,
            message: `Candidate ${match.candidateName} ${status}`
        });
    } catch (error) {
        console.error('Update match status error:', error);
        res.status(500).json({ message: 'Error updating match status' });
    }
});

module.exports = router;
