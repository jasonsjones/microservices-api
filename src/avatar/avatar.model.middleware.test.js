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
        it('removes the avatar ref and avatarUrl from user model', () => {
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

            const promise = AvatarMiddleware.removeAvatarRefFromUser(avatar);

            expect(promise).to.be.a('Promise');
            promise.then(data => {
                expect(data.avatar).to.be.null;
                expect(data.avatarUrl).to.equal(expectedAvatarUrl);
            });
        });

        it('rejects with error if something goes wrong', () => {
            UserMock = sinon.mock(User);
            UserMock.expects('findById')
                .withArgs(avatar.user)
                .chain('exec')
                .resolves(new Error('Ooops...something went wrong!'));

            const promise = AvatarMiddleware.removeAvatarRefFromUser(avatar);
            expect(promise).to.be.a('Promise');
            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });
});
