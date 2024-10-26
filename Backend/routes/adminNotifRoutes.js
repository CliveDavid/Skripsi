const express = require('express');
const router = express.Router();
const { AdminNotif } = require('../models');
const { ERROR_MESSAGES } = require('../constants');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all notifications for an admin
router.post('/get-all', asyncHandler(async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    const notifications = await AdminNotif.findAll({
        where: { admin_id },
        order: [['createdAt', 'DESC']]
    });

    res.json(notifications);
}));

// Get unread notifications for an admin
router.post('/get-unread', asyncHandler(async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    const notifications = await AdminNotif.findAll({
        where: { 
            admin_id,
            status: 'unread'
        },
        order: [['createdAt', 'DESC']]
    });

    res.json(notifications);
}));

// Get notification count for an admin
router.post('/get-count', asyncHandler(async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    const count = await AdminNotif.count({
        where: { 
            admin_id,
            status: 'unread'
        }
    });

    res.json({ count });
}));

// Mark notifications as read
router.post('/mark-as-read', asyncHandler(async (req, res) => {
    const { admin_id, notif_ids } = req.body;

    if (!admin_id || !notif_ids) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    await AdminNotif.update(
        { status: 'read' },
        {
            where: {
                admin_id,
                notif_id: notif_ids
            }
        }
    );

    res.json({ message: 'Notifications marked as read successfully' });
}));

// Mark all notifications as read
router.post('/mark-all-as-read', asyncHandler(async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    await AdminNotif.update(
        { status: 'read' },
        { where: { admin_id } }
    );

    res.json({ message: 'All notifications marked as read successfully' });
}));

// Delete notifications
router.post('/delete', asyncHandler(async (req, res) => {
    const { admin_id, notif_ids } = req.body;

    if (!admin_id || !notif_ids) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    await AdminNotif.destroy({
        where: {
            admin_id,
            notif_id: notif_ids
        }
    });

    res.json({ message: 'Notifications deleted successfully' });
}));

// Delete all notifications
router.post('/delete-all', asyncHandler(async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    await AdminNotif.destroy({
        where: { admin_id }
    });

    res.json({ message: 'All notifications deleted successfully' });
}));

module.exports = router;