import fs from 'fs';
import debug from 'debug';
import Config from '../config/config';
import db from '../config/db';
import User from '../user/user.model';
import Avatar from '../avatar/avatar.model';

const env = process.env.NODE_ENV || "development";
const config = Config[env];

const log = debug('db:seed');
const dbConn = db(config);

const assetPath = `${__dirname}/../../assets`;
const avatarFile = `${assetPath}/sfdc_default_avatar.png`;

const initialUsers = [
    {
        name: "Oliver Queen",
        email: "oliver@qc.com",
        roles: ["admin", "user"],
        password: "arrow"
    },
    {
        name: "John Diggle",
        email: "dig@qc.com",
        password: "spartan"
    },
    {
        name: "Felicity Smoak",
        email: "felicity@qc.com",
        roles: ["admin", "user"],
        password: "felicity"
    },
    {
        name: "Roy Harper",
        email: "roy@qc.com",
        password: "arsenal"
    },
    {
        name: "Thea Queen",
        email: "thea@qc.com",
        password: "thea"
    }
];

// seed the db with the default users (above), then get a handle
// to 'Olive Queen' so we can upload a custom avatar image
let defaultUserPromise = seedDefaultUsers()
    .then(() => User.findOne({name: 'Oliver Queen'}).exec());

let defaultAvatarPromise = seedDefaultAvatar();


Promise.all([defaultUserPromise, defaultAvatarPromise])
    .then((values) => {
        let [arrow] = values;
        if (!arrow.avatar) {
            return addCustomAvatarToUser(arrow, 'male3.png');
        } else {
            return Promise.resolve();
        }
    })
    .then(() => dbConn.close())
    .catch(err => console.log(err));

/****** helper functions ******/

function seedDefaultUsers() {
    return User.find({}).exec()
        .then(users => {
            if (users.length === 0) {
                log('db seeded with users');
                return User.create(initialUsers);
            }
        });
}

function seedDefaultAvatar() {
    return Avatar.find({defaultImg: true}).exec()
        .then(avatars => {
            if (avatars.length === 0) {
                let defaultAvatar = createDefaultAvatar();
                log('default avatar saved');
                return defaultAvatar.save();
            }
        });
}

function createDefaultAvatar() {
    const avatar = new Avatar({
        contentType: "image/png",
        fileSize: fs.statSync(avatarFile).size,
        data: fs.readFileSync(avatarFile),
        defaultImg: true
    });
    return avatar;
}

function makeCustomAvatar(userId, filename) {
    let filepath = `${assetPath}/${filename}`;
    const avatar = new Avatar({
        contentType: "image/png",
        fileSize: fs.statSync(filepath).size,
        data: fs.readFileSync(filepath),
        user: userId,
        defaultImg: false
    });
    return avatar;
}

function addCustomAvatarToUser(user, filename) {
    const avatar = makeCustomAvatar(user._id, filename);
    return new Promise((resolve, reject) => {
        avatar.save()
            .then(a => {
                user.avatar = a._id,
                user.avatarUrl = `http://localhost:3000/api/avatar/${a._id}`;
                resolve(user.save());
            })
            .catch(err => reject(err));
    });
}
