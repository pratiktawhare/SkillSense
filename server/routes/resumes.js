const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse-new');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { generateProfile } = require('../services/profiler');

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

// @route   POST /api/resumes
// @desc    Upload a resume PDF with auto-profiling
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
            profile
        });

        res.status(201).json({
            id: resume._id,
            candidateName: resume.candidateName,
            fileName: resume.fileName,
            textPreview: rawText.substring(0, 200) + '...',
            profile: resume.profile,
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
            .select('candidateName fileName uploadedAt rawText profile')
            .sort({ uploadedAt: -1 });

        res.json(resumes.map(r => ({
            id: r._id,
            candidateName: r.candidateName,
            fileName: r.fileName,
            textPreview: r.rawText.substring(0, 200) + '...',
            profile: r.profile,
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

        res.json({
            id: resume._id,
            candidateName: resume.candidateName,
            fileName: resume.fileName,
            rawText: resume.rawText,
            profile: resume.profile,
            uploadedAt: resume.uploadedAt
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({ message: 'Error fetching resume' });
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
