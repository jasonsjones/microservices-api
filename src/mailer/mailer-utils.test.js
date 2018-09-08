import { expect } from 'chai';
import sinon from 'sinon';
import nodemailer from 'nodemailer';

import { sendPasswordResetEmail, sendEmailVerificationEmail } from './mailer-utils';
import { mockUsers } from '../utils/userTestUtils';
import { clearMailTransporterCache } from './mailer';

const sendMailFake = (options, cb) => {
    cb(null, {
        messageId: '<1b519020-5bfe-4078-cd5e-7351a09bd766@sandboxapi.com>'
    });
};

const sendMailStub = sinon.stub().callsFake(sendMailFake);
const mockTransporter = {
    sendMail: sendMailStub
};

describe('Mailer utils', () => {
    let mailerStub, sendMailStub;

    beforeEach(() => {
        mailerStub = sinon.stub(nodemailer, 'createTransport');
    });

    afterEach(() => {
        mailerStub.restore();
        clearMailTransporterCache();
    });

    describe('sendPasswordResetEmail()', () => {
        it('resolves with a payload with user and info properties', () => {
            mailerStub.returns(mockTransporter);
            const promise = sendPasswordResetEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(payload => {
                expect(payload).to.be.an('object');
                expect(payload).to.have.property('user');
                expect(payload).to.have.property('info');
                expect(mailerStub.calledOnce).to.be.true;
            });
        });

        it('calls the nodemailer.createTransport() only once', () => {
            mailerStub.returns(mockTransporter);
            const promise = sendPasswordResetEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(() => {
                expect(mailerStub.calledOnce).to.be.true;
            });
        });
    });

    describe('sendEmailVerificationEmail()', () => {
        it('resolves with a payload with user and info properties', () => {
            mailerStub.returns(mockTransporter);
            const promise = sendEmailVerificationEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(payload => {
                expect(payload).to.be.an('object');
                expect(payload).to.have.property('user');
                expect(payload).to.have.property('info');
                expect(mailerStub.calledOnce).to.be.true;
            });
        });

        it('calls the nodemailer.createTransport() only once', () => {
            mailerStub.returns(mockTransporter);
            const promise = sendEmailVerificationEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(() => {
                expect(mailerStub.calledOnce).to.be.true;
            });
        });
    });
});
