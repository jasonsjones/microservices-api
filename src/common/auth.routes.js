import express from 'express';
import * as AuthUtils from './auth.utils';

export default passport => {
    let AuthRouter = express.Router();

    AuthRouter.get('/signout', (req, res) => {
        req.logout();
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });

    AuthRouter.post('/login', passport.authenticate('local'), (req, res) => {
        const user = req.user;
        res.json({
            success: true,
            message: 'authenticated via passport',
            payload: {
                user: user.toClientJSON(),
                token: AuthUtils.generateToken(user)
            }
        });
    });

    AuthRouter.get('/sessionUser', (req, res) => {
        const user = req.user;
        if (user) {
            res.json({
                success: true,
                message: 'session user',
                payload: {
                    user: user.toClientJSON(),
                    token: AuthUtils.generateToken(user)
                }
            });
        } else {
            res.json({
                success: false,
                message: 'user not logged in',
                payload: {
                    user: null,
                    token: null
                }
            });
        }
    });

    return AuthRouter;
};
