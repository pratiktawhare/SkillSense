const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { generateProfile } = require('../services/profiler');
const { generateJobEmbedding } = require('../services/jobEmbedding');

const router = express.Router();

// ─── Public endpoints (no auth required) ───────────────────────────

// @route   GET /api/jobs/public
// @desc    Browse all jobs (public job board)
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const jobs = await Job.find()
            .select('title rawText profile createdAt recruiter')
            .populate('recruiter', 'name')
            .sort({ createdAt: -1 });

        res.json(jobs.map(j => ({
            id: j._id,
            title: j.title,
            descriptionPreview: j.rawText.substring(0, 200) + '...',
            profile: j.profile ? {
                requiredSkills: j.profile.requiredSkills || [],
                preferredSkills: j.profile.preferredSkills || [],
                totalYearsRequired: j.profile.totalYearsRequired || 0,
                summary: j.profile.summary
            } : null,
            postedBy: j.recruiter?.name || 'Unknown',
            createdAt: j.createdAt
        })));
    } catch (error) {
        console.error('Public jobs error:', error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// @route   GET /api/jobs/public/:id
// @desc    View single job details (public)
// @access  Public
router.get('/public/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .select('title rawText profile createdAt recruiter')
            .populate('recruiter', 'name');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({
            id: job._id,
            title: job.title,
            rawText: job.rawText,
            profile: job.profile,
            postedBy: job.recruiter?.name || 'Unknown',
            createdAt: job.createdAt
        });
    } catch (error) {
        console.error('Public job detail error:', error);
        res.status(500).json({ message: 'Error fetching job' });
    }
});

// ─── Private endpoints (auth required) ─────────────────────────────
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
            profile,
            embeddingStatus: 'pending'
        });

        // Try to generate embedding in background (don't block response)
        generateJobEmbeddingAsync(job._id);

        res.status(201).json({
            id: job._id,
            title: job.title,
            rawText: job.rawText,
            profile: job.profile,
            embeddingStatus: job.embeddingStatus,
            createdAt: job.createdAt
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ message: 'Error creating job' });
    }
});

// Background embedding generation
async function generateJobEmbeddingAsync(jobId) {
    try {
        const job = await Job.findById(jobId);
        if (!job) return;

        job.embeddingStatus = 'processing';
        await job.save();

        const result = await generateJobEmbedding(job);

        job.embedding = result.embedding;
        job.embeddingStatus = 'ready';
        job.embeddingGeneratedAt = result.generatedAt;
        job.embeddingError = undefined;
        await job.save();

        console.log(`✅ Embedding generated for job: ${job.title} (${result.dimensions} dims, ${result.generationTimeMs}ms)`);
    } catch (error) {
        console.error(`❌ Embedding failed for job ${jobId}:`, error.message);

        try {
            await Job.findByIdAndUpdate(jobId, {
                embeddingStatus: 'failed',
                embeddingError: error.message
            });
        } catch (updateError) {
            console.error('Failed to update embedding status:', updateError);
        }
    }
}

// @route   GET /api/jobs
// @desc    Get all jobs for current recruiter
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user._id })
            .select('title rawText profile embeddingStatus createdAt')
            .sort({ createdAt: -1 });

        res.json(jobs.map(j => ({
            id: j._id,
            title: j.title,
            descriptionPreview: j.rawText.substring(0, 150) + '...',
            textPreview: j.rawText.substring(0, 300) + '...',
            profile: j.profile,
            embeddingStatus: j.embeddingStatus,
            hasEmbedding: j.embeddingStatus === 'ready',
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
            embeddingStatus: job.embeddingStatus,
            hasEmbedding: job.embeddingStatus === 'ready',
            embeddingGeneratedAt: job.embeddingGeneratedAt,
            embeddingError: job.embeddingError,
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

// @route   POST /api/jobs/:id/embed
// @desc    Generate or regenerate embedding for a job
// @access  Private
router.post('/:id/embed', auth, async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Update status to processing
        job.embeddingStatus = 'processing';
        await job.save();

        try {
            const result = await generateJobEmbedding(job);

            job.embedding = result.embedding;
            job.embeddingStatus = 'ready';
            job.embeddingGeneratedAt = result.generatedAt;
            job.embeddingError = undefined;
            await job.save();

            res.json({
                id: job._id,
                title: job.title,
                embeddingStatus: 'ready',
                dimensions: result.dimensions,
                generationTimeMs: result.generationTimeMs,
                message: 'Embedding generated successfully'
            });
        } catch (embedError) {
            job.embeddingStatus = 'failed';
            job.embeddingError = embedError.message;
            await job.save();

            res.status(500).json({
                id: job._id,
                embeddingStatus: 'failed',
                error: embedError.message,
                message: 'Embedding generation failed'
            });
        }
    } catch (error) {
        console.error('Embedding generation error:', error);
        res.status(500).json({ message: 'Error generating embedding' });
    }
});

// @route   GET /api/jobs/:id/embedding-status
// @desc    Check embedding status for a job
// @access  Private
router.get('/:id/embedding-status', auth, async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        }).select('embeddingStatus embeddingGeneratedAt embeddingError');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({
            status: job.embeddingStatus,
            hasEmbedding: job.embeddingStatus === 'ready',
            generatedAt: job.embeddingGeneratedAt,
            error: job.embeddingError
        });
    } catch (error) {
        console.error('Embedding status error:', error);
        res.status(500).json({ message: 'Error checking embedding status' });
    }
});

// @route   POST /api/jobs/batch-embed
// @desc    Generate embeddings for all jobs without embeddings
// @access  Private
router.post('/batch-embed', auth, async (req, res) => {
    try {
        const jobs = await Job.find({
            recruiter: req.user._id,
            embeddingStatus: { $in: ['pending', 'failed'] }
        }).select('_id title');

        if (jobs.length === 0) {
            return res.json({ message: 'No jobs need embedding', count: 0 });
        }

        // Start background processing for all jobs
        jobs.forEach(job => generateJobEmbeddingAsync(job._id));

        res.json({
            message: `Started embedding generation for ${jobs.length} jobs`,
            count: jobs.length,
            jobs: jobs.map(j => ({ id: j._id, title: j.title }))
        });
    } catch (error) {
        console.error('Batch embedding error:', error);
        res.status(500).json({ message: 'Error starting batch embedding' });
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
