import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';
import { expectJSONShape } from '../utils/testUtils';

describe.only('Authentication acceptance tests', () => {
    before(() => {
        return request(app)
            .post('/api/signup')
            .send({
                name: 'Oliver Queen',
                email: 'oliver@qc.com',
                password: '123456'
            })
            .expect(200);
    });

    after(() => {
        dropCollection(dbConnection, 'users');
    });

    it('error if attempting to log in with incorrect password', () => {
        return request(app)
            .post('/api/login')
            .send({
                email: 'oliver@qc.com',
                password: '654321'
            })
            .expect(401)
            .then(res => {
                expect(res.error).to.have.property('text');
                expect(res.error).to.have.property('path');
                expect(res.error).to.have.property('method');
                expect(res.error.text).to.equal('Unauthorized');
                expect(res.error.path).to.equal('/api/login');
                expect(res.error.method).to.equal('POST');
            });
    });

    it('logs in a user and returns a jwt', () => {
        return request(app)
            .post('/api/login')
            .send({
                email: 'oliver@qc.com',
                password: '123456'
            })
            .expect(200)
            .then(res => {
                const { token } = res.body.payload;
                expectJSONShape(res.body);
                expect(res.body.payload).to.have.property('user');
                expect(res.body.payload).to.have.property('token');
                expect(res.body.success).to.be.true;
                expect(token.split('.')).to.have.lengthOf(3);
            });
    });
});
