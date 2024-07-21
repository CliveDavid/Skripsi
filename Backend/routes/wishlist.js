const express = require('express');
const router = express.Router();
const {
    Wishlist
} = require('../models');

// Get all wishlist items
router.get('/', async (req, res) => {
    try {
        const wishlists = await Wishlist.findAll();
        res.json(wishlists);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new wishlist item
router.post('/', async (req, res) => {
    try {
        const wishlist = await Wishlist.create(req.body);
        res.status(201).json(wishlist);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update a wishlist item
router.put('/:id', async (req, res) => {
    try {
        const wishlist = await Wishlist.findByPk(req.params.id);
        if (wishlist) {
            await wishlist.update(req.body);
            res.json(wishlist);
        } else {
            res.status(404).json({
                error: 'Wishlist item not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;