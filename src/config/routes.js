import graphqlHTTP from 'express-graphql';
import schema from '../graphql';
import config from './config';
import AuthRouter from '../common/auth.routes';
import OauthRouter from '../common/oauth.routes';
import AvatarRouter from '../avatar/avatar.routes';
import UserRouter from '../user/user.routes';
import indexRoute from '../index/index.routes';

export default (app, passport) => {
    app.use((req, res, next) => {
        if (config.env !== 'test') {
            log('******************');
            log(`Session ID: ${req.session.id}`);
            log(`user is authenticated: ${req.isAuthenticated()}`);
        }
        next();
    });

    app.use(
        '/graphql',
        graphqlHTTP({
            schema,
            pretty: true,
            graphiql: true
        })
    );

    app.use('/oauth', OauthRouter(passport));
    app.use('/api', AuthRouter(passport));
    app.use('/api/avatars', AvatarRouter());
    app.use('/api/users', UserRouter());
    indexRoute(app);

    app.use((err, req, res, next) => {
        if (config.env === 'development') {
            console.error(err);
            res.json({
                message: err.message,
                error: err
            });
        }
    });
};
