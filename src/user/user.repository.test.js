import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';

import User from './user.model';
import Avatar from '../avatar/avatar.model';
import * as Repository from './user.repository';
import { mockUsers, mockUsersWithAvatar } from '../utils/userTestUtils';

describe('User repository', () => {
    let UserMock;
    beforeEach(() => {
        UserMock = sinon.mock(User);
    });

    afterEach(() => {
        UserMock.restore();
    });

    describe('getUsers()', () => {
        it('resolves to an array of users', () => {
            UserMock.expects('find')
                .withArgs({})
                .chain('exec')
                .resolves(mockUsers);

            const promise = Repository.getUsers();
            expect(promise).to.be.a('Promise');

            return promise.then(users => {
                expect(users).to.be.an('array');
                expect(users.length).to.equal(mockUsers.length);
                expect(users[0].avatar).to.be.a('String');
            });
        });

        it('resolves to an array of users with avatars populated', () => {
            UserMock.expects('find')
                .withArgs({})
                .chain('populate')
                .withArgs('avatar', '-data')
                .chain('exec')
                .resolves(mockUsersWithAvatar);

            const promise = Repository.getUsers({}, true);
            expect(promise).to.be.a('Promise');

            return promise.then(users => {
                expect(users).to.be.an('array');
                expect(users.length).to.equal(mockUsersWithAvatar.length);
                expect(users[0].avatar).to.be.an('Object');
            });
        });

        it('resolves to an array of QC users', () => {
            const qcRegex = new RegExp('@qc.com', 'i');
            UserMock.expects('find')
                .withArgs({ email: qcRegex })
                .chain('exec')
                .resolves([mockUsers[0], mockUsers[1]]);

            const promise = Repository.getUsers({ email: qcRegex });
            expect(promise).to.be.a('Promise');

            return promise.then(users => {
                expect(users).to.be.an('array');
                expect(users.length).to.equal(2);
            });
        });

        it('rejects with error if something went wrong', () => {
            UserMock.expects('find')
                .withArgs({})
                .chain('exec')
                .rejects(new Error('Oops, something went wrong...'));

            const promise = Repository.getUsers();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('getUser()', () => {
        it('resolves to a user with the given id', () => {
            const userId = mockUsers[0]._id;
            UserMock.expects('findById')
                .withArgs(userId)
                .chain('exec')
                .resolves(mockUsers[0]);

            const promise = Repository.getUser(userId);
            expect(promise).to.be.a('Promise');

            return promise.then(user => {
                expectUserProperties(user);
            });
        });

        it('resolves to a user with the avatar model included', () => {
            const userId = mockUsersWithAvatar[0]._id;
            UserMock.expects('findById')
                .withArgs(userId)
                .chain('exec')
                .resolves(mockUsersWithAvatar[0]);

            const promise = Repository.getUser(userId, true);
            expect(promise).to.be.a('Promise');

            return promise.then(user => {
                expectUserToHaveAvatar(user);
            });
        });

        it('rejects with error if something went wrong', () => {
            const userId = mockUsers[0]._id;
            UserMock.expects('findById')
                .withArgs(userId)
                .chain('exec')
                .rejects(new Error('Oops, something went wrong...'));

            const promise = Repository.getUser(userId);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the id param is not provided', () => {
            const promise = Repository.getUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('lookupUserByEmail()', () => {
        it('resolves to a user with the given email', () => {
            const email = mockUsers[0].email;
            UserMock.expects('findOne')
                .withArgs({ email: email })
                .chain('exec')
                .resolves(mockUsers[0]);

            const promise = Repository.lookupUserByEmail(email);
            expect(promise).to.be.a('Promise');

            return promise.then(user => {
                expectUserProperties(user);
            });
        });

        it('resolves to a user with the avatar model included', () => {
            const email = mockUsersWithAvatar[0].email;
            UserMock.expects('findOne')
                .withArgs({ email: email })
                .chain('exec')
                .resolves(mockUsersWithAvatar[0]);

            const promise = Repository.lookupUserByEmail(email, true);
            expect(promise).to.be.a('Promise');

            return promise.then(user => {
                expectUserToHaveAvatar(user);
            });
        });

        it('resolves to null if the user is not found', () => {
            const email = 'notfound@email.com';
            UserMock.expects('findOne')
                .withArgs({ email })
                .chain('exec')
                .resolves(null);

            const promise = Repository.lookupUserByEmail(email);
            expect(promise).to.be.a('Promise');

            return promise.then(user => {
                expect(user).to.be.null;
            });
        });

        it('rejects with error if something went wrong', () => {
            const email = mockUsers[0].email;
            UserMock.expects('findOne')
                .withArgs({ email: email })
                .chain('exec')
                .rejects(new Error('Oops, something went wrong...'));

            const promise = Repository.lookupUserByEmail(email);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the email param is not provided', () => {
            const promise = Repository.lookupUserByEmail();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('deleteUser()', () => {
        it('resovles to the deleted user when successful', () => {
            UserMock.expects('findByIdAndRemove')
                .withArgs(mockUsers[1]._id)
                .chain('exec')
                .resolves(mockUsers[1]);

            const promise = Repository.deleteUser(mockUsers[1]._id);
            expect(promise).to.be.a('Promise');
            return promise.then(user => {
                expectUserProperties(user);
            });
        });

        it('rejects with error if something goes wrong', () => {
            UserMock.expects('findByIdAndRemove')
                .withArgs(mockUsers[1]._id)
                .chain('exec')
                .rejects(new Error('Oops, something went wrong deleting the user'));

            const promise = Repository.deleteUser(mockUsers[1]._id);
            expect(promise).to.be.a('Promise');
            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the id param is not provided', () => {
            const promise = Repository.deleteUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('createUser()', () => {
        let newUser;
        beforeEach(() => {
            newUser = {
                name: 'Roy Harper',
                email: 'roy@qc.com',
                password: 'arsenal',
                roles: ['user']
            };
        });

        afterEach(() => {
            newUser = null;
        });

        it('resolves with user.save()', () => {
            const stub = sinon.stub(User.prototype, 'save');
            stub.resolves(mockUsers[0]);

            const promise = Repository.createUser(newUser);
            expect(promise).to.be.an('Promise');

            promise.then(user => {
                expectUserProperties(user);
                stub.restore();
            });
        });

        it('rejects with error if something goes wrong', () => {
            const stub = sinon.stub(User.prototype, 'save');
            stub.rejects(new Error('Ooops, something went wrong when saving the user'));

            const promise = Repository.createUser(newUser);
            expect(promise).to.be.an('Promise');

            promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
                stub.restore();
            });
        });

        it('rejects with error if the user data is not provided', () => {
            const promise = Repository.createUser();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('updateUser()', () => {
        it('resolves with user.save()', () => {
            const updatedData = {
                name: 'Roy (red hood) Harper',
                email: 'arsenal@qc.com'
            };
            const stub = sinon.stub(User.prototype, 'save');
            stub.resolves(new User(Object.assign(mockUsers[0], updatedData)));
            UserMock.expects('findById')
                .withArgs(mockUsers[0]._id)
                .chain('exec')
                .resolves(stub());
            const promise = Repository.updateUser(mockUsers[0]._id, updatedData);
            expect(promise).to.be.a('Promise');
            return promise.then(user => {
                expectUserProperties(user);
                expect(user.name).to.equal(updatedData.name);
                expect(user.email).to.equal(updatedData.email);
                stub.restore();
            });
        });

        it('rejects with error if something goes wrong', () => {
            const updatedData = {
                name: 'Roy (red hood) Harper',
                email: 'arsenal@qc.com'
            };
            UserMock.expects('findById')
                .withArgs(mockUsers[0]._id)
                .chain('exec')
                .rejects(new Error('Oops...something went wrong finding the user to update'));
            const promise = Repository.updateUser(mockUsers[0]._id, updatedData);
            expect(promise).to.be.a('Promise');
            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the id param is not provided', () => {
            const updatedData = {
                name: 'Roy (red hood) Harper',
                email: 'arsenal@qc.com'
            };
            const promise = Repository.updateUser(null, updatedData);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the updated user data is not provided', () => {
            const promise = Repository.updateUser(mockUsers[0]._id);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('uploadUserAvatar()', () => {
        let userId, file, avatarStub, userStub;
        beforeEach(() => {
            userId = mockUsers[1]._id;
            file = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: 62079,
                path: __dirname + '/../../assets/male3.png'
            };
            avatarStub = sinon.stub(Avatar.prototype, 'save');
            userStub = sinon.stub(User.prototype, 'save');
        });

        afterEach(() => {
            userId = null;
            file = {};
            avatarStub.restore();
            userStub.restore();
        });

        it('resolves with user.save()', () => {
            avatarStub.resolves(new Avatar(mockUsersWithAvatar[1].avatar));
            userStub.resolves(new User(mockUsers[1]));

            UserMock.expects('findById')
                .withArgs(userId)
                .chain('exec')
                .resolves(new User(mockUsers[1]));

            const promise = Repository.uploadUserAvatar(userId, file, false);
            expect(promise).to.be.a('Promise');

            promise.then(user => {
                expectUserProperties(user);
            });
        });

        it('rejects with error if something goes wrong saving the avatar', () => {
            avatarStub.rejects(new Error('Oops, problem saving the avatar...'));
            userStub.resolves(new User(mockUsers[1]));

            UserMock.expects('findById')
                .withArgs(userId)
                .chain('exec')
                .resolves(new User(mockUsers[1]));

            const promise = Repository.uploadUserAvatar(userId, file, false);
            expect(promise).to.be.a('Promise');

            promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if something goes wrong saving the user', () => {
            avatarStub.resolves(new Avatar(mockUsersWithAvatar[1].avatar));
            userStub.rejects(new Error('Oops, something went wropng saving the user'));

            UserMock.expects('findById')
                .withArgs(userId)
                .chain('exec')
                .resolves(new User(mockUsers[1]));

            const promise = Repository.uploadUserAvatar(userId, file, false);
            expect(promise).to.be.a('Promise');

            promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the id param is not provided', () => {
            const promise = Repository.uploadUserAvatar(null, file);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the avatar file is not provided', () => {
            const promise = Repository.uploadUserAvatar(mockUsers[0]._id);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });

    describe('unlinkSFDCAccount()', () => {
        it('resovles to the user with an unlinked sfdc account', () => {
            let rawUserData = Object.assign({}, mockUsers[2]);
            rawUserData.sfdc = {
                id: '003D000004534cda',
                accessToken: 'thisisareallylongtokenreturnedfromsfdcserver',
                refreshToken: null,
                profile: {
                    display_name: 'Jason Jones',
                    user_id: '003D000004534cda'
                }
            };
            let user = new User(rawUserData);
            const stub = sinon.stub(User.prototype, 'save');
            stub.resolves(user);

            const promise = Repository.unlinkSFDCAccount(user);
            expect(promise).to.be.a('Promise');

            promise.then(user => {
                expectUserProperties(user);
                expect(user.sfdc.id).to.equal(rawUserData.sfdc.id);
                expect(user.sfdc.accessToken).to.equal(null);
                expect(user.sfdc.refreshToken).to.equal(null);
                expect(user.sfdc.profile).to.be.empty;
                stub.restore();
            });
        });

        it('rejects with error if the user is not provided', () => {
            const promise = Repository.unlinkSFDCAccount();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if the user does not have existing sfdc profile', () => {
            let rawUserData = Object.assign({}, mockUsers[0]);
            rawUserData.sfdc = null;
            let user = new User(rawUserData);
            const promise = Repository.unlinkSFDCAccount(user);
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with error if something goes wrong saving the user', () => {
            const stub = sinon.stub(User.prototype, 'save');
            stub.rejects(new Error('Ooops, something went wrong when saving the user'));

            let rawUserData = mockUsers[2];
            rawUserData.sfdc = {
                id: '003D000004534cda',
                accessToken: 'thisisareallylongtokenreturnedfromsfdcserver',
                refreshToken: null,
                profile: {
                    display_name: 'Jason Jones',
                    user_id: '003D000004534cda'
                }
            };

            let user = new User(rawUserData);
            const promise = Repository.unlinkSFDCAccount(user);
            expect(promise).to.be.an('Promise');

            promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
                stub.restore();
            });
        });
    });

    describe('changePassword()', () => {
        it('rejects with Error if the user payload is not provided', () => {
            const promise = Repository.changePassword();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with Error if the user email is not provided', () => {
            const promise = Repository.changePassword({
                currentPassword: 'password',
                newPassword: 'newPassword'
            });
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with Error if the current password is not provided', () => {
            const promise = Repository.changePassword({
                email: 'oliver@qc.com',
                newPassword: 'newPassword'
            });
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with Error if the new password is not provided', () => {
            const promise = Repository.changePassword({
                email: 'oliver@qc.com',
                currentPassword: 'password'
            });
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('rejects with Error if the current password is not correct', () => {
            let userData = {
                email: 'oliver@qc.com',
                currentPassword: 'isWrong',
                newPassword: 'doesnotmatter'
            };
            UserMock.expects('findOne')
                .withArgs({ email: userData.email })
                .chain('exec')
                .resolves(new User(mockUsers[1]));
            const userStub = sinon.stub(User.prototype, 'verifyPassword').returns(false);
            const promise = Repository.changePassword(userData);
            expect(promise).to.be.a('Promise');
            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
                userStub.restore();
            });
        });

        it('resolves with user after updating the users password', () => {
            let returnedUser = new User(mockUsers[1]);
            let userData = {
                email: 'oliver@qc.com',
                currentPassword: 'thearrow',
                newPassword: 'iamaqueen'
            };
            UserMock.expects('findOne')
                .withArgs({ email: userData.email })
                .chain('exec')
                .resolves(returnedUser);
            const userStub = sinon.stub(User.prototype, 'verifyPassword').returns(true);
            const userSaveStub = sinon.stub(User.prototype, 'save').resolves(returnedUser);
            const promise = Repository.changePassword(userData);
            expect(promise).to.be.a('Promise');
            return promise.then(user => {
                expectUserProperties(user);
                expect(user.password).to.equal(userData.newPassword);
                userStub.restore();
                userSaveStub.restore();
            });
        });
    });

    describe('getRandomUser()', () => {
        it('returns a promise', () => {
            expect(Repository.getRandomUser()).to.be.a('Promise');
        });

        it('returns a promise that resolves to a random user with raw data when sendRawData is true', () => {
            let promise = Repository.getRandomUser(true);
            return promise.then(response => {
                expect(response).to.be.an('object');
                expect(response).to.have.property('name');
                expect(response).to.have.property('email');
                expect(response).to.have.property('location');
                expect(response).to.have.property('login');
                expect(response).to.have.property('picture');
            });
        });

        it('returns a promise that resolves to a random user with normalized data when sendRawData is false (default)', () => {
            let promise = Repository.getRandomUser(false);
            return promise.then(response => {
                expectUserProperties(response);
            });
        });
    });

    describe('generateAndSetResetToken()', () => {
        it('rejects with error if the email param is not provided', () => {
            const promise = Repository.generateAndSetResetToken();
            expect(promise).to.be.a('Promise');

            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });

        it('resolves to null if user is not found', () => {
            let user = new User(mockUsers[0]);
            UserMock.expects('findOne')
                .withArgs({ email: user.email })
                .chain('exec')
                .resolves(null);

            const promise = Repository.generateAndSetResetToken(user.email);
            expect(promise).to.be.an('Promise');

            return promise.then(response => {
                expect(response).to.be.null;
            });
        });

        it('updates user with password reset token and expiration date', () => {
            let user = new User(mockUsers[0]);
            const stub = sinon.stub(User.prototype, 'save');
            stub.resolves(user);

            UserMock.expects('findOne')
                .withArgs({ email: user.email })
                .chain('exec')
                .resolves(user);

            const promise = Repository.generateAndSetResetToken(user.email);
            expect(promise).to.be.an('Promise');

            promise.then(user => {
                expect(user).to.have.property('passwordResetToken');
                expect(user.passwordResetToken).to.be.a('string');
                stub.restore();
            });
        });

        it('updates user with password reset expiration date', () => {
            let user = new User(mockUsers[0]);
            const stub = sinon.stub(User.prototype, 'save');
            stub.resolves(user);

            UserMock.expects('findOne')
                .withArgs({ email: user.email })
                .chain('exec')
                .resolves(user);

            const promise = Repository.generateAndSetResetToken(user.email);
            expect(promise).to.be.an('Promise');

            promise.then(user => {
                expect(user).to.have.property('passwordResetTokenExpiresAt');
                expect(user.passwordResetTokenExpiresAt).to.be.a('Date');
                stub.restore();
            });
        });
    });
});

const expectUserProperties = user => {
    expect(user).to.be.an('Object');
    expect(user).to.have.property('name');
    expect(user).to.have.property('email');
    expect(user).to.have.property('avatarUrl');
    expect(user).to.have.property('roles');
    expect(user).to.have.property('avatar');
};

const expectUserToHaveAvatar = user => {
    expectUserProperties(user);
    expect(user.avatar).to.be.an('Object');
    expect(user.avatar).to.have.property('user');
    expect(user.avatar).to.have.property('fileSize');
    expect(user.avatar).to.have.property('contentType');
};
