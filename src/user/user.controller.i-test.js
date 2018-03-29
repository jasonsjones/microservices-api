import fs from 'fs';
import { expect } from 'chai';

import * as Controller from './user.controller';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

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
    expect(res).to.have.property('id');
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

    context('signUpUser()', () => {
        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns error payload if the user data is not provided', () => {
            return Controller.signupUser()
                .catch(error => {
                    expectErrorResponse(error, 'request parameter is required');
                });
        });

        it('creates a new user', () => {
            let req = {
                body: users[0]
            };
            return Controller.signupUser(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response.success).to.be.true;
                    expectUserShape(response.payload.user);
                });
        });
    });

    context('uploadUserAvatar()', () => {
        let barryId;
        before(() => {
            let req = {
                body: users[0]
            };
            return Controller.signupUser(req)
                .then(response => {
                    barryId = response.payload.user._id;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('returns error payload if the request is not provided', () => {
            return Controller.uploadUserAvatar()
                .catch(error => {
                    expectErrorResponse(error, 'request parameter is required');
                });
        });

        it('returns error payload if the request is not provided', () => {
            let req = {
                params: {
                    userid: barryId
                }
            };
            return Controller.uploadUserAvatar(req)
                .catch(error => {
                    expectErrorResponse(error, 'avatar file is required');
                });
        });

        it('returns error payload if the request is not provided', () => {
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
            let req = {
                file: avatar
            };
            return Controller.uploadUserAvatar(req)
                .catch(error => {
                    expectErrorResponse(error, 'user id is required');
                });
        });

        it('uploads a custom user avatar', () => {
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
            let req = {
                file: avatar,
                params: {
                    userid: barryId
                }
            };
            return Controller.uploadUserAvatar(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response.success).to.be.true;
                    expectClientJSONUserShape(response.payload.user);
                    expect(response.payload.user.avatarUrl).not.to.contain('default');
                });
        });
    });

    context('getUsers()', () => {
        before(() => {
            return Controller.signupUser({body: users[0]})
                .then(() => Controller.signupUser({body: users[1]}));
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns all the users', () => {
            return Controller.getUsers()
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
});