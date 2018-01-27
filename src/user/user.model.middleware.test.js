import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';
import bcrypt from 'bcrypt-nodejs';

import User from './user.model';
import Avatar from '../avatar/avatar.model';
import * as Middleware from './user.model.middleware';

const mockUsers = [
    {
      "_id": "59c44d83f2943200228467b2",
      "name": "John Diggle",
      "email": "dig@qc.com",
      "avatar": "59c44d9d0e584d00425c1722",
      "avatarUrl": "http://localhost:3000/api/avatar/59c44d9d0e584d00425c1722"
    },
    {
      "_id": "59c44d83f2943200228467b3",
      "name": "Roy Harper",
      "email": "roy@qc.com",
      "avatar": null,
      "avatarUrl": "http://localhost:3000/api/avatar/default"
    },
    {
      "_id": "59c44d83f2943200228467b1",
      "name": "Oliver Queen",
      "email": "oliver@qc.com",
      "avatar": "59c44d85f2943200228467b4",
      "avatarUrl": "http://localhost:3000/api/avatar/59c44d85f2943200228467b4"
    },
    {
      "_id": "59c6c317f9760b01a35c63b1",
      "name": "Jason Jones",
      "email": "jsjones96@gmail.com",
      "avatar": "59e4062a4c3bc800574e895f",
      "avatarUrl": "http://localhost:3000/api/avatar/59e4062a4c3bc800574e895f"
    }
];

const mockAvatars = [
    {
      "_id": "59c44d83f2943200228467b0",
      "defaultImg": true,
      "fileSize": 5012,
      "contentType": "image/png",
      "user": null
    },
    {
      "_id": "59c44d85f2943200228467b4",
      "defaultImg": false,
      "fileSize": 62079,
      "contentType": "image/png",
      "user": "59c44d83f2943200228467b1",
    },
    {
      "_id": "59c44d9d0e584d00425c1722",
      "defaultImg": false,
      "fileSize": 71955,
      "contentType": "image/png",
      "user": "59c44d83f2943200228467b2",
    },
    {
      "_id": "59e4062a4c3bc800574e895f",
      "defaultImg": false,
      "fileSize": 117632,
      "contentType": "image/png",
      "user": "59c6c317f9760b01a35c63b1",
    }
]

describe("User model middleware", () => {
    describe('checkForErrors()', () => {
        let user;
        beforeEach(() => {
            user = new User({
                name: 'Oliver Queen',
                email: 'oliver@qc.com',
                password: 'arrow',
                roles: ['user']
            });
        });

        it('throws error if there are duplicate keys', (done) => {
            const expectedErrorMsg = 'There was a duplicate key error';
            const error = {
                name: 'MongoError',
                code: 11000
            };
            Middleware.checkForErrors(error, user, (err) => {
                expect(err).to.exist;
                expect(err.message).to.equal(expectedErrorMsg);
                done();
            });
        });

        it('propagates any other errors', (done) => {
            const error = new Error('Something when wrong...');
            Middleware.checkForErrors(error, user, (err) => {
                expect(err).to.exist;
                expect(err).to.equal(error);
                done();
            });

        });
    });

    describe('hashPassword()', () => {
        const ORIG_PWD = 'arrow';
        let user;
        beforeEach(() => {
            user = new User({
                name: 'Oliver Queen',
                email: 'oliver@qc.com',
                password: ORIG_PWD,
            });
        });

        afterEach(() => {
            user = null;
        });

        it('hashes the password to save in db', (done) => {
            // need to bind the middleware function to the user to ensure the
            // proper 'this' context from within the function
            Middleware.hashPassword.bind(user, function (err, hashedUser) {
                expect(hashedUser.password).to.not.equal(ORIG_PWD);
                expect(hashedUser.password.startsWith('$2a$')).to.be.true;
                done();
            })();
        });

        it('does not hash the password if it has not changed', (done) => {
            user.isModified = () => false;

            // need to bind the middleware function to the user to ensure the
            // proper 'this' context from within the function
            Middleware.hashPassword.bind(user, function (err, hashedUser) {
                expect(err).to.not.exist;
                expect(hashedUser).to.not.exist;
                done();
            })();
        });

        it('invokes the callback with an error if there was a problem with bcrypt salt', (done) => {
            user.isModified = () => true;

            const bcryptStub = sinon.stub(bcrypt, 'genSalt');
            bcryptStub.yields(new Error('Oops, something went wrong with the salt...'));

            // need to bind the middleware function to the user to ensure the
            // proper 'this' context from within the function
            Middleware.hashPassword.bind(user, function (err, hashedUser) {
                expect(err).to.exist;
                expect(hashedUser).to.not.exist;
                bcryptStub.restore();
                done();
            })();
        });

        it('invokes the callback with an error if there was a problem with bcrypt hash', (done) => {
            user.isModified = () => true;

            const bcryptStub = sinon.stub(bcrypt, 'hash');
            bcryptStub.yields(new Error('Oops, something went wrong with the hash...'));

            // need to bind the middleware function to the user to ensure the
            // proper 'this' context from within the function
            Middleware.hashPassword.bind(user, function (err, hashedUser) {
                expect(err).to.exist;
                expect(hashedUser).to.not.exist;
                bcryptStub.restore();
                done();
            })();
        });
    });

    describe('removeAvatarOnDelete()', () => {
        let AvatarMock;

        beforeEach(() => {
            AvatarMock = sinon.mock(Avatar);
        });

        afterEach(() => {
            AvatarMock.restore();
        });

        it('removes the users custom avatar when the user is deleted', () => {
            const stub = sinon.stub(Avatar.prototype, 'remove');
            stub.resolves(new Avatar(mockAvatars[1]));
            AvatarMock.expects('findOne').withArgs(mockUsers[2].avatar)
                .chain('exec')
                .resolves(new Avatar(mockAvatars[1]));
            const promise = Middleware.removeAvatarOnDelete(mockUsers[2]);
            expect(promise).to.be.a('Promise');
            return promise.then(data => {
                expect(data).to.exist;
                expect(data).to.have.property('defaultImg');
                expect(data).to.have.property('contentType');
                expect(data).to.have.property('fileSize');
                stub.restore();
            });
        });

        it('rejects with an error if something goes wrong', () => {
            AvatarMock.expects('findOne').withArgs(mockUsers[2].avatar)
                .chain('exec')
                .rejects(new Error("Ooops...something went wrong!"));

            const promise = Middleware.removeAvatarOnDelete(mockUsers[2]);
            expect(promise).to.be.a('Promise');
            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });
});
