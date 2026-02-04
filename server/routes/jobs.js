const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { generateProfile } = require('../services/profiler');

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job description with auto-profiling
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, rawText } = req.body;

        if (!title || !rawText) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Generate profile from job description
        const profile = generateProfile(rawText, 'job');

        const job = await Job.create({
            recruiter: req.user._id,
            title,
            rawText,
            profile
        });

        res.status(201).json({
            id: job._id,
            title: job.title,
            rawText: job.rawText,
            profile: job.profile,
            createdAt: job.createdAt
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ message: 'Error creating job' });
    }
});

// @route   GET /api/jobs
// @desc    Get all jobs for current recruiter
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user._id })
            .select('title rawText profile createdAt')
            .sort({ createdAt: -1 });

        res.json(jobs.map(j => ({
            id: j._id,
            title: j.title,
            descriptionPreview: j.rawText.substring(0, 150) + '...',
            profile: j.profile,
            createdAt: j.createdAt
        })));
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job with full details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({
            id: job._id,
            title: job.title,
            rawText: job.rawText,
            profile: job.profile,
            createdAt: job.createdAt
        });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ message: 'Error fetching job' });
    }
});

// @route   POST /api/jobs/:id/profile
// @desc    Regenerate profile for a job
// @access  Private
router.post('/:id/profile', auth, async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Regenerate profile
        const profile = generateProfile(job.rawText, 'job');
        job.profile = profile;
        await job.save();

        res.json({
            id: job._id,
            title: job.title,
            profile: job.profile,
            message: 'Profile regenerated successfully'
        });
    } catch (error) {
        console.error('Profile generation error:', error);
        res.status(500).json({ message: 'Error generating profile' });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ message: 'Error deleting job' });
    }
});

module.exports = router;
