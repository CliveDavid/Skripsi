const express = require('express');
const router = express.Router();
const {
    Product
} = require('../models');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new product
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.update(req.body);
            res.json(product);
        } else {
            res.status(404).json({
                error: 'Product not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;