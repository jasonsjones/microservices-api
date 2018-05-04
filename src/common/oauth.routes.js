import express from 'express';

export default passport => {
    let OauthRouter = express.Router();

    OauthRouter.get('/sfdc',
        passport.authenticate('forcedotcom', {
            display: 'page',
            prompt: '',
            login_hint: ''
        })
    );

    OauthRouter.get('/sfdc/callback',
        passport.authenticate('forcedotcom', { successRedirect: '/profile' })
    );

    return OauthRouter;
};


/*
the routes:
    GET /auth/sfdc
    GET /auth/callback

the mount point for the router is going to be... oauth...?
*/