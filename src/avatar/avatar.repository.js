import fs from 'fs';
import Avatar from './avatar.model';

export function getAvatars(queryConditions = {}, selectionStr = '') {
    return Avatar.find(queryConditions, selectionStr).exec();
}

export function getAvatar(id) {
    if (!id) {
        return Promise.reject(new Error('avatar id is required'));
    }
    if (id === 'default') {
        return getDefaultAvatar();
    } else {
        return getAvatarById(id);
    }
}

export function deleteAvatar(id) {
    if (!id) {
        return Promise.reject(new Error('avatar id is required'));
    }
    return Avatar.findById(id).exec()
        .then(avatar => {
            return avatar.remove();
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
    let avatar = this.makeAvatarModel(file, userId, deleteAfter);
    return avatar.save();
}

export function uploadDefaultAvatar(file, deleteAfter) {
    if (!file) {
        return Promise.reject(new Error('file is required'));
    }
    let avatar = this.makeAvatarModel(file, null, deleteAfter, true);
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

function getDefaultAvatar() {
    return Avatar.findOne({defaultImg: true}).exec();
}

function getAvatarById(id) {
    return Avatar.findById(id).exec();
}
