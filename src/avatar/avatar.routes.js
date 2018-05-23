import express from 'express';
import multer from 'multer';
import * as AvatarController from './avatar.controller';

export default app => {
    let AvatarRouter = express.Router();
    const upload = multer({ dest: './uploads/' });

    AvatarRouter.route('/').get((req, res) => {
        AvatarController.getAvatars()
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    AvatarRouter
        .route('/:id')
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

    AvatarRouter.route('/default/:index').get((req, res) => {
        AvatarController.getDefaultAvatar(req)
            .then(response => {
                res.contentType(response.contentType);
                res.write(response.payload);
                res.end();
            })
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    AvatarRouter.route('/default').post(upload.single('avatar'), (req, res) => {
        AvatarController.uploadDefaultAvatar(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    return AvatarRouter;
};
