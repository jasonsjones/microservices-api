import { expect } from 'chai';
import sinon from 'sinon';
import 'sinon-mongoose';

import Avatar from './avatar.model';
import User from '../user/user.model';
import * as AvatarMiddleware from './avatar.model.middleware'

const mockAvatars = [
    {
      "_id": "59c44d83f2943200228467b0",
      "contentType": "image/png",
      "fileSize": 5012,
      "defaultImg": true,
      "user": null
    },
    {
      "_id": "59c44d85f2943200228467b4",
      "contentType": "image/png",
      "fileSize": 62079,
      "defaultImg": false,
      "user": "59c44d83f2943200228467b1"
    },
    {
      "_id": "59c44d9d0e584d00425c1722",
      "contentType": "image/png",
      "fileSize": 71955,
      "defaultImg": false,
      "user": "59c44d83f2943200228467b2"
    },
    {
      "_id": "59c44dc50e584d00425c1723",
      "contentType": "image/png",
      "fileSize": 138317,
      "defaultImg": false,
      "user": "59c44d83f2943200228467b3"
    },
    {
      "_id": "59e4062a4c3bc800574e895f",
      "contentType": "image/png",
      "fileSize": 117632,
      "defaultImg": false,
      "user": "59c6c317f9760b01a35c63b1"
    }
];


describe('Avatar model middleware', () => {
    let UserMock, stub, user, avatar;
    beforeEach(() => {
        const mockUser = {
            _id: mockAvatars[3].user,
            avatar: mockAvatars[3]._id,
            name: "Oliver Queen",
            email: "oliver@qc.com",
            avatarUrl: `http://localhost:3000/api/avatar/${mockAvatars[3]._id}`
        };
        user = new User(mockUser);
        avatar = new Avatar(mockAvatars[3]);
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
            UserMock.expects('findById').withArgs(avatar.user)
                .chain('exec')
                .resolves(stub());

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
            UserMock.expects('findById').withArgs(avatar.user)
                .chain('exec')
                .resolves(new Error("Ooops...something went wrong!"));

            const promise = AvatarMiddleware.removeAvatarRefFromUser(avatar);
            expect(promise).to.be.a('Promise');
            return promise.catch(err => {
                expect(err).to.exist;
                expect(err).to.be.an('Error');
            });
        });
    });
});
