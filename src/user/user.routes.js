import express from 'express';
import multer from 'multer';
import * as UserController from './user.controller';
import * as AuthController from '../common/auth.controller';

export default () => {
    let UserRouter = express.Router();
    const upload = multer({ dest: './uploads/' });

    UserRouter.route('/').get(
        (req, res, next) => {
            AuthController.verifyToken(req)
                .then(response => {
                    next();
                })
                .catch(err => {
                    console.log(err);
                    next(err);
                });
        },
        (req, res) => {
            UserController.getUsers()
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        }
    );

    UserRouter.route('/:id')
        .get((req, res) => {
            UserController.getUser(req)
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        })
        .put((req, res) => {
            UserController.updateUser(req)
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        })
        .delete((req, res) => {
            UserController.deleteUser(req)
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        });

    UserRouter.get('/unlinksfdc', (req, res) => {
        UserController.unlinkSFDCAccount(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    UserRouter.post('/signup', (req, res) => {
        UserController.signupUser(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    UserRouter.post(
        '/:id/avatar',
        //   AuthController.verifyToken,
        //   AuthController.protectRouteByUser,
        upload.single('avatar'),

        (req, res) => {
            UserController.uploadUserAvatar(req)
                .then(response => res.json(response))
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        }
    );

    UserRouter.post('/changepassword', (req, res) => {
        UserController.changePassword(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    return UserRouter;
};
