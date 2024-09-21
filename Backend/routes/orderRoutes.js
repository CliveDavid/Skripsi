const express = require('express');
const router = express.Router();
const { format } = require('date-fns');
const { sequelize, Order, OrderItem, Distributor, ShipmentMethod, Product, BoxType } = require('../models');

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
            { model: ShipmentMethod, attributes: ['shipment_name'] },
            { 
                model: OrderItem,
                include: [
                    { model: Product, attributes: ['prod_name'] },
                    { model: BoxType, attributes: ['box_type_code', 'box_capacity'] }
                ]
            }
        ]
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const flattenedOrder = {
        ...order.get({ plain: true }),
        distributor_name: order.distributor.name,
        shipment_name: order.shipment_method.shipment_name,
        order_dt: format(new Date(order.order_dt), 'yyyy-MM-dd'),
        orderItems: order.order_items.map(item => ({
            order_item_id: item.order_item_id,
            product_id: item.product_id,
            product_name: item.product.prod_name,
            box_type_code: item.box_type_code,
            box_type_display: `${item.box_type.box_type_code} (Capacity: ${item.box_type.box_capacity})`,
            qty: item.qty,
            total_item_price: item.total_item_price
        })),
        distributor: undefined,
        shipment_method: undefined,
        order_items: undefined
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
    const { order_id, status, total_price, shipment_code, orderItems } = req.body;
    
    // Basic validation
    if (!order_id || !status || !shipment_code) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const result = await sequelize.transaction(async (t) => {
            // Find the order
            const order = await Order.findByPk(order_id, { transaction: t });
            if (!order) {
                throw new Error('Order not found');
            }

            // Update the order
            await order.update({
                status,
                total_price,
                shipment_code
            }, { transaction: t });

            // Handle order items
            if (orderItems && orderItems.length > 0) {
                // Delete existing order items
                await OrderItem.destroy({
                    where: { order_id: order_id },
                    transaction: t
                });

                // Create new order items
                const orderItemsWithOrderId = orderItems.map(item => ({
                    ...item,
                    order_id: order_id
                }));
                await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction: t });
            }

            // Fetch the updated order with items
            return Order.findByPk(order_id, {
                include: [OrderItem],
                transaction: t
            });
        });

        console.log(`Order updated successfully: ${result.order_id}`);
        res.json(result);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
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