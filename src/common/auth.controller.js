import jwt from 'jsonwebtoken';

import config from '../config/config';
import User from '../user/user.model';
import * as UserRepository from '../user/user.repository';

export function verifyToken(req) {
    return new Promise((resolve, reject) => {
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            try {
                const decoded = jwt.verify(token, config.token_secret);
                req.decoded = decoded;
                resolve(decoded);
            } catch (err) {
                reject({
                    success: false,
                    message: err.message,
                    error: err
                });
            }
        } else {
            reject({
                success: false,
                message: 'No token provided'
            });
        }
    });
}

export function protectRouteByUser(req) {
    return new Promise((resolve, reject) => {
        if (!req.decoded) {
            reject({
                success: false,
                message: 'Token has not yet been verified'
            });
        }
        if (req.decoded && req.decoded.sub === req.params.userid) {
            resolve({
                success: true,
                message: 'Authorized user for this route'
            });
        } else {
            resolve({
                success: false,
                message: 'Not an authorized user for this route'
            });
        }
    });
}

export function adminRoute(req) {
    return new Promise((resolve, reject) => {
        if (!req.decoded) {
            reject({
                success: false,
                message: 'Token has not yet been verified'
            });
        }
        User.findById(req.decoded.sub)
            .exec()
            .then(user => {
                if (user.isAdmin()) {
                    resolve({
                        success: true,
                        message: 'Authorized user for this route'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Not an authorized user for this route'
                    });
                }
            })
            .catch(err =>
                reject({
                    success: false,
                    message: err.message,
                    error: err
                })
            );
    });
}

export const protectAdminRoute = req => {
    return verifyToken(req)
        .then(decoded => {
            return UserRepository.getUser(decoded.sub).then(user => {
                if (user.isAdmin()) {
                    return Promise.resolve({
                        success: true,
                        message: 'Authorized user for this route'
                    });
                } else {
                    return Promise.resolve({
                        success: false,
                        message: 'Not an authorized user for this route'
                    });
                }
            });
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: err.message,
                error: err
            });
        });
};

export const getUpdatedLoggedInUser = req => {
    return verifyToken(req)
        .then(decoded => {
            return UserRepository.getUser(decoded.sub).then(user => {
                if (user._id) {
                    req.user = user;
                    return Promise.resolve({
                        success: true,
                        message: 'updating user',
                        payload: {
                            user
                        }
                    });
                } else {
                    return Promise.resolve({
                        success: false,
                        message: 'user not found'
                    });
                }
            });
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: err.message,
                error: err
            });
        });
};
