import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { createUser } from '../utils/userTestUtils';

const barry = {
    name: 'Barry Allen',
    email: 'barry@starlabs.com',
    password: '123456'
};

const oliver = {
    name: 'Oliver Queen',
    email: 'oliver@qc.com',
    roles: ['admin', 'user'],
    password: '123456'
};

const signupAndLogin = userData => {
    return createUser(userData).then(() => {
        return request(app)
            .post('/api/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(200)
            .then(res => {
                return Promise.resolve(res.body.payload.token);
            });
    });
};

const loginUser = userCreds => {
    return request(app)
        .post('/api/login')
        .send({
            email: userCreds.email,
            password: userCreds.password
        })
        .expect(200)
        .then(res => {
            return Promise.resolve(res.body.payload.token);
        });
};

describe('User acceptance tests', () => {
    context('has routes to', () => {
        let oliverId;

        before(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        afterEach(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('signup a new user', () => {
            return request(app)
                .post('/api/users/signup')
                .send(oliver)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                    oliverId = res.body.payload.user._id;
                });
        });

        it('upload custom avatar image for user', () => {
            return createUser(oliver)
                .then(user => {
                    return request(app)
                        .post(`/api/users/${user._id}/avatar`)
                        .attach('avatar', `${__dirname}/../../assets/male3.png`)
                        .expect(200);
                })
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
            let userId;
            return createUser(oliver)
                .then(user => {
                    userId = user._id;
                    return request(app)
                        .post(`/api/users/${userId}/avatar`)
                        .attach('avatar', `${__dirname}/../../assets/male3.png`)
                        .expect(200);
                })
                .then(() =>
                    request(app)
                        .get(`/api/users/${userId}`)
                        .expect(200)
                )
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
            dropCollection(dbConnection, 'users');
            return createUser(barry)
                .then(user => {
                    barryId = user._id;
                    return createUser(oliver);
                })
                .then(user => {
                    oliverId = user.id;
                    return;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('get all the users', () => {
            let token;
            return loginUser(oliver)
                .then(resToken => (token = resToken))
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

        it('get me', () => {
            let token;
            return loginUser(oliver)
                .then(resToken => (token = resToken))
                .then(() => {
                    return request(app)
                        .get('/api/users/me')
                        .set('x-access-token', token)
                        .expect(200)
                        .then(res => {
                            expect(res.body.success).to.be.true;
                            expect(res.body.payload.user.email).to.eql(oliver.email);
                        })
                        .catch(err => console.log(err));
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
            dropCollection(dbConnection, 'users');
            return createUser(barry).then(user => {
                barryId = user._id;
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
            dropCollection(dbConnection, 'users');
            return createUser(barry).then(user => {
                barryId = user._id;
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
            dropCollection(dbConnection, 'users');
            return createUser(barry);
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

    context('has route to', () => {
        it('get a random user', () => {
            return request(app)
                .get('/api/users/randomuser')
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                });
        });
    });

    context('has helper to', () => {
        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('get the token', () => {
            return signupAndLogin(oliver).then(token => {
                expect(token).to.exist;
                expect(token).to.be.a('String');
            });
        });
    });
});
