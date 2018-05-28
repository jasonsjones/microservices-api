import debug from 'debug';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

import config from './config';
import passportConfig from './passport';
import registerRouters from './routes';

const applyMiddleware = app => {
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
};

const log = debug('app');
log(`Running in ${config.env} mode`);

const app = express();

app.set('view engine', 'ejs');
passportConfig(passport);
applyMiddleware(app);
registerRouters(app, passport);

export default app;
