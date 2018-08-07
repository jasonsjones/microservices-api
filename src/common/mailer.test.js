import { expect } from 'chai';
import sinon from 'sinon';
import nodemailer from 'nodemailer';

import { getMailTransporter, clearMailTransporterCache } from './mailer';

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
});
