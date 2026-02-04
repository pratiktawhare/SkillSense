const mongoose = require('mongoose');

// Skill subdocument schema
const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'other' },
    confidence: { type: Number, default: 0.5 },
    matchCount: { type: Number, default: 1 }
}, { _id: false });

// Experience subdocument schema
const experienceSchema = new mongoose.Schema({
    title: { type: String },
    company: { type: String },
    years: { type: Number }
}, { _id: false });

// Education subdocument schema
const educationSchema = new mongoose.Schema({
    level: { type: String },
    field: { type: String },
    institution: { type: String }
}, { _id: false });

// Profile subdocument schema
const profileSchema = new mongoose.Schema({
    skills: [skillSchema],
    experience: [experienceSchema],
    education: [educationSchema],
    totalYearsExperience: { type: Number, default: 0 },
    summary: { type: String },
    profiledAt: { type: Date }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    candidateName: {
        type: String,
        required: [true, 'Candidate name is required'],
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    rawText: {
        type: String,
        required: true
    },
    profile: profileSchema,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient recruiter-based queries
resumeSchema.index({ recruiter: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
