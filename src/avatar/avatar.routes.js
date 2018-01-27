import multer from 'multer';
import * as AvatarController from './avatar.controller';

export default (app) => {

    const upload = multer({dest: './uploads/'});

    app.route('/api/avatars')
        .get((req, res) => {
            AvatarController.getAvatars()
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        })
        .post(upload.single('avatar'), (req, res) => {
            AvatarController.uploadAvatar(req)
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err)
                });
        });

    app.route('/api/avatar/:id')
        .get((req, res) => {
            AvatarController.getAvatar(req)
                .then(response => {
                    res.contentType(response.contentType);
                    res.write(response.payload);
                    res.end();
                })
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        })
        .delete((req, res) => {
            AvatarController.deleteAvatar(req)
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        });
}
