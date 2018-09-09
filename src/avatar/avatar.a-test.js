import { expect } from 'chai';
import request from 'supertest';

import app from '../config/app';
import { expectAvatarShape } from '../utils/avatarTestUtils';
import { expectJSONShape } from '../utils/testUtils';
import { createUserUtil } from '../utils/userTestUtils';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const uploadDefaultAvatar = fileName => {
    return request(app)
        .post(`/api/avatars/default`)
        .attach('avatar', `${__dirname}/../../assets/${fileName}`)
        .expect(200)
        .then(res => Promise.resolve(res.body.payload));
};

const getAvatarId = response => {
    let parts = response.body.payload.user.avatarUrl.split('/');
    return parts[parts.length - 1];
};

describe('Avatar acceptence tests', () => {
    afterEach(() => {
        dropCollection(dbConnection, 'avatars');
    });

    context('POST /api/avatars/default', () => {
        it('uploads a default user avatar', async () => {
            const res = await request(app)
                .post(`/api/avatars/default`)
                .attach('avatar', `${__dirname}/../../assets/sfdc_default_avatar.png`)
                .expect(200);

            expectJSONShape(res.body);
            expect(res.body.success).to.be.true;
            expectAvatarShape(res.body.payload, true);
            expect(res.body.payload.defaultImg).to.be.true;
        });
    });

    context('GET /api/avatars', () => {
        it('returns all the user avatars', async () => {
            await uploadDefaultAvatar('sfdc_default_avatar.png');
            await uploadDefaultAvatar('default_avatar.png');
            const res = await request(app)
                .get('/api/avatars')
                .expect(200);

            expectJSONShape(res.body);
            expect(res.body.success).to.be.true;
            expect(res.body.payload.avatars).to.be.an('array');
            expectAvatarShape(res.body.payload.avatars[0], false);
            expectAvatarShape(res.body.payload.avatars[1], false);
        });
    });

    context('GET /api/avatars/default/:index', () => {
        it('returns the first default avatar', async () => {
            await uploadDefaultAvatar('sfdc_default_avatar.png');
            const res = await request(app)
                .get('/api/avatars/default/0')
                .expect(200);

            expect(res.body).to.exist;
            expect(typeof res.body === 'object').to.be.true;
        });

        it('returns an error if requesting a default avatar that does not exist', async () => {
            const res = await request(app)
                .get('/api/avatars/default/1')
                .expect(500);

            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success');
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('error');
            expect(res.body.success).to.be.false;
        });
    });

    context('GET /api/avatars/:id', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns an avatar with the given id', async () => {
            // create a new user
            const user = await createUserUtil({
                name: 'Oliver Queen',
                email: 'oliver@qc.com',
                password: '123456'
            });

            // upload a custom avatar for the new user
            const uploadResponse = await request(app)
                .post(`/api/users/${user._id}/avatar`)
                .attach('avatar', `${__dirname}/../../assets/male3.png`)
                .expect(200);

            // get the avatar id
            let id = getAvatarId(uploadResponse);

            const res = await request(app)
                .get(`/api/avatars/${id}`)
                .expect(200);

            expect(res.body).to.exist;
            expect(typeof res.body === 'object').to.be.true;
        });
    });

    context('DELETE /api/avatars/:id', () => {
        afterEach(() => {
            dropCollection(dbConnection, 'users');
        });

        it('deletes a custom avatar with the given id', async () => {
            // create a new user
            const user = await createUserUtil({
                name: 'Oliver Queen',
                email: 'oliver@qc.com',
                password: '123456'
            });

            // upload a custom avatar for the new user
            const uploadResponse = await request(app)
                .post(`/api/users/${user._id}/avatar`)
                .attach('avatar', `${__dirname}/../../assets/male3.png`)
                .expect(200);

            // get the avatar id
            let id = getAvatarId(uploadResponse);

            const res = await request(app)
                .delete(`/api/avatars/${id}`)
                .expect(200);

            expectJSONShape(res.body);
            expect(res.body.success).to.be.true;
            expectAvatarShape(res.body.payload, true);
        });

        it('verifies avatar is reset to default when custom avatar is deleted', async () => {
            // create a new user
            const user = await createUserUtil({
                name: 'Oliver Queen',
                email: 'oliver@qc.com',
                password: '123456'
            });

            // upload a custom avatar for the new user
            const uploadResponse = await request(app)
                .post(`/api/users/${user._id}/avatar`)
                .attach('avatar', `${__dirname}/../../assets/male3.png`)
                .expect(200);

            // get the avatar id
            let avatarId = getAvatarId(uploadResponse);

            // delete the custom avatar
            const deleteResponse = await request(app)
                .delete(`/api/avatars/${avatarId}`)
                .expect(200);

            const userId = deleteResponse.body.payload.user;

            const res = await request(app)
                .get(`/api/users/${userId}`)
                .expect(200);

            const { avatarUrl, avatar } = res.body.payload.user;
            expectJSONShape(res.body, 'user');
            expect(avatarUrl).contains('default');
            expect(avatar).to.equal(null);
        });
    });
});
