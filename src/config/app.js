import debug from 'debug';
import express from 'express';
import passport from 'passport';

import config from './config';
import passportConfig from './passport';
import applyMiddleware from './middleware';
import registerRouters from './routes';

const log = debug('app');
log(`Running in ${config.env} mode`);

const app = express();

passportConfig(passport);
applyMiddleware(app, passport);
registerRouters(app, passport);

export default app;
