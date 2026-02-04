const mongoose = require('mongoose');

// Skill subdocument schema
const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'other' },
    confidence: { type: Number, default: 0.5 },
    matchCount: { type: Number, default: 1 }
}, { _id: false });

// Experience requirement subdocument
const experienceRequirementSchema = new mongoose.Schema({
    title: { type: String },
    minYears: { type: Number, default: 0 }
}, { _id: false });

// Profile subdocument schema for jobs
const jobProfileSchema = new mongoose.Schema({
    skills: [skillSchema],
    requiredSkills: [skillSchema],
    preferredSkills: [skillSchema],
    experience: [experienceRequirementSchema],
    totalYearsRequired: { type: Number, default: 0 },
    summary: { type: String },
    profiledAt: { type: Date }
}, { _id: false });

const jobSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    rawText: {
        type: String,
        required: [true, 'Job description is required']
    },
    profile: jobProfileSchema,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient recruiter-based queries
jobSchema.index({ recruiter: 1 });

module.exports = mongoose.model('Job', jobSchema);
