const express = require('express');
const router = express.Router();
const { generateReportPDF } = require('../utils/pdfGenerator');
const { Order, OrderItem, Distributor, Product, OrderAddress, sequelize } = require('../models');
const { STATUS, ERROR_MESSAGES } = require('../constants');
const { Op } = require('sequelize');

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

function getDateRange(period) {
    const now = new Date();
    let startOfPeriod;
    let endOfPeriod;

    if (period === 'DAY') {
        startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
        endOfPeriod = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === 'MONTH') {
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'YEAR') {
        startOfPeriod = new Date(now.getFullYear(), 0, 1);
        endOfPeriod = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === 'WEEK') {
        // Set to the start of the current week (Sunday or Monday depending on locale)
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek == 0 ? -6 : 1); // Adjust if Sunday (0)
        startOfPeriod = new Date(now.setDate(diff));
        startOfPeriod.setHours(0, 0, 0, 0);

        // Set to the end of the current week (Saturday or Sunday depending on locale)
        endOfPeriod = new Date(now.setDate(diff + 6));
        endOfPeriod.setHours(23, 59, 59, 999);
    } else {
        throw new Error("Invalid period. Use 'DAY', 'MONTH', 'YEAR', or 'WEEK'.");
    }

    return { startOfPeriod, endOfPeriod };
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
    const { period = 'WEEK' } = req.body; // Default to WEEK if no period is specified

    // Get the date range based on the period
    const currentRange = getDateRange(period);
    
    // For last period (previous period), calculate accordingly
    let lastRange;
    if (period === 'DAY') {
        lastRange = getDateRange('DAY'); // Use previous day's range
        lastRange.startOfPeriod.setDate(lastRange.startOfPeriod.getDate() - 1);
        lastRange.endOfPeriod.setDate(lastRange.endOfPeriod.getDate() - 1);
    } else if (period === 'MONTH') {
        lastRange = getDateRange('MONTH');
        lastRange.startOfPeriod.setMonth(lastRange.startOfPeriod.getMonth() - 1);
        lastRange.endOfPeriod.setMonth(lastRange.endOfPeriod.getMonth() - 1);
    } else if (period === 'YEAR') {
        lastRange = getDateRange('YEAR');
        lastRange.startOfPeriod.setFullYear(lastRange.startOfPeriod.getFullYear() - 1);
        lastRange.endOfPeriod.setFullYear(lastRange.endOfPeriod.getFullYear() - 1);
    } else if (period === 'WEEK') {
        lastRange = getDateRange('WEEK');
        lastRange.startOfPeriod.setDate(lastRange.startOfPeriod.getDate() - 7);
        lastRange.endOfPeriod.setDate(lastRange.endOfPeriod.getDate() - 7);
    }

    // Get total distributors for current and previous period
    const currentPeriodDistributors = await Distributor.count({
        where: { is_active: true }
    });

    const previousPeriodDistributors = await Distributor.count({
        where: { 
            is_active: true,
            createdAt: {
                [Op.lt]: currentRange.startOfPeriod
            }
        }
    });

    // Fetch Orders for current and previous periods
    const currentPeriodOrders = await Order.findAll({
        where: {
            createdAt: {
                [Op.between]: [currentRange.startOfPeriod, currentRange.endOfPeriod]
            }
        }
    });

    const previousPeriodOrders = await Order.findAll({
        where: {
            createdAt: {
                [Op.between]: [lastRange.startOfPeriod, lastRange.endOfPeriod]
            }
        }
    });

    // Calculate stats for current and previous periods
    const currentPeriodStats = {
        totalDistributors: currentPeriodDistributors,
        totalOrders: currentPeriodOrders.length,
        totalRevenue: currentPeriodOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0).toFixed(2),
        deliveredOrders: currentPeriodOrders.filter(order => order.status === 'Delivered').length
    };

    const previousPeriodStats = {
        totalDistributors: previousPeriodDistributors,
        totalOrders: previousPeriodOrders.length,
        totalRevenue: previousPeriodOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0).toFixed(2),
        deliveredOrders: previousPeriodOrders.filter(order => order.status === 'Delivered').length
    };

    // Calculate percentage changes
    const percentageChanges = {
        distributors: calculatePercentageChange(currentPeriodStats.totalDistributors, previousPeriodStats.totalDistributors),
        orders: calculatePercentageChange(currentPeriodStats.totalOrders, previousPeriodStats.totalOrders),
        revenue: calculatePercentageChange(parseFloat(currentPeriodStats.totalRevenue), parseFloat(previousPeriodStats.totalRevenue)),
        delivered: calculatePercentageChange(currentPeriodStats.deliveredOrders, previousPeriodStats.deliveredOrders)
    };

    res.json({
        currentPeriod: {
            totalDistributors: currentPeriodStats.totalDistributors.toString(),
            totalOrders: currentPeriodStats.totalOrders.toString(),
            totalRevenue: currentPeriodStats.totalRevenue,
            deliveredOrders: currentPeriodStats.deliveredOrders.toString()
        },
        previousPeriod: {
            totalDistributors: previousPeriodStats.totalDistributors.toString(),
            totalOrders: previousPeriodStats.totalOrders.toString(),
            totalRevenue: previousPeriodStats.totalRevenue,
            deliveredOrders: previousPeriodStats.deliveredOrders.toString()
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
        where: {
            status: {
                [Op.in]: [STATUS.PENDING, STATUS.PROCESSING, STATUS.INVOICED]
            }
        },
        include: [{
            model: OrderAddress,
            as: 'addresses'
        }],
        order: [['order_dt', 'ASC']],
        limit: 10
    });

    res.json(recentOrders);
}));

router.post('/generate-pdf', asyncHandler(async (req, res) => {
    const { period } = req.body;
    
    // Validate period
    const validPeriods = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
    if (!validPeriods.includes(period)) {
        return res.status(400).send('Invalid period specified');
    }

    try {
        // Generate PDF from the data
        const pdfBuffer = await generateReportPDF(period);

        // Convert to Buffer if necessary
        const validBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${period.toLowerCase()}.pdf`);
        res.setHeader('Content-Length', validBuffer.length);

        // Send the PDF buffer
        res.end(validBuffer);

        console.log(`${period} report PDF generated successfully`);
    } catch (error) {
        console.error('Error in dashboard PDF generation:', error);
        res.status(500).send('Error generating dashboard report: ' + error.message);
    }
}));


module.exports = router;