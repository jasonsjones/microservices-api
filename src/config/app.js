import debug from 'debug';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';

import Config from './config';
import schema from '../graphql';
import passportConfig from './passport';
import authRoute from '../common/auth.routes';
import oauthRoute from '../common/oauth.routes';
import avatarRoute from '../avatar/avatar.routes';
import userRoute from '../user/user.routes';
import indexRoute from '../index/index.routes';

const log = debug('app');
const env = process.env.NODE_ENV || 'development';
log(`Running in ${env} mode`);
const config = Config[env];

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
if (env === 'development') {
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
    if (process.env.NODE_ENV !== 'test') {
        log('******************');
        log(`Session ID: ${req.session.id}`);
        log(`user is authenticated: ${req.isAuthenticated()}`);
    }
    next();
});

app.use('/oauth', oauthRoute(passport));
authRoute(app, passport);
avatarRoute(app);
userRoute(app);
indexRoute(app);

app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.err(err);
        res.json({
            message: err.message,
            error: err
        });
    }
});

export default app;
