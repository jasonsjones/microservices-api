import User from './user.model';
import { deleteAvatar, makeAvatarModel } from '../avatar/avatar.repository';

export function getUsers(queryCondition = {}, inclAvatars = false) {
    let query;
    if (inclAvatars) {
        query = User.find(queryCondition).populate('avatar', '-data');
    } else {
        query = User.find(queryCondition);
    }

    return query.exec();
}

export function getUser(id, inclAvatar = false) {
    if (!id) {
        return Promise.reject(new Error('user id is required'));
    }

    let query;
    if (inclAvatar) {
        query = User.findById(id).populate('avatar', '-data');
    } else {
        query = User.findById(id);
    }

    return query.exec();
}

export function lookupUserByEmail(email, inclAvatar = false) {
    if (!email) {
        return Promise.reject(new Error('email is required'));
    }
    return new Promise((resolve, reject) => {
        let query;
        if (inclAvatar) {
            query = User.findOne({email: email}).populate('avatar', '-data');
        } else {
            query = User.findOne({email: email});
        }

        query.exec()
            .then(user => resolve(user))
            .catch(err => reject(err));
    });
}

export function deleteUser(id) {
    if (!id) {
        return Promise.reject(new Error('user id is required'));
    }
        return User.findByIdAndRemove(id).exec();
}

export function updateUser(id, userData) {
    if (!id) {
        return Promise.reject(new Error('user id is required'));
    }
    if (!userData) {
        return Promise.reject(new Error('userData is required'));
    }
    return User.findById(id).exec()
            .then(user => {
                Object.assign(user, userData);
                return user.save();
            })
            .catch(err => Promise.reject(err));
}

export function uploadUserAvatar(id, file, deleteAfterUpload = true) {
    if (!id) {
        return Promise.reject(new Error('user id is required'));
    }
    if (!file) {
        return Promise.reject(new Error('avatar file is required'));
    }
    let userPromise = getUser(id);

    // if the user already has a custom avatar image, delete it first
    userPromise.then(user => {
        if (user.hasCustomAvatar()) {
            deleteAvatar(user.avatar);
        }
    });

    let avatarPromise = userPromise.then(user => {
        let avatar = makeAvatarModel(file, user._id, deleteAfterUpload);
        return avatar.save();
    });

    return Promise.all([userPromise, avatarPromise]).then(values => {
        let [user, img] = values;
        user.avatar = img._id;
        user.avatarUrl = `http://localhost:3000/api/avatar/${img._id}`;
        return user.save();
    })
    .catch(err => Promise.reject(err));
}

export function changePassword(userData) {
    if (!userData) {
        return Promise.reject(new Error('user data is required'));
    }

    const { email, currentPassword, newPassword } = userData;

    if (!email || !currentPassword || !newPassword) {
        return Promise.reject(new Error('user email is required'));
    }

    return this.lookupUserByEmail(email, false)
        .then(user => {
            if (user.verifyPassword(currentPassword)) {
                user.password = newPassword;
                return user.save();
            } else {
                return Promise.reject(new Error('user unauthorized to change password'));
            }
        });
}

export function signUpUser(userData) {
    if (!userData) {
        return Promise.reject(new Error('user data is required'));
    }
    let newUser = new User(userData);
    return newUser.save();
}

export const unlinkSFDCAccount = (user) => {
    if (!user) {
        return Promise.reject(new Error('User not provided; unable to unlink'));
    }
    user.sfdc.accessToken = null;
    user.sfdc.refreshToken = null;
    user.sfdc.profile = {};
    return user.save();
}
