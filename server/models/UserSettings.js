const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
    },
    notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        matches: { type: Boolean, default: true },
        applications: { type: Boolean, default: true }
    },
    matchingWeights: {
        skills: { type: Number, default: 50 },
        experience: { type: Number, default: 25 },
        semantic: { type: Number, default: 25 }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSettingsSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
