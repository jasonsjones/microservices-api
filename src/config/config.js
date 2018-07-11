import dotenv from 'dotenv';
import configDev from './configDev';
import configTest from './configTest';
dotenv.config();

const version = '0.2.8';
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const token_secret = process.env.JWT_SECRET;
const session_secret = process.env.SESSION_SECRET;

let configBase = {
    version,
    env,
    port,
    token_secret,
    session_secret,
    baseUrl: 'http://localhost',
    dbUrl: 'mongodb://mongo/sandboxapi-default'
};

let config;
if (configBase.env === 'development') {
    config = Object.assign({}, configBase, configDev);
} else if (configBase.env === 'test') {
    config = Object.assign({}, configBase, configTest);
} else {
    config = Object.assign({}, configBase);
}

export default config;
