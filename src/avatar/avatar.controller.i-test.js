import fs from 'fs';
import { expect } from 'chai';

import * as Controller from './avatar.controller';
import { dbConnection, dropAvatarCollection } from '../utils/dbTestUtils';

const assetPath = `${__dirname}/../../assets`;
const defaultAvatarFile = `${assetPath}/sfdc_default_avatar.png`;

const makeAvatarFile = (name, path) => {
    const avatar = {
        originalName: name,
        mimetype: 'image/png',
        size: fs.statSync(path).size,
        path: path
    };
    return avatar;

};

describe('Avatar controller integration tests', () => {
    after(() => {
        dropAvatarCollection(dbConnection);
    });

    context('uploadDefaultAvatar()', () => {
        it('uploads default avatar to db and returns success payload', () => {
            const copyAvatarFilePath = `${assetPath}/duplicate_avatar.png`;
            fs.copyFileSync(defaultAvatarFile, copyAvatarFilePath);
            const avatar = makeAvatarFile('duplicate_avatar.png', copyAvatarFilePath);

            let req = {
                file: avatar
            };

            return Controller.uploadDefaultAvatar(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                });
        });

        it('returns error payload if avatar file is not provided', () => {
            let req = {
                file: null
            };

            return Controller.uploadDefaultAvatar(req)
                .catch(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('error');
                    expect(response.success).to.be.false;
                    expect(response.message).to.contain('request parameter is required');
                    expect(response.error instanceof Error).to.be.true;
                });
        });
    });

    context('uploadAvatar()', () => {
        it('uploads avatar to db and returns success payload', () => {
            const copyAvatarFilePath = `${assetPath}/duplicate_avatar.png`;
            const customAvatarFile = `${assetPath}/male3.png`;
            fs.copyFileSync(customAvatarFile, copyAvatarFilePath);
            const avatar = makeAvatarFile('duplicate_avatar.png', copyAvatarFilePath);

            let req = {
                file: avatar,
                params: {
                    userId: "59c44d83f2943200228467b3",
                }
            };

            return Controller.uploadAvatar(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('payload');
                    expect(response.success).to.be.true;
                });
        });

        it('returns error payload if avatar file is not provided', () => {
            let req = {
                file: null
            };

            return Controller.uploadAvatar(req)
                .catch(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response).to.have.property('error');
                    expect(response.success).to.be.false;
                    expect(response.message).to.contain('request parameter is required');
                    expect(response.error instanceof Error).to.be.true;
                });
        });
    });
});