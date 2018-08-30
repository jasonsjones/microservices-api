import debug from 'debug';
import nodemailer from 'nodemailer';

import { getMailTransporter } from './mailer';
import config from '../config/config';
import * as templates from '../mailer/email-templates';

const log = debug('mailer');

export const sendPasswordResetEmail = user => {
    return new Promise((resolve, reject) => {
        const resetUrl = `${config.url}/reset/${user.passwordResetToken}`;
        let mailOptions = getMailOptionsForPasswordReset(user, resetUrl);
        let transporter = getMailTransporter();
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            resolve({ user, info });
        });
    });
};

export const sendEmailVerificationEmail = user => {
    return new Promise((resolve, reject) => {
        const verifyUrl = `${config.url}/reset/${user.emailVerificationToken}`;
        let mailOptions = getMailOptionsForEmailVerification(user, verifyUrl);
        let transporter = getMailTransporter();
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            resolve({ user, info });
        });
    });
};

const getMailOptionsForPasswordReset = (user, url) => {
    return {
        from: config.emailAddr,
        to: `"${user.name}" <${user.email}>`, // list of receivers
        subject: 'Password Reset', // Subject line
        text: templates.passwordResetEmailPlainText(url),
        html: templates.passwordResetEmailHTML(url)
    };
};

const getMailOptionsForEmailVerification = (user, url) => {
    return {
        from: config.emailAddr,
        to: `"${user.name}" <${user.email}>`, // list of receivers
        subject: 'Email Verification', // Subject line
        text: 'text email',
        html: `<p>html email</p><p>${url}</p>`
    };
};
