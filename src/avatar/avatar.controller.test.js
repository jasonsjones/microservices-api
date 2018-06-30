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

        it('sends a payload with an array of all avatars', () => {
            stub.resolves(mockAvatars);

            return Controller.getAvatars().then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('payload');
                expect(response.payload).to.have.property('avatars');
                expect(response.success).to.be.true;
                expect(response.payload.avatars).to.be.an('Array');
            });
        });

        it('sends a success false and message when error occurs', () => {
            stub.rejects(new Error('Oops, something went wrong...'));

            return Controller.getAvatars().catch(response => {
                expectErrorResponse(response);
            });
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

        it('sends the avatar data in the response', () => {
            stub.withArgs('default').resolves(mockAvatars[0]);
            req.params = {
                id: 'default'
            };
            return Controller.getAvatar(req).then(response => {
                expect(response).to.have.property('contentType');
                expect(response).to.have.property('payload');
                expect(response.payload).to.be.an('Object');
            });
        });

        it('sends a success false and message when error occurs', () => {
            stub.withArgs(mockAvatars[1]._id).rejects(new Error('Oops, something went wrong...'));

            req.params = {
                id: mockAvatars[1]._id
            };

            return Controller.getAvatar(req).catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error when avatar id is not provided', () => {
            return Controller.getAvatar().catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error when avatar id is not provided', () => {
            const badId = '59c44d83f2943200228467b9';
            stub.withArgs(badId).resolves(null);

            req.params = {
                id: badId
            };

            return Controller.getAvatar(req).catch(response => {
                expectErrorResponse(response);
            });
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

        it('sends the avatar data in the response', () => {
            stub.withArgs(0).resolves(mockAvatars[0]);

            req.params = {
                index: 0
            };

            return Controller.getDefaultAvatar(req).then(response => {
                expect(response).to.have.property('contentType');
                expect(response).to.have.property('payload');
                expect(response.payload).to.be.an('Object');
            });
        });

        it('sends a success false and message when error occurs', () => {
            stub.withArgs(0).rejects(new Error('Oops, something went wrong...'));

            req.params = {
                index: 0
            };

            return Controller.getDefaultAvatar(req).catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error when index is not provided', () => {
            return Controller.getDefaultAvatar().catch(response => {
                expectErrorResponse(response);
            });
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

        it('deletes an avatar when called with avatar id', () => {
            const modelStub = sinon.stub(Avatar.prototype, 'remove');
            modelStub.resolves(new Avatar(mockAvatars[1]));

            stub.withArgs(mockAvatars[1]._id).resolves(modelStub());

            req.params = {
                id: mockAvatars[1]._id
            };

            return Controller.deleteAvatar(req).then(response => {
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
        });

        it('sends a success false and message when error occurs', () => {
            stub.withArgs(mockAvatars[1]._id).rejects(new Error('Oops, something went wrong...'));

            req.params = {
                id: mockAvatars[1]._id
            };

            return Controller.deleteAvatar(req).catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error when req is not provided', () => {
            return Controller.deleteAvatar().catch(response => {
                expectErrorResponse(response);
            });
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

        it('returns the avatar in payload when successfully uploaded', () => {
            const avatar = Repository.makeAvatarModel(req.file, mockAvatars[1].user, false);
            stub.withArgs(req.file, req.params.userId).resolves(avatar);

            return Controller.uploadAvatar(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response).to.have.property('payload');
                expect(response.success).to.be.true;
            });
        });

        it('sends a success false and message when error occurs', () => {
            stub
                .withArgs(req.file, req.params.userId)
                .rejects(new Error('Oops, something went wrong uploading the image...'));

            return Controller.uploadAvatar(req).catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error when req.file is not provided', () => {
            return Controller.uploadAvatar().catch(response => {
                expectErrorResponse(response);
            });
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

        it('returns the default avatar in payload when successfully uploaded', () => {
            const avatar = Repository.makeAvatarModel(req.file, null, false, true);
            stub.withArgs(req.file).resolves(avatar);

            return Controller.uploadDefaultAvatar(req).then(response => {
                expect(response).to.have.property('success');
                expect(response).to.have.property('message');
                expect(response).to.have.property('payload');
                expect(response.success).to.be.true;
                expect(response.payload.defaultImg).to.be.true;
                expect(response.payload.user).to.be.undefined;
            });
        });

        it('sends a success false and message when error occurs', () => {
            stub
                .withArgs(req.file)
                .rejects(new Error('Oops, something went wrong uploading the image...'));

            return Controller.uploadDefaultAvatar(req).catch(response => {
                expectErrorResponse(response);
            });
        });

        it('rejects with error when req.file is not provided', () => {
            return Controller.uploadDefaultAvatar().catch(response => {
                expectErrorResponse(response);
            });
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
