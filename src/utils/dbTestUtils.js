import fs from 'fs';
import debug from 'debug';

import Avatar from '../avatar/avatar.model';

const log = debug('db:collections');

export const dropCollections = (connection) => {
    let collections = Object.keys(connection.collections);
    collections.forEach((coll) => {
        connection.dropCollection(coll, (err) => {
            if (err) {
                throw err;
            }
            log(`***** dropped collection ${coll}`);
        });
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
            contentType: "image/png",
            fileSize: fs.statSync(avatarFile).size,
            data: data,
            defaultImg: true
        });
        return defaultAvatar.save();
    });
};
