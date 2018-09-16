import { expect } from 'chai';
import sinon from 'sinon';
import nodemailer from 'nodemailer';

import { getMailTransporter, clearMailTransporterCache, createTestAccount } from './mailer';

const mockTestAccountResponse = {
    user: 'xwdowynjpycrbvqg@ethereal.email',
    pass: 'u6XKFA5qGUjhgzrBaw',
    smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    imap: { host: 'imap.ethereal.email', port: 993, secure: true },
    pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
    web: 'https://ethereal.email'
};

describe('Mailer', () => {
    describe('getMailTransporter()', () => {
        let transporter, nodemailerSpy;

        before(() => {
            nodemailerSpy = sinon.spy(nodemailer, 'createTransport');
            transporter = getMailTransporter();
        });

        after(() => {
            nodemailerSpy.restore();
            clearMailTransporterCache();
        });

        it('returns a mail transporter', () => {
            expect(transporter).to.exist;
        });

        it('calls nodemailer.createTrasnport() only once', () => {
            expect(nodemailerSpy.calledOnce).to.be.true;
        });

        it('subsequent calls return cached transporter', () => {
            const transporter2 = getMailTransporter();
            // nodemailer.createTransport() should not be called again
            // calledOnce still should be true
            expect(nodemailerSpy.calledOnce).to.be.true;
            expect(nodemailerSpy.calledTwice).to.be.false;
        });
    });

    describe('clearMailTransporterCache()', () => {
        let nodemailerSpy;

        before(() => {
            nodemailerSpy = sinon.spy(nodemailer, 'createTransport');
        });

        after(() => {
            nodemailerSpy.restore();
        });

        it('resets the mail transporter', () => {
            let transporter = getMailTransporter();
            expect(nodemailerSpy.calledOnce).to.be.true;
            clearMailTransporterCache();
            transporter = getMailTransporter();
            expect(nodemailerSpy.calledTwice).to.be.true;
        });
    });

    describe('createTestAccount()', () => {
        let nodemailerStub;

        before(() => {
            nodemailerStub = sinon.stub(nodemailer, 'createTestAccount');
        });

        after(() => {
            nodemailerStub.restore();
        });

        it('returns a raw account and smtpConfig', async () => {
            const accountFake = cb => {
                cb(null, mockTestAccountResponse);
            };
            nodemailerStub.callsFake(accountFake);

            const account = await createTestAccount();

            expect(account).to.have.property('rawAccount');
            expect(account).to.have.property('smtpMailConfig');
            expect(account.rawAccount).to.have.property('user');
            expect(account.rawAccount).to.have.property('pass');
        });

        it('returns error if something wrong with nodemailer createTestAccount', async () => {
            const accountFake = cb => {
                cb(new Error('Oops, nodemailer was not able to create account'), null);
            };
            nodemailerStub.callsFake(accountFake);
            try {
                await createTestAccount();
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('not able to create account');
            }
        });
    });
});
