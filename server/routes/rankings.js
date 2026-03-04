const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { rankCandidatesForJob, sensitivityAnalysis } = require('../services/rankingEngine');
const Note = require('../models/Note');

/**
 * GET /api/rankings/job/:jobId
 * Get ranked candidates for a job
 */
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        const ranked = await rankCandidatesForJob(req.params.jobId);
        res.json(ranked);
    } catch (error) {
        console.error('Ranking error:', error);
        res.status(500).json({ error: 'Failed to generate rankings' });
    }
});

/**
 * POST /api/rankings/sensitivity
 * "What-if" sensitivity analysis
 */
router.post('/sensitivity', auth, async (req, res) => {
    try {
        const { jobId, resumeId, skill } = req.body;
        if (!jobId || !resumeId) {
            return res.status(400).json({ error: 'jobId and resumeId are required' });
        }
        const result = await sensitivityAnalysis(jobId, resumeId, skill || 'Unknown Skill');
        res.json(result);
    } catch (error) {
        console.error('Sensitivity analysis error:', error);
        res.status(500).json({ error: 'Failed to run analysis' });
    }
});

/**
 * POST /api/rankings/compare
 * Compare selected candidates side by side
 */
router.post('/compare', auth, async (req, res) => {
    try {
        const { jobId, resumeIds } = req.body;
        if (!jobId || !resumeIds || resumeIds.length < 2) {
            return res.status(400).json({ error: 'jobId and at least 2 resumeIds are required' });
        }

        const ranked = await rankCandidatesForJob(jobId);
        const selected = ranked.filter(r => resumeIds.includes(r.resumeId.toString()));

        if (selected.length < 2) {
            return res.status(404).json({ error: 'Not enough candidates found in results' });
        }

        res.json(selected);
    } catch (error) {
        console.error('Compare error:', error);
        res.status(500).json({ error: 'Failed to compare candidates' });
    }
});

/**
 * GET /api/rankings/notes/:resumeId
 * Get all notes for a candidate
 */
router.get('/notes/:resumeId', auth, async (req, res) => {
    try {
        const { jobId } = req.query;
        const filter = { recruiter: req.user._id, resumeId: req.params.resumeId };
        if (jobId) filter.jobId = jobId;

        const notes = await Note.find(filter).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

/**
 * POST /api/rankings/notes
 * Add a note for a candidate
 */
router.post('/notes', auth, async (req, res) => {
    try {
        const { resumeId, jobId, content } = req.body;
        if (!resumeId || !content) {
            return res.status(400).json({ error: 'resumeId and content are required' });
        }

        const note = await Note.create({
            recruiter: req.user._id,
            resumeId,
            jobId: jobId || null,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

/**
 * DELETE /api/rankings/notes/:noteId
 * Delete a note
 */
router.delete('/notes/:noteId', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.noteId,
            recruiter: req.user._id
        });
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;
