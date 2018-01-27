import jwt from 'jsonwebtoken';

import Config from '../config/config';

const config = Config[process.env.NODE_ENV];

export const generateToken = (user) => {
    if (!user) {
        throw new Error('user is required to generate token');
    }
    const token = jwt.sign({
        sub: user._id,
        email: user.email
    }, config.token_secret, {expiresIn: '24hr'});

    return token;
};

export const verifyToken = (token) => {
    if (!token) {
        throw new Error('token is required to verify');
    }
    return jwt.verify(token, config.token_secret);
}
