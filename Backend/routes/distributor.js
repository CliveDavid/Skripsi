const express = require('express');
const router = express.Router();
const {
    Distributor
} = require('../models');

// Get all distributors
router.get('/', async (req, res) => {
    try {
        const distributors = await Distributor.findAll();
        res.json(distributors);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new distributor
router.post('/', async (req, res) => {
    try {
        const distributor = await Distributor.create(req.body);
        res.status(201).json(distributor);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update a distributor
router.put('/:id', async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id);
        if (distributor) {
            await distributor.update(req.body);
            res.json(distributor);
        } else {
            res.status(404).json({
                error: 'Distributor not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;