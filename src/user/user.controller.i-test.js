import fs from 'fs';
import { expect } from 'chai';

import * as Controller from './user.controller';
import { dbConnection, dropCollection } from '../utils/dbTestUtils';

const users = [
    {
        name: 'Barry Allen',
        email: 'barry@starlabs.com',
        password: '123456'
    },
    {
        name: 'Oliver Queen',
        email: 'oliver@qc.com',
        password: '123456'
    }
];

const getCopyOfAvatar = () => {
    const assetPath = `${__dirname}/../../assets`;
    const copyAvatarFilePath = `${assetPath}/duplicate_avatar.png`;
    const customAvatarFile = `${assetPath}/male3.png`;
    fs.copyFileSync(customAvatarFile, copyAvatarFilePath);

    const avatar = {
        originalName: 'duplicate_avatar.png',
        mimetype: 'image/png',
        size: fs.statSync(copyAvatarFilePath).size,
        path: copyAvatarFilePath
    };
    return avatar;
};

const expectUserShape = res => {
    expect(res).to.have.property('_id');
    expect(res).to.have.property('name');
    expect(res).to.have.property('email');
    expect(res).to.have.property('password');
    expect(res).to.have.property('roles');
    expect(res).to.have.property('avatarUrl');
    expect(res).to.have.property('createdAt');
    expect(res).to.have.property('updatedAt');
};

const expectClientJSONUserShape = res => {
    expect(res).to.have.property('id');
    expect(res).to.have.property('name');
    expect(res).to.have.property('email');
    expect(res).to.have.property('roles');
    expect(res).to.have.property('avatarUrl');
    expect(res).to.have.property('hasSFDCProfile');
};

const expectErrorResponse = (errorResponse, errMsg) => {
    expect(errorResponse).to.have.property('success');
    expect(errorResponse).to.have.property('message');
    expect(errorResponse).to.have.property('error');
    expect(errorResponse.success).to.be.false;
    expect(errorResponse.message).to.contain(errMsg);
    expect(errorResponse.error instanceof Error).to.be.true;
};

describe('User controller integration tests', () => {

    context('signUpUser()', () => {
        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('returns error payload if the user data is not provided', () => {
            return Controller.signupUser()
                .catch(error => {
                    expectErrorResponse(error, 'request parameter is required');
                });
        });

        it('creates a new user', () => {
            let req = {
                body: users[0]
            };
            return Controller.signupUser(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response.success).to.be.true;
                    expectUserShape(response.payload.user);
                });
        });
    });

    context('uploadUserAvatar()', () => {
        let barryId;
        before(() => {
            return Controller.signupUser({body: users[0]})
                .then(response => {
                    barryId = response.payload.user._id;
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        it('returns error payload if the request is not provided', () => {
            return Controller.uploadUserAvatar()
                .catch(error => {
                    expectErrorResponse(error, 'request parameter is required');
                });
        });

        it('returns error payload if the avatar is not provided', () => {
            let req = {
                params: {
                    id: barryId
                }
            };
            return Controller.uploadUserAvatar(req)
                .catch(error => {
                    expectErrorResponse(error, 'avatar file is required');
                });
        });

        it('returns error payload if the user id is not provided', () => {
            const avatar = getCopyOfAvatar();

            let req = {
                file: avatar
            };
            return Controller.uploadUserAvatar(req)
                .catch(error => {
                    expectErrorResponse(error, 'user id is required');
                });
        });

        it('uploads a custom user avatar', () => {
            const avatar = getCopyOfAvatar();

            let req = {
                file: avatar,
                params: {
                    id: barryId
                }
            };
            return Controller.uploadUserAvatar(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response.success).to.be.true;
                    expectClientJSONUserShape(response.payload.user);
                    expect(response.payload.user.avatarUrl).not.to.contain('default');
                });
        });
    });

    context('changePassword()', () => {
        let barryId;
        before(() => {
            return Controller.signupUser({body: users[0]})
                .then(response => {
                    barryId = response.payload.user._id;
                    Controller.signupUser({body: users[1]});
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
        });

        it('changes the user\'s password', () => {
            const req = {
                params: {
                    id: barryId
                },
                body: {
                    email: 'barry@starlabs.com',
                    currentPassword: '123456',
                    newPassword: 'password'
                }
            };

            return Controller.changePassword(req)
                .then(response => {
                    expect(response).to.have.property('success');
                    expect(response).to.have.property('message');
                    expect(response.success).to.be.true;
                });
        });

        it('returns an error if the request parameter is not provided', () => {
            return Controller.changePassword()
                .catch(error => {
                    expectErrorResponse(error, 'request parameter is required');
                });
        });

        it('returns an error if the required user data is not provided', () => {
            const req = {
                params: {
                    id: barryId
                }
            };
            return Controller.changePassword(req)
                .catch(error => {
                    expectErrorResponse(error, 'request body is required');
                });
        });
    });

    context('user fetching and mutating related tests', () => {
        let barryId;
        before(() => {
            return Controller.signupUser({body: users[0]})
                .then(response => {
                    barryId = response.payload.user._id;
                    Controller.signupUser({body: users[1]});
                });
        });

        after(() => {
            dropCollection(dbConnection, 'users');
            dropCollection(dbConnection, 'avatars');
        });

        context('getUsers()', () => {
            it('returns all the users', () => {
                return Controller.getUsers()
                    .then(response => {
                        expect(response).to.have.property('success');
                        expect(response).to.have.property('message');
                        expect(response).to.have.property('payload');
                        expect(response.success).to.be.true;
                        expect(response.payload.users).to.be.an('array');
                        expectUserShape(response.payload.users[0]);
                        expectUserShape(response.payload.users[1]);
                    });
            });
        });

        context('getUser()', () => {
            it('returns a payload with the user of the given id', () => {
                return Controller.getUser({params: {id: barryId}})
                    .then(response => {
                        expect(response).to.have.property('success');
                        expect(response).to.have.property('message');
                        expect(response).to.have.property('payload');
                        expect(response.success).to.be.true;
                    });
            });

            it('returns a payload with the user and includes the avatar model', () => {
                const avatar = getCopyOfAvatar();
                const req = {
                    params: {
                        id: barryId
                    },
                    file: avatar,
                    query: {
                        includeAvatar: "true"
                    }
                };
                return Controller.uploadUserAvatar(req)
                    .then(() => Controller.getUser(req))
                    .then(response => {
                        expectUserShape(response.payload.user);
                        expect(response.payload.user.avatar).to.exist;
                        expect(response.payload.user.avatar).to.be.an('object');
                        expect(response.payload.user.avatar).to.have.property('_id');
                        expect(response.payload.user.avatar).to.have.property('contentType');
                        expect(response.payload.user.avatar).to.have.property('defaultImg');
                    });
            });

            it('returns error payload if the request is not provided', () => {
                return Controller.getUser()
                    .catch(error => {
                        expectErrorResponse(error, 'request parameter is required');
                    });
            });
        });

        context('updateUser()', () => {
            it('updates the user with the provided data', () => {
                const req = {
                    params: {
                        id: barryId
                    },
                    body: {
                        name: 'The Flash',
                        email: 'flash@starlabs.com'
                    }
                };
                return Controller.updateUser(req)
                    .then(response => {
                        expect(response).to.have.property('success');
                        expect(response).to.have.property('message');
                        expect(response).to.have.property('payload');
                        expect(response.success).to.be.true;
                        expectClientJSONUserShape(response.payload.user);
                        expect(response.payload.user.name).to.not.equal(users[0].name);
                        expect(response.payload.user.email).to.not.equal(users[0].email);
                    });
            });

            it('returns an error if the request parameter is not provided', () => {
                return Controller.updateUser()
                    .catch(error => {
                        expectErrorResponse(error, 'request parameter is required');
                    });
            });

            it('returns an error if the user id is not provided', () => {
                const req = {
                    body: {
                        name: 'The Flash'
                    }
                };
                return Controller.updateUser(req)
                    .catch(error => {
                        expectErrorResponse(error, 'user id is required');
                    });
            });

            it('returns an error if the new user data is not provided', () => {
                const req = {
                    params: {
                        id: barryId
                    }
                };
                return Controller.updateUser(req)
                    .catch(error => {
                        expectErrorResponse(error, 'user data is required');
                    });
            });
        });

        context('deleteUser()', () => {
            it('returns error payload if the request is not provided', () => {
                return Controller.deleteUser()
                    .catch(error => {
                        expectErrorResponse(error, 'request parameter is required');
                    });
            });

            it('returns the a payload with the user that was just deleted', () => {
                const req = {
                    params: {
                        id: barryId
                    }
                };
                return Controller.deleteUser(req)
                    .then(response => {
                        expect(response).to.have.property('success');
                        expect(response).to.have.property('message');
                        expect(response).to.have.property('payload');
                        expect(response.success).to.be.true;
                        expectUserShape(response.payload.user);
                        expect(response.payload.user._id).to.eql(barryId);
                    });
            });

        });
    });

});