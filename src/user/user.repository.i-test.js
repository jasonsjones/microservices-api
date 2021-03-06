import fs from 'fs';
import { expect } from 'chai';

import Avatar from '../avatar/avatar.model';
import User from './user.model';
import * as Repository from './user.repository';
import { dbConnection, deleteCollection } from '../utils/dbTestUtils';

const users = [
    {
        name: {
            first: 'Barry',
            last: 'Allen'
        },
        email: 'barry@starlabs.com',
        password: '123456'
    },
    {
        name: {
            first: 'Oliver',
            last: 'Queen'
        },
        email: 'oliver@qc.com',
        password: '123456'
    }
];

const expectUserShape = res => {
    expect(res).to.have.property('_id');
    expect(res).to.have.property('name');
    expect(res.name).to.have.property('first');
    expect(res.name).to.have.property('last');
    expect(res).to.have.property('email');
    expect(res).to.have.property('isEmailVerified');
    expect(res).to.have.property('emailVerificationToken');
    expect(res).to.have.property('password');
    expect(res).to.have.property('roles');
    expect(res).to.have.property('avatarUrl');
    expect(res).to.have.property('createdAt');
    expect(res).to.have.property('updatedAt');
};

describe('User repository integration tests', () => {
    context('createUser()', () => {
        after(async () => await deleteCollection(dbConnection, User, 'users'));

        it('saves a new user to the db', () => {
            const newUser = users[0];

            return Repository.createUser(newUser).then(response => {
                expectUserShape(response);
                // ensure the password is hashed
                expect(response.password).to.not.equal(newUser.password);
            });
        });

        it('returns an error if the user data is not provided', () => {
            return Repository.createUser().catch(error => {
                expect(error).to.exist;
                expect(error.message).to.contain('user data is required');
            });
        });
    });

    context('uploadUserAvatar()', () => {
        const assetPath = `${__dirname}/../../assets`;
        const avatarFile = `${assetPath}/male3.png`;
        const avatar = {
            originalName: 'male3.png',
            mimetype: 'image/png',
            size: fs.statSync(avatarFile).size,
            path: avatarFile
        };

        let userId;
        before(() => {
            return Repository.createUser(users[1]).then(response => {
                userId = response._id;
            });
        });

        after(async () => {
            await deleteCollection(dbConnection, User, 'users');
            await deleteCollection(dbConnection, Avatar, 'avatars');
        });

        it('uploads a custom avatar and associates with the user', () => {
            return Repository.uploadUserAvatar(userId, avatar, false).then(response => {
                expectUserShape(response);
                expect(response.avatarUrl).to.not.contain('default');
                expect(response.avatar).to.exist;
            });
        });

        it('returns an error if a user id is not provided', () => {
            return Repository.uploadUserAvatar(null, avatar, false).catch(error => {
                expect(error).to.exist;
                expect(error.message).to.contain('user id is required');
            });
        });

        it('returns an error if the avatar file is not provided', () => {
            return Repository.uploadUserAvatar(userId, null, false).catch(error => {
                expect(error).to.exist;
                expect(error.message).to.contain('avatar file is required');
            });
        });
    });

    context('user fetching and updating related tests', () => {
        let barryId, oliverId, barryHashedPwd;
        const assetPath = `${__dirname}/../../assets`;
        const avatarFile = `${assetPath}/male3.png`;
        const avatar = {
            originalName: 'male3.png',
            mimetype: 'image/png',
            size: fs.statSync(avatarFile).size,
            path: avatarFile
        };

        before(() => {
            return Repository.createUser(users[0])
                .then(user => {
                    barryId = user._id;
                    barryHashedPwd = user.password;
                    return Repository.createUser(users[1]);
                })
                .then(user => {
                    oliverId = user._id;
                    return Repository.uploadUserAvatar(user._id, avatar, false);
                });
        });

        after(async () => {
            await deleteCollection(dbConnection, User, 'users');
            await deleteCollection(dbConnection, Avatar, 'avatars');
        });

        context('getUsers()', () => {
            it('returns an array of all the users', () => {
                return Repository.getUsers().then(response => {
                    expect(response).to.be.an('array');
                    expect(response).to.have.lengthOf(2);
                    expectUserShape(response[0]);
                    expectUserShape(response[1]);
                });
            });

            it('returns an array of user based on the query condition', () => {
                return Repository.getUsers({ email: users[1].email }).then(response => {
                    expect(response).to.be.an('array');
                    expect(response).to.have.lengthOf(1);
                    expectUserShape(response[0]);
                    expect(response[0].email).to.equal(users[1].email);
                });
            });

            it('returns an array of users with the avatar model populated', () => {
                return Repository.getUsers({ email: users[1].email }, true).then(response => {
                    expect(response).to.be.an('array');
                    expect(response).to.have.lengthOf(1);
                    expectUserShape(response[0]);
                    expect(response[0].name.first).to.equal(users[1].name.first);
                    expect(response[0].email).to.equal(users[1].email);
                    expect(response[0].avatar).to.exist;
                    expect(response[0].avatar).to.be.an('object');
                    expect(response[0].avatar.defaultImg).to.be.false;
                });
            });
        });

        context('getUser()', () => {
            it('returns the user with the given id', () => {
                return Repository.getUser(barryId).then(response => {
                    expectUserShape(response);
                    expect(response.name.first).to.equal('Barry');
                });
            });

            it('returns the user with the given id and avatar populated if requested', () => {
                return Repository.getUser(oliverId, true).then(response => {
                    expectUserShape(response);
                    expect(response.name.first).to.equal('Oliver');
                    expect(response.avatar).to.be.an('object');
                    expect(response.avatar.defaultImg).to.be.false;
                });
            });

            it('returns an error if a user id is not provided', () => {
                return Repository.getUser().catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user id is required');
                });
            });
        });

        context('lookupUserByEmail()', () => {
            it('returns the user with the given email', () => {
                return Repository.lookupUserByEmail(users[0].email).then(response => {
                    expectUserShape(response);
                    expect(response.name.first).to.equal('Barry');
                });
            });

            it('returns null when user email is not found', () => {
                return Repository.lookupUserByEmail('notfound@email.com').then(response => {
                    expect(response).to.be.null;
                });
            });

            it('returns the user with the given email and avatar populated if requested', () => {
                return Repository.lookupUserByEmail(users[1].email, true).then(response => {
                    expectUserShape(response);
                    expect(response.name.first).to.equal('Oliver');
                    expect(response.avatar).to.be.an('object');
                    expect(response.avatar.defaultImg).to.be.false;
                });
            });

            it('returns an error if a user email is not provided', () => {
                return Repository.lookupUserByEmail().catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('email is required');
                });
            });
        });

        context('changePassword()', () => {
            it('returns the user after changing the password', () => {
                const userData = {
                    email: 'barry@starlabs.com',
                    currentPassword: users[0].password,
                    newPassword: 'test1234'
                };
                return Repository.changePassword(userData).then(response => {
                    expectUserShape(response);
                    expect(response.password).not.to.equal(barryHashedPwd);
                });
            });

            it('returns an error if the user authentication fails', () => {
                const userData = {
                    email: 'barry@starlabs.com',
                    currentPassword: 'wrongpassword',
                    newPassword: 'test1234'
                };
                return Repository.changePassword(userData).catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user unauthorized to change password');
                });
            });

            it('returns an error if a user data is not provided', () => {
                return Repository.changePassword().catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user data is required');
                });
            });

            it('returns an error if user email is not provided', () => {
                const userData = {
                    currentPassword: users[1].password,
                    newPassword: 'test1234'
                };
                return Repository.changePassword(userData).catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user email is required');
                });
            });

            it('returns an error if current password is not provided', () => {
                const userData = {
                    email: 'barry@starlabs.com',
                    newPassword: 'test1234'
                };

                return Repository.changePassword(userData).catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user current password is required');
                });
            });

            it('returns an error if new password is not provided', () => {
                const userData = {
                    email: 'barry@starlabs.com',
                    currentPassword: users[0].password
                };

                return Repository.changePassword(userData).catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user new password is required');
                });
            });
        });

        context('generateAndSetResetToken()', () => {
            it('returns an error if the users email is not provided', () => {
                return Repository.generateAndSetResetToken().catch(error => {
                    expect(error).to.exist;
                    expect(error).to.be.an('Error');
                });
            });

            it('returns null if the user is not found', () => {
                return Repository.generateAndSetResetToken('notfound@email.com').then(response => {
                    expect(response).to.be.null;
                });
            });

            it('updates the user model with the reset token added', () => {
                return Repository.generateAndSetResetToken(users[0].email).then(response => {
                    expect(response.passwordResetToken).to.exist;
                    expect(response.passwordResetToken).to.be.a('string');
                    expect(response.passwordResetToken.length).to.equal(40);
                });
            });

            it('updates the user model with the reset token expiration date set', () => {
                return Repository.generateAndSetResetToken(users[0].email).then(response => {
                    expect(response.passwordResetTokenExpiresAt).to.exist;
                    expect(response.passwordResetTokenExpiresAt).to.be.a('Date');
                });
            });
        });

        context('updateUser()', () => {
            it('returns the updated user with the given id', () => {
                const updatedData = {
                    name: {
                        first: 'The',
                        last: 'Flash'
                    },
                    email: 'flash@starlabs.com'
                };

                return Repository.updateUser(barryId, updatedData).then(response => {
                    expectUserShape(response);
                    expect(response.name.first).to.equal(updatedData.name.first);
                    expect(response.name.last).to.equal(updatedData.name.last);
                    expect(response.email).to.equal(updatedData.email);
                    expect(response.createdAt).not.to.equal(response.updatedAt);
                });
            });

            it('returns an error if a user id is not provided', () => {
                return Repository.updateUser().catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user id is required');
                });
            });

            it('returns an error if a user data is not provided', () => {
                return Repository.updateUser(barryId).catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('userData is required');
                });
            });
        });

        context('unlinkSFDCAccount', () => {
            it('returns an error if a user is not provided', () => {
                return Repository.unlinkSFDCAccount().catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('unable to unlink');
                });
            });

            it('returns an error if the user does not have a SFDC profile', () => {
                return Repository.getUser(barryId)
                    .then(user => Repository.unlinkSFDCAccount(user))
                    .catch(error => {
                        expect(error).to.exist;
                        expect(error.message).to.contain('unable to unlink');
                    });
            });
        });

        context('deleteUser()', () => {
            it('returns the deleted user with the given id', () => {
                return Repository.deleteUser(oliverId).then(response => {
                    expectUserShape(response);
                    expect(response.name.first).to.equal(users[1].name.first);
                    expect(response.name.last).to.equal(users[1].name.last);
                    expect(response.email).to.equal(users[1].email);
                });
            });

            it('returns an error if a user id is not provided', () => {
                return Repository.deleteUser().catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user id is required');
                });
            });
        });
    });
});
