import fs from 'fs';
import { expect } from 'chai';

import Avatar from './avatar.model';
import * as Repository from './avatar.repository';
import { dbConnection, deleteCollection } from '../utils/dbTestUtils';

const assetPath = `${__dirname}/../../assets`;

const expectAvatarShape = response => {
    expect(response).to.have.property('_id');
    expect(response).to.have.property('data');
    expect(response).to.have.property('fileSize');
    expect(response).to.have.property('defaultImg');
    expect(response).to.have.property('contentType');
};

describe('Avatar repository integration tests', () => {
    let defatultAvatarId, customAvatarId;

    after(async () => await deleteCollection(dbConnection, Avatar, 'avatars'));

    context('uploadDefaultAvatar()', () => {
        it('saves a default avatar to the db', async () => {
            const defaultAvatarFile = `${assetPath}/sfdc_default_avatar.png`;
            const avatar = {
                originalName: 'sfdc_default_avatar.png',
                mimetype: 'image/png',
                size: fs.statSync(defaultAvatarFile).size,
                path: defaultAvatarFile
            };
            const response = await Repository.uploadDefaultAvatar(avatar, false);
            defatultAvatarId = response._id;

            expectAvatarShape(response);
            expect(response.contentType).to.equal('image/png');
            expect(response.defaultImg).to.be.true;
        });

        it('returns an error if the avatar file is not provided', async () => {
            try {
                await Repository.uploadDefaultAvatar(null, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('file is required');
            }
        });
    });

    context('uploadAvatar()', () => {
        it('saves an avatar to the db', async () => {
            const avatarFile = `${assetPath}/male3.png`;
            const userId = '59c44d83f2943200228467b1';
            const avatar = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: fs.statSync(avatarFile).size,
                path: avatarFile
            };
            const response = await Repository.uploadAvatar(avatar, userId, false);
            customAvatarId = response._id;

            expectAvatarShape(response);
            expect(response.contentType).to.equal('image/png');
            expect(response.defaultImg).to.be.false;
        });

        it('returns an error if the avatar file is not provided', async () => {
            const userId = '59c44d83f2943200228467b1';
            try {
                await Repository.uploadAvatar(null, userId, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('file is required');
            }
        });

        it('returns an error if the userId is not provided', async () => {
            const avatarFile = `${assetPath}/male3.png`;
            const avatar = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: fs.statSync(avatarFile).size,
                path: avatarFile
            };

            try {
                await Repository.uploadAvatar(avatar, null, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('user id is required');
            }
        });
    });

    context('getAvatars()', () => {
        it('gets all the avatars', async () => {
            const response = await Repository.getAvatars();
            expect(response).to.be.an('array');
            expect(response.length).to.equal(2);
            expectAvatarShape(response[0]);
            expectAvatarShape(response[1]);
        });
    });

    context('getAvatar()', () => {
        it('returns the avatar given the id', async () => {
            const response = await Repository.getAvatar(customAvatarId);
            expectAvatarShape(response);
            expect(response._id).to.eql(customAvatarId);
            expect(response.defaultImg).to.be.false;
        });

        it('returns the default avatar given the id', async () => {
            const response = await Repository.getAvatar(defatultAvatarId);
            expectAvatarShape(response);
            expect(response._id).to.eql(defatultAvatarId);
            expect(response.defaultImg).to.be.true;
        });

        it('returns null if an avatar does not exist with the given id', async () => {
            const idDoesNotExist = '59c44d83f2943200228467b0';
            const response = await Repository.getAvatar(idDoesNotExist);
            expect(response).to.be.null;
        });

        it('returns an error if the id paramater is not provided', async () => {
            try {
                await Repository.getAvatar();
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('avatar id is required');
            }
        });
    });

    context('getDefaultAvatar()', () => {
        it('returns the first default avatar when passed index 0', async () => {
            const response = await Repository.getDefaultAvatar(0);
            expectAvatarShape(response);
            expect(response._id).to.eql(defatultAvatarId);
            expect(response.defaultImg).to.be.true;
        });

        it('returns an error if a default avatar does not exist at the give index', async () => {
            try {
                await Repository.getDefaultAvatar(2);
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('default avatar with index');
                expect(error.message).to.contain('does not exist');
            }
        });

        it('returns an error if the index paramater is not provided', async () => {
            try {
                await Repository.getDefaultAvatar();
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('default avatar index is required');
            }
        });
    });

    context('deleteAvatar()', () => {
        it('returns the deleted (custome) avatar given the id', async () => {
            const response = await Repository.deleteAvatar(customAvatarId);
            expectAvatarShape(response);
            expect(response._id).to.eql(customAvatarId);
            expect(response.defaultImg).to.be.false;
        });

        it('returns the deleted (default) avatar given the id', async () => {
            const response = await Repository.deleteAvatar(defatultAvatarId);
            expectAvatarShape(response);
            expect(response._id).to.eql(defatultAvatarId);
            expect(response.defaultImg).to.be.true;
        });

        it('returns an error if an avatar does not exist with the given id', async () => {
            const idDoesNotExist = '59c44d83f2943200228467b0';
            try {
                await Repository.deleteAvatar(idDoesNotExist);
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('avatar does not exist with id ');
            }
        });

        it('returns an error if the id paramater is not provided', async () => {
            try {
                await Repository.deleteAvatar();
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.contain('avatar id is required');
            }
        });
    });
});
