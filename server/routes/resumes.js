const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse-new');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { generateProfile } = require('../services/profiler');
const { generateResumeEmbedding, calculateProfileCompleteness } = require('../services/resumeEmbedding');

const router = express.Router();

// Configure multer for memory storage (no disk save)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

/**
 * Generate embedding for a resume in the background
 */
async function generateResumeEmbeddingAsync(resumeId) {
    try {
        const resume = await Resume.findById(resumeId);
        if (!resume) return;

        resume.embeddingStatus = 'processing';
        await resume.save();

        const result = await generateResumeEmbedding(resume);

        resume.embedding = result.embedding;
        resume.embeddingStatus = 'ready';
        resume.embeddingGeneratedAt = result.generatedAt;
        resume.embeddingError = undefined;

        // Calculate profile completeness
        const completeness = calculateProfileCompleteness(resume);
        resume.profileCompleteness = completeness.score;

        await resume.save();
        console.log(`✅ Embedding generated for resume: ${resume.candidateName} (${result.dimensions}d, ${result.generationTimeMs}ms)`);
    } catch (error) {
        console.error(`❌ Embedding failed for resume ${resumeId}:`, error.message);
        try {
            await Resume.findByIdAndUpdate(resumeId, {
                embeddingStatus: 'failed',
                embeddingError: error.message
            });
        } catch (updateError) {
            console.error('Failed to update embedding status:', updateError.message);
        }
    }
}

// @route   POST /api/resumes
// @desc    Upload a resume PDF with auto-profiling + background embedding
// @access  Private
router.post('/', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const { candidateName } = req.body;
        if (!candidateName) {
            return res.status(400).json({ message: 'Candidate name is required' });
        }

        // Extract text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const rawText = pdfData.text;

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ message: 'Could not extract text from PDF' });
        }

        // Generate profile from extracted text
        const profile = generateProfile(rawText, 'resume');

        // Create resume record with profile
        const resume = await Resume.create({
            recruiter: req.user._id,
            candidateName,
            fileName: req.file.originalname,
            rawText,
            profile,
            embeddingStatus: 'pending'
        });

        // Calculate initial completeness (without embedding)
        const completeness = calculateProfileCompleteness(resume);
        resume.profileCompleteness = completeness.score;
        await resume.save();

        // Trigger embedding generation in background
        generateResumeEmbeddingAsync(resume._id);

        res.status(201).json({
            id: resume._id,
            candidateName: resume.candidateName,
            fileName: resume.fileName,
            textPreview: rawText.substring(0, 200) + '...',
            profile: resume.profile,
            embeddingStatus: resume.embeddingStatus,
            profileCompleteness: resume.profileCompleteness,
            uploadedAt: resume.uploadedAt
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ message: 'Error processing resume' });
    }
});

// @route   GET /api/resumes
// @desc    Get all resumes for current recruiter
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({ recruiter: req.user._id })
            .select('candidateName fileName uploadedAt rawText profile embeddingStatus profileCompleteness embeddingGeneratedAt embeddingError')
            .sort({ uploadedAt: -1 });

        res.json(resumes.map(r => ({
            id: r._id,
            candidateName: r.candidateName,
            fileName: r.fileName,
            textPreview: r.rawText.substring(0, 200) + '...',
            profile: r.profile,
            embeddingStatus: r.embeddingStatus || 'pending',
            profileCompleteness: r.profileCompleteness || 0,
            uploadedAt: r.uploadedAt
        })));
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({ message: 'Error fetching resumes' });
    }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume with full details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Calculate completeness on the fly
        const completeness = calculateProfileCompleteness(resume);

        res.json({
            id: resume._id,
            candidateName: resume.candidateName,
            fileName: resume.fileName,
            rawText: resume.rawText,
            profile: resume.profile,
            embeddingStatus: resume.embeddingStatus || 'pending',
            profileCompleteness: completeness.score,
            completenessBreakdown: completeness.breakdown,
            suggestions: completeness.suggestions,
            uploadedAt: resume.uploadedAt
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({ message: 'Error fetching resume' });
    }
});

// @route   POST /api/resumes/:id/embed
// @desc    Generate/regenerate embedding for a resume
// @access  Private
router.post('/:id/embed', auth, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Update status
        resume.embeddingStatus = 'processing';
        await resume.save();

        try {
            const result = await generateResumeEmbedding(resume);

            resume.embedding = result.embedding;
            resume.embeddingStatus = 'ready';
            resume.embeddingGeneratedAt = result.generatedAt;
            resume.embeddingError = undefined;

            const completeness = calculateProfileCompleteness(resume);
            resume.profileCompleteness = completeness.score;

            await resume.save();

            res.json({
                message: 'Embedding generated successfully',
                dimensions: result.dimensions,
                generationTimeMs: result.generationTimeMs,
                profileCompleteness: completeness.score
            });
        } catch (embedError) {
            resume.embeddingStatus = 'failed';
            resume.embeddingError = embedError.message;
            await resume.save();
            res.status(500).json({ error: embedError.message });
        }
    } catch (error) {
        console.error('Embed resume error:', error);
        res.status(500).json({ message: 'Error generating embedding' });
    }
});

// @route   GET /api/resumes/:id/embedding-status
// @desc    Get embedding status for a resume
// @access  Private
router.get('/:id/embedding-status', auth, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        }).select('embeddingStatus embeddingGeneratedAt embeddingError profileCompleteness');

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.json({
            status: resume.embeddingStatus || 'pending',
            generatedAt: resume.embeddingGeneratedAt,
            error: resume.embeddingError,
            profileCompleteness: resume.profileCompleteness || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching status' });
    }
});

// @route   POST /api/resumes/batch-embed
// @desc    Generate embeddings for all pending/failed resumes
// @access  Private
router.post('/batch-embed', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({
            recruiter: req.user._id,
            embeddingStatus: { $in: ['pending', 'failed'] }
        }).select('_id candidateName');

        if (resumes.length === 0) {
            return res.json({ message: 'No resumes need embedding', count: 0 });
        }

        // Trigger background embedding for each
        resumes.forEach(resume => generateResumeEmbeddingAsync(resume._id));

        res.json({
            message: `Started embedding generation for ${resumes.length} resumes`,
            count: resumes.length,
            resumeIds: resumes.map(r => r._id)
        });
    } catch (error) {
        console.error('Batch embed error:', error);
        res.status(500).json({ message: 'Error starting batch embedding' });
    }
});

// @route   POST /api/resumes/:id/profile
// @desc    Regenerate profile for a resume
// @access  Private
router.post('/:id/profile', auth, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Regenerate profile
        const profile = generateProfile(resume.rawText, 'resume');
        resume.profile = profile;
        await resume.save();

        res.json({
            id: resume._id,
            candidateName: resume.candidateName,
            profile: resume.profile,
            message: 'Profile regenerated successfully'
        });
    } catch (error) {
        console.error('Profile generation error:', error);
        res.status(500).json({ message: 'Error generating profile' });
    }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findOneAndDelete({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ message: 'Error deleting resume' });
    }
});

module.exports = router;
