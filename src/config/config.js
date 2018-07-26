import dotenv from 'dotenv';
import configDev from './configDev';
import configTest from './configTest';
dotenv.config();

const version = '0.2.9';
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const token_secret = process.env.JWT_SECRET;
const session_secret = process.env.SESSION_SECRET;

const getUrl = (env, port) => {
    switch (env) {
        case 'development':
        case 'test':
            return `http://localhost:${port}`;
        case 'production':
            return process.env.PROD_URL;
        default:
            break;
    }
};

let configBase = {
    version,
    env,
    port,
    token_secret,
    session_secret,
    url: getUrl(env, port),
    dbUrl: 'mongodb://mongo:27017/sandboxapi-default'
};

let config;
switch (env) {
    case 'development':
        config = Object.assign({}, configBase, configDev);
        break;
    case 'test':
        config = Object.assign({}, configBase, configTest);
        break;
    default:
        config = Object.assign({}, configBase);
        break;
}

export default config;
