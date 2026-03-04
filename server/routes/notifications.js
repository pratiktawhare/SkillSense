const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Pagination could be added here

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a single notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) return res.status(404).json({ msg: 'Notification not found' });

        // Ensure user owns notification
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all unread notifications as read
router.put('/read-all/now', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) return res.status(404).json({ msg: 'Notification not found' });

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await notification.deleteOne();
        res.json({ msg: 'Notification removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
