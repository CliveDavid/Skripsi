const { Invoice, Order, OrderItem, Distributor, Product, ShipmentMethod, Company, OrderAddress } = require('../models');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');


async function generateInvoicePDF(invoice_id) {
    try {
        const invoice = await Invoice.findByPk(invoice_id, {
            include: [{
                model: Order,
                include: [
                    { 
                        model: Distributor,
                    },
                    { 
                        model: OrderItem,
                        include: [{ model: Product }]
                    },
                    { model: ShipmentMethod },
                    {
                        model: OrderAddress,
                        as: 'addresses'  
                    }
                ]
            }]
         });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Fetch company information
        const company = await Company.findOne();

        // Load the HTML template
        const templatePath = path.join(__dirname, '../templates/invoice-template/invoice-template.html');
        let templateHtml = fs.readFileSync(templatePath, 'utf8');

        // Load and inject CSS
        const cssPath = path.join(__dirname, '../templates/invoice-template/invoice-template.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        templateHtml = templateHtml.replace('</head>', `<style>${cssContent}</style></head>`);

        // Helper function to format number to 2 decimal places
        const formatNumber = (num) => parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

        // Format date to Indonesian format
        const formatDate = (date) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString('id-ID', options);
        };

        // Prepare order items HTML
        let orderItemsHtml = '';
        invoice.order.order_items.forEach((item, index) => {
            orderItemsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.product ? item.product.prod_name : 'Produk tidak diketahui'}</td>
                    <td>${item.qty}</td>
                    <td>${item.box_type_code}</td>
                    <td>Rp ${formatNumber(item.total_item_price / item.qty)}</td>
                    <td>Rp ${formatNumber(item.total_item_price)}</td>
                </tr>
            `;
        });
        // Get dynamic port and host the app is running on
        const port = process.env.PORT || 3000;
        const imageUrl = `http://localhost:${port}/public/images/SJM.png`;

        // Replace placeholders in the HTML template with actual data
        templateHtml = templateHtml
            .replace('{{ invoice_number }}', invoice.invoice_number)
            .replace('{{ invoice_dt }}', formatDate(invoice.invoice_dt))
            .replace('{{ due_dt }}', formatDate(invoice.due_dt))
            .replace('{{ distributor_name }}', invoice.order.distributor.name)
            .replace('{{ distributor_address }}', 
                `${invoice.order.addresses[0].address}, ${invoice.order.addresses[0].addr_details}`
            )            
            .replace('{{ order_items }}', orderItemsHtml)
            .replace('{{ notes }}', invoice.order.notes || '-')
            .replace('{{ subtotal }}', formatNumber(invoice.subtotal))
            .replace('{{ additional_fee }}', formatNumber(invoice.additional_fee))
            .replace('{{ discount }}', formatNumber(invoice.discount))
            .replace('{{ total }}', formatNumber(invoice.total))
            .replace('{{ shipment_method }}', invoice.order.shipment_method.shipment_name)
            .replace('{{ company_name }}', company.company_name)
            .replace('{{ company_address }}', company.address)
            .replace('{{ company_phone }}', company.phn1)
            .replace('{{ company_email }}', company.email)
            .replace('src="images/SJM.png"', `src="${imageUrl}"`);

        // Launch Puppeteer in headless mode
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the content of the page to be the modified HTML template
        await page.setContent(templateHtml);

        // Generate PDF
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        // Close the browser
        await browser.close();

        return { pdfBuffer, invoice };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

async function generateReportPDF(period) {
    try {
        // Get date range based on period
        const { startDate, endDate } = getDateRange(period);

        // Fetch orders with all related data
        const orders = await Order.findAll({
            where: {
                order_dt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                { 
                    model: Distributor,
                },
                { 
                    model: OrderItem,
                    include: [{ model: Product }]
                },
                { model: ShipmentMethod },
                { model: Invoice }  
            ],
            order: [['order_dt', 'DESC']]
        });

        // Get stats data
        const [totalDistributors, prevPeriodOrders] = await Promise.all([
            Distributor.count(),
            Order.findAll({
                where: {
                    order_dt: {
                        [Op.between]: [
                            new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                            startDate
                        ]
                    }
                }
            })
        ]);

        // Calculate statistics
        const currentPeriodStats = calculatePeriodStats(orders);
        const previousPeriodStats = calculatePeriodStats(prevPeriodOrders);
        const percentageChanges = calculatePercentageChanges(currentPeriodStats, previousPeriodStats);

        // Load template and CSS
        const templatePath = path.join(__dirname, '../templates/report-template/report-template.html');
        let templateHtml = fs.readFileSync(templatePath, 'utf8');
        const cssPath = path.join(__dirname, '../templates/report-template/report-template.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        templateHtml = templateHtml.replace('</head>', `<style>${cssContent}</style></head>`);

        // Helper functions
        const formatNumber = (num) => parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        const formatDate = (date) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString('id-ID', options);
        };

        // Prepare orders HTML
        let ordersHtml = '';
        orders.forEach((order) => {
            const orderTotal = order.invoice ? parseFloat(order.invoice.total) : 
                order.order_items.reduce((sum, item) => sum + parseFloat(item.total_item_price), 0);
            
            let orderItemsHtml = `
            <table class="items-table">
                <thead>
                    <tr class="table-header">
                        <th>No</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Box Type</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
            `;
        
            order.order_items.forEach((item, index) => {
                const unitPrice = parseFloat(item.total_item_price) / parseFloat(item.qty);
                orderItemsHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.product ? item.product.prod_name : 'Produk tidak diketahui'}</td>
                        <td>${item.qty}</td>
                        <td>${item.box_type_code}</td>
                        <td>Rp ${formatNumber(unitPrice)}</td>
                        <td>Rp ${formatNumber(item.total_item_price)}</td>
                    </tr>
                `;
            });
        
            orderItemsHtml += '</tbody></table>';
        
            ordersHtml += `
                <div class="order-section">
                    <div class="order-info">
                        <table class="order-header-table">
                            <tbody>
                                <tr>
                                    <td class="header-label">Order #:</td>
                                    <td class="header-value">${order.order_number}</td>
                                    <td class="header-label">Date:</td>
                                    <td class="header-value">${formatDate(order.order_dt)}</td>
                                </tr>
                                <tr>
                                    <td class="header-label">Distributor:</td>
                                    <td class="header-value">${order.distributor.name}</td>
                                    <td class="header-label">Status:</td>
                                    <td class="header-value">
                                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <table class="order-details-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Box Type</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.order_items.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.product ? item.product.prod_name : 'Unknown Product'}</td>
                                    <td>${item.qty}</td>
                                    <td>${item.box_type_code}</td>
                                    <td>Rp ${formatNumber(item.total_item_price / item.qty)}</td>
                                    <td>Rp ${formatNumber(item.total_item_price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="order-summary">
                        <table class="summary-table">
                            <tbody>
                                <tr>
                                    <td>Subtotal</td>
                                    <td>Rp ${formatNumber(order.invoice?.subtotal || order.total || 0)}</td>
                                </tr>
                                <tr>
                                    <td>Additional Fee</td>
                                    <td>Rp ${formatNumber(order.invoice?.additional_fee || 0)}</td>
                                </tr>
                                <tr>
                                    <td>Discount</td>
                                    <td>Rp ${formatNumber(order.invoice?.discount || 0)}</td>
                                </tr>
                                <tr class="total-row">
                                    <td>Total</td>
                                    <td>Rp ${formatNumber(order.invoice?.total || order.total || 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                `;
        });
        // Get dynamic port and host
        const port = process.env.PORT || 3000;
        const imageUrl = `http://localhost:${port}/public/images/SJM.png`;

        // Replace placeholders in template
        templateHtml = templateHtml
        .replace(/\{\{\s*period\s*\}\}/g, period)
        .replace(/\{\{\s*start_date\s*\}\}/g, formatDate(startDate))
        .replace(/\{\{\s*end_date\s*\}\}/g, formatDate(endDate))
        .replace(/\{\{\s*total_distributors\s*\}\}/g, totalDistributors)
        .replace(/\{\{\s*total_orders\s*\}\}/g, currentPeriodStats.totalOrders)
        .replace(/\{\{\s*total_revenue\s*\}\}/g, `Rp ${formatNumber(currentPeriodStats.totalRevenue)}`)
        .replace(/\{\{\s*delivered_orders\s*\}\}/g, currentPeriodStats.deliveredOrders)
        .replace(/\{\{\s*orders_change\s*\}\}/g, percentageChanges.orders)
        .replace(/\{\{\s*revenue_change\s*\}\}/g, percentageChanges.revenue)
        .replace(/\{\{\s*orders\s*\}\}/g, ordersHtml)
        .replace(/\{\{\s*generated_date\s*\}\}/g, formatDate(new Date()))
        .replace(/src="images\/SJM.png"/g, `src="${imageUrl}"`);

        // Launch Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(templateHtml);

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        return pdfBuffer;

    } catch (error) {
        console.error('Error generating report PDF:', error);
        throw error;
    }
}

// Helper functions
function getDateRange(period) {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
        case 'DAY':
            startDate.setDate(endDate.getDate() - 1);
            break;
        case 'WEEK':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case 'MONTH':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case 'YEAR':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
    }

    return { startDate, endDate };
}

function calculatePeriodStats(orders) {
    let totalRevenue = 0;
    orders.forEach(order => {
        if (order.invoice) {
            totalRevenue += parseFloat(order.invoice.total) || 0;
        } else {
            totalRevenue += (order.order_items || []).reduce((sum, item) => 
                sum + (parseFloat(item.total_item_price) || 0), 0);
        }
    });

    return {
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        deliveredOrders: orders.filter(order => order.status === 'Delivered').length
    };
}

function calculatePercentageChanges(current, previous) {
    const calculateChange = (curr, prev) => {
        if (!prev) return '+100%';
        const change = ((curr - prev) / prev) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    return {
        orders: calculateChange(current.totalOrders, previous.totalOrders),
        revenue: calculateChange(current.totalRevenue, previous.totalRevenue)
    };
}

module.exports = { generateInvoicePDF, generateReportPDF };