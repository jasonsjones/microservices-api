import debug from 'debug';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';

import config from './config';
import schema from '../graphql';
import passportConfig from './passport';
import AuthRouter from '../common/auth.routes';
import OauthRouter from '../common/oauth.routes';
import AvatarRouter from '../avatar/avatar.routes';
import UserRouter from '../user/user.routes';
import indexRoute from '../index/index.routes';

const log = debug('app');
log(`Running in ${config.env} mode`);

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
if (config.env === 'development') {
    app.use(morgan('dev'));
}
app.use(cors());

app.use(
    session({
        cookie: {
            secure: false
        },
        secret: config.session_secret,
        resave: false,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.use(
    '/graphql',
    graphqlHTTP({
        schema,
        pretty: true,
        graphiql: true
    })
);

app.use((req, res, next) => {
    if (config.env !== 'test') {
        log('******************');
        log(`Session ID: ${req.session.id}`);
        log(`user is authenticated: ${req.isAuthenticated()}`);
    }
    next();
});

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

export default app;
