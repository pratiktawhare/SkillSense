const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserSettings = require('../models/UserSettings');
const User = require('../models/User');

// @route   GET /api/settings
// @desc    Get current user settings
router.get('/', auth, async (req, res) => {
    try {
        let settings = await UserSettings.findOne({ userId: req.user._id });

        // Return default settings if none found yet
        if (!settings) {
            settings = new UserSettings({ userId: req.user._id });
            await settings.save();
        }

        // Return user info too
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            user: { name: user.name, email: user.email },
            settings
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/settings
// @desc    Update user settings
router.put('/', auth, async (req, res) => {
    const { theme, notifications, matchingWeights, userName, userEmail } = req.body;

    try {
        let settings = await UserSettings.findOne({ userId: req.user._id });

        if (!settings) {
            settings = new UserSettings({ userId: req.user._id });
        }

        // Only update provided fields
        if (theme) settings.theme = theme;
        if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
        if (matchingWeights) {
            // Validate weights sum to 100
            const sum = Object.values(matchingWeights).reduce((a, b) => a + b, 0);
            if (sum !== 100) {
                return res.status(400).json({ error: 'Matching weights must sum to exactly 100%' });
            }
            settings.matchingWeights = matchingWeights;
        }

        await settings.save();

        // Check if basic profile data changed
        if (userName || userEmail) {
            const user = await User.findById(req.user._id);
            if (userName) user.name = userName;
            if (userEmail) user.email = userEmail;
            await user.save();
        }

        const updatedUser = await User.findById(req.user._id).select('-password');

        res.json({
            user: { name: updatedUser.name, email: updatedUser.email },
            settings
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
