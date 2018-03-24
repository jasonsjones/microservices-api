import { expect } from 'chai';

import * as Controller from './user.controller';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const users = [
    {
        name: 'Barry Allen',
        email: 'barry@starlabs.com',
        password: '123456'
    },
    {
        name: 'Oliver Queen',
        email: 'oliver@qc.com',
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

const expectErrorResponse = (errorResponse, errMsg) => {
    expect(errorResponse).to.have.property('success');
    expect(errorResponse).to.have.property('message');
    expect(errorResponse).to.have.property('error');
    expect(errorResponse.success).to.be.false;
    expect(errorResponse.message).to.contain(errMsg);
    expect(errorResponse.error instanceof Error).to.be.true;
};

describe('User controller integration tests', () => {
    after(() => {
        dropCollection(dbConnection, 'users');
    });

    context('signUpUser()', () => {
        it('returns error payload if the user data is not provided', () => {
            return Controller.signupUser()
                .catch(error => {
                    expectErrorResponse(error, 'request parameter is required');
                });
        });

        it('creates a new user', () => {
            let req = {
                body: users[0]
            };
            return Controller.signupUser(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response.success).to.be.true;
                    expectUserShape(response.payload.user);
                });
        });
    });
});