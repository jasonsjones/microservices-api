import { expect } from 'chai';

import * as Repository from './user.repository';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

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
    });

    context('signUpUser()', () => {
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
});