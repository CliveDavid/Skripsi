const express = require('express');
const router = express.Router();
const { Company } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// GET route to fetch the first or default company
router.get('/get', async (req, res) => {
    try {
        const company = await Company.findOne();
        if (company) {
            res.status(200).json(company); 
        } else {
            res.status(404).json({ message: 'No company found' }); 
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company', details: error.message });
    }
});

module.exports = router;
