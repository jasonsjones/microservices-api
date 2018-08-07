import express from 'express';
import multer from 'multer';
import * as UserController from './user.controller';
import * as AuthController from '../common/auth.controller';

const handleSuccess = res => {
    return response => res.json(response);
};

const handleError = res => {
    return err => {
        res.status(500);
        res.json(err);
    };
};

const verifyToken = (req, res, next) => {
    AuthController.verifyToken(req)
        .then(() => next())
        .catch(err => {
            console.log(err);
            next(err);
        });
};

export default () => {
    let UserRouter = express.Router();
    const upload = multer({ dest: './uploads/' });

    UserRouter.route('/').get(verifyToken, (req, res) => {
        UserController.getUsers()
            .then(handleSuccess(res))
            .catch(handleError(res));
    });

    UserRouter.route('/:id([0-9a-zA-Z]{24})')
        .get((req, res) => {
            UserController.getUser(req)
                .then(handleSuccess(res))
                .catch(handleError(res));
        })
        .put((req, res) => {
            UserController.updateUser(req)
                .then(handleSuccess(res))
                .catch(handleError(res));
        })
        .delete((req, res) => {
            UserController.deleteUser(req)
                .then(handleSuccess(res))
                .catch(handleError(res));
        });

    UserRouter.get('/unlinksfdc', (req, res) => {
        UserController.unlinkSFDCAccount(req)
            .then(handleSuccess(res))
            .catch(handleError(res));
    });

    UserRouter.post('/signup', (req, res) => {
        UserController.createUser(req)
            .then(handleSuccess(res))
            .catch(handleError(res));
    });

    UserRouter.get(
        '/me',
        (req, res, next) => {
            AuthController.getUpdatedLoggedInUser(req)
                .then(response => {
                    if (response.success) {
                        next();
                    } else {
                        next(response);
                    }
                })
                .catch(err => {
                    console.log(err);
                    next(err);
                });
        },
        (req, res) => {
            UserController.getMe(req)
                .then(handleSuccess(res))
                .catch(handleError(res));
        }
    );

    UserRouter.get('/randomuser', (req, res) => {
        UserController.getRandomUser().then(handleSuccess(res));
    });

    // TODO: add middleware to protect the route
    // AuthController.verifyToken,
    // AuthController.protectRouteByUser,
    UserRouter.post('/:id/avatar', upload.single('avatar'), (req, res) => {
        UserController.uploadUserAvatar(req)
            .then(handleSuccess(res))
            .catch(handleError(res));
    });

    UserRouter.post('/changepassword', (req, res) => {
        UserController.changePassword(req)
            .then(handleSuccess(res))
            .catch(handleError(res));
    });

    return UserRouter;
};
