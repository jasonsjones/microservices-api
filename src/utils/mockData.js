import config from '../config/config';

export const mockTestAccountResponse = {
    user: config.testEmailAddr,
    pass: 'u6XKFA5qGUjhgzrBaw',
    smtp: { host: 'smtp.sandboxpi.com', port: 587, secure: false },
    imap: { host: 'imap.sandboxapi.com', port: 993, secure: true },
    pop3: { host: 'pop3.sandboxapi.com', port: 995, secure: true },
    web: 'https://sandboxapi.com'
};
