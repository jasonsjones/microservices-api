import fs from 'fs';
import Avatar from './avatar.model';

export function getAvatars(queryConditions = {}, selectionStr = '') {
    return Avatar.find(queryConditions, selectionStr).exec();
}

export function getAvatar(id) {
    if (!id) {
        return Promise.reject(new Error('avatar id is required'));
    }
    return Avatar.findById(id).exec();
}

export function getDefaultAvatar(idx) {
    if (idx === undefined) {
        return Promise.reject(new Error('default avatar index is required'));
    }
    return Avatar.find({defaultImg: true}).exec()
        .then(defaults => {
            if (idx > -1 && idx < defaults.length) {
                return defaults[idx];
            } else {
                return Promise.reject(new Error(`default avatar with index: ${idx} does not exist`));
            }
        })
        .catch(err => Promise.reject(err));
}

export function deleteAvatar(id) {
    if (!id) {
        return Promise.reject(new Error('avatar id is required'));
    }
    return Avatar.findById(id).exec()
        .then(avatar => {
            if (avatar) {
                return avatar.remove();
            } else {
                return Promise.reject(new Error(`avatar does not exist with id ${id}`));
            }
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

export function uploadAvatar(file, userId, deleteAfter) {
    if (!file) {
        return Promise.reject(new Error('file is required'));
    }
    if (!userId) {
        return Promise.reject(new Error('user id is required'));
    }
    let avatar = makeAvatarModel(file, userId, deleteAfter);
    return avatar.save();
}

export function uploadDefaultAvatar(file, deleteAfter) {
    if (!file) {
        return Promise.reject(new Error('file is required'));
    }
    let avatar = makeAvatarModel(file, null, deleteAfter, true);
    return avatar.save();
}

export function makeAvatarModel(file, userId, deleteAfter = true, isDefault = false) {
    let avatar = new Avatar();
    avatar.fileName = file.originalname;
    avatar.contentType = file.mimetype;
    avatar.fileSize = file.size;
    avatar.defaultImg = isDefault;
    avatar.data = fs.readFileSync(file.path);
    if (deleteAfter) {
        fs.unlinkSync(file.path);
    }

    if (userId) {
        avatar.user = userId;
    }
    return avatar;
}
