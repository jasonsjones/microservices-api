import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';

import Avatar from './avatar.model';
import User from '../user/user.model';
import * as AvatarMiddleware from './avatar.model.middleware';
import { mockAvatars } from '../utils/avatarTestUtils';

describe('Avatar model middleware', () => {
    let UserMock, stub, user, avatar;
    beforeEach(() => {
        const mockUser = {
            _id: mockAvatars[1].user,
            avatar: mockAvatars[1]._id,
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            avatarUrl: `http://localhost:3000/api/avatar/${mockAvatars[1]._id}`
        };
        user = new User(mockUser);
        avatar = new Avatar(mockAvatars[1]);
    });

    afterEach(() => {
        UserMock.restore();
        stub.restore();
        user = null;
        avatar = null;
    });

    describe('removeAvatarRefFromUser()', () => {
        it('removes the avatar ref and avatarUrl from user model', async () => {
            const expectedAvatarUrl = 'http://localhost:3000/api/avatar/default';

            stub = sinon.stub(User.prototype, 'save');
            stub.resolves(user);

            UserMock = sinon.mock(User);
            UserMock.expects('findById')
                .withArgs(avatar.user)
                .chain('exec')
                .resolves(user);

            expect(user.avatar).not.to.be.null;
            expect(user.avatarUrl).not.to.equal(expectedAvatarUrl);

            const data = await AvatarMiddleware.removeAvatarRefFromUser(avatar);

            expect(data.avatar).to.be.null;
            expect(data.avatarUrl).to.equal(expectedAvatarUrl);
        });

        it('rejects with error if something goes wrong', async () => {
            UserMock = sinon.mock(User);
            UserMock.expects('findById')
                .withArgs(avatar.user)
                .chain('exec')
                .resolves(new Error('Ooops...something went wrong!'));

            try {
                await AvatarMiddleware.removeAvatarRefFromUser(avatar);
            } catch (error) {
                expect(error).to.exist;
                expect(error).to.be.an('Error');
            }
        });
    });
});
