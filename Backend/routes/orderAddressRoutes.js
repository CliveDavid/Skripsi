const express = require('express');
const router = express.Router();
const { OrderAddress } = require('../models');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create new order address
router.post('/create', asyncHandler(async (req, res) => {
    const { order_id, address, city, province, zipcode } = req.body;

    // Create a new order address
    const newOrderAddress = await OrderAddress.create({
        order_id,
        address,
        city,
        province,
        zipcode
    });

    res.status(201).json(newOrderAddress);
}));

// Get all addresses for a specific order
router.post('/get-order-addresses', asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // Fetch all addresses for a specific order
    const orderAddresses = await OrderAddress.findAll({
        where: { order_id: orderId }
    });

    if (!orderAddresses.length) {
        return res.status(404).json({ message: 'No addresses found for this order' });
    }

    res.status(200).json(orderAddresses);
}));

module.exports = router;
