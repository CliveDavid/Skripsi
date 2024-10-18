const express = require('express');
const router = express.Router();
const { format } = require('date-fns');
const { sequelize, Order, OrderItem, OrderAddress, Distributor, ShipmentMethod, Product, BoxType, OrderStatusHistory, Invoice } = require('../models');
const { STATUS, ERROR_MESSAGES } = require('../constants');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all orders
router.post('/get-all', asyncHandler(async (req, res) => {
    const orders = await Order.findAll({
        include: [
            { model: Distributor, attributes: ['name'] },
            { model: ShipmentMethod, attributes: ['shipment_name'] },
            { 
                model: OrderItem,
                attributes: [[sequelize.fn('SUM', sequelize.col('qty')), 'total_items']]
            },
            {
                model: OrderStatusHistory,
                attributes: ['status', 'changed_at'],
                order: [['changed_at', 'DESC']],
                limit: 1
            }
        ],
        group: ['Order.order_id'],
        order: [['updatedAt', 'DESC']],
        raw: false,
        nest: true
    });

    const flattenedOrders = orders.map(order => ({
        id: order.order_id,
        orderNumber: order.order_number,
        date: format(new Date(order.order_dt), 'yyyy-MM-dd'),
        status: order.order_status_histories[0]?.status || order.status,
        items: order.order_items[0]?.dataValues.total_items || 0,
        total: order.total_price,
        distributor_name: order.distributor.name,
        shipment_method_name: order.shipment_method.shipment_name
    }));

    res.json(flattenedOrders);
}));

// Get complete order info by order number
router.post('/get-by-order-number', asyncHandler(async (req, res) => {
    const { order_number } = req.body;

    if (!order_number) {
        return res.status(400).json({ message: 'Order number is required' });
    }

    const order = await Order.findOne({
        where: { order_number: order_number },
        include: [
            { model: Distributor, attributes: ['name'], as: 'distributor' },
            { model: ShipmentMethod, attributes: ['shipment_name'], as: 'shipment_method' },
            { 
                model: OrderItem,
                as: 'order_items',
                include: [
                    { model: Product, attributes: ['prod_id', 'prod_name'], as: 'product' },
                    { model: BoxType, attributes: ['box_type_code', 'box_capacity'], as: 'box_type' }
                ]
            },
            {
                model: OrderAddress,
                as: 'addresses',
                attributes: [
                    'address', 'addr_details', 'city', 'province', 'zipcode', 'district', 'subdistrict'
                ]
            },
            {
                model: OrderStatusHistory,
                as: 'order_status_histories',
                attributes: ['status', 'changed_at'],
                order: [['changed_at', 'ASC']]  
            },
            {
                model: Invoice, 
                attributes: ['invoice_number', 'invoice_dt', 'due_dt', 'payment_status']
            }
        ]
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const flattenedOrder = {
        order_id: order.order_id,
        order_number: order.order_number,
        distributor_name: order.distributor.name,
        shipment_name: order.shipment_method.shipment_name,
        order_date: format(new Date(order.order_dt), 'd MMMM, yyyy'),
        total_price: order.total_price,
        items: order.order_items.map(item => ({
            prod_id: item.product.prod_id,
            product_name: item.product.prod_name,
            box_type_code: item.box_type.box_type_code,
            box_type_display: `${item.box_type.box_type_code} (Capacity: ${item.box_type.box_capacity})`,
            qty: item.qty,
            total_item_price: item.total_item_price
        })),
        address: order.addresses.map(addr => 
            `${addr.address}, ${addr.addr_details}`
        ).join(', '),
        status_history: order.order_status_histories.map(status => ({
            status: status.status,
            changed_at: format(new Date(status.changed_at), 'yyyy-MM-dd HH:mm:ss')
        })),
        invoice: order.invoice ? {
            invoice_number: order.invoice.invoice_number,
            invoice_date: format(new Date(order.invoice.invoice_dt), 'd MMMM, yyyy'),
            due_date: format(new Date(order.invoice.due_dt), 'd MMMM, yyyy'),
            payment_status: order.invoice.payment_status
        } : null
    };

    res.json(flattenedOrder);
}));



// Create new order
router.post('/create', asyncHandler(async (req, res) => {
    const { 
        distributor_id, 
        order_dt, 
        total_price, 
        shipment_code, 
        notes,
        orderItems,
        addresses
    } = req.body;
    
    // Basic validation
    if (!distributor_id || !order_dt || !total_price || !shipment_code) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    const status = STATUS.PENDING

    try {
        const result = await sequelize.transaction(async (t) => {
            // Create the order
            const newOrder = await Order.create({
                distributor_id,
                order_dt,
                status,
                total_price,
                shipment_code,
                notes
            }, { transaction: t });

            // Create the order items
            if (orderItems && orderItems.length > 0) {
                const orderItemsWithOrderId = orderItems.map(item => ({
                    order_id: newOrder.order_id,
                    product_id: item.product_id,
                    box_type_code: item.box_type_code,
                    qty: item.qty,
                    total_item_price: item.total_item_price
                }));
                await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction: t });
            }

            // Create the order addresses
            if (addresses && addresses.length > 0) {
                const orderAddressesWithOrderId = addresses.map(address => ({
                    order_id: newOrder.order_id,
                    address: address.address,
                    addr_details: address.addr_details,
                    city: address.city,
                    province: address.province,
                    zipcode: address.zipcode,
                    district: address.district,
                    subdistrict: address.subdistrict
                }));
                await OrderAddress.bulkCreate(orderAddressesWithOrderId, { transaction: t });
            }

            // Fetch the full order with items and addresses
            return Order.findByPk(newOrder.order_id, {
                include: [
                    { model: OrderItem },
                    { model: OrderAddress, as: 'addresses' }
                ],
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
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
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

// Get orders for order history (upcoming and history) for a specific distributor
router.post('/get-for-history', asyncHandler(async (req, res) => {
    const { distributor_id } = req.body;

    if (!distributor_id) {
        return res.status(400).json({ message: "distributor_id is required" });
    }

    const upcomingStatuses = ['Pending', 'Processing', 'Invoiced'];
    const historyStatuses = ['Delivered', 'Cancelled'];

    const orders = await Order.findAll({
        where: { distributor_id },
        attributes: [
            'order_id',
            'order_number',
            'order_dt',
            'status',
            'total_price',
            [sequelize.literal('(SELECT SUM(qty) FROM order_items WHERE order_items.order_id = "order".order_id)'), 'total_items']
        ],
        include: [
            {
                model: OrderStatusHistory,
                as: 'order_status_histories',
                attributes: ['status', 'changed_at'],
                order: [['changed_at', 'DESC']],
                limit: 1,
                separate: true
            }
        ],
        order: [['order_dt', 'DESC']]
    });

    const formattedOrders = orders.map(order => ({
        id: order.order_id,
        orderNumber: order.order_number,
        date: format(new Date(order.order_dt), 'yyyy-MM-dd'),
        status: order.order_status_histories[0]?.status || order.status,
        items: parseInt(order.dataValues.total_items) || 0,
        total: order.total_price
    }));

    const upcomingOrders = formattedOrders.filter(order => upcomingStatuses.includes(order.status));
    const historyOrders = formattedOrders.filter(order => historyStatuses.includes(order.status));

    res.json({ upcomingOrders, historyOrders });
}));

module.exports = router;