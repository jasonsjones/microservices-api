import dotenv from 'dotenv';
dotenv.config();

const dockerDbUri = 'mongodb://mongo:27017/sandboxapi';

export default {
    logging: false,
    apiUrl: 'https://j2sandbox-api.herokuapp.com',
    clientUrl: 'https://j2sandbox.herokupap.com',
    dbUrl: process.env.MLAB_DB_URI
};
