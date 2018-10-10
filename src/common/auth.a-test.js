import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { createUserUtil } from '../utils/userTestUtils';

describe('Authentication acceptance tests', () => {
    before(() => {
        return createUserUtil({
            name: {
                first: 'Oliver',
                last: 'Queen'
            },
            email: 'oliver@qc.com',
            password: '123456'
        });
    });

    after(() => {
        dropCollection(dbConnection, 'users');
    });

    it('returns error if attempting to log in with incorrect password', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'oliver@qc.com',
                password: '654321'
            })
            .expect(401);

        expect(res.error).to.have.property('text');
        expect(res.error).to.have.property('path');
        expect(res.error).to.have.property('method');
        expect(res.error.text).to.equal('Unauthorized');
        expect(res.error.path).to.equal('/api/login');
        expect(res.error.method).to.equal('POST');
    });

    it('logs in a user and returns a jwt', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'oliver@qc.com',
                password: '123456'
            })
            .expect(200);

        const { token } = res.body.payload;
        expectJSONShape(res.body);
        expect(res.body.payload).to.have.property('user');
        expect(res.body.payload).to.have.property('token');
        expect(res.body.success).to.be.true;
        expect(token.split('.')).to.have.lengthOf(3);
    });

    it('logs out the user', async () => {
        await request(app)
            .post('/api/login')
            .send({
                email: 'oliver@qc.com',
                password: '123456'
            })
            .expect(200);

        const res = await request(app)
            .get('/api/logout')
            .expect(200);

        expectJSONShape(res.body);
        expect(res.body.success).to.be.true;
    });
});
