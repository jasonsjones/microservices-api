import debug from 'debug';
import nodemailer from 'nodemailer';

import { getMailTransporter } from './mailer';
import config from '../config/config';
import * as templates from '../mailer/email-templates';

const log = debug('mailer');

export const sendPasswordResetEmail = (user, resetUrl) => {
    return new Promise((resolve, reject) => {
        let mailOptions = getMailOptions(user, resetUrl);
        let transporter = getMailTransporter();
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            resolve({ email: user.email, info });
        });
    });
};

const getMailOptions = (user, resetUrl) => {
    return {
        from: config.emailAddr,
        to: `"${user.name}" <${user.email}>`, // list of receivers
        subject: 'Password Reset', // Subject line
        text: templates.passwordResetEmailPlainText(resetUrl),
        html: templates.passwordResetEmailHTML(resetUrl)
    };
};
