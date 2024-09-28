const express = require('express');
const router = express.Router();
const { Invoice } = require('../models');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

//#region Invoice Routes

// Get all invoices
router.post('/get-all', asyncHandler(async (req, res) => {
    const invoices = await Invoice.findAll({
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'tax', 'total', 'payment_status', 'createdAt']
    });
    res.json(invoices);
}));

// Get invoice by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { id } = req.body;  // Assuming the ID is passed in the request body
    const invoice = await Invoice.findByPk(id, {
        attributes: ['invoice_id', 'invoice_number', 'invoice_dt', 'due_dt', 'order_id', 'subtotal', 'tax', 'total', 'payment_status', 'createdAt']
    });

    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
}));

// Create new invoice
router.post('/create', asyncHandler(async (req, res) => {
    const { invoice_number, invoice_dt, due_dt, order_id, subtotal, tax, total, payment_status } = req.body;

    // Validate required fields
    if (!invoice_number || !invoice_dt || !due_dt || !order_id || !subtotal || !tax || !total) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newInvoice = await Invoice.create({
        invoice_number,
        invoice_dt,
        due_dt,
        order_id,
        subtotal,
        tax,
        total,
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
        total: newInvoice.total,
        payment_status: newInvoice.payment_status
    });
}));

//#endregion

module.exports = router;
