import fs from 'fs';
import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';

import Avatar from './avatar.model';
import * as AvatarRepository from './avatar.repository';
import { mockAvatars } from '../utils/avatarTestUtils';

describe('Avatar Repository', () => {
    let AvatarMock;
    afterEach(() => {
        AvatarMock.restore();
    });

    describe('getAvatars()', () => {
        it('resolves to an array of avatars', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('find')
                .withArgs({})
                .chain('exec')
                .resolves(mockAvatars);

            const avatars = await AvatarRepository.getAvatars({}, '');

            expect(avatars).to.be.an('array');
            expect(avatars.length).to.equal(3);
        });

        it('rejects with an error if something went wrong', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('find')
                .withArgs({})
                .chain('exec')
                .rejects(new Error('Oops, something went wrong...'));

            try {
                await AvatarRepository.getAvatars();
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });

    describe('getAvatar()', () => {
        it('with avatar id resolves to the avatar with that id', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('findById')
                .withArgs(mockAvatars[1]._id)
                .chain('exec')
                .resolves(mockAvatars[1]);

            const avatar = await AvatarRepository.getAvatar(mockAvatars[1]._id);

            expect(avatar).to.be.an('object');
            expect(avatar).to.have.property('contentType');
            expect(avatar).to.have.property('fileSize');
            expect(avatar).to.have.property('defaultImg');
            expect(avatar).to.have.property('user');
            expect(avatar.defaultImg).to.equal(false);
            expect(avatar.user).not.to.be.null;
        });

        it('with avatar id rejects with error if something goes wrong with the lookup', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('findById')
                .withArgs(mockAvatars[1]._id)
                .chain('exec')
                .rejects(new Error('Oops, something went wrong getting image'));

            try {
                await AvatarRepository.getAvatar(mockAvatars[1]._id);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if the id param is not provided', async () => {
            try {
                await AvatarRepository.getAvatar();
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });

    describe('getDefaultAvatar()', () => {
        it('with index resolves to the default image', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('find')
                .withArgs({ defaultImg: true })
                .chain('exec')
                .resolves([mockAvatars[0]]);

            const avatar = await AvatarRepository.getDefaultAvatar(0);

            expect(avatar).to.be.an('object');
            expect(avatar).to.have.property('contentType');
            expect(avatar).to.have.property('fileSize');
            expect(avatar).to.have.property('defaultImg');
            expect(avatar).to.have.property('user');
            expect(avatar.defaultImg).to.equal(true);
            expect(avatar.user).to.be.undefined;
        });

        it('rejects with error if the index is out of bounds', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('find')
                .withArgs({ defaultImg: true })
                .chain('exec')
                .resolves([mockAvatars[0]]);

            try {
                await AvatarRepository.getDefaultAvatar(3);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if the index is not provided', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('find')
                .withArgs({ defaultImg: true })
                .chain('exec')
                .resolves([mockAvatars[0]]);

            try {
                await AvatarRepository.getDefaultAvatar();
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if something goes wrong getting the default avatars from the db', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('find')
                .withArgs({ defaultImg: true })
                .chain('exec')
                .rejects(new Error('Oops, something went wrong getting default image'));

            try {
                await AvatarRepository.getDefaultAvatar(1);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });

    describe('deleteAvatar()', () => {
        it('with avatar id rejects with error if something goes wrong with the lookup', async () => {
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('findById')
                .withArgs(mockAvatars[2]._id)
                .chain('exec')
                .rejects(new Error('Oops, something went wrong getting image'));

            try {
                await AvatarRepository.deleteAvatar(mockAvatars[2]._id);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('with avatar id resolves with avatar.remove()', async () => {
            const stub = sinon.stub(Avatar.prototype, 'remove');
            stub.resolves(new Avatar(mockAvatars[2]));

            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('findById')
                .withArgs(mockAvatars[2]._id)
                .chain('exec')
                .resolves(stub());

            const avatar = await AvatarRepository.deleteAvatar(mockAvatars[2]._id);
            expect(avatar).to.be.an('object');
            expect(stub.called).to.equal(true);
            stub.restore();
        });

        it('with invalid avatar resovles with error', async () => {
            const invalidId = '59c44d85f2943400228467b4';
            AvatarMock = sinon.mock(Avatar);
            AvatarMock.expects('findById')
                .withArgs(invalidId)
                .chain('exec')
                .resolves(null);

            try {
                await AvatarRepository.deleteAvatar(invalidId);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if the id param is not provided', async () => {
            try {
                await AvatarRepository.deleteAvatar();
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });

    describe('makeAvatarModel()', () => {
        it('returns an avatar model', () => {
            const file = {
                originalName: 'male3.png',
                mimetype: 'image/png',
                size: 62079,
                path: __dirname + '/../../assets/male3.png'
            };
            const avatar = AvatarRepository.makeAvatarModel(
                file,
                mockAvatars[1].user,
                false,
                false
            );
            expect(avatar).to.exist;
            expect(avatar).to.have.property('_id');
            expect(avatar).to.have.property('user');
            expect(avatar).to.have.property('fileSize');
            expect(avatar).to.have.property('contentType');
            expect(avatar).to.have.property('defaultImg');
            expect(avatar).to.have.property('data');
            expect(avatar.defaultImg).to.be.false;
        });

        it('returns a default avatar model', () => {
            const file = {
                originalName: 'default.png',
                mimetype: 'image/png',
                size: 5012,
                path: __dirname + '/../../assets/sfdc_default_avatar.png'
            };
            const avatar = AvatarRepository.makeAvatarModel(file, mockAvatars[1].user, false, true);
            expect(avatar).to.exist;
            expect(avatar).to.have.property('_id');
            expect(avatar).to.have.property('user');
            expect(avatar).to.have.property('fileSize');
            expect(avatar).to.have.property('contentType');
            expect(avatar).to.have.property('defaultImg');
            expect(avatar).to.have.property('data');
            expect(avatar.defaultImg).to.be.true;
        });
    });

    describe('uploadAvatar()', () => {
        let file, userId, stub;
        beforeEach(() => {
            file = {
                originalName: 'default.png',
                mimetype: 'image/png',
                size: 62079,
                path: __dirname + '/../../assets/male3.png'
            };
            userId = mockAvatars[1].user;
            stub = sinon.stub(Avatar.prototype, 'save');
        });

        afterEach(() => {
            file = null;
            userId = '';
            stub.restore();
        });

        it('generates the avatar model and saves to db', async () => {
            const avatar = AvatarRepository.makeAvatarModel(file, userId, false, false);
            stub.resolves(avatar);

            const response = await AvatarRepository.uploadAvatar(file, userId, false);

            expect(response).to.exist;
            expect(response).to.have.property('_id');
            expect(response).to.have.property('user');
            expect(response).to.have.property('fileSize');
            expect(response).to.have.property('contentType');
            expect(response).to.have.property('defaultImg');
            expect(response).to.have.property('data');
            expect(response.user.toString()).to.equal(mockAvatars[1].user);
        });

        it('generates the avatar model and saves to db then deletes the file for fs', async () => {
            fs.copyFileSync(file.path, `${__dirname}/../../assets/avatarCopy.png`);
            const copyiedAvatar = {
                originalName: 'avatarCopy.png',
                mimetype: 'image/png',
                size: 62079,
                path: __dirname + '/../../assets/avatarCopy.png'
            };
            const avatar = AvatarRepository.makeAvatarModel(copyiedAvatar, userId, false, false);
            stub.resolves(avatar);

            const response = await AvatarRepository.uploadAvatar(copyiedAvatar, userId);

            expect(response).to.exist;
            expect(response).to.have.property('_id');
            expect(response).to.have.property('user');
            expect(response).to.have.property('fileSize');
            expect(response).to.have.property('contentType');
            expect(response).to.have.property('defaultImg');
            expect(response).to.have.property('data');
            expect(response.user.toString()).to.equal(mockAvatars[1].user);
            expect(fs.existsSync(copyiedAvatar.path)).to.be.false;
        });

        it('catches an error if the avatar is unable to be saved to db', async () => {
            stub.rejects(new Error('Oops, unable to save avatar to db'));

            try {
                await AvatarRepository.uploadAvatar(file, userId, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if the file param is not provided', async () => {
            try {
                await AvatarRepository.uploadAvatar(null, userId, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if the id param is not provided', async () => {
            try {
                await AvatarRepository.uploadAvatar(file, null, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });

    describe('uploadDefaultAvatar()', () => {
        let file, stub;
        beforeEach(() => {
            file = {
                originalName: 'default.png',
                mimetype: 'image/png',
                size: 5012,
                path: __dirname + '/../../assets/sfdc_default_avatar.png'
            };
            stub = sinon.stub(Avatar.prototype, 'save');
        });

        afterEach(() => {
            file = null;
            stub.restore();
        });

        it('generates a default avatar model and saves to db', async () => {
            const avatar = AvatarRepository.makeAvatarModel(file, null, false, true);
            stub.resolves(avatar);

            const response = await AvatarRepository.uploadDefaultAvatar(file, false);

            expect(response).to.exist;
            expect(response).to.have.property('_id');
            expect(response).to.have.property('user');
            expect(response).to.have.property('fileSize');
            expect(response).to.have.property('contentType');
            expect(response).to.have.property('defaultImg');
            expect(response).to.have.property('data');
            expect(response.user).to.be.undefined;
        });

        it('catches an error if the avatar is unable to be saved to db', async () => {
            stub.rejects(new Error('Oops, unable to save avatar to db'));

            try {
                await AvatarRepository.uploadDefaultAvatar(file, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });

        it('rejects with error if the file param is not provided', async () => {
            try {
                await AvatarRepository.uploadDefaultAvatar(null, false);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });
});
