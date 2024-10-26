const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { ERROR_MESSAGES } = require('../constants');
require('dotenv').config();

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Send support message
router.post('/send-email', asyncHandler(async (req, res) => {
    const { email, subject, message } = req.body;
    
    if (!email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS 
        });
    }

    try {
        const result = await emailService.sendSupportEmail({ email, subject, message });
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Error sending support email:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to send support email' 
        });
    }
}));

module.exports = router;