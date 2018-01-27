import * as AvatarRepository from './avatar.repository';

export function getAvatars() {
    return AvatarRepository.getAvatars({}, '-data')
        .then(avatars => {
            return {
                success: true,
                payload: avatars
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error retrieving avatars. ' + err,
                error: err
            });
        });
}

export function getAvatar(req) {
    if (!req || !req.params || !req.params.id) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return AvatarRepository.getAvatar(req.params.id)
        .then(avatar => {
            return {
                contentType: avatar.contentType,
                payload: avatar.data
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error retrieving avatar. ' + err,
                error: err
            });
        });
}

export function deleteAvatar(req) {
    if (!req || !req.params || !req.params.id) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return AvatarRepository.deleteAvatar(req.params.id)
        .then(avatar => {
            return {
                success: true,
                message: 'avatar successfully deleted.',
                payload:  avatar
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error deleting avatar. ' + err,
                error: err
            });
        });
}

export function uploadAvatar(req) {
    if (!req || !req.file) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return AvatarRepository.uploadAvatar(req.file)
        .then(avatar => {
            return {
                success: true,
                message: 'avatar uploaded and saved.',
                payload: avatar
            }
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error saving avatar. ' + err,
                error: err
            });
        });
}

