import multer from 'multer';
import * as UserController from './user.controller';
// import * as AuthController from '../common/auth.controller';

export default (app) => {

    const upload = multer({dest: './uploads/'});

    app.get('/api/users',
            //  AuthController.verifyToken,
            //  AuthController.adminRoute,
            (req, res) => {
                UserController.getUsers()
                    .then(response => res.json(response))
                    .catch(err => {
                        res.status(500);
                        res.json(err);
                    });
            });

    app.get('/api/user/:id', (req, res) => {
        UserController.getUser(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    app.put('/api/user/:id', (req, res) => {
        UserController.updateUser(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });

    });

    app.delete('/api/user/:id', (req, res) => {
        UserController.deleteUser(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    app.get('/api/unlinksfdc', (req, res) => {
        UserController.unlinkSFDCAccount(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    app.post('/api/signup', (req, res) => {
        UserController.signupUser(req)
            .then(response => res.json(response))
            .catch(err => {
                res.status(500);
                res.json(err);
            });
    });

    app.post('/api/user/:userid/avatar',
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
}
