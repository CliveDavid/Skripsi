const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const { Invoice, Order, Distributor } = require('../models');


class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async compileTemplate(templateName, data) {
        const templatePath = path.join(__dirname, '../templates', templateName);
        let template = await fs.readFile(templatePath, 'utf-8');
        
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, data[key]);
        });
        
        return template;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID').format(amount);
    }

    async sendOTPEmail(email, name, otp, isResend = false) {
        const htmlContent = await this.compileTemplate('otp-email.html', {
            name,
            otp
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `${isResend ? 'New ' : ''}OTP Code for Email Verification`,
            html: htmlContent,
            text: `Your OTP is: ${otp}`
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendSupportEmail({ email, subject, message }) {
        try {
            const htmlContent = await this.compileTemplate('support-email.html', {
                email,
                subject,
                message
            });
    
            const mailOptions = {
                from: email,
                to: process.env.SUPPORT_EMAIL,
                subject: `Support Request: ${subject}`,
                html: htmlContent,
                text: `From: ${email}\n\nMessage:\n${message}`
            };
    
            const emailResult = await this.transporter.sendMail(mailOptions);
            
            return {
                success: Boolean(emailResult.messageId && emailResult.rejected.length === 0),
                message: emailResult.messageId ? 'Message sent successfully' : 'Failed to send message'
            };
        } catch (error) {
            console.error('Error sending support email:', error);
            throw error;
        }
    }

    async sendOrderProcessingEmail(order, distributor) {
        try {
            const htmlContent = await this.compileTemplate('order-processing.html', {
                name: distributor.name,
                order_number: order.order_number,
                order_date: new Date(order.order_dt).toLocaleDateString('id-ID'),
                total_price: this.formatCurrency(order.total_price),
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: distributor.email,
                subject: `Order #${order.order_number} Is Being Processed`,
                html: htmlContent,
                text: `Your order #${order.order_number} is now being processed. Total amount: Rp ${this.formatCurrency(order.total_price)}.`
            };

            return this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending order processing email:', error);
            throw error;
        }
    }

    async sendInvoiceEmail(invoice, pdfBuffer) {
        try {
            const invoiceWithDetails = await Invoice.findOne({
                where: { invoice_number: invoice.invoice_number },
                include: [{
                    model: Order,
                    include: [{
                        model: Distributor,
                        attributes: ['name', 'email'] 
                    }]
                }]
            });
    
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: invoiceWithDetails.order.distributor.email,
                subject: `Invoice #${invoice.invoice_number}`,
                text: `Dear ${invoiceWithDetails.order.distributor.name},\n\nPlease find attached the invoice #${invoice.invoice_number} for your recent order.\n\nThank you for your business.\n\nBest regards,\nPT Sadang Jaya`,
                attachments: [{
                    filename: `invoice-${invoice.invoice_number}.pdf`,
                    content: pdfBuffer
                }]
            };
    
            const emailResult = await this.transporter.sendMail(mailOptions);
            
            // Email is successful if messageId exists and there are no rejected recipients
            return { 
                success: Boolean(emailResult.messageId && emailResult.rejected.length === 0),
                messageId: emailResult.messageId,
                rejected: emailResult.rejected
            };
        } catch (error) {
            console.error('Error sending invoice email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();