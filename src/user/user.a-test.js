import { expect } from 'chai';
import request from 'supertest';
import debug from 'debug';

import app from '../config/app';
import { dbConnection } from '../utils/dbTestUtils';

const log = debug('db:integration-test');

describe('User integration tests', () => {

    afterEach(() => {
        dbConnection.dropCollection('users', () => {
            log('dropped users collection');
        });
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
            })
            .catch(err => err);
    });
});
