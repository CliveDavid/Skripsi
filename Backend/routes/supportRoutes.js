const express = require('express');
const router = express.Router();
const { sendMail } = require('../utils/email');
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
        const result = await sendSupportEmail({ email, subject, message });
        const response = typeof result === 'boolean'
            ? { success: result, message: result ? 'Message sent successfully' : 'Failed to send message' }
            : result;
        
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

const sendSupportEmail = async ({ email, subject, message }) => {
    try {
        const mailOptions = {
            from: email,
            to: process.env.SUPPORT_EMAIL,
            subject: `Support Request: ${subject}`,
            text: `From: ${email}\n\nMessage:\n${message}`,
            html: `
                <h3>Support Request</h3>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-line;">${message}</p>
            `
        };

        const emailResult = await sendMail(mailOptions);
        
        // Email is successful if messageId exists and there are no rejected recipients
        const isSuccess = Boolean(emailResult.messageId && emailResult.rejected.length === 0);
        
        return {
            success: isSuccess,
            message: isSuccess ? 'Message sent successfully' : 'Failed to send message'
        };
    } catch (error) {
        console.error('Error sending support email:', error);
        return { success: false, message: error.message };
    }
};

module.exports = router;