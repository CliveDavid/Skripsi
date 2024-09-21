const express = require('express');
const router = express.Router();
const { sequelize, Order, OrderItem, Distributor, ShipmentMethod } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all orders
router.post('/get-all', asyncHandler(async (req, res) => {
    const orders = await Order.findAll({
        include: [
            { model: Distributor, attributes: ['name'] },
            { model: ShipmentMethod, attributes: ['shipment_name'] }
        ],
        order: [['updatedAt', 'DESC']],
        raw: true,
        nest: true
    });

    const flattenedOrders = orders.map(order => ({
        ...order,
        distributor_name: order.distributor.name,
        shipment_method_name: order.shipment_method.shipment_name,
        distributor: undefined,
        shipment_method: undefined
    }));

    res.json(flattenedOrders);
}));

// Get order by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { order_id } = req.body;
    const order = await Order.findByPk(order_id, {
        include: [
            { model: Distributor, attributes: ['name'] },
            { model: ShipmentMethod, attributes: ['shipment_name'] }
        ],
        raw: true,
        nest: true
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const flattenedOrder = {
        ...order,
        distributor_name: order.distributor.name,
        shipment_name: order.shipment_method.shipment_name,
        distributor: undefined,
        shipment_method: undefined
    };

    res.json(flattenedOrder);
}));

// Create new order
router.post('/create', asyncHandler(async (req, res) => {
    const { distributor_id, order_dt, status, total_price, shipment_code, orderItems } = req.body;
    
    // Basic validation
    if (!distributor_id || !order_dt || !status || !shipment_code) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const result = await sequelize.transaction(async (t) => {
            // Create the order
            const newOrder = await Order.create({
                distributor_id,
                order_dt,
                status,
                total_price,
                shipment_code
            }, { transaction: t });

            // Create the order items
            if (orderItems && orderItems.length > 0) {
                const orderItemsWithOrderId = orderItems.map(item => ({
                    ...item,
                    order_id: newOrder.order_id
                }));
                await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction: t });
            }

            // Fetch the full order with items
            return Order.findByPk(newOrder.order_id, {
                include: [OrderItem],
                transaction: t
            });
        });

        console.log(`Order created successfully: ${result.order_id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
}));

// Update order
router.post('/update', asyncHandler(async (req, res) => {
    const { order_id, distributor_id, order_dt, status, total_price, shipment_code } = req.body;
    const order = await Order.findByPk(order_id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const updates = {};
    if (distributor_id) updates.distributor_id = distributor_id;
    if (order_dt) updates.order_dt = order_dt;
    if (status) updates.status = status;
    if (total_price) updates.total_price = total_price;
    if (shipment_code) updates.shipment_code = shipment_code;

    await order.update(updates);
    res.json(order);
}));

// Get orders by distributor ID
router.post('/get-by-distributor', asyncHandler(async (req, res) => {
    const { distributor_id } = req.body;
    const orders = await Order.findAll({
        where: { distributor_id },
        include: [
            { model: ShipmentMethod, attributes: ['shipment_name'] }
        ],
        raw: true,
        nest: true
    });

    const flattenedOrders = orders.map(order => ({
        ...order,
        shipment_name: order.shipment_method.shipment_name,
        shipment_method: undefined
    }));

    res.json(flattenedOrders);
}));

// Get orders by status
router.post('/get-by-status', asyncHandler(async (req, res) => {
    const { status } = req.body;
    const orders = await Order.findAll({
        where: { status },
        include: [
            { model: Distributor, attributes: ['name'] },
            { model: ShipmentMethod, attributes: ['shipment_name'] }
        ],
        raw: true,
        nest: true
    });

    const flattenedOrders = orders.map(order => ({
        ...order,
        distributor_name: order.distributor.name,
        shipment_name: order.shipment_method.shipment_name,
        distributor: undefined,
        shipment_method: undefined
    }));

    res.json(flattenedOrders);
}));

module.exports = router;