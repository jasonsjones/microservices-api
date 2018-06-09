import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';
import { expectJSONShape } from '../utils/testUtils';

const barry = {
    name: 'Barry Allen',
    email: 'barry@starlabs.com',
    password: '123456'
};

const oliver = {
    name: 'Oliver Queen',
    email: 'oliver@qc.com',
    password: '123456'
};

const createUser = userData => {
    return request(app)
        .post('/api/users/signup')
        .send(userData)
        .expect(200);
};

const createAdminUser = userData => {
    let userId;
    return request(app)
        .post('/api/users/signup')
        .send(userData)
        .expect(200)
        .then(res => {
            userId = res.body.payload.user._id;
        })
        .then(() => {
            return request(app)
                .put(`/api/users/${userId}`)
                .send({ roles: ['user', 'admin'] })
                .expect(200);
        });
};

describe('User acceptance tests', () => {
    context('has routes to', () => {
        let oliverId;
        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('creates an admin user', () => {
            return createAdminUser(oliver).then(res => {
                expectJSONShape(res.body, 'user');
                expect(res.body.success).to.be.true;
                expect(res.body.payload.user.roles).to.contain('admin');
            });
        });

        it('signup a new user', () => {
            return createUser(oliver).then(res => {
                expectJSONShape(res.body, 'user');
                expect(res.body.success).to.be.true;
                oliverId = res.body.payload.user._id;
            });
        });

        it('upload custom avatar image for user', () => {
            return request(app)
                .post(`/api/users/${oliverId}/avatar`)
                .attach('avatar', `${__dirname}/../../assets/male3.png`)
                .expect(200)
                .then(res => {
                    const { user } = res.body.payload;
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    expect(user).to.have.property('id');
                    expect(user).to.have.property('name');
                    expect(user).to.have.property('email');
                    expect(user).to.have.property('avatarUrl');
                    expect(user.avatarUrl).not.to.contain('default');
                });
        });

        it('verify the user has been added', () => {
            return request(app)
                .get(`/api/users/${oliverId}`)
                .expect(200)
                .then(res => {
                    const { user } = res.body.payload;
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    expect(user).to.have.property('_id');
                    expect(user).to.have.property('name');
                    expect(user).to.have.property('email');
                    expect(user).to.have.property('avatarUrl');
                    expect(user.avatarUrl).not.to.contain('default');
                });
        });
    });

    context('has routes to', () => {
        let barryId, oliverId;

        before(() => {
            return createUser(barry)
                .then(res => {
                    barryId = res.body.payload.user._id;
                    return createAdminUser(oliver);
                })
                .then(res => (oliverId = res.body.payload.user.id));
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('get all the users', () => {
            let token;
            return request(app)
                .post('/api/login')
                .send({
                    email: 'oliver@qc.com',
                    password: '123456'
                })
                .expect(200)
                .then(res => {
                    token = res.body.payload.token;
                })
                .then(() => {
                    return request(app)
                        .get('/api/users')
                        .set('x-access-token', token)
                        .expect(200)
                        .then(res => {
                            expectJSONShape(res.body, 'users');
                            expect(res.body.success).to.be.true;
                            expect(res.body.payload.users).to.be.an('Array');
                            expect(res.body.payload.users.length).to.equal(2);
                        });
                });
        });

        it('get barry user by id', () => {
            return request(app)
                .get(`/api/users/${barryId}`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('_id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user).to.have.property('avatarUrl');
                    expect(res.body.payload.user.name).to.equal(barry.name);
                });
        });

        it('get oliver user by id', () => {
            return request(app)
                .get(`/api/users/${oliverId}`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('_id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user).to.have.property('avatarUrl');
                    expect(res.body.payload.user.name).to.equal(oliver.name);
                });
        });
    });

    context('has route to', () => {
        let barryId;
        const barry = {
            name: 'Barry Allen',
            email: 'barry@starlabs.com',
            password: '123456'
        };

        before(() => {
            return request(app)
                .post('/api/users/signup')
                .send(barry)
                .expect(200)
                .then(res => {
                    barryId = res.body.payload.user._id;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('update user data', () => {
            const updatedUserData = {
                name: 'The Flash',
                email: 'flash@starlabs.com'
            };

            return request(app)
                .put(`/api/users/${barryId}`)
                .send(updatedUserData)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload.user).to.have.property('id');
                    expect(res.body.payload.user).to.have.property('name');
                    expect(res.body.payload.user).to.have.property('email');
                    expect(res.body.payload.user.name).to.equal(updatedUserData.name);
                    expect(res.body.payload.user.email).to.equal(updatedUserData.email);
                });
        });
    });

    context('has route to', () => {
        let barryId;
        const barry = {
            name: 'Barry Allen',
            email: 'barry@starlabs.com',
            password: '123456'
        };

        before(() => {
            return request(app)
                .post('/api/users/signup')
                .send(barry)
                .expect(200)
                .then(res => {
                    barryId = res.body.payload.user._id;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('delete a user', () => {
            const url = `/api/users/${barryId}`;

            return request(app)
                .delete(url)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload).to.be.an('Object');
                    expect(res.body.payload.user.name).to.equal(barry.name);
                    return request(app)
                        .get(url)
                        .expect(200);
                })
                .then(res => {
                    expectJSONShape(res.body);
                    expect(res.body.success).to.be.true;
                    expect(res.body.payload).to.be.an('Object');
                    expect(res.body.payload.user).to.equal(null);
                });
        });
    });

    context('has route to', () => {
        const barry = {
            name: 'Barry Allen',
            email: 'barry@starlabs.com',
            password: '123456'
        };

        before(() => {
            return request(app)
                .post('/api/users/signup')
                .send(barry)
                .expect(200);
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it("change a user's password", () => {
            const payload = {
                email: barry.email,
                currentPassword: barry.password,
                newPassword: 'test1234'
            };
            return request(app)
                .post('/api/users/changepassword')
                .send(payload)
                .expect(200)
                .then(res => {
                    expect(res.body).to.be.an('Object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body.success).to.be.true;
                    expect(res.body.message).to.contain('user password changed');
                });
        });
    });
});
