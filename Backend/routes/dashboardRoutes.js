const express = require('express');
const router = express.Router();
const { Order, OrderItem, Distributor, Product, OrderAddress, sequelize } = require('../models');
const { Op } = require('sequelize');
const { ERROR_MESSAGES } = require('../constants');

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/stats', asyncHandler(async (req, res) => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current week stats
    const currentWeekStats = await Order.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('order_id')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
            [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'Delivered' THEN 1 END")), 'deliveredOrders']
        ],
        where: {
            createdAt: {
                [Op.gte]: lastWeek
            }
        }
    });

    // Previous week stats for comparison
    const previousWeekStats = await Order.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('order_id')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
            [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'Delivered' THEN 1 END")), 'deliveredOrders']
        ],
        where: {
            createdAt: {
                [Op.between]: [twoWeeksAgo, lastWeek]
            }
        }
    });

    // Total distributors
    const totalDistributors = await Distributor.count({
        where: {
            is_active: true
        }
    });

    // Improved percentage change calculation
    const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) {
            return current > 0 ? '100%' : '0%';
        }
        return `${((current - previous) / previous * 100).toFixed(2)}%`;
    };

    const stats = {
        currentWeek: currentWeekStats[0],
        previousWeek: previousWeekStats[0],
        percentageChanges: {
            orders: calculatePercentageChange(
                currentWeekStats[0].totalOrders,
                previousWeekStats[0].totalOrders
            ),
            revenue: calculatePercentageChange(
                currentWeekStats[0].totalRevenue || 0,
                previousWeekStats[0].totalRevenue || 0
            ),
            delivered: calculatePercentageChange(
                currentWeekStats[0].deliveredOrders,
                previousWeekStats[0].deliveredOrders
            )
        },
        totalDistributors
    };

    res.json(stats);
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