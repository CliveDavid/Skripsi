const express = require('express');
const router = express.Router();
const { Invoice } = require('../models');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
require('dotenv').config();
const { ERROR_MESSAGES } = require('../constants');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);


// Get all invoices
router.post('/get-all', asyncHandler(async (req, res) => {
    const invoices = await Invoice.findAll({
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'discount', 'total', 'payment_status', 'additional_fee']
    });
    res.json(invoices);
}));

// Get invoice by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { id } = req.body;
    const invoice = await Invoice.findByPk(id, {
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'discount', 'total', 'payment_status', 'additional_fee']
    });

    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
}));

// Get invoice by order ID
router.post('/get-by-order-id', asyncHandler(async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    const invoice = await Invoice.findOne({
        where: { order_id },
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'discount', 'total', 'payment_status', 'additional_fee']
    });

    // If no invoice is found, return an empty object instead of an error
    res.json(invoice || {});
}));

// Create new invoice
router.post('/create', asyncHandler(async (req, res) => {
    const { invoice_dt, order_id, subtotal, discount, additional_fee, payment_status } = req.body;

    if (!invoice_dt || !order_id || !subtotal) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }

    try {
        let invoice = await Invoice.findOne({ where: { order_id } });
        
        if (invoice) {
            // First check if there are any real differences in the data
            const hasChanges = 
                parseFloat(invoice.subtotal) !== parseFloat(subtotal) ||
                parseFloat(invoice.discount || 0) !== parseFloat(discount || 0) ||
                parseFloat(invoice.additional_fee || 0) !== parseFloat(additional_fee || 0);

            if (!hasChanges) {
                invoice = await invoice.update({
                    payment_status: payment_status || 'Unpaid'
                });
                return res.status(200).json(invoice);
            }

            // Only update dates and recalculate if there are actual changes
            const currentDate = new Date();
            const dueDate = new Date(currentDate);
            dueDate.setDate(dueDate.getDate() + 7);

            invoice = await invoice.update({
                invoice_dt: currentDate,
                due_dt: dueDate,
                subtotal,
                discount: discount || 0,
                additional_fee: additional_fee || 0,
                payment_status: payment_status || 'Unpaid',
                total: parseFloat(subtotal) - parseFloat(discount || 0) + parseFloat(additional_fee || 0),
                is_sent: false
            });
        } else {
            invoice = await Invoice.create({
                invoice_dt: new Date(invoice_dt),
                order_id,
                subtotal,
                discount: discount || 0,
                additional_fee: additional_fee || 0,
                payment_status: payment_status || 'Unpaid'
            });
        }
 
        await sendInvoiceEmail(invoice);
 
        res.status(invoice ? 200 : 201).json(invoice);
    } catch (error) {
        console.error('Error creating/updating invoice:', error);
        res.status(500).json({ message: 'Error creating/updating invoice', error: error.message });
    }
}));

// Download PDF
router.post('/generate-pdf', asyncHandler(async (req, res) => {
    const { invoice_id } = req.body;

    try {
        const { pdfBuffer, invoice } = await generateInvoicePDF(invoice_id);

        // Convert to Buffer if it's not recognized as a valid Buffer
        const validBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=nota-titipan-barang-${invoice_id}.pdf`);
        res.setHeader('Content-Length', validBuffer.length);

        // Send the PDF buffer as a binary stream
        res.end(validBuffer);

        console.log('PDF sent successfully');
    } catch (error) {
        console.error('Error in PDF generation:', error);
        res.status(500).contentType('text/plain').send('Error generating PDF: ' + error.message);
    }
}));

// Send invoice PDF via email
router.post('/send-invoice-email', asyncHandler(async (req, res) => {
    const { invoice_id } = req.body;
    
    if (!invoice_id) {
        return res.status(400).json({ message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
    }
 
    try {
        const invoice = await Invoice.findByPk(invoice_id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
    
        const result = await sendInvoiceEmail(invoice);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
 }));

 const sendInvoiceEmail = async (invoice) => {
    if (invoice.is_sent) {
        return { success: false, message: 'Invoice already sent' };
    }

    try {
        const { pdfBuffer } = await generateInvoicePDF(invoice.invoice_id);
        
        const emailResult = await emailService.sendInvoiceEmail(invoice, pdfBuffer);
        
        await invoice.update({ is_sent: emailResult.success });
        
        return { 
            success: emailResult.success, 
            message: emailResult.success ? 'Email sent successfully' : 'Failed to send email'
        };
    } catch (error) {
        console.error('Error sending invoice email:', error);
        await invoice.update({ is_sent: false });
        return { success: false, message: error.message };
    }
};
module.exports = router;
