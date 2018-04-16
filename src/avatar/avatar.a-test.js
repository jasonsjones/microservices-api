import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const expectAvatarShape = payload => {
    expect(payload).to.have.property('contentType');
    expect(payload).to.have.property('fileSize');
    expect(payload).to.have.property('data');
    expect(payload).to.have.property('createdAt');
    expect(payload).to.have.property('updatedAt');
};

const expectJSONShape = json => {
    expect(json).to.be.an('Object');
    expect(json).to.have.property('success');
    expect(json).to.have.property('message');
    expect(json).to.have.property('payload');
};

describe.only('Avatar acceptence tests', () => {

    after(() => {
        dropCollection(dbConnection, 'avatars');
    });

    it('POST /api/avatar/default', () => {
        return request(app)
            .post(`/api/avatar/default`)
            .attach('avatar', `${__dirname}/../../assets/sfdc_default_avatar.png`)
            .expect(200)
            .then(res => {
                expectJSONShape(res.body);
                expect(res.body.success).to.be.true;
                expectAvatarShape(res.body.payload);
            });
    });

});