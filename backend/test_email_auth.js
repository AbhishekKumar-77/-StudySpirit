require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});
