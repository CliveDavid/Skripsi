const express = require('express');
const router = express.Router();
const { Order, OrderItem, Distributor, Product, OrderAddress, sequelize } = require('../models');
const { Op } = require('sequelize');

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

function getWeekRange(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
}

function calculatePercentageChange(current, previous) {
    if (current === 0 && previous === 0) return '0%';
    if (previous === 0 && current > 0) return '+100%';
    if (current === 0 && previous > 0) return '-99.9%';
    const change = ((current - previous) / previous) * 100;
    if (change < -99.9) return '-99.9%';
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
}

router.post('/stats', asyncHandler(async (req, res) => {
    const now = new Date();
    const currentWeekRange = getWeekRange(now);
    
    // Get last week's range
    const lastWeekStart = new Date(currentWeekRange.startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekRange.endOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    // Get total distributors for current week (all active distributors)
    const currentWeekDistributors = await Distributor.count({
        where: {
            is_active: true
        }
    });

    // Get total distributors for previous week (excluding distributors created this week)
    const previousWeekDistributors = await Distributor.count({
        where: {
            is_active: true,
            createdAt: {
                [Op.lt]: currentWeekRange.startOfWeek
            }
        }
    });

    // Current Week Stats
    const currentWeekOrders = await Order.findAll({
        where: {
            createdAt: {
                [Op.between]: [currentWeekRange.startOfWeek, currentWeekRange.endOfWeek]
            }
        }
    });

    // Previous Week Stats
    const previousWeekOrders = await Order.findAll({
        where: {
            createdAt: {
                [Op.between]: [lastWeekStart, lastWeekEnd]
            }
        }
    });

    // Calculate current week stats
    const currentWeekStats = {
        totalDistributors: currentWeekDistributors,
        totalOrders: currentWeekOrders.length,
        totalRevenue: currentWeekOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0).toFixed(2),
        deliveredOrders: currentWeekOrders.filter(order => order.status === 'Delivered').length
    };

    // Calculate previous week stats
    const previousWeekStats = {
        totalDistributors: previousWeekDistributors,
        totalOrders: previousWeekOrders.length,
        totalRevenue: previousWeekOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0).toFixed(2),
        deliveredOrders: previousWeekOrders.filter(order => order.status === 'Delivered').length
    };

    // Calculate percentage changes
    const percentageChanges = {
        distributors: calculatePercentageChange(
            currentWeekStats.totalDistributors, 
            previousWeekStats.totalDistributors
        ),
        orders: calculatePercentageChange(
            currentWeekStats.totalOrders, 
            previousWeekStats.totalOrders
        ),
        revenue: calculatePercentageChange(
            parseFloat(currentWeekStats.totalRevenue), 
            parseFloat(previousWeekStats.totalRevenue)
        ),
        delivered: calculatePercentageChange(
            currentWeekStats.deliveredOrders,
            previousWeekStats.deliveredOrders
        )
    };

    res.json({
        currentWeek: {
            totalDistributors: currentWeekStats.totalDistributors.toString(),
            totalOrders: currentWeekStats.totalOrders.toString(),
            totalRevenue: currentWeekStats.totalRevenue,
            deliveredOrders: currentWeekStats.deliveredOrders.toString()
        },
        previousWeek: {
            totalDistributors: previousWeekStats.totalDistributors.toString(),
            totalOrders: previousWeekStats.totalOrders.toString(),
            totalRevenue: previousWeekStats.totalRevenue,
            deliveredOrders: previousWeekStats.deliveredOrders.toString()
        },
        percentageChanges
    });
}));

router.post('/top-products', asyncHandler(async (req, res) => {
    const topProducts = await OrderItem.findAll({
        attributes: [
            'product_id',
            [sequelize.fn('COUNT', sequelize.col('order_item.order_item_id')), 'orderCount']
        ],
        include: [{
            model: Product,
            attributes: ['prod_name', 'prod_id'],
            required: true
        }],
        where: {
            '$product.is_active$': true 
        },
        group: [
            'order_item.order_item_id', 
            'order_item.product_id', 
            'product.prod_id', 
            'product.prod_name'
        ],
        order: [[sequelize.literal('COUNT(order_item.order_item_id)'), 'DESC']],
        limit: 5,
        raw: true,
        nest: true,
        subQuery: false
    });
    
    const formattedProducts = topProducts.map(item => ({
        product_id: item.product_id,
        product_name: item.product.prod_name,
        order_count: parseInt(item.orderCount)
    }));

    res.json(formattedProducts);
}));

router.post('/recent-orders', asyncHandler(async (req, res) => {
    const recentOrders = await Order.findAll({
        include: [{
            model: OrderAddress,
            as: 'addresses'
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
    });

    res.json(recentOrders);
}));

module.exports = router;