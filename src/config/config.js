import dotenv from 'dotenv';
import configDev from './configDev';
import configTest from './configTest';
import configProd from './configProd';
dotenv.config();

const version = '0.2.12';
const emailAddr = '"Sandbox API" <support@sandboxapi.com>';

const {
    NODE_ENV: env = 'development',
    PORT: port = 3000,
    JWT_SECRET: token_secret = 'defaultjwtsecret1234',
    SESSION_SECRET: session_secret = 'defaultsessionsecret4321'
} = process.env;

let configBase = {
    version,
    env,
    port,
    token_secret,
    session_secret,
    emailAddr,
    apiUrl: 'http://localhost:3000',
    clientUrl: 'http://localhost:4200',
    dbUrl: 'mongodb://mongo:27017/sandboxapi-default'
};

let config;
switch (env) {
    case 'development':
        config = Object.assign({}, configBase, configDev);
        break;
    case 'production':
        config = Object.assign({}, configBase, configProd);
        break;
    case 'test':
        config = Object.assign({}, configBase, configTest);
        break;
    default:
        config = Object.assign({}, configBase);
        break;
}

export default config;
