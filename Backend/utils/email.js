const nodemailer = require('nodemailer');
require('dotenv').config();

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

// Function to send email
const sendMail = (mailOptions) => {
    return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
