import nodemailer from 'nodemailer';

import config from '../config/config';

let _transporter = null;

export const getMailTransporter = () => {
    if (!_transporter) {
        return getEmailAcctConfig().then(creds => {
            _transporter = nodemailer.createTransport(creds);
            return _transporter;
        });
    }
    return Promise.resolve(_transporter);
};

export const clearMailTransporterCache = () => {
    _transporter = null;
};

export const createTestAccount = () => {
    return new Promise((resolve, reject) => {
        nodemailer.createTestAccount((err, account) => {
            if (err) {
                reject(err);
            }
            const rawAccount = account;
            const smtpMailConfig = {
                ...account.smtp,
                auth: { user: account.user, pass: account.pass }
            };
            resolve({ rawAccount, smtpMailConfig });
        });
    });
};

const getEmailAcctConfig = () => {
    if (process.env.NODE_ENV != 'production') {
        return createTestAccount().then(creds => creds.smtpMailConfig);
    }
};
