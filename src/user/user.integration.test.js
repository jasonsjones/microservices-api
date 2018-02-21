import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import Config from '../config/config';
import db from '../config/db';

const env = process.env.NODE_ENV || "development";
const config = Config[env];

let dbConnection;

describe('User integration tests', () => {

    before(() => {
        dbConnection = db(config);
    });

    after(() => {
        dbConnection.dropCollection('users', () => {
            console.log('***** dropped users collection');
        });
        dbConnection.close();
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
