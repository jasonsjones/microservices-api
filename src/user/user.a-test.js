import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

describe('User acceptance tests', () => {

    context('signs up a new user and uploads a custom avatar', () => {
        let oliverId;
        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('POST /api/signup', () => {
            return request(app)
                .post('/api/signup')
                .send({
                    'name': 'Oliver Queen',
                    'email': 'oliver@qc.com',
                    'password': '123456'
                })
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('user');
                    expect(res.body.success).to.be.true;
                    oliverId = res.body.payload.user._id;
                });
        });

        it('POST /api/user/:userid/avatar', () => {
            return request(app)
                .post(`/api/user/${oliverId}/avatar`)
                .attach('avatar', `${__dirname}/../../assets/male3.png`)
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user).to.have.property('avatarUrl');
                    expect(res.body.payload.user.avatarUrl).not.to.contain('default');
                });
        });

        it('GET /api/user/:id', () => {
            return request(app)
                .get(`/api/user/${oliverId}`)
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('_id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user).to.have.property('avatarUrl');
                    expect(res.body.payload.user.avatarUrl).not.to.contain('default');
                });
        });
    });

    context('gets all users and individual users by id', () => {
        let barryId, oliverId;
        const barry ={
            'name': 'Barry Allen',
            'email': 'barry@starlabs.com',
            'password': '123456'
        };

        const oliver ={
            'name': 'Oliver Queen',
            'email': 'oliver@qc.com',
            'password': '123456'
        };

        before(() => {
            return request(app)
                .post('/api/signup')
                .send(barry)
                .expect(200)
                .then(res => {
                    barryId = res.body.payload.user._id;
                    return request(app)
                        .post('/api/signup')
                        .send(oliver)
                        .expect(200);
                })
                .then(res => oliverId = res.body.payload.user._id);
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('GET /api/users', () => {
            return request(app)
                .get('/api/users')
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('users');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.users).to.be.an('Array');
                    expect(res.body.payload.users.length).to.equal(2);
                });
        });

        it('GET /api/user/:id -- Barry', () => {
            return request(app)
                .get(`/api/user/${barryId}`)
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('_id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user).to.have.property('avatarUrl');
                    expect(res.body.payload.user.name).to.equal(barry.name);
                });
        });

        it('GET /api/user/:id -- Oliver', () => {
            return request(app)
                .get(`/api/user/${oliverId}`)
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('_id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user).to.have.property('avatarUrl');
                    expect(res.body.payload.user.name).to.equal(oliver.name);
                });
        });
    });

    context('updates user data', () => {
        let barryId;
        const barry ={
            'name': 'Barry Allen',
            'email': 'barry@starlabs.com',
            'password': '123456'
        };

        before(() => {
            return request(app)
                .post('/api/signup')
                .send(barry)
                .expect(200)
                .then(res => {
                    barryId = res.body.payload.user._id;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('PUT /api/user/:id', () => {
            const updatedUserData = {
                'name': 'The Flash',
                'email': 'flash@starlabs.com'
            };

            return request(app)
                .put(`/api/user/${barryId}`)
                .send(updatedUserData)
                .expect(200)
                .then(res => {
                    expect(res).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.have.property('user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user.name).to.equal(updatedUserData.name);
                    expect(res.body.payload.user.email).to.equal(updatedUserData.email);
                });
        });
    });

    context('deletes a user', () => {
        it('DELETE /api/user/:id');
    });

    context('changes a user\'s password', () => {
        it('POST /api/user/changepassword');
    });
});
