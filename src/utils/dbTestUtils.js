import fs from 'fs';
import debug from 'debug';

import Avatar from '../avatar/avatar.model';
import config from '../config/config';
import db from '../config/db';

const log = debug('db:collections');

export const dbConnection = db(config);

export const dropCollection = (connection, collectionName, cb) => {
    connection.dropCollection(collectionName, () => {
        log(`dropping '${collectionName}' collection`);
        if (cb) {
            cb();
        }
    });
};

export const addDefaultAvatar = () => {
    const assetPath = `${__dirname}/../../assets`;
    const avatarFile = `${assetPath}/sfdc_default_avatar.png`;
    fs.readFile(avatarFile, (err, data) => {
        if (err) {
            throw err;
        }
        const defaultAvatar = new Avatar({
            contentType: 'image/png',
            fileSize: fs.statSync(avatarFile).size,
            data: data,
            defaultImg: true
        });
        return defaultAvatar.save();
    });
};
