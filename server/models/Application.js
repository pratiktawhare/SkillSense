const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    candidateId: {
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
        ref: 'Resume'
    },
    status: {
        type: String,
        enum: ['applied', 'screening', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'],
        default: 'applied'
    },
    statusHistory: [statusHistorySchema],
    recruiterNotes: {
        type: String,
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// One application per candidate per job
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
