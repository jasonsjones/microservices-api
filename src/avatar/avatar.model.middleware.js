import User from '../user/user.model';

export function removeAvatarRefFromUser(avatar) {
    return User.findById(avatar.user).exec()
        .then(user => {
            if (user && user.avatar.equals(avatar._id)) {
                user.avatar = null;
                user.avatarUrl = 'http://localhost:3000/api/avatar/default';
                return user.save();
            }
        })
        .catch(err => {
            return err;
        });
}
