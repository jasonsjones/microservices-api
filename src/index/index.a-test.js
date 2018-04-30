import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import config from '../config/config';

describe('Index acceptance tests', () => {
    let json;
    it('has route to get api information', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(res => {
                expect(res).to.be.an('Object');
                expect(res.body).to.have.property('version');
                expect(res.body).to.have.property('message');
                json = res.body;
            });
    });

    it('returns the correct version of the api', () => {
        expect(json.version).to.equal(config.version);
    });
});
