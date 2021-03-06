import debug from 'debug';
import fetch from 'node-fetch';
import request from 'supertest';
import { getUsers } from '../user/user.repository';
import { getAvatars } from '../avatar/avatar.repository';
import config from '../config/config';

const log = debug('db:seed');

const url = config.apiUrl;
const assetPath = `${__dirname}/../../assets`;
const defaultAvatarFile = `${assetPath}/sfdc_default_avatar.png`;
const initialUsers = [
    {
        name: {
            first: 'Oliver',
            last: 'Queen'
        },
        email: 'oliver@qc.com',
        roles: ['admin', 'user'],
        password: 'arrow'
    },
    {
        name: {
            first: 'John',
            last: 'Diggle'
        },
        email: 'dig@qc.com',
        password: 'spartan'
    },
    {
        name: {
            first: 'Felicity',
            last: 'Smoak'
        },
        email: 'felicity@qc.com',
        roles: ['admin', 'user'],
        password: 'felicity'
    },
    {
        name: {
            first: 'Roy',
            last: 'Harper'
        },
        email: 'roy@qc.com',
        password: 'arsenal'
    },
    {
        name: {
            first: 'Thea',
            last: 'Queen'
        },
        email: 'thea@qc.com',
        password: 'thea'
    }
];

const getResource = endpoint => {
    return fetch(`${url}${endpoint}`).then(response => response.json());
};

const seedAvatarImage = imgPath => {
    return request(url)
        .post('/api/avatars/default')
        .attach('avatar', imgPath);
};

const seedUser = userData => {
    return fetch(`${url}/api/users?verifyEmail=false`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json());
};

const getDefaultAvatars = avatars => {
    return avatars.filter(image => image.defaultImg);
};

const seedDefaultAvatarAPI = () => {
    return getResource('/api/avatars').then(data => {
        if (data.success) {
            const defaults = getDefaultAvatars(data.payload.avatars);
            if (defaults.length === 0) {
                log('adding default avatar...');
                return seedAvatarImage(defaultAvatarFile);
            } else {
                log('default avatar(s) already in db');
                return Promise.resolve('avatar not required');
            }
        }
    });
};

const seedDefaultAvatarDb = () => {
    return getAvatars().then(avatars => {
        const defaults = getDefaultAvatars(avatars);
        if (defaults.length === 0) {
            log('adding default avatar...');
            return seedAvatarImage(defaultAvatarFile);
        } else {
            log('default avatar(s) already in db');
            return Promise.resolve('avatar not required');
        }
    });
};

const seedDefaultUserAPI = () => {
    return getResource('/api/users').then(data => {
        if (data.success && data.payload.users.length === 0) {
            log('adding user...');
            // only seed oliver for now...
            return seedUser(initialUsers[0]);
        } else {
            log('users already in db');
            return Promise.resolve('users not required');
        }
    });
};

const seedDefaultUserDb = () => {
    return getUsers().then(users => {
        if (users.length === 0) {
            log('adding users...');
            let seedOliver = seedUser(initialUsers[0]);
            let seedDiggle = seedUser(initialUsers[1]);
            return Promise.all([seedOliver, seedDiggle]);
        } else {
            log('user(s) already in db...');
            return Promise.resolve('users not required');
        }
    });
};

export const seedData = () => {
    const userPromise = seedDefaultUserDb();
    const avatarPromise = seedDefaultAvatarDb();
    return Promise.all([userPromise, avatarPromise]);
};
