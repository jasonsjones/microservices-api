import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { expectAvatarShape } from '../utils/avatarTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

describe.only('Avatar acceptence tests', () => {

    context('uploads and gets a default avatar image', () => {
        after(() => {
            dropCollection(dbConnection, 'avatars');
        });

        it('POST /api/avatar/default', () => {
            return request(app)
                .post(`/api/avatar/default`)
                .attach('avatar', `${__dirname}/../../assets/sfdc_default_avatar.png`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expectAvatarShape(res.body.payload, true);
                    expect(res.body.payload.defaultImg).to.be.true;
                });
        });

        it('GET /api/avatar/default/:index', () => {
            return request(app)
                .get('/api/avatar/default/0')
                .expect(200)
                .then(res => {
                    expect(res.body).to.exist;
                    expect(typeof res.body === 'object').to.be.true;
                });
        });

        it('GET /api/avatar/default/:index', () => {
            return request(app)
                .get('/api/avatar/default/1')
                .expect(500)
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('error');
                    expect(res.body.success).to.be.false;
                });
        });

        it('GET /api/avatars', () => {
            return request(app)
                .post(`/api/avatar/default`)
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

        })
    });

    context('gets and deletes a user\'s custom avatar', () => {
        let avatarId;

        before(() => {
            dropCollection(dbConnection, 'users');

            return request(app)
                .post('/api/signup')
                .send({
                    'name': 'Oliver Queen',
                    'email': 'oliver@qc.com',
                    'password': '123456'
                })
                .expect(200)
                .then(res => {
                    const userId = res.body.payload.user._id;
                    return request(app)
                        .post(`/api/user/${userId}/avatar`)
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

        it('GET /api/avatar/:id', () => {
            return request(app)
                .get(`/api/avatar/${avatarId}`)
                .expect(200)
                .then(res => {
                    expect(res.body).to.exist;
                    expect(typeof res.body === 'object').to.be.true;
                });
        });

        it('DELETE /api/avatar/:id', () => {
            return request(app)
                .delete(`/api/avatar/${avatarId}`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expectAvatarShape(res.body.payload, true);
                    expect(res.body.payload._id).to.equal(avatarId);
                });
        });
    });
});