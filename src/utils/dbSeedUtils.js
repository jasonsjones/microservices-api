import fs from 'fs';
import debug from 'debug';
import fetch from 'node-fetch';
import Config from '../config/config';
import { uploadDefaultAvatar } from '../avatar/avatar.repository';

const env = process.env.NODE_ENV || "development";
const config = Config[env];

const log = debug('db:seed');

const baseUrl = `${config.baseUrl}:${config.port}`;
const assetPath = `${__dirname}/../../assets`;
const defaultAvatarFile = `${assetPath}/sfdc_default_avatar.png`;
const initialUsers = [
    {
        name: "Oliver Queen",
        email: "oliver@qc.com",
        roles: ["admin", "user"],
        password: "arrow"
    },
    {
        name: "John Diggle",
        email: "dig@qc.com",
        password: "spartan"
    },
    {
        name: "Felicity Smoak",
        email: "felicity@qc.com",
        roles: ["admin", "user"],
        password: "felicity"
    },
    {
        name: "Roy Harper",
        email: "roy@qc.com",
        password: "arsenal"
    },
    {
        name: "Thea Queen",
        email: "thea@qc.com",
        password: "thea"
    }
];

const getResource = (endpoint) => {
    return fetch(`${baseUrl}${endpoint}`)
        .then(response => response.json());
};

const seedDefaultAvatarImage = () => {
    const avatar = {
        originalName: 'sfdc_default_avatar.png',
        mimetype: 'image/png',
        size: fs.statSync(defaultAvatarFile).size,
        path: defaultAvatarFile
    };
    // Utilize the repository function here to add the image to the db
    // for some reason, not able to create an HTML File obj to attach
    // to the payload to use the POST endpoint (/api/avatar/default)
    return uploadDefaultAvatar(avatar, false);
};

const seedUser = (userData) => {
    return fetch(`${baseUrl}/api/signup`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(response => response.json());
};

const getDefaultAvatars = (data) => {
    return data.payload.avatars.filter(image => image.defaultImg);
};

const seedDefaultAvatarAPI = () => {
    return getResource('/api/avatars')
        .then(data => {
            if (data.success) {
                const defaults = getDefaultAvatars(data);
                if (defaults.length === 0) {
                    log('adding default avatar...');
                    // only seed oliver for now...
                    return seedUser(initialUsers[0]);
                } else {
                    log('default avatar(s) already in db');
                    return Promise.resolve('avatar not required');
                }
            }
        });
};

const seedDefaultUserAPI = () => {
    return getResource('/api/users')
        .then(data => {
            if (data.success && data.payload.users.length === 0) {
                log('adding user...');
                return seedDefaultAvatarImage();
            } else {
                log('users already in db');
                return Promise.resolve('users not required');
            }
        });
};

export const seedData = () => {
    const userPromise = seedDefaultUserAPI();
    const avatarPromise = seedDefaultAvatarAPI();
    return Promise.all([userPromise, avatarPromise]);
};
