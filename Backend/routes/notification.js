const express = require('express');
const router = express.Router();
const {
    Notification
} = require('../models');

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.findAll();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update a notification
router.put('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (notification) {
            await notification.update(req.body);
            res.json(notification);
        } else {
            res.status(404).json({
                error: 'Notification not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;