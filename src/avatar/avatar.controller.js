import * as AvatarRepository from './avatar.repository';

export function getAvatars() {
    return AvatarRepository.getAvatars({}, '-data')
        .then(avatars => {
            return {
                success: true,
                message: 'avatars fetch successful',
                payload: {
                    avatars
                }
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
            if (avatar) {
                return {
                    contentType: avatar.contentType,
                    payload: avatar.data
                };
            } else {
                return Promise.reject(new Error(`unable to find avatar with id ${req.params.id}`));
            }
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error retrieving avatar. ' + err,
                error: err
            });
        });
}

export function getDefaultAvatar(req) {
    if (!req || !req.params || req.params.index === undefined) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return AvatarRepository.getDefaultAvatar(req.params.index)
        .then(avatar => {
            return {
                contentType: avatar.contentType,
                payload: avatar.data
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error retrieving avatar. ' + err.message,
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
    return AvatarRepository.uploadAvatar(req.file, req.params.userId)
        .then(avatar => {
            return {
                success: true,
                message: 'avatar uploaded and saved.',
                payload: avatar
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error saving avatar. ' + err,
                error: err
            });
        });
}

export function uploadDefaultAvatar(req) {
    if (!req || !req.file) {
        return Promise.reject({
            success: false,
            message: 'request parameter is required',
            error: new Error('request parameter is required')
        });
    }
    return AvatarRepository.uploadDefaultAvatar(req.file)
        .then(avatar => {
            return {
                success: true,
                message: 'default avatar uploaded and saved.',
                payload: avatar
            };
        })
        .catch(err => {
            return Promise.reject({
                success: false,
                message: 'error saving default avatar: ' + err.message,
                error: err
            });
        });

}
