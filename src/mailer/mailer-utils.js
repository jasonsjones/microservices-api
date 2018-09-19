import debug from 'debug';
import nodemailer from 'nodemailer';

import { getMailTransporter } from './mailer';
import config from '../config/config';
import * as templates from '../mailer/email-templates';

const log = debug('mailer');

export const sendPasswordResetEmail = user => {
    return new Promise((resolve, reject) => {
        const resetUrl = `${config.clientUrl}/api/users/reset-password/${user.passwordResetToken}`;
        let mailOptions = getMailOptionsForPasswordReset(user, resetUrl);
        getMailTransporter().then(transporter => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return reject(error);
                }
                log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                resolve({ user, info });
            });
        });
    });
};

export const sendEmailVerificationEmail = user => {
    return new Promise((resolve, reject) => {
        const verifyUrl = `${config.clientUrl}/api/users/verify-email/${
            user.emailVerificationToken
        }`;
        let mailOptions = getMailOptionsForEmailVerification(user, verifyUrl);
        getMailTransporter().then(transporter => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return reject(error);
                }
                log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                resolve({ user, info });
            });
        });
    });
};

const getMailOptionsForPasswordReset = (user, url) => {
    return {
        from: config.emailAddr,
        to: `"${user.name}" <${user.email}>`,
        subject: 'Password Reset -- Sandbox API',
        text: templates.passwordResetEmailPlainText(url),
        html: templates.passwordResetEmailHTML(url)
    };
};

const getMailOptionsForEmailVerification = (user, url) => {
    return {
        from: config.emailAddr,
        to: `"${user.name}" <${user.email}>`,
        subject: 'Email Verification -- Sandbox API',
        text: templates.verifyEmailPlainText(url),
        html: templates.verifyEmailHTML(url)
    };
};
