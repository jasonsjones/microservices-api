import config from '../config/config';
import * as UserRepository from './user.repository';
import * as AuthUtils from '../common/auth.utils';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from '../mailer/mailer-utils';

const buildError = msg => {
    return {
        success: false,
        message: msg,
        error: new Error(msg)
    };
};

export function getUsers() {
    return UserRepository.getUsers()
        .then(users => {
            return {
                success: true,
                message: 'fetched all the users',
                payload: {
                    users
                }
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: `error fetching users: ${err.message}`,
                error: err
            });
        });
}

export function getUser(req) {
    let includeAvatar = false;

    if (!req || !req.params || !req.params.id) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }

    if (req.query && req.query.includeAvatar === 'true') {
        includeAvatar = true;
    }

    return UserRepository.getUser(req.params.id, includeAvatar)
        .then(user => {
            return {
                success: true,
                message: 'fetched the user',
                payload: {
                    user
                }
            };
        })
        .catch(err => {
            return {
                success: false,
                message: `error getting user: ${err.message}`,
                error: err
            };
        });
}

export function updateUser(req) {
    if (!req) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }

    if (!req.params || !req.params.id) {
        return Promise.reject({
            success: false,
            message: 'user id is required',
            error: new Error('user id is required')
        });
    }

    if (!req.body) {
        return Promise.reject({
            success: false,
            message: 'user data is required',
            error: new Error('user data is required')
        });
    }

    return UserRepository.updateUser(req.params.id, req.body)
        .then(user => {
            return {
                success: true,
                message: 'user updated',
                payload: {
                    user: user.toClientJSON()
                }
            };
        })
        .catch(err => {
            return {
                success: false,
                message: `error updating user: ${err.message}`,
                error: err
            };
        });
}

export function deleteUser(req) {
    if (!req || !req.params || !req.params.id) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return UserRepository.deleteUser(req.params.id)
        .then(user => {
            return user.remove();
        })
        .then(user => {
            return {
                success: true,
                message: 'user removed',
                payload: {
                    user
                }
            };
        })
        .catch(err => {
            return {
                success: false,
                message: `error removing user: ${err.message}`,
                error: err
            };
        });
}

export function uploadUserAvatar(req) {
    if (!req) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }

    if (!req.params || !req.params.id) {
        return Promise.reject({
            success: false,
            message: 'user id is required',
            error: new Error('user id is required')
        });
    }

    if (!req.file) {
        return Promise.reject({
            success: false,
            message: 'avatar file is required',
            error: new Error('avatar file is required')
        });
    }

    return UserRepository.uploadUserAvatar(req.params.id, req.file)
        .then(user => {
            return {
                success: true,
                message: 'avatar uploaded and saved',
                payload: {
                    user: user.toClientJSON()
                }
            };
        })
        .catch(err => {
            return {
                success: false,
                message: `error uploading avatar: ${err.message}`,
                error: err
            };
        });
}

export function createUser(req) {
    if (!req || !req.body || !req.body.name || !req.body.email || !req.body.password) {
        const errorMsg = 'unable to create new user; user data is required';
        return Promise.reject({
            success: false,
            message: errorMsg,
            error: new Error(errorMsg)
        });
    }
    return UserRepository.createUser(req.body)
        .then(user => {
            return {
                success: true,
                message: 'new user saved',
                payload: {
                    user: user.toClientJSON(),
                    token: AuthUtils.generateToken(user)
                }
            };
        })
        .catch(err => {
            return {
                success: false,
                message: `error saving new user: ${err.message}`,
                error: err
            };
        });
}

export const unlinkSFDCAccount = req => {
    if (!req || !req.user) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return UserRepository.unlinkSFDCAccount(req.user)
        .then(user => {
            return {
                success: true,
                message: 'user sfdc account unlinked',
                payload: {
                    user: user.toClientJSON()
                }
            };
        })
        .catch(err => {
            return {
                success: false,
                message: `error unlinking the user: ${err.message}`,
                error: err
            };
        });
};

export function changePassword(req) {
    if (!req) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }

    if (!req.body || !req.body.email || !req.body.currentPassword || !req.body.newPassword) {
        return Promise.reject({
            success: false,
            message: 'request body is required',
            error: new Error('request body parameter is required')
        });
    }

    return UserRepository.changePassword(req.body)
        .then(user => {
            if (user) {
                return {
                    success: true,
                    message: 'user password changed'
                };
            }
        })
        .catch(err => {
            return {
                success: false,
                message: `error changing the password: ${err.message}`,
                error: err
            };
        });
}

export const getMe = req => {
    if (!req) {
        return Promise.reject(buildError('request parameter is required'));
    }
    if (req.user) {
        return Promise.resolve({
            success: true,
            message: 'updated user',
            payload: {
                user: req.user
            }
        });
    } else {
        return Promise.resolve({
            success: false,
            message: 'no user is logged in',
            payload: null
        });
    }
};

export const forgotPassword = req => {
    if (!req) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }

    if (!req.body || !req.body.email) {
        return Promise.reject({
            success: false,
            message: 'user email is required',
            error: new Error('user email is required')
        });
    }

    return UserRepository.generateAndSetResetToken(req.body.email)
        .then(user => {
            if (user) {
                return sendPasswordResetEmail(user);
            }
        })
        .then(data => {
            if (data && data.user && data.user.email) {
                return Promise.resolve({
                    success: true,
                    message: `reset email sent to ${data.user.email}`,
                    payload: {
                        email: data.user.email,
                        info: data.info
                    }
                });
            } else {
                return Promise.resolve({
                    success: false,
                    message: 'user not found',
                    payload: null
                });
            }
        })
        .catch(error => {
            return Promise.reject({
                success: false,
                message: error.message,
                error: error
            });
        });
};

export const getRandomUser = () => {
    return UserRepository.getRandomUser().then(user => {
        return {
            success: true,
            message: 'random user provided',
            payload: {
                user
            }
        };
    });
};

export const sendEmailVerification = user => sendEmailVerificationEmail(user);
