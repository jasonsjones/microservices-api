import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

describe('User acceptance tests', () => {

    after(() => {
        dropCollection(dbConnection, 'users');
        dropCollection(dbConnection, 'avatars');
    });

    context('signs up a new user and uploads a custom avatar', () => {
        let oliverId;
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
});
