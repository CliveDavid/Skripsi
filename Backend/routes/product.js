const express = require('express');
const {
    Product
} = require('../models');
const router = express.Router();

// Create a new product
router.post('/create', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating product',
            error
        });
    }
});

// Get a product by ID
router.post('/get', async (req, res) => {
    try {
        const product = await Product.findByPk(req.body.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching product',
            error
        });
    }
});

// Update a product by ID
router.post('/update', async (req, res) => {
    try {
        const product = await Product.findByPk(req.body.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating product',
            error
        });
    }
});

// Delete a product by ID
router.post('/delete', async (req, res) => {
    try {
        const product = await Product.findByPk(req.body.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        await product.destroy();
        res.json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting product',
            error
        });
    }
});

module.exports = router;