const express = require('express');
const router = express.Router();
const { Invoice, Order, OrderItem, Distributor, Product, BoxType, ProductType, ShipmentMethod, Company  } = require('../models');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);



// Get all invoices
router.post('/get-all', asyncHandler(async (req, res) => {
    const invoices = await Invoice.findAll({
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'tax', 'total', 'payment_status', 'additional_fee']
    });
    res.json(invoices);
}));

// Get invoice by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { id } = req.body;
    const invoice = await Invoice.findByPk(id, {
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'tax', 'total', 'payment_status', 'additional_fee']
    });

    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
}));

// Create new invoice
router.post('/create', asyncHandler(async (req, res) => {
    const { invoice_dt, order_id, subtotal, tax, additional_fee, payment_status } = req.body;

    // Validate required fields
    if (!invoice_dt || !order_id || !subtotal) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newInvoice = await Invoice.create({
        invoice_dt: new Date(invoice_dt),
        order_id,
        subtotal,
        tax: tax || 0,
        additional_fee: additional_fee || 0, 
        payment_status: payment_status || 'Unpaid'
    });

    res.status(201).json({
        invoice_id: newInvoice.invoice_id,
        invoice_number: newInvoice.invoice_number,
        invoice_dt: newInvoice.invoice_dt,
        due_dt: newInvoice.due_dt,
        order_id: newInvoice.order_id,
        subtotal: newInvoice.subtotal,
        tax: newInvoice.tax,
        additional_fee: newInvoice.additional_fee,
        total: newInvoice.total,
        payment_status: newInvoice.payment_status
    });
}));

// Generate PDF for invoice
router.post('/generate-pdf', asyncHandler(async (req, res) => {
    const { invoice_id } = req.body;

    try {
        // Fetch invoice data from database with associated order and related data
        const invoice = await Invoice.findByPk(invoice_id, {
            include: [{
                model: Order,
                include: [
                    { model: Distributor },
                    { 
                        model: OrderItem,
                        include: [{ model: Product }]
                    },
                    { model: ShipmentMethod }
                ]
            }]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Fetch company information
        const company = await Company.findOne();

        // Load the HTML template
        const templatePath = path.join(__dirname, '../templates/invoice-template.html');
        let templateHtml = fs.readFileSync(templatePath, 'utf8');

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
                    <td>${item.product.prod_name}</td>
                    <td>${item.qty}</td>
                    <td>${item.box_type_code}</td>
                    <td>Rp ${formatNumber(item.total_item_price / item.qty)}</td>
                    <td>Rp ${formatNumber(item.total_item_price)}</td>
                </tr>
            `;
        });

        // Replace placeholders in the HTML template with actual data
        templateHtml = templateHtml
            .replace('{{ invoice_number }}', invoice.invoice_number)
            .replace('{{ invoice_dt }}', formatDate(invoice.invoice_dt))
            .replace('{{ due_dt }}', formatDate(invoice.due_dt))
            .replace('{{ distributor_name }}', invoice.order.distributor.name)
            .replace('{{ distributor_address }}', invoice.order.distributor.address)
            .replace('{{ order_items }}', orderItemsHtml)
            .replace('{{ notes }}', invoice.order.notes || '-')
            .replace('{{ subtotal }}', formatNumber(invoice.subtotal))
            .replace('{{ additional_fee }}', formatNumber(invoice.additional_fee))
            .replace('{{ tax }}', formatNumber(invoice.tax))
            .replace('{{ total }}', formatNumber(invoice.total))
            .replace('{{ shipment_method }}', invoice.order.shipment_method.shipment_name)
            .replace('{{ company_name }}', company.company_name)
            .replace('{{ company_address }}', company.address)
            .replace('{{ company_phone }}', company.phn1)
            .replace('{{ company_email }}', company.email);

        // Launch Puppeteer in headless mode
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the content of the page to be the modified HTML template
        await page.setContent(templateHtml);

        // Generate PDF
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        // Close the browser
        await browser.close();

        // Save PDF locally for debugging
        const debugPath = path.join(__dirname, `../debug/invoice-${invoice_id}.pdf`);
        fs.writeFileSync(debugPath, pdfBuffer);
        console.log(`Debug PDF saved at: ${debugPath}`);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=nota-titipan-barang-${invoice_id}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error in PDF generation:', error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
}));

module.exports = router;
