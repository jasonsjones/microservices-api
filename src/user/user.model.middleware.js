import bcrypt from 'bcrypt-nodejs';
import Avatar from '../avatar/avatar.model';

export function hashPassword(next) {
    let user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(12, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next(null, user);
        });
    });
}

export function checkForErrors(err, user, next) {
    if (err.name === 'MongoError' && err.code == 11000) {
        next(new Error('There was a duplicate key error'))
    } else {
        next(err);
    }
}

export function removeAvatarOnDelete(user) {
    return Avatar.findOne(user.avatar).exec()
        .then(avatar => {
            if (avatar && !avatar.defaultImg && avatar.user.equals(user._id)) {
                return avatar.remove();
            }
        })
        .catch(err => {
            return err;
        });
}
