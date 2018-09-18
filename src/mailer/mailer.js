import debug from 'debug';
import nodemailer from 'nodemailer';

import config from '../config/config';

const log = debug('mailer');
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
                return reject(err);
            }
            log('Test account user: %s', account.user);
            log('Test account password: %s', account.pass);
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
