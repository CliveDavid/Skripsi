const express = require('express');
const router = express.Router();
const {
    Promotion
} = require('../models');

// Get all promotions
router.get('/', async (req, res) => {
    try {
        const promotions = await Promotion.findAll();
        res.json(promotions);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new promotion
router.post('/', async (req, res) => {
    try {
        const promotion = await Promotion.create(req.body);
        res.status(201).json(promotion);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update a promotion
router.put('/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findByPk(req.params.id);
        if (promotion) {
            await promotion.update(req.body);
            res.json(promotion);
        } else {
            res.status(404).json({
                error: 'Promotion not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;