import express from 'express';
import multer from 'multer';
import * as AvatarController from './avatar.controller';

const handleSimpleSuccess = res => {
    return response => res.json(response);
};

const sendImage = res => {
    return response => {
        res.contentType(response.contentType);
        res.write(response.payload);
        res.end();
    };
};

const handleError = res => {
    return err => {
        res.status(500);
        res.json(err);
    };
};

export default app => {
    let AvatarRouter = express.Router();
    const upload = multer({ dest: './uploads/' });

    AvatarRouter.route('/').get((req, res) => {
        AvatarController.getAvatars()
            .then(handleSimpleSuccess(res))
            .catch(handleError(res));
    });

    AvatarRouter.route('/:id')
        .get((req, res) => {
            AvatarController.getAvatar(req)
                .then(sendImage(res))
                .catch(handleError(res));
        })
        .delete((req, res) => {
            AvatarController.deleteAvatar(req)
                .then(handleSimpleSuccess(res))
                .catch(handleError(res));
        });

    AvatarRouter.route('/default/:index').get((req, res) => {
        AvatarController.getDefaultAvatar(req)
            .then(sendImage(res))
            .catch(handleError(res));
    });

    AvatarRouter.route('/default').post(upload.single('avatar'), (req, res) => {
        AvatarController.uploadDefaultAvatar(req)
            .then(handleSimpleSuccess(res))
            .catch(handleError(res));
    });

    return AvatarRouter;
};
