import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';

import * as Repository from './avatar.repository';
import * as Controller from './avatar.controller';
import Avatar from './avatar.model';
import { mockAvatars } from '../utils/avatarTestUtils';

describe('Avatar controller', () => {
    describe('getAvatars()', () => {
        let stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'getAvatars');
        });

        afterEach(() => {
            stub.restore();
        });

        it('sends a payload with an array of all avatars', async () => {
            stub.resolves(mockAvatars);

            const response = await Controller.getAvatars();

            expect(response).to.have.property('success');
            expect(response).to.have.property('payload');
            expect(response.payload).to.have.property('avatars');
            expect(response.success).to.be.true;
            expect(response.payload.avatars).to.be.an('Array');
        });

        it('sends a success false and message when error occurs', async () => {
            stub.rejects(new Error('Oops, something went wrong...'));

            try {
                await Controller.getAvatars();
            } catch (error) {
                expectErrorResponse(error);
            }
        });
    });

    describe('getAvatar()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'getAvatar');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('sends the avatar data in the response', async () => {
            stub.withArgs('default').resolves(mockAvatars[0]);
            req.params = {
                id: 'default'
            };
            const response = await Controller.getAvatar(req);

            expect(response).to.have.property('contentType');
            expect(response).to.have.property('payload');
            expect(response.payload).to.be.an('Object');
        });

        it('sends a success false and message when error occurs', async () => {
            stub.withArgs(mockAvatars[1]._id).rejects(new Error('Oops, something went wrong...'));

            req.params = {
                id: mockAvatars[1]._id
            };

            try {
                await Controller.getAvatar(req);
            } catch (error) {
                expectErrorResponse(error);
            }
        });

        it('rejects with error when avatar id is not provided', async () => {
            try {
                await Controller.getAvatar();
            } catch (error) {
                expectErrorResponse(error);
            }
        });

        it('rejects with error when avatar id is not provided', async () => {
            const badId = '59c44d83f2943200228467b9';
            stub.withArgs(badId).resolves(null);

            req.params = {
                id: badId
            };

            try {
                await Controller.getAvatar(req);
            } catch (error) {
                expectErrorResponse(error);
            }
        });
    });

    describe('getDefaultAvatar()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'getDefaultAvatar');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('sends the avatar data in the response', async () => {
            stub.withArgs(0).resolves(mockAvatars[0]);

            req.params = {
                index: 0
            };

            const response = await Controller.getDefaultAvatar(req);

            expect(response).to.have.property('contentType');
            expect(response).to.have.property('payload');
            expect(response.payload).to.be.an('Object');
        });

        it('sends a success false and message when error occurs', async () => {
            stub.withArgs(0).rejects(new Error('Oops, something went wrong...'));

            req.params = {
                index: 0
            };

            try {
                await Controller.getDefaultAvatar(req);
            } catch (error) {
                expectErrorResponse(error);
            }
        });

        it('rejects with error when index is not provided', async () => {
            try {
                await Controller.getDefaultAvatar();
            } catch (error) {
                expectErrorResponse(error);
            }
        });
    });

    describe('deleteAvatar()', () => {
        let req, stub;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'deleteAvatar');
            req = {};
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('deletes an avatar when called with avatar id', async () => {
            const modelStub = sinon.stub(Avatar.prototype, 'remove');
            modelStub.resolves(new Avatar(mockAvatars[1]));

            stub.withArgs(mockAvatars[1]._id).resolves(modelStub());

            req.params = {
                id: mockAvatars[1]._id
            };

            const response = await Controller.deleteAvatar(req);

            expect(response).to.have.property('success');
            expect(response).to.have.property('message');
            expect(response).to.have.property('payload');
            expect(response.success).to.be.true;
            expect(response.payload).to.be.an('Object');
            expect(response.payload).to.have.property('_id');
            expect(response.payload).to.have.property('contentType');
            expect(response.payload).to.have.property('user');
            expect(response.payload).to.have.property('fileSize');
            modelStub.restore();
        });

        it('sends a success false and message when error occurs', async () => {
            stub.withArgs(mockAvatars[1]._id).rejects(new Error('Oops, something went wrong...'));

            req.params = {
                id: mockAvatars[1]._id
            };

            try {
                await Controller.deleteAvatar(req);
            } catch (error) {
                expectErrorResponse(error);
            }
        });

        it('rejects with error when req is not provided', async () => {
            try {
                await Controller.deleteAvatar();
            } catch (error) {
                expectErrorResponse(error);
            }
        });
    });

    describe('uploadAvatar()', () => {
        let stub, req;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'uploadAvatar');
            req = {
                file: {
                    originalName: 'male3.png',
                    mimetype: 'image/png',
                    size: 62079,
                    path: __dirname + '/../../assets/male3.png'
                },
                params: {
                    userId: '59c44d83f2943200228467b3'
                }
            };
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns the avatar in payload when successfully uploaded', async () => {
            const avatar = Repository.makeAvatarModel(req.file, mockAvatars[1].user, false);
            stub.withArgs(req.file, req.params.userId).resolves(avatar);

            const response = await Controller.uploadAvatar(req);

            expect(response).to.have.property('success');
            expect(response).to.have.property('message');
            expect(response).to.have.property('payload');
            expect(response.success).to.be.true;
        });

        it('sends a success false and message when error occurs', async () => {
            stub.withArgs(req.file, req.params.userId).rejects(
                new Error('Oops, something went wrong uploading the image...')
            );

            try {
                await Controller.uploadAvatar(req);
            } catch (error) {
                expectErrorResponse(error);
            }
        });

        it('rejects with error when req.file is not provided', async () => {
            try {
                await Controller.uploadAvatar();
            } catch (error) {
                expectErrorResponse(error);
            }
        });
    });

    describe('uploadDefaultAvatar()', () => {
        let stub, req;
        beforeEach(() => {
            stub = sinon.stub(Repository, 'uploadDefaultAvatar');
            req = {
                file: {
                    originalName: 'default.png',
                    mimetype: 'image/png',
                    size: 5012,
                    path: __dirname + '/../../assets/sfdc_default_avatar.png'
                }
            };
        });

        afterEach(() => {
            stub.restore();
            req = {};
        });

        it('returns the default avatar in payload when successfully uploaded', async () => {
            const avatar = Repository.makeAvatarModel(req.file, null, false, true);
            stub.withArgs(req.file).resolves(avatar);

            const response = await Controller.uploadDefaultAvatar(req);

            expect(response).to.have.property('success');
            expect(response).to.have.property('message');
            expect(response).to.have.property('payload');
            expect(response.success).to.be.true;
            expect(response.payload.defaultImg).to.be.true;
            expect(response.payload.user).to.be.undefined;
        });

        it('sends a success false and message when error occurs', async () => {
            stub.withArgs(req.file).rejects(
                new Error('Oops, something went wrong uploading the image...')
            );

            try {
                await Controller.uploadDefaultAvatar(req);
            } catch (error) {
                expectErrorResponse(error);
            }
        });

        it('rejects with error when req.file is not provided', async () => {
            try {
                await Controller.uploadDefaultAvatar();
            } catch (error) {
                expectErrorResponse(error);
            }
        });
    });
});

const expectErrorResponse = response => {
    expect(response).to.have.property('success');
    expect(response).to.have.property('message');
    expect(response).to.have.property('error');
    expect(response.success).to.be.false;
    expect(response.error instanceof Error).to.be.true;
};
