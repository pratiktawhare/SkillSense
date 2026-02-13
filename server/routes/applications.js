const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');

const router = express.Router();

// @route   POST /api/applications
// @desc    Candidate applies to a job
// @access  Candidate only
router.post('/', auth, requireRole('candidate'), async (req, res) => {
    try {
        const { jobId, resumeId } = req.body;

        // Verify job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const existing = await Application.findOne({
            candidateId: req.user._id,
            jobId
        });
        if (existing) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Verify resume if provided
        if (resumeId) {
            const resume = await Resume.findOne({ _id: resumeId, recruiter: req.user._id });
            if (!resume) {
                return res.status(404).json({ message: 'Resume not found' });
            }
        }

        const application = await Application.create({
            candidateId: req.user._id,
            jobId,
            resumeId: resumeId || undefined,
            statusHistory: [{ status: 'applied', changedBy: req.user._id }]
        });

        res.status(201).json(application);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }
        console.error('Apply error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/applications/my
// @desc    Candidate gets their applications
// @access  Candidate only
router.get('/my', auth, requireRole('candidate'), async (req, res) => {
    try {
        const applications = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'title rawText profile createdAt')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/applications/job/:jobId
// @desc    Recruiter gets applications for a specific job
// @access  Recruiter only
router.get('/job/:jobId', auth, requireRole('recruiter'), async (req, res) => {
    try {
        // Verify this job belongs to the recruiter
        const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const applications = await Application.find({ jobId: req.params.jobId })
            .populate('candidateId', 'name email')
            .populate('resumeId', 'candidateName profile profileCompleteness')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Get job applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Recruiter updates application status
// @access  Recruiter only
router.put('/:id/status', auth, requireRole('recruiter'), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['applied', 'screening', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify the job belongs to this recruiter
        const job = await Job.findOne({ _id: application.jobId, recruiter: req.user._id });
        if (!job) {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        application.status = status;
        application.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.user._id
        });

        await application.save();
        res.json(application);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
