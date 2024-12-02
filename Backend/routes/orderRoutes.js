const express = require('express');
const router = express.Router();
const { format } = require('date-fns');
const { sequelize, Order, OrderItem, OrderAddress, Distributor, ShipmentMethod, Product, BoxType, OrderStatusHistory, Invoice } = require('../models');
const { STATUS, ERROR_MESSAGES } = require('../constants');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');


// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all orders
router.post('/get-all', asyncHandler(async (req, res) => {
    const orders = await Order.findAll({
        include: [
            { 
                model: ShipmentMethod, 
                attributes: ['shipment_name'], 
                as: 'shipment_method' 
            },
            {
                model: Invoice,
                attributes: ['invoice_id'],
                required: false
            },
            {
                model: Distributor,
                attributes: ['name'],
                as: 'distributor'
            }
        ],
        order: [['order_dt', 'DESC']]
    });

    const flattenedOrders = orders.map(order => ({
        order_id: order.order_id,
        order_number: order.order_number,
        distributor_id: order.distributor_id,
        distributor_name: order.distributor.name,
        order_dt: order.order_dt,
        status: order.status,
        total_price: order.total_price,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shipment_name: order.shipment_method.shipment_name,
        invoice_id: order.invoice?.invoice_id || null
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

// Get complete order info by order id
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findByPk(order_id, {
        include: [
            { 
                model: OrderItem, 
                as: 'order_items',
                include: [
                    { model: Product, as: 'product' }, 
                    { model: BoxType, as: 'box_type' } 
                ]
            },
            {
                model: OrderAddress, 
                as: 'addresses' 
            },
            {
                model: OrderStatusHistory, 
                as: 'order_status_histories',
                order: [['changed_at', 'ASC']]  
            },
            {
                model: Invoice, 
                as: 'invoice'
            }
        ]
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

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

// Get orders for order history (upcoming and history) for a specific distributor
router.post('/get-for-history', asyncHandler(async (req, res) => {
    const { distributor_id } = req.body;

    if (!distributor_id) {
        return res.status(400).json({ message: "distributor_id is required" });
    }

    const upcomingStatuses = [STATUS.PENDING, STATUS.PROCESSING, STATUS.INVOICED];
    const historyStatuses = [STATUS.DELIVERED, STATUS.CANCELLED];

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

//#region Create New Order
router.post('/create', asyncHandler(async (req, res) => {
    const { 
        distributor_id, 
        order_dt, 
        status,
        total_price, 
        shipment_code, 
        notes,
        orderItems,
        addresses
    } = req.body;
    
    if (!distributor_id || !order_dt || !total_price || !shipment_code) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    try {
        const result = await sequelize.transaction(async (t) => {
            // Create order
            const newOrder = await Order.create({
                distributor_id,
                order_dt,
                status: status || STATUS.PENDING,
                total_price,
                shipment_code,
                notes
            }, { transaction: t });

            // Create order items
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
            if (addresses?.length > 0) {
                const orderAddressesWithOrderId = addresses.map(address => ({
                    order_id: newOrder.order_id,
                    ...address
                }));
                await OrderAddress.bulkCreate(orderAddressesWithOrderId, { transaction: t });
            }

            await notificationService.notifyNewOrder(newOrder.order_id, t);

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
//#endregion

//#region Update Order

// Function to update order details
const updateOrderDetails = async (order, { distributor_id, order_dt, status, total_price, shipment_code, notes }, transaction) => {
    await order.update({
        distributor_id,
        order_dt,
        status,
        total_price,
        shipment_code,
        notes
    }, { transaction });
};

// Function to update order items
const updateOrderItems = async (order_id, orderItems, transaction) => {
    await OrderItem.destroy({ where: { order_id }, transaction });
    if (orderItems?.length > 0) {
        const orderItemsWithOrderId = orderItems.map(item => ({
            order_id,
            product_id: item.product_id,
            box_type_code: item.box_type_code,
            qty: item.qty,
            total_item_price: item.total_item_price
        }));
        await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });
    }
};

// Function to update addresses
const updateOrderAddresses = async (order_id, addresses, transaction) => {
    await OrderAddress.destroy({ where: { order_id }, transaction });
    if (addresses?.length > 0) {
        const orderAddressesWithOrderId = addresses.map(address => ({
            order_id,
            address: address.address,
            addr_details: address.addr_details,
            city: address.city,
            province: address.province,
            zipcode: address.zipcode,
            district: address.district,
            subdistrict: address.subdistrict
        }));
        await OrderAddress.bulkCreate(orderAddressesWithOrderId, { transaction });
    }
};

router.post('/update', asyncHandler(async (req, res) => {
    const { order_id, distributor_id, order_dt, status, total_price, shipment_code, notes, orderItems, addresses } = req.body;

    if (!order_id || !distributor_id || !order_dt || !total_price || !shipment_code) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    try {
        const result = await sequelize.transaction(async (transaction) => {
            const order = await Order.findByPk(order_id, { 
                include: [{ 
                    model: Distributor,
                    attributes: ['distributor_id', 'name', 'email'],
                    as: 'distributor'
                }],
                transaction 
            });

            if (!order) throw new Error('Order not found');

            const previousStatus = order.status;

            await updateOrderDetails(order, { distributor_id, order_dt, status, total_price, shipment_code, notes }, transaction);
            await updateOrderItems(order_id, orderItems, transaction);
            await updateOrderAddresses(order_id, addresses, transaction);

            if (previousStatus !== status) {
                await notificationService.notifyOrderStatusChange(
                    order.order_number,
                    distributor_id, 
                    previousStatus, 
                    status, 
                    transaction
                );

                // Send email if status changed to processing
                if (status === STATUS.PROCESSING) {
                    const updatedOrder = {
                        order_number: order.order_number,
                        order_dt,
                        total_price
                    };

                    const distributorData = {
                        name: order.distributor.name,
                        email: order.distributor.email
                    };
                    
                    emailService.sendOrderProcessingEmail(updatedOrder, distributorData)
                        .catch(error => {
                            console.error('Failed to send order processing email:', error);
                        });
                }
            }

            return await Order.findByPk(order_id, {
                include: [
                    { model: OrderItem },
                    { model: OrderAddress, as: 'addresses' }
                ],
                transaction
            });
        });

        res.json(result);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
}));

//#endregion

module.exports = router;