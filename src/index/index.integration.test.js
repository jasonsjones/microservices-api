import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../config/app';
import Config from '../config/config';
import db from '../config/db';

const env = process.env.NODE_ENV || "development";
const config = Config[env];

chai.use(chaiHttp);
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
        return chai.request(app).get('/api').then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('version');
            expect(res.body).to.have.property('message');
        });
    });
});
