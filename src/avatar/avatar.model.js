import mongoose from 'mongoose';
import * as middleware from './avatar.model.middleware';

const Schema = mongoose.Schema;

const avatarSchema = new Schema({
    contentType: {type:String, required: true},
    data: {type: Buffer, required: true},
    fileSize: {type: Number},
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return !this.defaultImg;
        }
    },
    defaultImg: {type: Boolean, default: false}
}, {timestamps: true});

avatarSchema.post('remove', middleware.removeAvatarRefFromUser);

const Avatar = mongoose.model('Avatar', avatarSchema);
export default Avatar;
