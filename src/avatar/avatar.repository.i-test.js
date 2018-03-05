import fs from 'fs';
import { expect } from 'chai';
import debug from 'debug';

import * as Repository from './avatar.repository';
import { dbConnection } from '../utils/dbTestUtils';

const log = debug('db:integration-test');
const assetPath = `${__dirname}/../../assets`;

const dropAvatarCollection = () => {
    dbConnection.dropCollection('avatars', () => {
        log('dropped avatars collection');
    });
};

const expectAvatarShape = response => {
    expect(response).to.have.property('_id');
    expect(response).to.have.property('data');
    expect(response).to.have.property('fileSize');
    expect(response).to.have.property('defaultImg');
    expect(response).to.have.property('contentType');
};

describe('Avatar repository integration tests', () => {

    after(() => {
        dropAvatarCollection();
    });

    context('uploadDefaultAvatar()', () => {
        it('saves a default avatar to the db', () => {
            const defaultAvatarFile = `${assetPath}/sfdc_default_avatar.png`;
            const avatar = {
                originalName: 'sfdc_default_avatar.png',
                mimetype: 'image/png',
                size: fs.statSync(defaultAvatarFile).size,
                path: defaultAvatarFile
            };
            return Repository.uploadDefaultAvatar(avatar, false)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.contentType).to.equal('image/png');
                    expect(response.defaultImg).to.be.true;
                });
        });

        it('returns an error if the avatar file is not provided', () => {
            return Repository.uploadDefaultAvatar(null, false)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('file is required');
                });
        });
    });

    context('uploadAvatar()', () => {
        it('saves an avatar to the db', () => {
            const avatarFile = `${assetPath}/male3.png`;
            const userId = "59c44d83f2943200228467b1";
            const avatar = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: fs.statSync(avatarFile).size,
                path: avatarFile
            };
            return Repository.uploadAvatar(avatar, userId, false)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.contentType).to.equal('image/png');
                    expect(response.defaultImg).to.be.false;
                });
        });
        it('returns an error if the avatar file is not provided', () => {
            const userId = "59c44d83f2943200228467b1";
            return Repository.uploadAvatar(null, userId, false)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('file is required');
                });
        });
        it('returns an error if the userId is not provided', () => {
            const avatarFile = `${assetPath}/male3.png`;
            const avatar = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: fs.statSync(avatarFile).size,
                path: avatarFile
            };
            return Repository.uploadAvatar(avatar, null, false)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('user id is required');
                });
        });
    });
});