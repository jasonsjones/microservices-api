import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';

describe('Index acceptance tests', () => {
    it('has route to get api information', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(res => {
                expect(res).to.be.an('Object');
                expect(res.body).to.have.property('version');
                expect(res.body).to.have.property('message');
            });
    });
});
