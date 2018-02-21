import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import Config from '../config/config';
import db from '../config/db';

const env = process.env.NODE_ENV || "development";
const config = Config[env];

let dbConnection;

describe('Index integration tests', () => {

    before(() => {
        dbConnection = db(config);
    });

    after(() => {
        dbConnection.close();
    });

    it('app is present', () => {
        expect(app).to.exist;
    });

    it('returns status 200 and json payload', () => {
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
