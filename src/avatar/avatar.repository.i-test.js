import fs from 'fs';
import { expect } from 'chai';
import debug from 'debug';

import * as Repository from './avatar.repository';
import { dbConnection } from '../utils/dbTestUtils';

const log = debug('db:integration-test');

const dropAvatarCollection = () => {
    dbConnection.dropCollection('avatars', () => {
        log('dropped avatars collection');
    });
};

describe('Avatar repository integration tests', () => {

    after(() => {
        dropAvatarCollection();
    });

    context('uploadDefaultAvatar()', () => {
        it('saves a default avatar to the db', () => {
            const assetPath = `${__dirname}/../../assets`;
            const defaultAvatarFile = `${assetPath}/sfdc_default_avatar.png`;
            const avatar = {
                originalName: 'sfdc_default_avatar.png',
                mimetype: 'image/png',
                size: fs.statSync(defaultAvatarFile).size,
                path: defaultAvatarFile
            };
            return Repository.uploadDefaultAvatar(avatar, false)
                .then(response => {
                    expect(response).to.have.property('_id');
                    expect(response).to.have.property('data');
                    expect(response).to.have.property('fileSize');
                    expect(response).to.have.property('defaultImg');
                    expect(response).to.have.property('contentType');
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
});