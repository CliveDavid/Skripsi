const express = require('express');
const router = express.Router();
const { Company } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// GET route to fetch the first or default company
router.post('/get', asyncHandler(async (req, res) => {
    const company = await Company.findOne();
    if (company) {
        res.status(200).json(company);
    } else {
        res.status(404).json({ message: 'No company found' });
    }
}));

router.post('/update', asyncHandler(async (req, res) => {
    const { company_name, phn1, phn2, phn3, email, address } = req.body;
    
    let company = await Company.findOne();
    if (company) {
        // Update existing company
        company = await company.update({
            company_name,
            phn1,
            phn2,
            phn3,
            email,
            address
        });
    } else {
        // Create new company if none exists
        company = await Company.create({
            company_name,
            phn1,
            phn2,
            phn3,
            email,
            address
        });
    }
    res.status(200).json(company);
}));

module.exports = router;
