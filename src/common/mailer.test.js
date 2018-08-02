import { expect } from 'chai';

import { getMailTransporter } from './mailer';

describe('Mailer', () => {
    it('returns a mail transporter', () => {
        const transporter = getMailTransporter();
        expect(transporter).to.exist;
    });
});
