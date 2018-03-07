import fs from 'fs';
import { expect } from 'chai';

import * as Repository from './avatar.repository';
import { dbConnection, dropAvatarCollection } from '../utils/dbTestUtils';

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

    after(() => {
        dropAvatarCollection(dbConnection);
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
                    defatultAvatarId = response._id;
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
                    customAvatarId = response._id;
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

    context('getAvatars()', () => {
        it('gets all the avatars', () => {
            return Repository.getAvatars()
                .then(response => {
                    expect(response).to.be.an('array');
                    expect(response.length).to.equal(2);
                    expectAvatarShape(response[0]);
                    expectAvatarShape(response[1]);
                });
        });
    });

    context('getAvatar()', () => {
        it('returns the avatar given the id', () => {
            return Repository.getAvatar(customAvatarId)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.defaultImg).to.be.false;
                });
        });

        it('returns the default avatar given the id', () => {
            return Repository.getAvatar(defatultAvatarId)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.defaultImg).to.be.true;
                });
        });

        it('returns null if an avatar does not exist with the given id', () => {
            const idDoesNotExist = "59c44d83f2943200228467b0";

            return Repository.getAvatar(idDoesNotExist)
                .then(response => {
                    expect(response).to.be.null;
                });
        });

        it('returns an error if the id paramater is not provided', () => {
            return Repository.getAvatar()
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('avatar id is required');
                });
        });
    });

    context('getDefaultAvatar()', () => {
        it('returns the first default avatar when passed index 0', () => {
            return Repository.getDefaultAvatar(0)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.defaultImg).to.be.true;
                });
        });

        it('returns an error if a default avatar does not exist at the give index', () => {
            return Repository.getDefaultAvatar(2)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('default avatar with index');
                    expect(error.message).to.contain('does not exist');
                });
        });

        it('returns an error if the index paramater is not provided', () => {
            return Repository.getDefaultAvatar()
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('default avatar index is required');
                });
        });
    });

    context('deleteAvatar()', () => {
        it('returns the deleted (custome) avatar given the id', () => {
            return Repository.deleteAvatar(customAvatarId)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.defaultImg).to.be.false;
                });
        });

        it('returns the deleted (default) avatar given the id', () => {
            return Repository.deleteAvatar(defatultAvatarId)
                .then(response => {
                    expectAvatarShape(response);
                    expect(response.defaultImg).to.be.true;
                });
        });

        it('returns an error if an avatar does not exist with the given id', () => {
            const idDoesNotExist = "59c44d83f2943200228467b0";

            return Repository.deleteAvatar(idDoesNotExist)
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('avatar does not exist with id ');
                });
        });

        it('returns an error if the id paramater is not provided', () => {
            return Repository.deleteAvatar()
                .catch(error => {
                    expect(error).to.exist;
                    expect(error.message).to.contain('avatar id is required');
                });
        });
    });
});