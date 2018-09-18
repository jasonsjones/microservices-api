import { expect } from 'chai';
import sinon from 'sinon';
import nodemailer from 'nodemailer';

import { getMailTransporter, clearMailTransporterCache, createTestAccount } from './mailer';
import { mockTestAccountResponse } from '../utils/mockData';

describe('Mailer', () => {
    describe('getMailTransporter()', () => {
        let nodemailerSpy;
        let createTestAccountStub;

        before(() => {
            clearMailTransporterCache();
            createTestAccountStub = sinon.stub(nodemailer, 'createTestAccount');
            const accountFake = cb => {
                cb(null, mockTestAccountResponse);
            };
            createTestAccountStub.callsFake(accountFake);
            nodemailerSpy = sinon.spy(nodemailer, 'createTransport');
        });

        after(() => {
            nodemailerSpy.restore();
            createTestAccountStub.restore();
            clearMailTransporterCache();
        });

        it('returns a mail transporter', () => {
            getMailTransporter().then(transporter => {
                expect(transporter).to.exist;
            });
        });

        it('calls nodemailer.createTrasnport() only once', () => {
            expect(nodemailerSpy.calledOnce).to.be.true;
        });

        it('subsequent calls return cached transporter', () => {
            getMailTransporter().then(() => {
                // nodemailer.createTransport() should not be called again
                // calledOnce still should be true
                expect(nodemailerSpy.calledOnce).to.be.true;
                expect(nodemailerSpy.calledTwice).to.be.false;
            });
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
            getMailTransporter()
                .then(() => {
                    expect(nodemailerSpy.calledOnce).to.be.true;
                    clearMailTransporterCache();
                    return getMailTransporter();
                })
                .then(() => {
                    expect(nodemailerSpy.calledTwice).to.be.true;
                });
        });
    });

    describe('createTestAccount()', () => {
        let createTestAccountStub;
        beforeEach(() => {
            createTestAccountStub = sinon.stub(nodemailer, 'createTestAccount');
        });

        afterEach(() => {
            createTestAccountStub.restore();
        });

        it('returns a raw account and smtpConfig', async () => {
            const accountFake = cb => {
                cb(null, mockTestAccountResponse);
            };
            createTestAccountStub.callsFake(accountFake);
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
            createTestAccountStub.callsFake(accountFake);
            try {
                await createTestAccount();
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('not able to create account');
            }
        });
    });
});
