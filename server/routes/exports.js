const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { generateJobReport, generateResumeSummary } = require('../services/pdfGenerator');

// ─── GET /api/export/job/:jobId/pdf ────────────────────────────────────────
// Download PDF report for a job's matching results
router.get('/job/:jobId/pdf', auth, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const matches = await Match.find({ jobId: job._id, recruiter: req.user._id })
            .sort({ 'scores.final': -1 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="SkillSense_Report_${job.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);

        generateJobReport(job, matches, res);
    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// ─── GET /api/export/job/:jobId/csv ────────────────────────────────────────
// Download CSV ranking for a job
router.get('/job/:jobId/csv', auth, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const matches = await Match.find({ jobId: job._id, recruiter: req.user._id })
            .sort({ 'scores.final': -1 });

        // Build CSV
        const headers = ['Rank', 'Candidate', 'Final Score', 'Skill Score', 'Experience Score', 'Semantic Score', 'Matched Skills', 'Missing Skills', 'Status'];
        const rows = matches.map((m, idx) => [
            idx + 1,
            `"${m.candidateName || 'Unknown'}"`,
            Math.round(m.scores?.final || 0),
            Math.round(m.scores?.skillMatch || 0),
            Math.round(m.scores?.experience || 0),
            Math.round(m.scores?.semantic || 0),
            `"${(m.matchedSkills || []).map(s => s.name || s).join(', ')}"`,
            `"${(m.missingSkills || []).map(s => s.name || s).join(', ')}"`,
            m.status || 'pending'
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="SkillSense_Rankings_${job.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
});

// ─── GET /api/export/resume/:resumeId/pdf ──────────────────────────────────
// Download PDF summary for a single resume
router.get('/resume/:resumeId/pdf', auth, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);
        if (!resume) return res.status(404).json({ error: 'Resume not found' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="SkillSense_Profile_${(resume.candidateName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);

        generateResumeSummary(resume, res);
    } catch (error) {
        console.error('Resume PDF error:', error);
        res.status(500).json({ error: 'Failed to generate resume PDF' });
    }
});

// ─── POST /api/export/batch-delete ─────────────────────────────────────────
// Bulk delete resumes
router.post('/batch-delete', auth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        const result = await Resume.deleteMany({ _id: { $in: ids }, recruiter: req.user._id });
        // Also clean up related matches
        await Match.deleteMany({ resumeId: { $in: ids } });

        res.json({ deleted: result.deletedCount, message: `Deleted ${result.deletedCount} resumes` });
    } catch (error) {
        console.error('Batch delete error:', error);
        res.status(500).json({ error: 'Failed to batch delete' });
    }
});

// ─── POST /api/export/batch-status ─────────────────────────────────────────
// Bulk update match status (shortlist/reject)
router.post('/batch-status', auth, async (req, res) => {
    try {
        const { matchIds, status } = req.body;
        if (!matchIds || !Array.isArray(matchIds) || !status) {
            return res.status(400).json({ error: 'matchIds and status required' });
        }

        const result = await Match.updateMany(
            { _id: { $in: matchIds }, recruiter: req.user._id },
            { $set: { status } }
        );

        res.json({ updated: result.modifiedCount, message: `Updated ${result.modifiedCount} candidates to ${status}` });
    } catch (error) {
        console.error('Batch status error:', error);
        res.status(500).json({ error: 'Failed to batch update' });
    }
});

// ─── GET /api/export/search ────────────────────────────────────────────────
// Global search across candidates, jobs, matches
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ candidates: [], jobs: [] });

        const regex = new RegExp(q, 'i');

        const [candidates, jobs] = await Promise.all([
            Resume.find({ recruiter: req.user._id, candidateName: regex }).select('candidateName fileName').limit(10),
            Job.find({ recruiter: req.user._id, title: regex }).select('title company').limit(10)
        ]);

        res.json({ candidates, jobs });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
