import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { expectAvatarShape } from '../utils/avatarTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

describe('Avatar acceptence tests', () => {
    context('has routes to', () => {
        after(() => {
            dropCollection(dbConnection, 'avatars');
        });

        it('upload default user avatar', () => {
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

        it('get the first default avatar', () => {
            return request(app)
                .get('/api/avatars/default/0')
                .expect(200)
                .then(res => {
                    expect(res.body).to.exist;
                    expect(typeof res.body === 'object').to.be.true;
                });
        });

        it('verify error if requesting a default avatar that does not exist', () => {
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

        it('get all the avatars', () => {
            return request(app)
                .post(`/api/avatars/default`)
                .attach('avatar', `${__dirname}/../../assets/default_avatar.png`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expectAvatarShape(res.body.payload, true);
                    expect(res.body.payload.defaultImg).to.be.true;
                    return request(app)
                        .get('/api/avatars')
                        .expect(200);
                })
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.avatars).to.be.an('array');
                    expectAvatarShape(res.body.payload.avatars[0], false);
                    expectAvatarShape(res.body.payload.avatars[1], false);
                });
        });
    });

    context('has routes to', () => {
        let avatarId, userId;

        before(() => {
            dropCollection(dbConnection, 'users');

            return request(app)
                .post('/api/users/signup')
                .send({
                    name: 'Oliver Queen',
                    email: 'oliver@qc.com',
                    password: '123456'
                })
                .expect(200)
                .then(res => {
                    userId = res.body.payload.user.id;
                    return request(app)
                        .post(`/api/users/${userId}/avatar`)
                        .attach('avatar', `${__dirname}/../../assets/male3.png`)
                        .expect(200)
                        .then(res => {
                            let parts = res.body.payload.user.avatarUrl.split('/');
                            avatarId = parts[parts.length - 1];
                        });
                });
        });

        after(() => {
            dropCollection(dbConnection, 'avatars');
            dropCollection(dbConnection, 'users');
        });

        it('get a custom avatar', () => {
            return request(app)
                .get(`/api/avatars/${avatarId}`)
                .expect(200)
                .then(res => {
                    expect(res.body).to.exist;
                    expect(typeof res.body === 'object').to.be.true;
                });
        });

        it('delete a custom avatar', () => {
            return request(app)
                .delete(`/api/avatars/${avatarId}`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expectAvatarShape(res.body.payload, true);
                    expect(res.body.payload._id).to.equal(avatarId);
                });
        });

        it("verify user's avatar is reset to default", () => {
            return request(app)
                .get(`/api/users/${userId}`)
                .expect(200)
                .then(res => {
                    const { avatarUrl, avatar } = res.body.payload.user;
                    expectJSONShape(res.body, 'user');
                    expect(avatarUrl).contains('default');
                    expect(avatar).to.equal(null);
                });
        });
    });
});
