import fs from 'fs';
import { expect } from 'chai';

import * as Repository from './user.repository';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const users = [
    {
        name: 'Barry Allen',
        email: 'barry@starlabs.com',
        password: '123456'
    },
    {
        name: 'Oliver Queen',
        email: 'arrow@qc.com',
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

describe('User repository integration tests', () => {
    after(() => {
        dropCollection(dbConnection, 'users');
        dropCollection(dbConnection, 'avatars');
    });

    context('signUpUser()', () => {
        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('saves a new user to the db', () => {
            const newUser = {
                name: 'Barry Allen',
                email: 'barry@starlabs.com',
                password: '123456'
            };
            return Repository.signUpUser(newUser)
                .then(response => {
                    expectUserShape(response);
                    // ensure the password is hashed
                    expect(response.password).to.not.equal(newUser.password);
                });
        });

        it('returns an error if the user data is not provided', () => {
            return Repository.signUpUser()
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user data is required');
                });
        });
    });

    context('uploadUserAvatar()', () => {
        const assetPath = `${__dirname}/../../assets`;
        const avatarFile = `${assetPath}/male3.png`;
        const avatar = {
            originalName: 'male3.png',
            mimetype: 'image/png',
            size: fs.statSync(avatarFile).size,
            path: avatarFile
        };

        let userId;
        before(() => {
            return Repository.signUpUser(users[1])
                .then(response => {
                    userId = response._id;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('uploads a custom avatar and associates with the user', () => {
            return Repository.uploadUserAvatar(userId, avatar, false)
                .then(response => {
                    expectUserShape(response);
                    expect(response.avatarUrl).to.not.contain('default');
                    expect(response.avatar).to.exist;
                });
        });

        it('returns an error if a user id is not provided', () => {
            return Repository.uploadUserAvatar(null, avatar, false)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user id is required');
                });
        });

        it('returns an error if the avatar file is not provided', () => {
            return Repository.uploadUserAvatar(userId, null, false)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('avatar file is required');
                });
        });
    });

    context('getUsers()', () => {
        let oliverId;
        before(() => {
            return Repository.signUpUser(users[0])
                .then(() => Repository.signUpUser(users[1]))
                .then(user => oliverId = user._id);
        });

        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('returns an array of all the users', () => {
            return Repository.getUsers()
                .then(response => {
                    expect(response).to.be.an('array');
                    expect(response).to.have.lengthOf(2);
                    expectUserShape(response[0]);
                    expectUserShape(response[1]);
                });
        });

        it('returns an array of user based on the query condition', () => {
            return Repository.getUsers({name: "Oliver Queen"})
                .then(response => {
                    expect(response).to.be.an('array');
                    expect(response).to.have.lengthOf(1);
                    expectUserShape(response[0]);
                    expect(response[0].name).to.equal("Oliver Queen");
                });
        });

        it('returns an array of users with the avatar model populated', () => {
            const assetPath = `${__dirname}/../../assets`;
            const avatarFile = `${assetPath}/male3.png`;
            const avatar = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: fs.statSync(avatarFile).size,
                path: avatarFile
            };

            return Repository.uploadUserAvatar(oliverId, avatar, false)
                .then(() => Repository.getUsers({name: "Oliver Queen"}, true))
                .then(response => {
                    expect(response).to.be.an('array');
                    expect(response).to.have.lengthOf(1);
                    expectUserShape(response[0]);
                    expect(response[0].name).to.equal("Oliver Queen");
                    expect(response[0].avatar).to.exist;
                    expect(response[0].avatar).to.be.an('object');
                    expect(response[0].avatar.defaultImg).to.be.false;
                });
        });
    });
});