import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import config from '../config/config';

export const generateToken = user => {
    if (!user) {
        throw new Error('user is required to generate token');
    }
    const token = jwt.sign(
        {
            sub: user._id,
            email: user.email
        },
        config.token_secret,
        { expiresIn: '24hr' }
    );

    return token;
};

export const verifyToken = token => {
    if (!token) {
        throw new Error('token is required to verify');
    }
    return jwt.verify(token, config.token_secret);
};

export const generateRandomToken = () => {
    return crypto.randomBytes(20).toString('hex');
};
