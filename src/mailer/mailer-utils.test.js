import { expect } from 'chai';
import sinon from 'sinon';
import nodemailer from 'nodemailer';

import { sendPasswordResetEmail, sendEmailVerificationEmail } from './mailer-utils';
import { mockUsers } from '../utils/userTestUtils';
import mailer from './mailer';
import { mockTestAccountResponse } from '../utils/mockData';

describe('Mailer utils', () => {
    let createTransportStub;
    let createTestAccountStub;
    let mockTransporter;

    before(() => {
        const sendMailStub = sinon.stub().yieldsRight(null, {
            messageId: '<1b519020-5bfe-4078-cd5e-7351a09bd766@sandboxapi.com>'
        });

        mockTransporter = {
            sendMail: sendMailStub
        };
    });

    beforeEach(() => {
        createTransportStub = sinon.stub(nodemailer, 'createTransport').returns(mockTransporter);
        createTestAccountStub = sinon
            .stub(nodemailer, 'createTestAccount')
            .yields(null, mockTestAccountResponse);
    });

    afterEach(() => {
        createTransportStub.restore();
        createTestAccountStub.restore();
        mailer.clearMailTransporterCache();
    });

    describe('sendPasswordResetEmail()', () => {
        it('resolves with a payload with user and info properties', () => {
            const promise = sendPasswordResetEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(payload => {
                expect(payload).to.be.an('object');
                expect(payload).to.have.property('user');
                expect(payload).to.have.property('info');
                expect(createTransportStub.calledOnce).to.be.true;
            });
        });

        it('calls the nodemailer.createTransport() only once', () => {
            const promise = sendPasswordResetEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(() => {
                expect(createTransportStub.calledOnce).to.be.true;
            });
        });
    });

    describe('sendEmailVerificationEmail()', () => {
        it('resolves with a payload with user and info properties', () => {
            const promise = sendEmailVerificationEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(payload => {
                expect(payload).to.be.an('object');
                expect(payload).to.have.property('user');
                expect(payload).to.have.property('info');
                expect(createTransportStub.calledOnce).to.be.true;
            });
        });

        it('calls the nodemailer.createTransport() only once', () => {
            const promise = sendEmailVerificationEmail(mockUsers[0]);
            expect(promise).to.be.a('promise');
            promise.then(() => {
                expect(createTransportStub.calledOnce).to.be.true;
            });
        });
    });
});
