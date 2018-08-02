import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let _transporter = null;

export const getMailTransporter = () => {
    if (!_transporter) {
        _transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWD
            }
        });
    }
    return _transporter;
};
