import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';
import jwt from 'jsonwebtoken';

import User from '../user/user.model';
import * as Controller from './auth.controller';

const mockUsers = [
    {
        _id: "59c44d83f2943200228467b3",
        updatedAt: "2017-11-21T16:24:16.413Z",
        createdAt: "2017-09-21T23:38:43.338Z",
        name: "Roy Harper",
        email: "roy@qc.com",
        password: "$2a$12$DyizVZatjn.zMHeOhQI5nuIX64417O2zuRKXe/Ae0f06bLupmZ/d6",
        avatar:  "5a145330e6d09600aff70ef9",
        avatarUrl: "http://localhost:3000/api/avatar/5a145330e6d09600aff70ef9",
        roles: [
            "user"
        ]
    },
    {
        _id: "59c44d83f2943200228467b1",
        updatedAt: "2017-09-21T23:38:45.575Z",
        createdAt: "2017-09-21T23:38:43.337Z",
        name: "Oliver Queen",
        email: "oliver@qc.com",
        password: "$2a$12$wwUJRxZdDzpZ5uK2u.7eNelWp6y4HT/WE/zzZ6e2L4VVvv/tJE2dK",
        avatar: "59c44d85f2943200228467b4",
        avatarUrl: "http://localhost:3000/api/avatar/59c44d85f2943200228467b4",
        roles: [
            "admin",
            "user"
        ]
    },
    {
        _id: "59c6c317f9760b01a35c63b1",
        updatedAt: "2017-11-16T17:56:35.118Z",
        createdAt: "2017-09-23T20:24:55.748Z",
        name: "Jason Jones",
        email: "jsjones96@gmail.com",
        password: "$2a$12$5GCSOcQgHZ1tJHaMiOvvXOcFCoOoZCmjkQfD9hd/vIrF/dm0zrXa2",
        avatar: null,
        avatarUrl: "http://localhost:3000/api/avatar/default",
        roles: [
            "user"
        ]
    }
];

describe('Auth controller', () => {
    describe('verifyToken()', () => {
        it('returns a promise that resolves with the decoded token', () => {
            const expected = {
                sub: '59c44d83f2943200228467b1',
                email: 'oliver@qc.com',
                iat: '1513453484',
                exp: '1513453484'
            };
            const req = {
                query: {},
                body: {
                    token: 'thisisa.simulated.tokenvalue'
                },
                headers: {}
            };
            const jwtStub = sinon.stub(jwt, 'verify');
            jwtStub.returns(expected);

            const promise = Controller.verifyToken(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(req.decoded).to.exist;
                expect(response).to.be.an('object');
                expect(response).to.have.property('sub');
                expect(response).to.have.property('email');
                expect(response).to.have.property('iat');
                expect(response).to.have.property('exp');
                jwtStub.restore();
            })
        });

        it('rejects if no token is provided', () => {
            const req = {
                query: {},
                body: {},
                headers: {}
            };

            const promise = Controller.verifyToken(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expectError(err);
                expect(err.success).to.be.false;
            });
        });

        it('rejects with an error if there is something wrong with the token', () => {
            const req = {
                query: {},
                body: {
                    token: 'thisisa.simulated.tokenvalue'
                },
                headers: {}
            };
            const jwtStub = sinon.stub(jwt, 'verify');
            jwtStub.throws({name: 'JsonWebTokenError', message: 'jwt malformed'});

            const promise = Controller.verifyToken(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expectError(err);
                jwtStub.restore();
            });
        });
    });

    describe('adminRoute()', () => {
        let UserMock;
        beforeEach(() => {
            UserMock = sinon.mock(User);
        });

        afterEach(() => {
            UserMock.restore();
        });

        it('resolve to true if the user is an admin', () => {
            const req = {
                decoded: {
                    sub: '59c44d83f2943200228467b1',
                    email: 'oliver@qc.com',
                    iat: '1513453484',
                    exp: '1513453484'
                }
            };

            UserMock.expects('findById').withArgs(mockUsers[1]._id)
                .chain('exec')
                .resolves(new User(mockUsers[1]));

            const promise = Controller.adminRoute(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.true;
            });
        });

        it('resolve to false if the user is an admin', () => {
            const req = {
                decoded: {
                    sub: '59c44d83f2943200228467b3',
                    email: 'roy@qc.com',
                    iat: '1513453484',
                    exp: '1513453484'
                }
            };

            UserMock.expects('findById').withArgs(mockUsers[0]._id)
                .chain('exec')
                .resolves(new User(mockUsers[0]));

            const promise = Controller.adminRoute(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.false;
            });
        });

        it('rejects if something went wrong getting the user', () => {
            const req = {
                decoded: {
                    sub: '59c44d83f2943200228467b3',
                    email: 'roy@qc.com',
                    iat: '1513453484',
                    exp: '1513453484'
                }
            };

            UserMock.expects('findById').withArgs(mockUsers[0]._id)
                .chain('exec')
                .rejects(new Error('Oops, something went wrong getting the user'))

            const promise = Controller.adminRoute(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectError(response);
            });
        });

        it('rejects if the token had not be verified or decoded', () => {
            const req = {};

            UserMock.expects('findById').withArgs(mockUsers[0]._id)
                .chain('exec')
                .resolves(new User(mockUsers[0]));

            const promise = Controller.adminRoute(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectError(response);
            });
        });
    });

    describe('protectRouteByUser()', () => {
        it('resolve to true if the user action is for the user with the token', () => {
            const req = {
                decoded: {
                    sub: '59c44d83f2943200228467b3',
                    email: 'roy@qc.com',
                    iat: '1513453484',
                    exp: '1513453484'
                },
                params: {
                    userid: '59c44d83f2943200228467b3'
                }
            };

            const promise = Controller.protectRouteByUser(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(response).to.be.an('object');
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.true;
            });
        });

        it('resolve to false if the user action is NOT for the user with the token', () => {
            const req = {
                decoded: {
                    sub: '59c44d83f2943200228467b3',
                    email: 'roy@qc.com',
                    iat: '1513453484',
                    exp: '1513453484'
                },
                params: {
                    userid: '59c44d83f2943200228467b1'
                }
            };

            const promise = Controller.protectRouteByUser(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(response).to.be.an('object');
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.false;
            });
        });

        it('rejects if the token had not be verified or decoded', () => {
            const req = {};

            const promise = Controller.protectRouteByUser(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectError(response);
            });
        });
    });
});

const expectError = err => {
    expect(err).to.exist;
    expect(err).to.be.an('object');
    expect(err).to.have.property('success');
    expect(err).to.have.property('message');
    expect(err.success).to.be.false;
};
