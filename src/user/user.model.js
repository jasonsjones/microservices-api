import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import * as middleware from './user.model.middleware';
const Schema = mongoose.Schema;

const baseUrl = 'http://localhost:3000';
const allowedRoles = ['user', 'admin', 'dev'];

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: function () {
        return this.sfdc.id === undefined;
    }},
    roles: {type: [String], enum: allowedRoles, default: ["user"]},
    avatar: {type: Schema.Types.ObjectId, ref: 'Avatar'},
    avatarUrl: {type: String, default: `${baseUrl}/api/avatar/default`},
    sfdc: {
        id: {type: String},
        accessToken: {type: String},
        refreshToken: {type: String},
        profile: {type: Schema.Types.Mixed}
    }
}, {timestamps: true});

userSchema.pre('save', middleware.hashPassword);
userSchema.post('save', middleware.checkForErrors);
userSchema.post('remove', middleware.removeAvatarOnDelete);

userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.isAdmin = function () {
    return this.roles.includes('admin');
};

userSchema.methods.addRole = function (role) {
    if (allowedRoles.includes(role) && !this.roles.includes(role)) {
        this.roles.push(role);
    }
};

userSchema.methods.removeRole = function (role) {
    var roleIndex = this.roles.indexOf(role);
    if (roleIndex !== -1) {
        this.roles.splice(roleIndex, 1);
    }
};

userSchema.methods.hasCustomAvatar = function () {
    return !!this.avatar;
}

userSchema.methods.toClientJSON = function () {
    let userDataForClient = {
        id: this._id,
        name: this.name,
        email: this.email,
        avatarUrl: this.avatarUrl,
        roles: this.roles
    };

    if (this.sfdc && this.sfdc.accessToken) {
        userDataForClient.hasSFDCProfile = true;
    } else {
        userDataForClient.hasSFDCProfile = false;
    }
    return userDataForClient;
}

const User = mongoose.model('User', userSchema);
export default User;
