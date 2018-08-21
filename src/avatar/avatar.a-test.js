import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { expectAvatarShape } from '../utils/avatarTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { createUserUtil } from '../utils/userTestUtils';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const uploadDefaultAvatar = fileName => {
    return request(app)
        .post(`/api/avatars/default`)
        .attach('avatar', `${__dirname}/../../assets/${fileName}`)
        .expect(200)
        .then(res => Promise.resolve(res.body.payload));
};
describe('Avatar acceptence tests', () => {
    afterEach(() => {
        dropCollection(dbConnection, 'avatars');
    });

    context('POST /api/avatars/default', () => {
        it('uploads a default user avatar', () => {
            return request(app)
                .post(`/api/avatars/default`)
                .attach('avatar', `${__dirname}/../../assets/sfdc_default_avatar.png`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expectAvatarShape(res.body.payload, true);
                    expect(res.body.payload.defaultImg).to.be.true;
                });
        });
    });

    context('GET /api/avatars', () => {
        it('returns all the user avatars', () => {
            return uploadDefaultAvatar('sfdc_default_avatar.png')
                .then(() => uploadDefaultAvatar('default_avatar.png'))
                .then(() =>
                    request(app)
                        .get('/api/avatars')
                        .expect(200)
                )
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.avatars).to.be.an('array');
                    expectAvatarShape(res.body.payload.avatars[0], false);
                    expectAvatarShape(res.body.payload.avatars[1], false);
                });
        });
    });

    context('GET /api/avatars/default/:index', () => {
        it('returns the first default avatar', () => {
            return uploadDefaultAvatar('sfdc_default_avatar.png')
                .then(() =>
                    request(app)
                        .get('/api/avatars/default/0')
                        .expect(200)
                )
                .then(res => {
                    expect(res.body).to.exist;
                    expect(typeof res.body === 'object').to.be.true;
                });
        });

        it('returns an error if requesting a default avatar that does not exist', () => {
            return request(app)
                .get('/api/avatars/default/1')
                .expect(500)
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('error');
                    expect(res.body.success).to.be.false;
                });
        });
    });

    context('GET /api/avatars/:id', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns an avatar with the given id', () => {
            // create a new user
            return (
                createUserUtil({
                    name: 'Oliver Queen',
                    email: 'oliver@qc.com',
                    password: '123456'
                })
                    // upload a custom avatar for the new user
                    .then(user =>
                        request(app)
                            .post(`/api/users/${user._id}/avatar`)
                            .attach('avatar', `${__dirname}/../../assets/male3.png`)
                            .expect(200)
                    )
                    // get the avatar id
                    .then(res => {
                        let parts = res.body.payload.user.avatarUrl.split('/');
                        return parts[parts.length - 1];
                    })
                    .then(id =>
                        request(app)
                            .get(`/api/avatars/${id}`)
                            .expect(200)
                    )
                    .then(res => {
                        expect(res.body).to.exist;
                        expect(typeof res.body === 'object').to.be.true;
                    })
            );
        });
    });

    context('DELETE /api/avatars/:id', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });
        it('deletes a custom avatar with the given id', () => {
            // create a new user
            return (
                createUserUtil({
                    name: 'Oliver Queen',
                    email: 'oliver@qc.com',
                    password: '123456'
                })
                    // upload a custom avatar for the new user
                    .then(user =>
                        request(app)
                            .post(`/api/users/${user._id}/avatar`)
                            .attach('avatar', `${__dirname}/../../assets/male3.png`)
                            .expect(200)
                    )
                    // get the avatar id
                    .then(res => {
                        let parts = res.body.payload.user.avatarUrl.split('/');
                        return parts[parts.length - 1];
                    })
                    .then(id =>
                        request(app)
                            .delete(`/api/avatars/${id}`)
                            .expect(200)
                    )
                    .then(res => {
                        expectJSONShape(res.body);
                        expect(res.body.success).to.be.true;
                        expectAvatarShape(res.body.payload, true);
                    })
            );
        });

        it('verifies avatar is reset to default when custom avatar is deleted', () => {
            return (
                // create new user
                createUserUtil({
                    name: 'Oliver Queen',
                    email: 'oliver@qc.com',
                    password: '123456'
                })
                    // upload a custom avatar for the new user
                    .then(user =>
                        request(app)
                            .post(`/api/users/${user._id}/avatar`)
                            .attach('avatar', `${__dirname}/../../assets/male3.png`)
                            .expect(200)
                    )
                    // get the avatar id
                    .then(res => {
                        let parts = res.body.payload.user.avatarUrl.split('/');
                        return parts[parts.length - 1];
                    })
                    // delete the custom avatar
                    .then(id =>
                        request(app)
                            .delete(`/api/avatars/${id}`)
                            .expect(200)
                    )
                    .then(res => res.body.payload.user)
                    .then(id =>
                        request(app)
                            .get(`/api/users/${id}`)
                            .expect(200)
                    )
                    .then(res => {
                        const { avatarUrl, avatar } = res.body.payload.user;
                        expectJSONShape(res.body, 'user');
                        expect(avatarUrl).contains('default');
                        expect(avatar).to.equal(null);
                    })
            );
        });
    });
});
