import nodemailer from 'nodemailer';

import config from '../config/config';

let _transporter = null;

export const getMailTransporter = () => {
    if (!_transporter) {
        _transporter = nodemailer.createTransport(config.emailAcct);
    }
    return _transporter;
};

export const clearMailTransporterCache = () => {
    _transporter = null;
};
