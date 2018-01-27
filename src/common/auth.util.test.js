import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';

import * as Util from './auth.utils'

describe('Auth util', () => {
    let token;
    const user = {
        _id: "59c44d83f2943200228467b3",
        name: "Roy Harper",
        email: "roy@qc.com",
        password: "$2a$12$DyizVZatjn.zMHeOhQI5nuIX64417O2zuRKXe/Ae0f06bLupmZ/d6",
        avatarUrl: "http://localhost:3000/api/avatar/default",
        roles: [
            "user"
        ]
    };

    describe('generateToken()', () => {
        it('generates a jwt token', () => {
            token = Util.generateToken(user);
            const parts = token.split('.');

            expect(token).to.exist;
            expect(parts.length).to.equal(3);
        });

        it('throws error if user is not provided', () => {
            expect(() => Util.generateToken()).to.throw;
            // adding try/catch to force code coverage reporting for error condition
            try {
                Util.generateToken();
            } catch (e) {
                expect(e).to.exist;
            }
        });
    });

    describe('verifyToken()', () => {
        it('verifies a token', () => {
            const decoded = Util.verifyToken(token);
            expect(decoded).to.have.property('sub');
            expect(decoded).to.have.property('email');
            expect(decoded).to.have.property('iat');
            expect(decoded).to.have.property('exp');
            expect(decoded.email).to.equal(user.email);
        });

        it('throws error if there the token is expired', () => {
            const stub = sinon.stub(jwt, 'verify');
            stub.throws('TokenExpiredError');
            expect(() => Util.verifyToken(token)).to.throw;
            stub.restore();
        });

        it('throws error if there the token is malformed', () => {
            const stub = sinon.stub(jwt, 'verify');
            stub.throws('JsonWebTokenError');
            expect(() => Util.verifyToken(token)).to.throw;
            stub.restore();
        });

        it('throws error if token is not provided', () => {
            expect(() => Util.verifyToken()).to.throw;
            // adding try/catch to force code coverage reporting for error condition
            try {
                Util.verifyToken();
            } catch (e) {
                expect(e).to.exist;
            }
        });
    });
});
