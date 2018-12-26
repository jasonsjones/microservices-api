import debug from 'debug';
import nodemailer from 'nodemailer';

import config from '../config/config';

const log = debug('mailer');

class MailTransport {
    constructor() {
        this._transporter = null;
    }

    getMailTransporter() {
        if (!this._transporter) {
            return this.getEmailAcctConfig().then(creds => {
                this._transporter = nodemailer.createTransport(creds);
                return this._transporter;
            });
        }
        return Promise.resolve(this._transporter);
    }

    clearMailTransporterCache() {
        this._transporter = null;
    }

    getEmailAcctConfig() {
        if (process.env.NODE_ENV != 'production') {
            return this.createTestAccount().then(creds => creds.smtpMailConfig);
        }
        // else we will need to configure an actual email account to use in production
    }

    createTestAccount() {
        return new Promise((resolve, reject) => {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    return reject(err);
                }
                if (!account.user.includes(config.testEmailAddr)) {
                    log('Test account user: %s', account.user);
                    log('Test account password: %s', account.pass);
                }
                const rawAccount = account;
                const smtpMailConfig = Object.assign({}, account.smtp, {
                    auth: { user: account.user, pass: account.pass }
                });
                resolve({ rawAccount, smtpMailConfig });
            });
        });
    }
}

export default new MailTransport();
