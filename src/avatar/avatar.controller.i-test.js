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

const expectErrorResponse = (errorResponse, errMsg) => {
    expect(errorResponse).to.have.property('success');
    expect(errorResponse).to.have.property('message');
    expect(errorResponse).to.have.property('error');
    expect(errorResponse.success).to.be.false;
    expect(errorResponse.message).to.contain(errMsg);
    expect(errorResponse.error instanceof Error).to.be.true;
};

describe('Avatar controller integration tests', () => {
    let customAvatarId;

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

            return Controller.uploadDefaultAvatar(req).then(response => {
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

            return Controller.uploadDefaultAvatar(req).catch(response => {
                expectErrorResponse(response, 'request parameter is required');
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
                    userId: '59c44d83f2943200228467b3'
                }
            };

            return Controller.uploadAvatar(req).then(response => {
                customAvatarId = response.payload._id;
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
            return Controller.uploadAvatar(req).catch(response => {
                expectErrorResponse(response, 'request parameter is required');
            });
        });
    });

    context('getAvatars()', () => {
        it('returns a json payload with all the avatars', () => {
            return Controller.getAvatars().then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response).to.have.property('payload');
                expect(response.payload).to.have.property('avatars');
                expect(response.payload.avatars).to.be.an('array');
                expect(response.payload.avatars).to.have.lengthOf(2);
                expect(response.success).to.be.true;
            });
        });
    });

    context('getAvatar()', () => {
        it('returns a json payload with given the id in req.params.id', () => {
            let req = {
                params: {
                    id: customAvatarId
                }
            };
            return Controller.getAvatar(req).then(response => {
                expect(response).to.have.property('contentType');
                expect(response).to.have.property('payload');
            });
        });

        it('returns error payload if avatar is not found with id', () => {
            let req = {
                params: {
                    id: '59c44d83f2943200228467b0' // this does not exist
                }
            };
            return Controller.getAvatar(req).catch(response => {
                expectErrorResponse(response, 'unable to find avatar');
            });
        });

        it('returns error payload if avatar id is not provided', () => {
            let req = {
                params: {
                    id: null
                }
            };
            return Controller.getAvatar(req).catch(response => {
                expectErrorResponse(response, 'request parameter is required');
            });
        });
    });

    context('getDefaultAvatar()', () => {
        it('returns a json payload with the given index', () => {
            let req = {
                params: {
                    index: 0
                }
            };
            return Controller.getDefaultAvatar(req).then(response => {
                expect(response).to.have.property('contentType');
                expect(response).to.have.property('payload');
            });
        });

        it('returns error payload if the index provided does not exist', () => {
            let req = {
                params: {
                    index: 3
                }
            };
            return Controller.getDefaultAvatar(req).catch(response => {
                expectErrorResponse(response, 'does not exist');
            });
        });

        it('returns error payload if default avatar index is not provided', () => {
            let req = {
                params: {
                    index: undefined
                }
            };
            return Controller.getDefaultAvatar(req).catch(response => {
                expectErrorResponse(response, 'request parameter is required');
            });
        });
    });

    context('deleteAvatar()', () => {
        it('deletes the avatar with the given id and returns a json payload', () => {
            let req = {
                params: {
                    id: customAvatarId
                }
            };
            return Controller.deleteAvatar(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response).to.have.property('payload');
                expect(response.success).to.be.true;
                expect(response.payload._id).to.eql(customAvatarId);
            });
        });

        it('returns error payload if avatar id is not provided', () => {
            let req = {
                params: {
                    id: null
                }
            };
            return Controller.deleteAvatar(req).catch(response => {
                expectErrorResponse(response, 'request parameter is required');
            });
        });
    });
});
