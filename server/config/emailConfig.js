const nodemailer = require('nodemailer');

// Baca variabel lingkungan dari file .env
require('dotenv').config();

// Konfigurasi transporter Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = transporter;
