import fs from 'fs';
import nodemailer from 'nodemailer';
import sinon from 'sinon';
import { expect } from 'chai';

import * as Controller from './user.controller';
import { createUserUtil } from '../utils/userTestUtils';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';
import { clearMailTransporterCache } from '../mailer/mailer';

const users = [
    {
        name: 'Barry Allen',
        email: 'barry@starlabs.com',
        password: '123456'
    },
    {
        name: 'Oliver Queen',
        email: 'oliver@qc.com',
        password: '123456'
    }
];

const getCopyOfAvatar = () => {
    const assetPath = `${__dirname}/../../assets`;
    const copyAvatarFilePath = `${assetPath}/duplicate_avatar.png`;
    const customAvatarFile = `${assetPath}/male3.png`;
    fs.copyFileSync(customAvatarFile, copyAvatarFilePath);

    const avatar = {
        originalName: 'duplicate_avatar.png',
        mimetype: 'image/png',
        size: fs.statSync(copyAvatarFilePath).size,
        path: copyAvatarFilePath
    };
    return avatar;
};

const expectUserShape = res => {
    expect(res).to.have.property('_id');
    expect(res).to.have.property('name');
    expect(res).to.have.property('email');
    expect(res).to.have.property('password');
    expect(res).to.have.property('roles');
    expect(res).to.have.property('avatarUrl');
    expect(res).to.have.property('createdAt');
    expect(res).to.have.property('updatedAt');
};

const expectClientJSONUserShape = res => {
    expect(res).to.have.property('_id');
    expect(res).to.have.property('name');
    expect(res).to.have.property('email');
    expect(res).to.have.property('roles');
    expect(res).to.have.property('avatarUrl');
    expect(res).to.have.property('hasSFDCProfile');
};

const expectErrorResponse = (errorResponse, errMsg) => {
    expect(errorResponse).to.have.property('success');
    expect(errorResponse).to.have.property('message');
    expect(errorResponse).to.have.property('error');
    expect(errorResponse.success).to.be.false;
    expect(errorResponse.message).to.contain(errMsg);
    expect(errorResponse.error instanceof Error).to.be.true;
};

describe('User controller integration tests', () => {
    before(() => {
        dropCollection(dbConnection, 'users');
        dropCollection(dbConnection, 'avatars');
    });

    context('createUser()', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns error payload if the user data is not provided', () => {
            return Controller.createUser().catch(error => {
                expectErrorResponse(error, 'unable to create new user; user data is required');
            });
        });

        it('resolves with user data and token for newly created user', () => {
            let req = {
                body: users[0]
            };
            return Controller.createUser(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.true;
                expect(response.payload).to.have.property('token');
                expectClientJSONUserShape(response.payload.user);
            });
        });
    });

    context('getUsers()', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns all the users', () => {
            return createUserUtil(users[0])
                .then(() => createUserUtil(users[1]))
                .then(() => Controller.getUsers())
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                    expect(response.payload.users).to.be.an('array');
                    expectUserShape(response.payload.users[0]);
                    expectUserShape(response.payload.users[1]);
                });
        });
    });

    context('getUser()', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns a payload with the user with the given id', () => {
            return createUserUtil(users[1])
                .then(user => Controller.getUser({ params: { id: user._id } }))
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                });
        });

        it('returns a payload with the user and includes the avatar model', () => {
            const avatar = getCopyOfAvatar();
            return createUserUtil(users[1])
                .then(user =>
                    Controller.uploadUserAvatar({ params: { id: user._id }, file: avatar })
                )
                .then(response =>
                    Controller.getUser({
                        params: { id: response.payload.user._id },
                        query: { includeAvatar: 'true' }
                    })
                )
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                    expect(response.payload.user.avatar).to.exist;
                    expect(response.payload.user.avatar).to.be.an('object');
                    expect(response.payload.user.avatar).to.have.property('_id');
                    expect(response.payload.user.avatar).to.have.property('contentType');
                    expect(response.payload.user.avatar).to.have.property('defaultImg');
                });
        });
    });

    context('unlinkSFDCAccount()', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns an error if the user does not have a linked SFDC profile', () => {
            return createUserUtil(users[1])
                .then(user => Controller.getUser({ params: { id: user._id } }))
                .then(response => Controller.unlinkSFDCAccount({ user: response.payload.user }))
                .then(response => expectErrorResponse(response, 'error unlinking the user'));
        });
    });

    context('updateUser()', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('updates the user with the provided data', () => {
            return createUserUtil(users[1])
                .then(user =>
                    Controller.updateUser({
                        params: { id: user._id },
                        body: {
                            name: 'The Flash',
                            email: 'flash@starlabs.com'
                        }
                    })
                )
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                    expectClientJSONUserShape(response.payload.user);
                    expect(response.payload.user.name).to.not.equal(users[0].name);
                    expect(response.payload.user.email).to.not.equal(users[0].email);
                });
        });
    });

    context('deleteUser()', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns the a payload with the user that was just deleted', () => {
            return createUserUtil(users[1])
                .then(user => Controller.deleteUser({ params: { id: user._id } }))
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                    expectUserShape(response.payload.user);
                });
        });
    });

    context('uploadUserAvatar()', () => {
        let barryId;
        before(() => {
            return createUserUtil(users[0]).then(user => {
                barryId = user._id;
            });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('returns error payload if the request is not provided', () => {
            return Controller.uploadUserAvatar().catch(error => {
                expectErrorResponse(error, 'request parameter is required');
            });
        });

        it('returns error payload if the avatar is not provided', () => {
            let req = {
                params: {
                    id: barryId
                }
            };
            return Controller.uploadUserAvatar(req).catch(error => {
                expectErrorResponse(error, 'avatar file is required');
            });
        });

        it('returns error payload if the user id is not provided', () => {
            const avatar = getCopyOfAvatar();

            let req = {
                file: avatar
            };
            return Controller.uploadUserAvatar(req).catch(error => {
                expectErrorResponse(error, 'user id is required');
            });
        });

        it('uploads a custom user avatar', () => {
            const avatar = getCopyOfAvatar();

            let req = {
                file: avatar,
                params: {
                    id: barryId
                }
            };
            return Controller.uploadUserAvatar(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.true;
                expectClientJSONUserShape(response.payload.user);
                expect(response.payload.user.avatarUrl).not.to.contain('default');
            });
        });
    });

    context('changePassword()', () => {
        let barryId;
        before(() => {
            return createUserUtil(users[0]).then(user => {
                barryId = user._id;
                return createUserUtil(users[1]);
            });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it("changes the user's password", () => {
            const req = {
                params: {
                    id: barryId
                },
                body: {
                    email: 'barry@starlabs.com',
                    currentPassword: '123456',
                    newPassword: 'password'
                }
            };

            return Controller.changePassword(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.true;
            });
        });

        it('returns an error if the request parameter is not provided', () => {
            return Controller.changePassword().catch(error => {
                expectErrorResponse(error, 'request parameter is required');
            });
        });

        it('returns an error if the required user data is not provided', () => {
            const req = {
                params: {
                    id: barryId
                }
            };
            return Controller.changePassword(req).catch(error => {
                expectErrorResponse(error, 'request body is required');
            });
        });
    });

    context('forgotPassword()', () => {
        before(() => {
            clearMailTransporterCache();
        });

        afterEach(() => {
            clearMailTransporterCache();
        });

        it('returns an error if the request parameter is not provided', () => {
            return Controller.forgotPassword().catch(error => {
                expectErrorResponse(error, 'request parameter is required');
            });
        });

        it('returns an error if the required user data is not provided', () => {
            const req = {};
            return Controller.forgotPassword(req).catch(error => {
                expectErrorResponse(error, 'user email is required');
            });
        });

        it('resolves with object with success (false) and message properity if user is not found', () => {
            const req = {
                body: {
                    email: 'notfound@email.com'
                }
            };
            return Controller.forgotPassword(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response.success).to.be.false;
            });
        });

        it('sends an email to the user with a link to reset password', () => {
            let mockTransporter = {
                sendMail: (data, cb) => {
                    cb(null, {
                        messageId: '<1b519020-5bfe-4078-cd5e-7351a09bd766@sandboxapi.com>'
                    });
                }
            };

            let mailerStub = sinon.stub(nodemailer, 'createTransport').returns(mockTransporter);
            const req = {
                body: {
                    email: 'oliver@qc.com'
                }
            };
            return createUserUtil(users[1]).then(() => {
                return Controller.forgotPassword(req).then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.payload).to.have.property('email');
                    expect(response.payload).to.have.property('info');
                    expect(response.success).to.be.true;
                    mailerStub.restore();
                });
            });
        });
    });
});
