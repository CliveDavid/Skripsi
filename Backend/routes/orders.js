const express = require('express');
const router = express.Router();
const {
    Order
} = require('../models');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new order
router.post('/', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update an order
router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (order) {
            await order.update(req.body);
            res.json(order);
        } else {
            res.status(404).json({
                error: 'Order not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;