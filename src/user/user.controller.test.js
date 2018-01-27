
import { expect } from 'chai';
import sinon from 'sinon';

import * as Repository from './user.repository';
import * as Controller from './user.controller';
import User from './user.model';

const mockUsers = [
    {
        _id: "59c44d83f2943200228467b3",
        updatedAt: "2017-11-21T16:24:16.413Z",
        createdAt: "2017-09-21T23:38:43.338Z",
        name: "Roy Harper",
        email: "roy@qc.com",
        avatar: null,
        password: "$2a$12$DyizVZatjn.zMHeOhQI5nuIX64417O2zuRKXe/Ae0f06bLupmZ/d6",
        avatarUrl: "http://localhost:3000/api/avatar/default",
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

describe('User controller', () => {
    describe('getUsers()', () => {
        let stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'getUsers');
        });

        afterEach(() => {
            stub.restore();
        });

        it('returns a promise that resolves to a payload with an array of the users', () => {
            stub.resolves(mockUsers);

            const promise = Controller.getUsers();
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('payload');
                expect(response.success).to.be.true
                expect(response.payload.users).to.be.an('Array');
            });
        });

        it('rejects with an error if something goes wrong getting the users', () => {
            stub.rejects(new Error('Oops, something went wrong when getting the user.'));

            const promise = Controller.getUsers();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });

    describe('getUser()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'getUser');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns a promise that resolves to the requested user', () => {
            stub.withArgs(mockUsers[1]._id).resolves(mockUsers[1]);
            req.params = {
                id: mockUsers[1]._id
            };
            const promise = Controller.getUser(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expectUserResponse(response);
            });
        });

        it('rejects with error if something goes wrong getting the user', () => {
            stub.rejects(new Error('Oops, something went wrong when getting the user.'));
            req.params = {
                id: mockUsers[0]._id
            };

            const promise = Controller.getUser(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.getUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });

    describe('updateUser()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'updateUser');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns a promise that resolves to the updated user', () => {
            req.params = {
                id: mockUsers[1]._id
            };
            req.body = {
                email: 'thearrow@qc.com',
                name: 'the arrow'
            };

            stub.resolves(new User(Object.assign({}, mockUsers[1], req.body)));
            // stub.resolves({...mockUsers[1], ...req.body});
            const promise = Controller.updateUser(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expectUserResponse(response);
            });
        });

        it('rejects with error if something goes wrong updating user', () => {
            stub.rejects(new Error('Oops, something went wrong updating the user.'));
            req.params = {
                id: mockUsers[0]._id
            };

            req.body = {
                email: 'thearrow@qc.com',
                name: 'the arrow'
            };

            const promise = Controller.updateUser(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.updateUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });

    describe('changePassword()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'changePassword');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.changePassword();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req.body is not provided', () => {
            const promise = Controller.changePassword(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req.body.email is not provided', () => {
            req.body = {
                currentPassword: 'password',
                newPassword: 'newPassword'
            };
            const promise = Controller.changePassword(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req.body.currentPassword is not provided', () => {
            req.body = {
                email: 'oliver@qc.com',
                newPassword: 'newPassword'
            };
            const promise = Controller.changePassword(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req.body.newPassword is not provided', () => {
            req.body = {
                email: 'oliver@qc.com',
                currentPassword: 'password'
            };
            const promise = Controller.changePassword(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if something goes wrong changing the password', () => {
            stub.rejects(new Error('Oops, something went wrong updating the user.'));
            req.body = {
                email: 'oliver@qc.com',
                currentPassword: 'password',
                newPassword: 'newPassword'
            };
            const promise = Controller.changePassword(req);
            expect(promise).to.be.a('Promise');
            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('returns a promise that resolves with a payload', () => {
            req.body = {
                email: 'oliver@qc.com',
                currentPassword: 'password',
                newPassword: 'newPassword'
            };
            stub.resolves(new User(mockUsers[1]));
            const promise = Controller.changePassword(req);
            expect(promise).to.be.a('Promise');
            return promise.then(response => {
                expect(response).to.be.an('object');
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.true;
            })
        });
    });

    describe('deleteUser()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'deleteUser');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns a promise that resolves to the deleted user', () => {
            req.params = {
                id: mockUsers[1]._id
            };
            stub.resolves(new User(mockUsers[1]));
            let userStub = sinon.stub(User.prototype, 'remove');
            userStub.resolves(new User(mockUsers[1]));

            const promise = Controller.deleteUser(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expectUserResponse(response);
                userStub.restore();
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.deleteUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if something goes wrong deleting user', () => {
            stub.rejects(new Error('Oops, something went wrong deleting the user.'));
            req.params = {
                id: mockUsers[0]._id
            };

            const promise = Controller.deleteUser(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.deleteUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });

    describe('uploadUserAvatar()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'uploadUserAvatar');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns a promise that resolves to the user with updated avatar', () => {
            req.file = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: 62079,
                path: __dirname + '/../../../assets/male3.png'
            };
            req.params = {
                userid: mockUsers[1]._id
            };
            stub.resolves(new User(mockUsers[1]));

            const promise = Controller.uploadUserAvatar(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expectUserResponse(response);
            });
        });

        it('rejects with error if something goes wrong uploading the avatar', () => {
            req.file = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: 62079,
                path: __dirname + '/../../../assets/male3.png'
            };
            req.params = {
                userid: mockUsers[1]._id
            };
            stub.rejects(new Error('Oops, something went wrong uploading the avatar'));

            const promise = Controller.uploadUserAvatar(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.uploadUserAvatar();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });

    describe('signUpUser()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'signUpUser');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns a promise that resolves to some user data after signup', () => {
            req.body = {
                name: 'Roy Harper',
                email: 'roy@qc.com',
                password: 'arsenal'
            };
            stub.resolves(mockUsers[0]);
            const promise = Controller.signupUser(req);
            expect(promise).to.be.a('Promise');

            return promise.then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('payload');
                expect(response.success).to.be.true;
                expect(response.payload).to.be.an('object');
            });
        });

        it('rejects with error if something goes wrong signing up the user', () => {
            req.body = {
                name: 'Roy Harper',
                email: 'roy@qc.com',
                password: 'arsenal'
            };
            stub.rejects(new Error('Oops, something went wrong when signing up'));
            const promise = Controller.signupUser(req);
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.signupUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });

    describe('unlinkSFDCAccount', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'unlinkSFDCAccount');
            req = {};
            req.user = mockUsers[2];
            req.user.sfdc = {
                id: '003D000004534cda',
                accessToken: 'thisisareallylongtokenreturnedfromsfdcserver',
                refreshToken: null,
                profile: {
                    'display_name': 'Jason Jones',
                    'user_id': '003D000004534cda'
                }
            };
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });
        it('returns a promise that resolves to the unlinked user', () => {
            let expectedUser = new User(mockUsers[2]);
            expectedUser.sfdc = {
                id: '003D000004534cda',
                accessToken: null,
                refreshToken: null,
                profile: {}
            };
            stub.resolves(expectedUser);

            const promise = Controller.unlinkSFDCAccount(req);
            expect(promise).to.be.a('Promise');
            promise.then(response => {
                expectUserResponse(response);
            });
        });

        it('rejects with error if something goes wrong saving the unlinked user', () => {
            stub.rejects(new Error('Ooops, something went wrong saving the user'));

            const promise = Controller.unlinkSFDCAccount(req);
            expect(promise).to.be.a('Promise');
            promise.catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error if req parameter is not provided', () => {
            const promise = Controller.unlinkSFDCAccount();
            expect(promise).to.be.a('Promise');
            promise.catch(response => {
                expectErrorResponse(response);
            });
        });
    });
});

const expectErrorResponse = response => {
    expect(response).to.have.property('success');
    expect(response).to.have.property('message');
    expect(response).to.have.property('error');
    expect(response.success).to.be.false
    expect(response.error instanceof Error).to.be.true
};

const expectUserResponse = response => {
    expect(response).to.have.property('success');
    expect(response).to.have.property('payload');
    expect(response.success).to.be.true;
    expect(response.payload).to.have.property('user');
    expect(response.payload.user).to.be.an('object');
};
