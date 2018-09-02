import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { createUserUtil } from '../utils/userTestUtils';

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
    return createUserUtil(userData).then(() => {
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
    before(() => {
        dropCollection(dbConnection, 'users');
        dropCollection(dbConnection, 'avatars');
    });

    afterEach(() => {
        dropCollection(dbConnection, 'users');
        dropCollection(dbConnection, 'avatars');
    });

    context('POST /api/users', () => {
        it('returns status code 200 and json payload when creating a new user', () => {
            return request(app)
                .post('/api/users/')
                .send(oliver)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expectJSONShape(res.body, 'token');
                    expect(res.body.success).to.be.true;
                });
        }).timeout(8000);

        it('returns status code 500 and json payload if user data is not provided', () => {
            return request(app)
                .post('/api/users/')
                .send({})
                .expect(500)
                .then(res => {
                    expect(res.body).to.have.property('success');
                    expect(res.body.success).to.be.false;
                    expect(res.body).to.have.property('message');
                });
        });
    });

    context('POST /api/users/:id/avatar', () => {
        it('uploads a custom user avatar (profile pic)', () => {
            return createUserUtil(oliver)
                .then(user =>
                    request(app)
                        .post(`/api/users/${user._id}/avatar`)
                        .attach('avatar', `${__dirname}/../../assets/male3.png`)
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
        }).timeout(3000);
    });

    context.skip('POST /api/users/forgotpassword', () => {
        beforeEach(() => {
            return createUserUtil(oliver);
        });

        it('responds with 500 status if user email is not provided', () => {
            return request(app)
                .post('/api/users/forgotpassword')
                .send({})
                .expect(500)
                .then(res => {
                    expect(res.body).to.have.property('success');
                    expect(res.body.success).to.be.false;
                    expect(res.body).to.have.property('message');
                });
        });

        it('responds with appropriate message if the user cannot be found', () => {
            return request(app)
                .post('/api/users/forgotpassword')
                .send({ email: 'notfound@email.com' })
                .expect(200)
                .then(res => {
                    expect(res.body).to.have.property('success');
                    expect(res.body.success).to.be.false;
                    expect(res.body).to.have.property('message');
                });
        });

        it('sends password reset email', () => {
            return request(app)
                .post('/api/users/forgotpassword')
                .send({ email: oliver.email })
                .expect(200)
                .then(res => {
                    expect(res.body).to.have.property('success');
                    expect(res.body.success).to.be.true;
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload.email).to.be.a('string');
                    expect(res.body.payload.info).to.be.a('object');
                });
        }).timeout(8000);
    });

    context('POST /api/users/changepassword', () => {
        it('changes the user password', () => {
            const payload = {
                email: barry.email,
                currentPassword: barry.password,
                newPassword: 'test1234'
            };
            return createUserUtil(barry).then(() =>
                request(app)
                    .post('/api/users/changepassword')
                    .send(payload)
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an('Object');
                        expect(res.body).to.have.property('success');
                        expect(res.body).to.have.property('message');
                        expect(res.body.success).to.be.true;
                        expect(res.body.message).to.contain('user password changed');
                    })
            );
        });
    });

    context('GET /api/users/', () => {
        it('returns all the users if logged in as an admin', () => {
            return createUserUtil(barry)
                .then(() => signupAndLogin(oliver))
                .then(token =>
                    request(app)
                        .get('/api/users')
                        .set('x-access-token', token)
                        .expect(200)
                        .then(res => {
                            expectJSONShape(res.body, 'users');
                            expect(res.body.success).to.be.true;
                            expect(res.body.payload.users).to.be.an('Array');
                            expect(res.body.payload.users.length).to.equal(2);
                        })
                );
        });
    });

    context('GET /api/users/me', () => {
        it('returns the logged in user', () => {
            return signupAndLogin(oliver).then(token =>
                request(app)
                    .get('/api/users/me')
                    .set('x-access-token', token)
                    .expect(200)
                    .then(res => {
                        expect(res.body.success).to.be.true;
                        expect(res.body.payload.user.email).to.eql(oliver.email);
                    })
                    .catch(err => console.log(err))
            );
        });
    });

    context('GET /api/users/:id', () => {
        it('returns the user with the given id', () => {
            return createUserUtil(barry).then(user =>
                request(app)
                    .get(`/api/users/${user._id}`)
                    .expect(200)
                    .then(res => {
                        expectJSONShape(res.body, 'user');
                        expect(res.body.success).to.be.true;
                        expect(res.body.payload.user).to.have.property('_id');
                        expect(res.body.payload.user).to.have.property('name');
                        expect(res.body.payload.user).to.have.property('email');
                        expect(res.body.payload.user).to.have.property('avatarUrl');
                        expect(res.body.payload.user.name).to.equal(barry.name);
                    })
            );
        });
    });

    context('PUT /api/users/:id', () => {
        it('updates the user with the provided data', () => {
            const updatedUserData = {
                name: 'The Flash',
                email: 'flash@starlabs.com'
            };
            return createUserUtil(barry).then(user =>
                request(app)
                    .put(`/api/users/${user._id}`)
                    .send(updatedUserData)
                    .expect(200)
                    .then(res => {
                        expectJSONShape(res.body, 'user');
                        expect(res.body.success).to.be.true;
                        expect(res.body.payload.user).to.have.property('_id');
                        expect(res.body.payload.user).to.have.property('name');
                        expect(res.body.payload.user).to.have.property('email');
                        expect(res.body.payload.user.name).to.equal(updatedUserData.name);
                        expect(res.body.payload.user.email).to.equal(updatedUserData.email);
                    })
            );
        });
    });

    context('DELETE /api/users/:id', () => {
        it('deletes the user with the given id', () => {
            return createUserUtil(barry).then(user =>
                request(app)
                    .delete(`/api/users/${user._id}`)
                    .expect(200)
                    .then(res => {
                        expectJSONShape(res.body, 'user');
                        expect(res.body.success).to.be.true;
                        expect(res.body.payload).to.be.an('Object');
                        expect(res.body.payload.user.name).to.equal(barry.name);
                    })
            );
        });
    });

    context('GET /api/users/randomuser', () => {
        it('returns a random user', () => {
            return request(app)
                .get('/api/users/randomuser')
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, 'user');
                    expect(res.body.success).to.be.true;
                });
        });
    });

    context('private utility function to', () => {
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
