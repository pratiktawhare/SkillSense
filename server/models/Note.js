const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

noteSchema.index({ recruiter: 1, resumeId: 1 });
noteSchema.index({ recruiter: 1, jobId: 1, resumeId: 1 });

module.exports = mongoose.model('Note', noteSchema);
