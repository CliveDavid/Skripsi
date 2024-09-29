const express = require('express');
const router = express.Router();
const { Invoice } = require('../models');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const nodemailer = require('nodemailer');
require('dotenv').config();


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

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route to send invoice PDF via email
router.post('/send-invoice-email', asyncHandler(async (req, res) => {
    const { invoice_id } = req.body;
    const testEmail = 'clivedavid.lie@gmail.com'; // For testing purposes

    try {
        const { pdfBuffer, invoice } = await generateInvoicePDF(invoice_id);

        // Prepare email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: testEmail,
            subject: `Invoice #${invoice.invoice_number}`,
            text: `Dear ${invoice.order.distributor.name},\n\nPlease find attached the invoice #${invoice.invoice_number} for your recent order.\n\nThank you for your business.\n\nBest regards,\nPT Sadang Jaya`,
            attachments: [
                {
                    filename: `invoice-${invoice_id}.pdf`,
                    content: pdfBuffer
                }
            ]
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Invoice sent successfully via email' });
    } catch (error) {
        console.error('Error sending invoice email:', error);
        res.status(500).json({ message: 'Error sending invoice email', error: error.message });
    }
}));

module.exports = router;
