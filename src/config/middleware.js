import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import cors from 'cors';
import FileStoreFactory from 'session-file-store';

import config from './config';
import { generateRandomToken } from '../common/auth.utils';

const FileStore = FileStoreFactory(session);

const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true
};

const getSessionFilePath = () => {
    if (config.env === 'test') {
        return { path: './test-sessions' };
    }
    return { path: './sessions' };
};

export default (app, passport) => {
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cors(corsOptions));
    app.use(
        session({
            genid: () => generateRandomToken(),
            store: new FileStore(Object.assign({}, { retries: 2 }, getSessionFilePath())),
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
