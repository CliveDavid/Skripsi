const express = require('express');
const router = express.Router();
const {
    OrderItem
} = require('../models');

// Get all order items
router.get('/', async (req, res) => {
    try {
        const orderItems = await OrderItem.findAll();
        res.json(orderItems);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new order item
router.post('/', async (req, res) => {
    try {
        const orderItem = await OrderItem.create(req.body);
        res.status(201).json(orderItem);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update an order item
router.put('/:id', async (req, res) => {
    try {
        const orderItem = await OrderItem.findByPk(req.params.id);
        if (orderItem) {
            await orderItem.update(req.body);
            res.json(orderItem);
        } else {
            res.status(404).json({
                error: 'Order Item not found'
            });
        }
    } catch (err) {
        res.status500().json({
            error: err.message
        });
    }
});

module.exports = router;