const { Invoice, Order, OrderItem, Distributor, Product, ShipmentMethod, Company } = require('../models');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateInvoicePDF(invoice_id) {
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
            .replace('{{ shipment_method }}', invoice.order.shipmentMethod ? invoice.order.shipmentMethod.shipment_name : 'Metode pengiriman tidak diketahui')
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

        return { pdfBuffer, invoice };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

module.exports = { generateInvoicePDF };