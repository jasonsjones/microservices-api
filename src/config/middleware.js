import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import cors from 'cors';

import config from './config';
import { generateRandomToken } from '../common/auth.utils';

export default (app, passport) => {
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cors());
    app.use(
        session({
            genid: () => generateRandomToken(),
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

    if (config.env === 'development') {
        app.use(morgan('dev'));
    }
};
