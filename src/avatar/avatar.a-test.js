import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { expectAvatarShape } from '../utils/avatarTestUtils';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const expectJSONShape = json => {
    expect(json).to.be.an('Object');
    expect(json).to.have.property('success');
    expect(json).to.have.property('message');
    expect(json).to.have.property('payload');
};

describe.only('Avatar acceptence tests', () => {

    context('uploads and gets a default avatar image', () => {
        after(() => {
            dropCollection(dbConnection, 'avatars');
        });

        it('POST /api/avatar/default', () => {
            return request(app)
                .post(`/api/avatar/default`)
                .attach('avatar', `${__dirname}/../../assets/sfdc_default_avatar.png`)
                .expect(200)
                .then(res => {
                    expectJSONShape(res.body, true);
                    expect(res.body.success).to.be.true;
                    expectAvatarShape(res.body.payload);
                });
        });

        it('GET /api/avatar/default/:index', () => {
            return request(app)
                .get('/api/avatar/default/0')
                .expect(200)
                .then(res => {
                    expect(res.body).to.exist;
                    expect(typeof res.body === 'object').to.be.true;
                });
        });

        it('GET /api/avatar/default/:index', () => {
            return request(app)
                .get('/api/avatar/default/1')
                .expect(500)
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('error');
                    expect(res.body.success).to.be.false;
                });
        });
    });
});