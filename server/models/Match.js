const mongoose = require('mongoose');

const matchedSkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'other' },
    type: { type: String, enum: ['exact', 'semantic'], default: 'exact' },
    similarity: { type: Number, default: 1.0 }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    // Score components
    scores: {
        semantic: { type: Number, default: 0 },      // 0-1 cosine similarity
        skillMatch: { type: Number, default: 0 },     // 0-1 skill overlap ratio
        experience: { type: Number, default: 0 },     // 0-1.2 experience fit
        final: { type: Number, default: 0 }           // 0-100 weighted final
    },
    // Skill analysis
    matchedSkills: [matchedSkillSchema],   // Skills candidate has that job needs
    missingSkills: [matchedSkillSchema],   // Skills job needs but candidate lacks
    bonusSkills: [matchedSkillSchema],     // Extra skills candidate has
    // Human-readable interpretation
    interpretation: {
        label: { type: String },           // "Excellent Match", "Good Match", etc.
        summary: { type: String },         // Plain english explanation
        tier: { type: String, enum: ['excellent', 'good', 'partial', 'weak'], default: 'weak' }
    },
    // Candidate info (denormalized for fast queries)
    candidateName: { type: String },
    jobTitle: { type: String },
    // Status for recruiter workflow
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected'],
        default: 'pending'
    },
    calculatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index: one match per resume-job pair
matchSchema.index({ jobId: 1, resumeId: 1 }, { unique: true });
matchSchema.index({ recruiter: 1, jobId: 1 });
matchSchema.index({ jobId: 1, 'scores.final': -1 });

module.exports = mongoose.model('Match', matchSchema);
