import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../config/app';

chai.use(chaiHttp);

describe('Index integration tests', () => {

    it('app is present', () => {
        expect(app).to.exist;
    });

    it('returns status 200 and json payload', () => {
        return chai.request(app).get('/api').then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
        });
    });
});
